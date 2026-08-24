# Guna Herbals Integration and Analytics Decision

## Executive decision

Use **PostHog as the single product-analytics platform**. It combines event analytics, funnels, retention, paths, feature flags, and session replay in one system [1] [2]. It can run as PostHog Cloud now and accept the same application configuration when moved to a self-hosted instance later. The application now reads `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`; with no key configured, analytics remains disabled.

Do not run Clarity and Mixpanel alongside PostHog initially. Two or three analytics products create duplicated events, more consent work, and more dashboards to maintain. Add Clarity later only if heatmaps and visual replays are more important than portable product analytics. Keep Mixpanel as an alternative if the business grows into a dedicated product-analytics team, complex cohort reporting, or larger-scale behavioral analysis.

## Platform comparison

| Platform | Best use | Strengths | Limitations for this project | Self-hosting path | Recommendation |
|---|---|---|---|---|---|
| Microsoft Clarity | Website behavior diagnosis | Free, simple, heatmaps, session recordings, near-real-time behavior insights, no stated traffic limits [3] | Primarily behavioral web analytics; weaker as the system of record for commerce events, revenue cohorts, and backend order events; data is stored in Microsoft Azure [3] | No equivalent first-party self-hosted deployment | Optional later companion, not the primary platform |
| Mixpanel | Mature product analytics | Strong funnels, retention, flows, cohorts, saved metrics, and event analysis; its current free plan includes up to 1M events/month [4] | Cloud-first commercial service; adds a second system if used alongside PostHog; self-hosting is not the normal migration path | No normal self-hosted deployment path | Good alternative, but not the simplest portable choice |
| PostHog | Unified product and commerce analytics | Funnels, retention, paths, lifecycle insights, session replay, feature flags, experiments, and API/MCP access over the same events [1] [2] | Self-hosting requires operations, backups, upgrades, and larger infrastructure; PostHog states that self-hosted deployments are unsupported and recommends current images [5] | PostHog Cloud now, self-hosted Docker deployment later with the same event model and host variable [5] | **Recommended** |

## Simple operating architecture

The application should keep **business truth in Neon PostgreSQL** and use PostHog for behavioral analytics. Orders, payments, refunds, inventory, shipping, and customer records must never depend on an analytics provider. This makes the site portable to AWS PostgreSQL, keeps financial records authoritative, and allows analytics to be disabled without breaking checkout.

| Concern | Primary system | Integration approach |
|---|---|---|
| Orders, products, inventory, payments, shipments | Neon PostgreSQL + Drizzle | Existing database schema remains authoritative |
| Product and customer behavior | PostHog | Browser SDK with explicit commerce events and privacy masking |
| Operational logs | JSON application logger plus database audit logs | Keep structured server logs provider-neutral; forward to a log service later if needed |
| Transactional email | Confirm SendTree provider/API first | Use an adapter with provider URL and API key in server environment variables |
| Product images and documents | **Cloudinary** | Server-side uploads, CDN delivery, responsive transformations, and signed operations; keep API secret server-side [6] |
| Raw exports, backups, and large non-image files | Optional Cloudflare R2 | S3-compatible adapter; use a public read URL or signed URLs, never expose secret keys in the browser [10] |
| DNS and edge routing | Cloudflare DNS | DNS only for the domain and optional first-party analytics proxy; deployment can remain on Vercel |
| Deployment | Vercel | Keep secrets in Vercel environment variables; do not put credentials in Git |
| Customer support | **Chatwoot Cloud now; self-hosted Chatwoot later** | Website chat, email, WhatsApp, help center, API, and optional voice through Twilio/WhatsApp; keep conversation data in Chatwoot and link order IDs from the app [11] |
| Authentication | Current local session system first; migrate to OIDC later | Use a stable internal user ID and OIDC claims mapping; Keycloak is the strongest self-hosted provider option [7] |

## Business events to instrument

Start with a small event vocabulary. The most useful initial events are `product_viewed`, `search_submitted`, `add_to_cart`, `checkout_started`, `payment_started`, `payment_succeeded`, `payment_failed`, `order_created`, `order_shipped`, and `order_delivered`. Event properties should include product ID, category, variant ID, order ID, order value, currency, payment method, and shipping type. Do not send payment secrets, full addresses, phone numbers, raw gateway payloads, or card information to analytics.

The current client foundation is intentionally disabled until a PostHog project key is configured. The configured host can point either to PostHog Cloud or a self-hosted PostHog domain. PostHog recommends identifying authenticated users with a stable ID and resetting identity on logout [8].

## Razorpay implementation

The checkout now uses the real Razorpay Orders API when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are present. The server creates a Razorpay order in INR paise, stores the gateway order ID in the `payments` table, opens Razorpay Checkout in the browser, verifies the returned HMAC-SHA256 signature server-side, and updates both `payments` and `orders` transactionally. A webhook endpoint is available at `/api/webhooks/razorpay`; configure the same webhook secret as `RAZORPAY_WEBHOOK_SECRET` and subscribe to payment captured, payment failed, and order paid events.

Razorpay is not considered live until test-mode credentials, webhook configuration, and a successful test payment have been completed. No real charge has been initiated by this development work.

## Authentication recommendation

For this business, choose **Keycloak when self-hosting and centralized identity are hard requirements**. It speaks OpenID Connect, OAuth 2.0, and SAML, supports social login and identity brokering, and provides centralized users, sessions, roles, and two-factor authentication [7]. It is a separate operational service, so it is more work than keeping authentication inside the Next.js application.

Choose **Better Auth instead when the priority is a TypeScript-native system that lives with the application code**. Better Auth provides email/password, sessions, rate limiting, social sign-on, two-factor authentication, organizations, and a plugin ecosystem [9]. It is easier to keep in the same repository and database, but it is an application library rather than an independent identity platform.

For Guna Herbals, the practical sequence is to keep the existing login stable, add an OIDC-compatible abstraction, and migrate only after the storefront and admin roles are stable. If the eventual target is a company-wide identity service shared by multiple systems, use Keycloak. If the target is one portable Next.js product with minimal operations, use Better Auth.

## Activation checklist

1. Create a PostHog project and provide `NEXT_PUBLIC_POSTHOG_KEY`; keep `NEXT_PUBLIC_POSTHOG_HOST` pointed to PostHog Cloud or your self-hosted domain.
2. Confirm whether the intended email provider is **SendTree.io** or **SendGrid**. The name “SendTree” resolves to a separate email product with API and SMTP access, so the exact API contract must be confirmed before coding provider-specific calls.
3. Add Razorpay test credentials to the deployment environment and set `RAZORPAY_WEBHOOK_SECRET` in Razorpay Dashboard and Vercel.
4. Configure the Razorpay webhook URL as `https://your-domain.com/api/webhooks/razorpay`, then complete one successful and one failed test payment.
5. Create a Cloudinary product environment and configure `CLOUDINARY_URL` or the individual Cloudinary variables. Use product folders such as `guna-herbals/products`, `guna-herbals/banners`, and `guna-herbals/journal`.
6. Create a Chatwoot Cloud account or self-hosted deployment, configure the website token and base URL, and link support conversations to customer/order IDs without copying full conversation contents into Neon.
7. Use R2 only if raw backups or non-image files need separate low-cost object storage. Configure its server-only keys when that need exists.
8. Configure the production domain in Cloudflare DNS and point the application to Vercel. Keep all secrets server-side.
9. Decide between Keycloak and Better Auth before replacing the current login. Do not migrate authentication, payments, and support in the same release.

## References

[1]: https://posthog.com/docs/product-analytics "PostHog Product Analytics"

[2]: https://posthog.com/docs/session-replay "PostHog Session Replay"

[3]: https://learn.microsoft.com/en-us/clarity/faq "Microsoft Clarity FAQ"

[4]: https://mixpanel.com/pricing/ "Mixpanel Pricing"

[5]: https://posthog.com/docs/self-host "PostHog Self-hosting"

[6]: https://developers.cloudflare.com/r2/api/s3/api/ "Cloudflare R2 S3 API Compatibility"

[7]: https://www.keycloak.org/ "Keycloak Identity and Access Management"

[8]: https://posthog.com/docs/libraries/next-js "PostHog Next.js Integration"

[9]: https://better-auth.com/docs/introduction "Better Auth Introduction"

[10]: https://cloudinary.com/documentation "Cloudinary Documentation"

[11]: https://www.chatwoot.com/ "Chatwoot Customer Support Platform"
