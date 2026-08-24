# Guna Herbals headless-commerce recommendation

## Executive recommendation

The open-source backend the user may be remembering is most likely **Medusa**, **Vendure**, or **Spree**. For the current Guna Herbals codebase, Medusa is the closest technical fit because it is TypeScript/Node-oriented, exposes APIs for a separate storefront, supports custom data models, workflows, events, admin customization, payments, inventory, fulfillment, and a Next.js storefront path [1].

However, the recommendation is **not to migrate immediately**. The current project already has a working Next.js application, Neon/PostgreSQL schema, product and variant catalog, carts, orders, Razorpay foundation, manual shipments, returns/refunds, Better Auth foundation, receipts, WhatsApp sharing, admin operations, and provider adapters. Migrating now would replace the commerce tables and server actions and require data migration, payment reconciliation, customer identity mapping, shipment-state mapping, and storefront contract rewrites.

The safer plan is to finish and release the current application first. Medusa should remain the migration candidate if the custom commerce backend becomes too expensive to maintain or if the store later needs multi-region pricing, multiple sales channels, marketplace workflows, or a larger operations team.

## Platform comparison

| Platform | API and stack | Strengths | Main tradeoff for Guna Herbals | Recommendation |
|---|---|---|---|---|
| Medusa | TypeScript/Node; REST routes and framework modules | Closest to the current stack; extensible workflows, modules, custom data, events, admin customization, payments, inventory, fulfillment, and Next.js storefront guidance [1] | Requires replacing the existing commerce domain and learning Medusa's module model | **Best migration candidate** |
| Vendure | TypeScript/Node; GraphQL Shop/Admin APIs and plugins | Strong catalog/order/customer platform, custom fields, plugins, payment guides, S3/R2 assets, OAuth, and admin dashboard extension [2] | GraphQL/plugin architecture adds a larger integration surface than the current direct Drizzle actions | Good alternative if GraphQL and plugin extensibility are priorities |
| Saleor | Python/Django; GraphQL and apps/extensions | Mature API-first concepts for products, checkout, channels, promotions, payments, custom shipping, dashboard extensions, and self-hosting [3] | Largest stack change from Next.js/TypeScript/Drizzle; GraphQL and Python operations are a bigger migration | Powerful but not the simplest fit here |
| Spree | Ruby on Rails; REST/OpenAPI and TypeScript SDK | REST-first, OpenAPI, Next.js starter, B2B/marketplace features, and self-hosting under BSD-3-Clause according to its official site [4] | Requires operating a Ruby/Rails backend and migrating away from the current TypeScript service boundary | Worth a proof of concept if REST/OpenAPI is the priority |
| Sylius | PHP/Symfony; REST/API Platform | Flexible headless framework, MIT Community Edition, custom checkout, pricing, channels, and integrations [5] | Requires PHP/Symfony/Composer operations and is aimed more at highly customized enterprise commerce | Not appropriate for a simpler solo-operated store |

## Decision for the current rollout

Keep **Next.js + Neon PostgreSQL + Drizzle + Better Auth + Razorpay + manual courier workflow** as the production path for now. Put all external services behind provider-neutral adapters. This preserves the current UI and business logic while keeping future migration possible.

If a migration is later approved, run a separate proof of concept with Medusa rather than mixing it into the production branch. The proof of concept must import a representative catalog, create a cart, complete a Razorpay test payment, create a manual shipment, expose order tracking, and map the current customer identity. Only after those acceptance tests pass should the store migrate.

## Next pending work

1. Finish Phase 5 admin compatibility cleanup and confirm no operational admin screen depends on in-memory ShopContext data.
2. Complete provider activation adapters for SendGrid, Cloudinary, PostHog, Chatwoot, Razorpay, and WhatsApp Cloud API without committing credentials.
3. Run security and reliability hardening, including validation, authorization, idempotency, rate limits, audit coverage, dependency review, and migration checks.
4. Run the end-to-end browser and test-mode payment verification.
5. Prepare the final deployment, backup, webhook, DNS, and credential handoff runbook.

## References

1. [Medusa Documentation](https://docs.medusajs.com/)
2. [Vendure Developer Hub](https://docs.vendure.io/)
3. [Saleor Documentation](https://docs.saleor.io/)
4. [Spree Open Source Headless eCommerce](https://spreecommerce.org/headless-ecommerce/)
5. [Sylius Documentation](https://docs.sylius.com/)
