# Guna Herbals Store

A premium, product-first herbal e-commerce storefront built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **Drizzle ORM**, and **PostgreSQL**. The project includes a customer storefront, customer authentication, cart and checkout, Razorpay payment foundations, manual courier fulfillment, receipts, tracking, WhatsApp sharing, and a database-backed admin panel.

## Current architecture

| Layer | Current implementation | Portability boundary |
|---|---|---|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS | Can deploy on Vercel, AWS, or another Node-compatible platform |
| Commerce database | Neon PostgreSQL with Drizzle ORM | PostgreSQL connection string and migrations can move to AWS RDS/Aurora or another PostgreSQL provider |
| Authentication | Better Auth foundation with email/password, Google sign-in, and sessions | Commerce user IDs remain separate from auth-provider records |
| Payments | Razorpay Orders API, Checkout, HMAC verification, and webhook route | Payment adapter keeps the checkout contract independent of the gateway |
| Fulfillment | Manual courier workflow with shipper, shipment number, tracking number, URL, and status | No courier API lock-in; any later courier API can be added behind the same shipment contract |
| Email | SendGrid adapter | Can later be replaced with SMTP without changing order or auth business logic |
| Product media | Cloudinary-ready adapter | Can later be changed to R2 or S3-compatible storage |
| Analytics | PostHog-ready browser provider | Host is configurable for PostHog Cloud or self-hosting |
| Support | Chatwoot-ready optional widget | Cloud or self-hosted Chatwoot can be selected without storing conversations in commerce tables |
| Receipts | Server-generated PDF receipts with `pdf-lib` | No external document-service lock-in |
| Order sharing | WhatsApp deep link for tracking | WhatsApp Cloud API can be added later for proactive messages |
| Deployment/DNS | Vercel and Cloudflare-ready configuration | Deployment and DNS remain separate from commerce logic |

## Headless commerce evaluation

The preferred future headless-commerce migration target is **Medusa**. Its current documentation describes a TypeScript/Node commerce platform with custom REST API routes, workflows, data models, modules, event subscribers, admin customization, payments, inventory, fulfillment, customer management, and a Next.js storefront path [1]. This is the closest architectural fit if Guna Herbals later outgrows the custom commerce domain.

The project should not migrate to Medusa immediately. The current backend already contains working product, variant, inventory, cart, order, payment, shipment, return, refund, user, address, discount, audit, and admin concepts. An immediate migration would require catalog, customer, payment, order, shipment, and identity mapping while introducing a second operational system. The safe policy is to finish and launch the current system, then run a separate Medusa proof of concept before considering production migration.

| Platform | API/stack | Strengths | Tradeoff | Fit |
|---|---|---|---|---|
| **Medusa** | TypeScript/Node, REST routes and extensible framework | Custom modules, workflows, events, payments, inventory, fulfillment, admin customization, and Next.js guidance [1] | Requires migrating the current commerce domain | **Best future migration candidate** |
| **Vendure** | TypeScript/Node, GraphQL APIs and plugins | Catalog, orders, customers, custom fields, payments, OAuth, S3/R2 assets, and dashboard extensions [2] | Larger GraphQL/plugin integration surface | Strong alternative |
| **Saleor** | Python/Django, GraphQL, apps | Products, checkout, channels, promotions, payments, custom shipping, dashboard extensions, self-hosting [3] | Largest technology change from this project | Powerful but not minimal |
| **Spree** | Ruby/Rails, REST/OpenAPI | REST API, TypeScript SDK, Next.js starter, self-hosting, B2B and marketplace capabilities [4] | Requires operating a Ruby/Rails backend | Worth a proof of concept if REST is preferred |
| **Sylius** | PHP/Symfony, API Platform | MIT Community Edition, flexible checkout, pricing, channels, and API integrations [5] | Requires PHP/Symfony operations and is more enterprise-oriented | Not recommended for the current solo rollout |

## Tools and services used

The project uses a deliberately small tool set. **Next.js** provides the application runtime and routing. **React** and **TypeScript** provide the UI and type system. **Tailwind CSS** provides styling. **Drizzle ORM** provides typed PostgreSQL access and migrations. **Neon** is the current PostgreSQL host. **Better Auth** is the planned identity layer with only email/password, Google sign-in, and sessions. **Razorpay** handles payments. **SendGrid** handles transactional email initially. **Cloudinary** is the preferred product-image platform. **PostHog** is the selected analytics platform. **Chatwoot** is the selected support platform. **Vercel** is the current deployment target, and **Cloudflare DNS** is the intended domain/DNS layer.

The application also uses `pdf-lib` for server-generated receipts, a WhatsApp `wa.me` link for free tracking sharing, `sonner` for client notifications, `html2canvas` only for the existing Instagram asset-export route, `dotenv` only for database scripts, and Lucide-style dependency-free SVGs in the shared `components/Icon.tsx` component. Unused packages are removed rather than retained “just in case.”

## Rollout status

The implementation is being delivered in sequential checkpoints. Every completed checkpoint is built, reviewed, committed, and merged into `main` before the next phase begins.

| Phase | Status |
|---|---|
| Release baseline and acceptance gates | Complete and merged |
| Commerce product, inventory, order, payment, shipment, refund, and customer operations | In progress through verified slices |
| Better Auth customer recovery and session foundation | Complete and merged |
| Storefront full-catalog search, checkout, receipts, tracking, and WhatsApp sharing | Verified slices merged |
| Admin payments, audit logs, analytics, customers, security | Verified slices merged; final compatibility audit in progress |
| Provider activation and migration-safe adapters | Foundation complete; credentials and production URLs remain user-owned |
| Security hardening and release verification | Pending |
| Final deployment and launch handoff | Pending |

## Migration policy

No production provider is changed silently. Migrations are staged and reversible. Commerce records remain in PostgreSQL, and external systems receive references rather than becoming the source of truth for orders or payments. A future Medusa migration must first pass catalog import, cart creation, Razorpay test payment, manual shipment creation, order tracking, receipt generation, and customer identity mapping in a separate proof-of-concept environment.

The migration SQL/data-mapping foundation is kept separate from the active commerce schema. It is intended for a future copy/export process and must not be applied to production without a backup, a dry run, row-count checks, foreign-key checks, payment reconciliation, and rollback notes.

## Local development

```bash
pnpm install
pnpm dev
```

Use `.env.example` as the configuration contract. Never commit provider secrets, OAuth secrets, payment secrets, webhook secrets, or database URLs. Production credentials belong in the deployment provider’s encrypted environment settings.

## Verification

```bash
pnpm build
pnpm exec tsc
pnpm audit
```

The production build currently skips TypeScript validation by project configuration. TypeScript diagnostics should still be run separately and resolved before production launch. Build-time warnings about missing Google OAuth credentials are expected until credentials are configured.

## References

1. [Medusa Documentation](https://docs.medusajs.com/)
2. [Vendure Developer Hub](https://docs.vendure.io/)
3. [Saleor Documentation](https://docs.saleor.io/)
4. [Spree Open Source Headless eCommerce](https://spreecommerce.org/headless-ecommerce/)
5. [Sylius Documentation](https://docs.sylius.com/)
