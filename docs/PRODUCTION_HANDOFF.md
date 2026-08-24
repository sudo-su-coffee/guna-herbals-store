# Guna Herbals Production Handoff

**Author:** Manus AI  
**Repository:** `sudo-su-coffee/guna-herbals-store`  
**Branch:** `main`  
**Handoff status:** Production candidate; provider credentials and live-domain verification remain deployment-owner tasks.

## Executive summary

Guna Herbals is now a database-backed Next.js storefront and admin application rather than a client-side commerce prototype. The active commerce source of truth is PostgreSQL accessed through Drizzle. Better Auth supplies identity and sessions, while the commerce user record is linked by email. Razorpay, SendGrid, Cloudinary, PostHog, and Chatwoot are represented behind provider-neutral boundaries so credentials can be supplied later without changing order or customer-domain contracts.

The completed rollout preserves manual courier fulfillment. Orders can move through the admin lifecycle without a courier API lock-in, and the tracking number, shipper, receipt, and WhatsApp-sharing features remain application-owned.

> **Important:** A successful local build is not proof that production credentials, database migrations, DNS, OAuth callbacks, payment webhooks, or sender verification are complete. Those require a deployment-owner verification pass.

## Verified repository state

| Area | Current implementation | Verification |
|---|---|---|
| Runtime | Next.js 16.3.2, React 19.2.8, Tailwind 4 | Production build passed |
| Database | Neon PostgreSQL through Drizzle | Build completed with a database-shaped environment; run migrations against the real database before launch |
| Identity | Better Auth, email/password, Google provider boundary, stateful sessions | Auth route compiled; Google credentials are required for activation |
| Storefront | Catalog, search, product pages, cart, checkout, profile, wishlist, policies, tracking | 45 routes generated in the final build |
| Payments | Razorpay order creation, checkout, signature verification, webhook processing, COD path | Razorpay code compiled; live/test key and webhook delivery still require deployment verification |
| Fulfillment | Manual shipper, tracking number, status lifecycle | Admin routes and mutations are present |
| Receipts | Server-side PDF generation with `pdf-lib` | Receipt route compiled |
| Admin | Products, orders, customers, payments, delivery, audit logs, security, notifications, integrations, analytics | Admin mock context removed from active admin routes |
| Provider adapters | SendGrid bounded request, Cloudinary delivery and signed-upload helper, PostHog browser provider, Chatwoot configuration | Targeted lint passed with warnings only; production build passed |
| Repository | All rollout slices pushed to `main` | The final rollout and handoff commits are pushed to `main`; see `git log --oneline` for the exact head |

## Credential setup

Copy `.env.example` into the deployment provider's secret configuration. Do not commit a real `.env` file. Use separate credentials for local, staging, and production.

| Provider | Required variables | Operational check |
|---|---|---|
| Neon/PostgreSQL | `DATABASE_URL` | Run migrations, check connection, verify expected tables and indexes |
| Better Auth | `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Use a long random secret; confirm session cookies are secure in production |
| Google sign-in | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Register the exact production callback URL for `/api/auth/[...all]` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Use test mode first; configure webhook endpoint and verify signatures |
| SendGrid | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, optional `SENDGRID_FROM_NAME` | Complete domain/sender verification and send a test receipt/reset email |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Verify signed upload parameters and delivery URLs; never expose the API secret |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY`, optional `NEXT_PUBLIC_POSTHOG_HOST` | Confirm page views and checkout events in the intended project |
| Chatwoot | `SUPPORT_BASE_URL`, `SUPPORT_WEBSITE_TOKEN`, optional account/inbox values | Confirm the widget is visible only on intended public pages |
| Application | `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL` | Values must use the canonical HTTPS domain in production |

The current health dashboard intentionally displays only whether required values are present. It never returns secret values to the browser.

## Launch procedure

First, create a staging database branch or separate staging database and apply the repository migrations. Load a small, known catalog fixture and verify that product variants have inventory rows connected to active warehouses. Confirm that the production deployment uses the same migration revision as the code being deployed.

Next, configure the authentication and provider secrets in the deployment platform. Confirm Better Auth's callback and cookie behavior on the real HTTPS domain. Test email/password registration, login, logout, session revocation, and Google sign-in only after the callback URL is correct.

Then run the payment test flow. Create a cart, complete a Razorpay test checkout, verify the server-side signature, confirm the order and payment ledger state, replay the same webhook, and verify that webhook idempotency does not create a second payment transition. Test COD separately.

Finally, run the fulfillment flow. In the admin panel, assign a manual shipper, add a tracking number, move the order to shipped, open the customer tracking view, download the PDF receipt, and use the WhatsApp share action. Verify that the audit log contains the admin mutation events.

## Rollback procedure

For an application rollback, redeploy the previous known-good commit without changing database state. Because provider adapters are environment-driven, credentials can remain unchanged while the application version is reverted.

For a migration rollback, do not run destructive SQL automatically. Take a database snapshot or provider backup, identify the migration and affected tables, and perform a rehearsed restore or compensating migration. Payment and order records must be reconciled before any data repair is considered complete.

For provider failure, disable the affected provider at the environment boundary where possible. COD and manual fulfillment should remain available when Razorpay is unavailable. Email delivery failure must not silently mark an order as unpaid; inspect the audit log and provider response, then retry through an operator-controlled path.

## Security and operational notes

The current rate limiter is an in-process fixed-window guard for login and selected mutation paths. It is useful for a single instance and basic abuse control, but it is not a distributed security boundary across multiple serverless instances. Before scaling authentication horizontally, replace it with a shared store such as a managed Redis-compatible service or an equivalent edge rate-limit facility.

Admin mutations require an authenticated admin or staff identity where supported, validate order and payment statuses, and write audit records for manual orders, order-status changes, payment-status changes, customer blocking, and customer-session revocation. Continue adding audit coverage whenever a new mutation is introduced.

The production build currently passes. The focused lint run for changed files passes with warnings from pre-existing unused imports and legacy compatibility typing in `lib/api.ts`. A repository-wide lint run still reports legacy accessibility, unescaped-entity, hook, and typing findings outside this rollout. These should be cleaned in a separate non-functional quality pass rather than hidden as part of deployment.

## Medusa migration runbook

Do not introduce Medusa beside the live commerce system without a proof-of-concept environment. The current database remains the source of truth until the migration passes the following sequence:

1. Export products, variants, images, categories, inventory, customers, addresses, orders, payments, shipments, returns, discounts, and audit references into a versioned staging export.
2. Map current product and variant IDs to Medusa product, variant, inventory, and sales-channel identifiers. Preserve the original IDs in metadata for reconciliation.
3. Map Better Auth identities separately from commerce customers. Do not transfer password hashes unless the selected identity strategy explicitly supports it; prefer a controlled account-linking or reset flow.
4. Implement Razorpay payment and manual fulfillment modules against the existing application contracts before switching traffic.
5. Run catalog counts, foreign-key checks, inventory reconciliation, payment reconciliation, receipt generation, tracking, and customer-login tests in staging.
6. Exercise a dual-read or shadow comparison for catalog and order views, but keep one system authoritative for writes during the test.
7. Define a cutover window, freeze policy, rollback point, and post-cutover reconciliation report before changing production traffic.

The repository includes the migration foundation and strategy documentation. It is not a production migration script and must not be applied directly to the live database.

## Definition of done

| Gate | Status | Evidence or remaining action |
|---|---|---|
| Storefront and admin routes compile | Verified | Final Next.js build generated 45 routes |
| Admin mock context removed from active admin routes | Verified | No `useShop` or `ShopContext` references remain under `app/admin` |
| Manual admin orders are database-backed | Verified | Transactional order, line-item, inventory, stock-movement, and audit writes |
| Provider secrets are server-side | Verified | Integration health returns configuration booleans only |
| Razorpay webhook signature and duplicate delivery handling | Verified in code | Must be exercised with a Razorpay test webhook in staging |
| Auth brute-force guard | Verified in code | Shared distributed rate limiting remains a scale-up task |
| Production credentials and domain callbacks | Incomplete | Deployment owner must configure and verify them |
| Live Neon migration and backup | Incomplete | Run against the intended staging and production databases |
| Full browser journey with real test credentials | Incomplete | Perform the launch procedure above |
| Medusa migration | Not started by design | Run only as a separate proof of concept after launch |

## References

[1]: https://github.com/sudo-su-coffee/guna-herbals-store — Guna Herbals Store repository and source of truth for the implementation described in this guide.
[2]: https://docs.medusajs.com/ — Medusa documentation referenced by the repository's headless-commerce strategy.
