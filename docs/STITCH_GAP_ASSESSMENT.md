# Guna Herbals Stitch-to-Next.js Gap Assessment

## Executive summary

The current application has the main storefront, authentication, catalog, checkout, order operations, customer records, payments ledger, security, analytics, notifications, gallery, integrations, settings, and audit routes. The connected Neon database is real and the preview has been tested with live catalog rows and one COD sample order.

The Stitch export is broader than the currently implemented production surface. It contains many conceptual screens, but several are design references rather than separate commerce requirements. The highest-value gaps are operational detail screens and document actions: a complete payment detail view, printable order invoice, packing slip, order slip PDF, richer per-user 360-degree activity, and a real staff/team permissions workflow.

## Current production route coverage

| Area | Current route | Current state |
|---|---|---|
| Storefront | `/`, `/shop`, `/shop/[id]`, `/search`, `/cart`, `/checkout`, `/order-success` | Implemented and Neon-backed where commerce data is involved. |
| Customer account | `/login`, `/profile`, `/wishlist`, `/track-order`, `/reset-password` | Implemented, with Better Auth and commerce-user bridge. |
| Public content | `/about`, `/journal`, `/journal/[id]`, `/training`, `/raw-materials`, `/contact`, `/enquiry`, `/faq`, `/policies/*` | Implemented as public content/support surfaces. |
| Admin overview | `/admin/dashboard`, `/admin/analytics` | Implemented with database-backed metrics and analytics surfaces. |
| Admin catalog | `/admin/products`, `/admin/gallery` | Implemented; product detail/editor depth should be checked against the Stitch editor reference. |
| Admin order operations | `/admin/orders`, `/admin/orders/[id]`, `/admin/delivery` | Implemented; order list/detail and manual COD workflow are present. Document actions are still incomplete. |
| Admin payments | `/admin/payments` | Ledger list exists. A dedicated payment detail route is not present; the current UI uses an inline view state when a payment row exists. |
| Admin customers/RBAC | `/admin/customers`, `/admin/customers/[id]` | Customer list and customer detail are present. Team invitations, role assignment, and fine-grained permissions are incomplete. |
| Admin security | `/admin/security`, `/admin/login-attempts`, `/admin/logs` | Security and audit list surfaces exist. Detail/drill-down and complete event taxonomy coverage should be expanded. |
| Admin operations | `/admin/notifications`, `/admin/integrations`, `/admin/settings` | Present; provider activation remains environment-driven. |

## Stitch screens mapped to current coverage

| Stitch reference family | Current coverage | Gap or decision |
|---|---|---|
| Home, categories, product lists, product detail, refined search, cart, wishlist | `/`, `/shop`, `/shop/[id]`, `/search`, `/cart`, `/wishlist` | Core surface is covered. Continue visual refinement against Stitch references, but do not reintroduce mock data. |
| Login/sign-up, verify OTP, member sanctuary, user profile, address book | `/login`, `/profile`, reset-password | Email/password and Google are implemented through Better Auth. OTP and a richer address-book subview may be added if the business requires them. |
| Order history, order details, order success | `/profile`/orders, `/order-success`, `/admin/orders/[id]` | Customer-facing order-detail/history depth should be verified. Admin order detail needs print invoice, packing slip, and order slip actions. |
| Payment methods, UPI processing, payment success/failure | `/checkout`, `/order-success` | Razorpay/COD code exists. Provider credentials and full success/failure browser verification remain deployment tasks. Admin payment detail is missing as a dedicated route. |
| Notifications and notification hub | `/admin/notifications` | Admin notification operations exist; customer notification history and read/unread interaction need confirmation or implementation. |
| Admin dashboard orders/inventory/overview/rituals content | `/admin/dashboard`, `/admin/products`, `/admin/analytics` | Core metrics exist. A distinct CMS/storytelling manager is not implemented as a full editor. |
| Admin product editor and product owner strategy hub | `/admin/products` | Product CRUD exists, but advanced SEO, merchandising, variants, media gallery, and product audit depth should be expanded if required by the team. |
| Admin order tracking/logistics, packer fulfillment station, warehouse logistics hub | `/admin/orders/[id]`, `/admin/delivery` | Manual courier flow exists. Packing-station workflow, printable packing slip, warehouse assignment, and fulfillment queue are missing or simplified. |
| Admin payment logs/reconciliation | `/admin/payments` | Payment list exists. Payment detail, reconciliation notes, gateway timeline, webhook history, refunds, and CSV reconciliation are incomplete. |
| Admin customer profile deep dive, carts/wishlists master view, sessions/activity tracking | `/admin/customers/[id]`, `/admin/login-attempts`, `/admin/security` | Customer detail has orders, sessions, and audit tabs. It does not yet show cart lines, wishlist items, notification history, payment history, support history, or a dedicated activity timeline. |
| Admin team permissions RBAC/internal staff portal | `/admin/customers` | Basic role foundation exists (`admin`, `staff`, `customer`). Staff invitation, role change, permission groups, team directory, and least-privilege route/action enforcement are missing. |
| Admin security/audit/platform health/error taxonomy | `/admin/security`, `/admin/logs`, `/admin/integrations` | List-level coverage exists. Error taxonomy, request correlation, richer audit drill-down, and operational health history are future hardening work. |
| Admin support ticket hub, marketing/FCM, loyalty/referral, mobile configuration, SEO metadata, reviews/community | No complete equivalent | These are future modules, not blockers for the core storefront. Add only when there is a defined business workflow and provider choice. |
| CMS storytelling/content, sustainability/legal, referral, raw-material/B2B flows | Public pages exist for some content | Full content-management CRUD and B2B workflows are not implemented. Treat as phase-two business features. |

## Highest-priority missing features to create next

### 1. Order document center

Add server-generated PDF actions to `/admin/orders/[id]` and the customer order detail surface:

| Document | Purpose | Required fields |
|---|---|---|
| Tax/invoice receipt | Customer and accounting record | Order number, dates, customer, address, line items, tax, discount, shipping, total, payment status, business identity. |
| Packing slip | Warehouse/packer execution | Order number, item quantities, SKU, variant, shipping address, picker/packer notes, barcode/QR if desired. |
| Order slip | Internal print/phone-order reference | Customer contact, order source, items, totals, courier fields, internal notes. |
| Return/refund sheet | Operations | Return authorization, items, reason, status, refund method, operator. |

The existing `pdf-lib` capability should be reused rather than adding another PDF dependency. Downloads must be authorized server-side and must not expose another customer’s order.

### 2. Payment detail and reconciliation

Add `/admin/payments/[id]` or an equivalent protected detail view. It should show the payment row, linked order, payment method, gateway, amount/currency, current state, timestamps, Razorpay IDs, webhook timeline, failure reason, refund records, audit events, and reconciliation notes. The existing payment list should link to that detail view rather than only opening a local modal.

The manual COD transaction now needs to create a pending payment record so COD orders appear in the ledger. The preview sample order currently uses order ID `1`, order number `GUN-2026-MT6YFCOQ`, total ₹484, and COD pending status; the missing payment-row behavior should be corrected in the application and the sample row backfilled only for testing.

### 3. Customer 360 view

Expand `/admin/customers/[id]` with tabs or sections for profile, orders, payments, cart, wishlist, addresses, sessions, notifications, support enquiries, and a chronological audit/activity timeline. Every sensitive action—blocking, unblocking, session revocation, role changes, and manual order creation—must remain audited.

### 4. Staff/team RBAC

Create a dedicated team-management workflow rather than using the customer list as a staff directory. It should support staff invitations, activation, role changes, permission groups, per-module access, session revocation, and audit history. Recommended base permission groups are `catalog`, `orders`, `fulfillment`, `payments`, `customers`, `content`, `analytics`, `support`, and `security`; the owner/admin role should retain all permissions.

### 5. Fulfillment station

Add a packer-oriented queue with filters for paid/COD, pending/processing, warehouse, courier assignment, and print status. Add packing confirmation, shipment assignment, tracking number, customer notification, and a print packing slip action. Keep the courier adapter manual/provider-neutral.

## Features that are not missing blockers

The Stitch archive also includes referral/loyalty, FCM marketing triggers, mobile-app configuration, CMS storytelling, support-ticket hub, reviews/community, SEO metadata, B2B raw-material workflows, and platform-health dashboards. These are legitimate future modules, but implementing them now would expand scope beyond the core production e-commerce release. They should be added only after the order, payment, customer-360, fulfillment, and staff-permissions gaps are closed.

## Test data and current preview observations

The connected Neon database contains the seeded catalog and a confirmed sample COD order created during the preview test:

| Record | Value |
|---|---|
| Product | Gunas Amla Hair Oil |
| Product price | ₹434 |
| Shipping | ₹50 |
| Sample order | `GUN-2026-MT6YFCOQ` |
| Sample order total | ₹484 |
| Order status | Processing |
| Payment status | Pending COD |
| Shipping address | Preview Test Customer, Tenkasi |

The order list, order detail, customer detail, product detail, payment ledger, security events, and integrations pages were opened in the preview. The customer detail route required a Next.js 16 Promise-based `params` correction. The manual-order modal required normalization of the `getAllProducts()` response before it could load catalog choices. Those corrections should be included in the next commit after build verification.

## Recommended implementation order

1. Finish the current order/payment document and payment-record corrections.
2. Add dedicated payment detail and reconciliation views.
3. Expand customer 360 sections for cart, wishlist, payments, notifications, and audit timeline.
4. Add the fulfillment/packing station and print actions.
5. Build staff invitations and fine-grained RBAC.
6. Re-run the complete storefront and admin smoke test, then update the production handoff.
