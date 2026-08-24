# Headless commerce findings

## Medusa

Source: https://docs.medusajs.com/

The official Medusa documentation currently presents Medusa v2.19 as a commerce platform with a built-in framework for customizations. It documents REST API routes, workflows, custom data models, custom modules, linked data models, event subscriptions, admin customization, and system integrations. Its documentation also lists cart and purchase, payment, product, order, customer, promotion, fulfillment, and other commerce modules, plus a Next.js storefront starter and custom storefront guidance. This makes Medusa a strong fit for a TypeScript/Node team that wants a custom Next.js frontend and provider-specific extensions such as manual courier workflows.

## Saleor

Source: https://docs.saleor.io/

Saleor's official documentation describes a headless commerce platform with a GraphQL API and an extension/app model. The docs cover products, checkout, channels, promotions, modeling, payments, multi-region, custom shipping, dashboard extensions, marketplace recipes, SMTP, and self-hosting. Saleor is powerful and composable, but its GraphQL/Python/Django-centered architecture would be a larger change from the current Next.js/Drizzle/Neon codebase.

## Initial implication for Guna Herbals

The current application already contains a commerce domain for products, variants, inventory, carts, orders, payments, shipments, returns, refunds, users, addresses, discounts, audit logs, analytics, and admin pages. A headless platform would replace most of these domain tables and server actions, but would require a migration of catalog IDs, order IDs, customers, payment references, shipment state, and admin workflows. The least disruptive candidate to investigate further is Medusa because it is TypeScript/Node-oriented, API-first, extensible, and compatible with keeping the existing Next.js storefront concept. Migration should not begin until a proof-of-concept validates Razorpay, manual shipping, customer identity, and the exact data migration path.

## References

1. [Medusa Documentation](https://docs.medusajs.com/)
2. [Saleor Documentation](https://docs.saleor.io/)
3. [Medusa GitHub repository](https://github.com/medusajs/medusa)
4. [Saleor GitHub repository](https://github.com/saleor/saleor)
5. [Spree headless commerce](https://spreecommerce.org/headless-ecommerce/)
6. [Sylius documentation](https://docs.sylius.com/)
