# Guna Herbals modernization rollout

## Decision summary

Guna Herbals remains a single Next.js application with Neon PostgreSQL as the commerce source of truth. The dependency graph has been reduced by removing unused `clsx`, `pg`, `@types/pg`, and the unused browser `html2canvas` dependency was restored because the Instagram export screen imports it dynamically. `dotenv` is retained as a development-only dependency because the existing Drizzle seed script imports `dotenv/config`.

The framework was upgraded to Next.js 16.3.2 and React 19.2.8. Drizzle ORM, Drizzle Kit, `jose`, `postgres`, Tailwind, `sonner`, `tailwind-merge`, React typings, and the TypeScript 5 toolchain were updated to compatible stable releases. TypeScript 7 and ESLint 10 were intentionally not adopted because they are major-version changes requiring a separate compatibility test rather than a blind upgrade.

## Authentication boundary

Better Auth is now available at `/api/auth/*` and supports only email/password authentication, Google sign-in, and cookie-backed sessions. Its tables are isolated as `auth_user`, `auth_account`, `auth_session`, and `auth_verification`. The commerce database continues to own orders, addresses, phones, customer profiles, roles, and operational data.

The application bridges a Better Auth session to the existing commerce user by matching the email address. If there is no matching commerce record, the user is not silently granted commerce access. This prevents accidental duplication and keeps account linking explicit. The Google client ID, client secret, Better Auth URL, and secret are server/deployment configuration values, never source-controlled values.

The authentication rollout should be staged: apply the generated migration, configure test credentials, test sign-up/sign-in/Google callback/session expiry, then migrate existing users by verified email mapping. Do not combine an authentication cutover with a payment gateway change.

## Order receipts and WhatsApp

The authenticated endpoint `/api/orders/[id]/receipt` generates a compact PDF receipt from Neon using `pdf-lib`. It includes order number, date, line items, totals, payment method, and payment status. It excludes full addresses, gateway payloads, card data, and secrets. The checkout success screen downloads this receipt directly.

WhatsApp sharing currently uses the low-cost `wa.me` deep link. It opens WhatsApp with a tracking URL containing the order identifier and does not require a WhatsApp API subscription or message template approval. The tracking page accepts both `order` and `orderId` query parameters and auto-loads the tracking record.

A later WhatsApp Cloud API adapter can be added for proactive status messages. It should be event-driven from order-status changes, idempotent, rate-limited, and configured with a business phone number ID, access token, and approved templates. It must not send full addresses, payment details, or sensitive customer data.

## Rollout steps

| Step | Action | Rollback |
|---|---|---|
| 1 | Review the package diff and lockfile; install with the project package manager and scripts disabled by default. | Restore the previous commit and lockfile. |
| 2 | Apply `drizzle/migrations/0001_military_nightcrawler.sql` to Neon. | Drop only the four `auth_*` tables if the auth route has not been activated. Take a database backup first. |
| 3 | Set `BETTER_AUTH_URL` and a random `BETTER_AUTH_SECRET`; leave Google values empty until OAuth credentials exist. | Disable the Better Auth UI route through deployment configuration and use the existing session path. |
| 4 | Configure Google redirect URIs for `/api/auth/callback/google`. | Remove Google credentials; email/password remains available. |
| 5 | Configure SendGrid sender credentials for password reset and order-confirmation mail. | Leave the adapter unconfigured; commerce operations continue and email delivery is skipped safely. |
| 6 | Test PDF download for an authenticated order and the WhatsApp tracking deep link. | Keep the existing tracking page and customer support contact path. |
| 7 | Deploy to Vercel with the same environment contract. | Move the same build to AWS later; change deployment and environment values, not commerce code. |

## Security verification

The final production build completed successfully with Next.js 16.3.2 and all 44 routes generated. The build reports only the existing middleware-to-proxy deprecation warning and expected Better Auth warnings when Google credentials are absent.

The production dependency audit reports one low and one moderate advisory, with no high or critical vulnerabilities. These should be reviewed before production activation; an audit result is not proof that every transitive issue is harmless. Package upgrades should be applied with lockfile review, release-age policy, and a build/test gate.

## AWS portability contract

The application should use `DATABASE_URL` for PostgreSQL, `CLOUDINARY_*` or an image adapter for media, `SENDGRID_*` for current email, SMTP variables for the future mail provider, `BETTER_AUTH_*` and Google variables for identity, and provider-neutral order/payment interfaces. Moving to AWS RDS or Aurora PostgreSQL should require a connection-string change, migration replay, backup/restore test, and deployment changes. It should not require changing storefront components or order business rules.
