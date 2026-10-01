# Guna Herbals release baseline

## Current branch and release point

The repository is on `main`, synchronized with `origin/main`, and was clean before this baseline record. The current release point includes Next.js 16.3.2, React 19.2.8, Better Auth route scaffolding, Razorpay checkout and webhook handling, SendGrid adapter support, Cloudinary/Chatwoot/PostHog boundaries, PDF order receipts, and WhatsApp tracking deep links.

## Current database model

Neon PostgreSQL remains the source of truth for products, variants, categories, inventory, customers, addresses, carts, orders, payments, shipments, returns, notifications, audit logs, and Better Auth identity/session tables. The commerce user table remains separate from the Better Auth identity tables. The Better Auth migration is generated but must be applied to the target database during deployment.

## Verified commands

| Gate | Command | Result |
|---|---|---|
| Production build | `DATABASE_URL=... node node_modules/next/dist/bin/next build` | Passed; all 44 routes generated. |
| Dependency audit | `pnpm audit --prod` | One low and one moderate advisory; no high or critical advisory. |
| TypeScript | `pnpm exec tsc --noEmit` | Fails on existing legacy diagnostics outside the new auth/receipt/tracking paths; touched modernization paths are clean. |
| Database migration generation | `pnpm db:generate` | Passed after restricting Drizzle Kit to the two schema files. |
| Repository status | `git status --short` | Clean at the phase baseline. |

## Definition of Done for the remaining rollout

The project is release-ready when the complete commerce schema and migrations are idempotent, all public and private routes use consistent authorization, the admin can manage product and order lifecycles, Razorpay test payments and webhooks reconcile correctly, manual courier tracking updates appear in customer tracking, receipts download only for authorized customers, SendGrid and WhatsApp integrations fail safely, provider secrets remain server-side, and the production build plus targeted API/browser tests pass.

## Next phase

The next phase is the **commerce domain and admin data-contract audit**. It will verify that product tables and admin screens expose name, category, unit, price, stock, variants, images, and status consistently, then verify that order, payment, shipment, return, and audit mutations are transactional and authorized. That phase will be committed and merged into `main` separately before authentication and storefront hardening continue.
