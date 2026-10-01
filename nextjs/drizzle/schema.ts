import {
    pgTable, bigserial, text, varchar, numeric, integer, boolean,
    timestamp, date, jsonb, check, bigint, primaryKey, foreignKey,
    uniqueIndex, index, pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// =========================
// ENUMS
// =========================

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff', 'customer']);
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked']);
export const orderStatusEnum = pgEnum('order_status', [
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
]);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping']);
export const stockMovementTypeEnum = pgEnum('stock_movement_type', ['in', 'out', 'adjustment']);
export const reservationStatusEnum = pgEnum('reservation_status', ['active', 'released', 'converted']);
export const returnStatusEnum = pgEnum('return_status', ['requested', 'approved', 'rejected', 'completed']);
export const enquiryStatusEnum = pgEnum('enquiry_status', ['pending', 'read', 'responded']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'flat']);
export const paymentMethodEnum = pgEnum('payment_method', ['razorpay', 'cod', 'card', 'upi']);

// =========================
// USERS & AUTHENTICATION
// =========================

export const users = pgTable('users', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name'),
    email: text('email').unique().notNull(),
    phone: text('phone').unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('customer').notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    emailVerified: boolean('email_verified').default(false),
    phoneVerified: boolean('phone_verified').default(false),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('users_email_idx').on(table.email),
    index('users_phone_idx').on(table.phone),
    index('users_status_idx').on(table.status),
]);

export const userProfiles = pgTable('user_profiles', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    gender: text('gender'),
    dateOfBirth: date('date_of_birth'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('user_profiles_user_id_idx').on(table.userId),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: 'user_profiles_user_id_fk'
    })
]);

export const userSessions = pgTable('user_sessions', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    sessionToken: text('session_token').unique().notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
}, (table) => [
    index('user_sessions_user_id_idx').on(table.userId),
    index('user_sessions_token_idx').on(table.sessionToken),
    index('user_sessions_expires_idx').on(table.expiresAt),
]);

// =========================
// ADDRESSES
// =========================

export const addresses = pgTable('addresses', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    type: addressTypeEnum('type').notNull(),
    name: text('name'),
    phone: text('phone'),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    landmark: text('landmark'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    country: text('country').default('India').notNull(),
    postalCode: text('postal_code').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('addresses_user_id_idx').on(table.userId),
    index('addresses_type_idx').on(table.type),
    check('addresses_phone_check', sql`${table.phone} ~ '^[0-9]{10}$'`),
]);

// =========================
// CATALOG
// =========================

export const categories = pgTable('categories', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    parentId: bigint('parent_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true).notNull(),
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('categories_slug_idx').on(table.slug),
    index('categories_parent_id_idx').on(table.parentId),
    index('categories_is_active_idx').on(table.isActive),
]);

export const brands = pgTable('brands', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    logoUrl: text('logo_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('brands_slug_idx').on(table.slug),
    index('brands_is_active_idx').on(table.isActive),
]);

export const products = pgTable('products', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
    brandId: bigint('brand_id', { mode: 'number' }).references(() => brands.id, { onDelete: 'set null' }),
    categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id, { onDelete: 'set null' }),
    isActive: boolean('is_active').default(true).notNull(),
    isFeatured: boolean('is_featured').default(false),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    metaKeywords: text('meta_keywords'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('products_slug_idx').on(table.slug),
    index('products_brand_id_idx').on(table.brandId),
    index('products_category_id_idx').on(table.categoryId),
    index('products_is_active_idx').on(table.isActive),
    index('products_is_featured_idx').on(table.isFeatured),
]);

export const productVariants = pgTable('product_variants', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
    sku: text('sku').unique().notNull(),
    variantName: text('variant_name'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
    costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
    weight: numeric('weight', { precision: 8, scale: 2 }),
    dimensions: text('dimensions'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('product_variants_product_id_idx').on(table.productId),
    index('product_variants_sku_idx').on(table.sku),
    index('product_variants_is_active_idx').on(table.isActive),
    check('product_variants_price_check', sql`${table.price} > 0`),
]);

export const productImages = pgTable('product_images', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    altText: text('alt_text'),
    isPrimary: boolean('is_primary').default(false).notNull(),
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('product_images_product_id_idx').on(table.productId),
    index('product_images_variant_id_idx').on(table.variantId),
    index('product_images_is_primary_idx').on(table.isPrimary),
]);

// =========================
// INVENTORY & WAREHOUSING
// =========================

export const warehouses = pgTable('warehouses', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    code: text('code').unique().notNull(),
    location: text('location'),
    address: text('address'),
    city: text('city'),
    state: text('state'),
    country: text('country').default('India'),
    postalCode: text('postal_code'),
    contactPerson: text('contact_person'),
    contactPhone: text('contact_phone'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('warehouses_code_idx').on(table.code),
    index('warehouses_is_active_idx').on(table.isActive),
]);

export const inventory = pgTable('inventory', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    warehouseId: bigint('warehouse_id', { mode: 'number' }).references(() => warehouses.id, { onDelete: 'cascade' }).notNull(),
    stockQty: integer('stock_qty').default(0).notNull(),
    reservedQty: integer('reserved_qty').default(0).notNull(),
    reorderLevel: integer('reorder_level').default(10),
    reorderQty: integer('reorder_qty').default(50),
    lastRestocked: timestamp('last_restocked'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('inventory_variant_id_idx').on(table.variantId),
    index('inventory_warehouse_id_idx').on(table.warehouseId),
    uniqueIndex('inventory_variant_warehouse_unq').on(table.variantId, table.warehouseId),
    check('inventory_stock_qty_check', sql`${table.stockQty} >= 0`),
    check('inventory_reserved_qty_check', sql`${table.reservedQty} >= 0`),
]);

export const inventoryReservations = pgTable('inventory_reservations', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }),
    cartId: bigint('cart_id', { mode: 'number' }).references(() => carts.id, { onDelete: 'cascade' }),
    reservedQty: integer('reserved_qty').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    status: reservationStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('inventory_reservations_variant_id_idx').on(table.variantId),
    index('inventory_reservations_order_id_idx').on(table.orderId),
    index('inventory_reservations_cart_id_idx').on(table.cartId),
    index('inventory_reservations_status_idx').on(table.status),
    index('inventory_reservations_expires_idx').on(table.expiresAt),
]);

export const stockMovements = pgTable('stock_movements', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    warehouseId: bigint('warehouse_id', { mode: 'number' }).references(() => warehouses.id, { onDelete: 'cascade' }).notNull(),
    movementType: stockMovementTypeEnum('movement_type').notNull(),
    quantity: integer('quantity').notNull(),
    previousQty: integer('previous_qty'),
    newQty: integer('new_qty'),
    referenceId: bigint('reference_id', { mode: 'number' }),
    referenceType: text('reference_type'),
    notes: text('notes'),
    createdBy: bigint('created_by', { mode: 'number' }).references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('stock_movements_variant_id_idx').on(table.variantId),
    index('stock_movements_warehouse_id_idx').on(table.warehouseId),
    index('stock_movements_reference_idx').on(table.referenceId, table.referenceType),
    index('stock_movements_created_at_idx').on(table.createdAt),
]);

export const batches = pgTable('batches', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    batchCode: text('batch_code').unique().notNull(),
    manufactureDate: date('manufacture_date').notNull(),
    expiryDate: date('expiry_date').notNull(),
    quantityProduced: integer('quantity_produced').notNull(),
    quantityAvailable: integer('quantity_available').notNull(),
    qualityStatus: text('quality_status').default('approved'),
    warehouseId: bigint('warehouse_id', { mode: 'number' }).references(() => warehouses.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('batches_variant_id_idx').on(table.variantId),
    index('batches_batch_code_idx').on(table.batchCode),
    index('batches_expiry_date_idx').on(table.expiryDate),
    check('batches_quantity_check', sql`${table.quantityAvailable} >= 0 AND ${table.quantityAvailable} <= ${table.quantityProduced}`),
]);

// =========================
// DISCOUNTS & COUPONS
// =========================

export const discounts = pgTable('discounts', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    discountType: discountTypeEnum('discount_type').notNull(),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }),
    maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    appliesToCategories: jsonb('applies_to_categories'),
    appliesToProducts: jsonb('applies_to_products'),
    usageLimit: integer('usage_limit'),
    usageCount: integer('usage_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('discounts_is_active_idx').on(table.isActive),
    index('discounts_dates_idx').on(table.startDate, table.endDate),
    check('discounts_value_check', sql`${table.value} > 0`),
    check('discounts_dates_check', sql`${table.endDate} > ${table.startDate}`),
]);

export const coupons = pgTable('coupons', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    code: text('code').unique().notNull(),
    discountType: discountTypeEnum('discount_type').notNull(),
    discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }),
    maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }),
    usageLimit: integer('usage_limit'),
    usageCount: integer('usage_count').default(0),
    perUserLimit: integer('per_user_limit').default(1),
    startDate: date('start_date').notNull(),
    expiryDate: date('expiry_date').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    appliesToCategories: jsonb('applies_to_categories'),
    appliesToProducts: jsonb('applies_to_products'),
    createdBy: bigint('created_by', { mode: 'number' }).references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('coupons_code_idx').on(table.code),
    index('coupons_is_active_idx').on(table.isActive),
    index('coupons_expiry_date_idx').on(table.expiryDate),
    check('coupons_value_check', sql`${table.discountValue} > 0`),
]);

// =========================
// CART & WISHLIST
// =========================

export const carts = pgTable('carts', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    couponCode: text('coupon_code'),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
    taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
    shippingCharge: numeric('shipping_charge', { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('carts_user_id_idx').on(table.userId),
    uniqueIndex('carts_user_unq').on(table.userId),
]);

export const cartItems = pgTable('cart_items', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    cartId: bigint('cart_id', { mode: 'number' }).references(() => carts.id, { onDelete: 'cascade' }).notNull(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
    quantity: integer('quantity').notNull(),
    priceAtTime: numeric('price_at_time', { precision: 10, scale: 2 }).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('cart_items_cart_id_idx').on(table.cartId),
    index('cart_items_variant_id_idx').on(table.variantId),
    uniqueIndex('cart_items_cart_variant_unq').on(table.cartId, table.variantId),
    check('cart_items_quantity_check', sql`${table.quantity} > 0 AND ${table.quantity} <= 100`),
]);

export const wishlists = pgTable('wishlists', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').default('My Wishlist'),
    isDefault: boolean('is_default').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('wishlists_user_id_idx').on(table.userId),
    uniqueIndex('wishlists_user_default_unq').on(table.userId, table.isDefault).where(sql`${table.isDefault} = true`),
]);

export const wishlistItems = pgTable('wishlist_items', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    wishlistId: bigint('wishlist_id', { mode: 'number' }).references(() => wishlists.id, { onDelete: 'cascade' }).notNull(),
    productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => [
    index('wishlist_items_wishlist_id_idx').on(table.wishlistId),
    index('wishlist_items_product_id_idx').on(table.productId),
    uniqueIndex('wishlist_items_wishlist_product_unq').on(table.wishlistId, table.productId),
]);

// =========================
// ORDERS & PAYMENTS
// =========================

export const orders = pgTable('orders', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderNumber: text('order_number').unique().notNull(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    orderStatus: orderStatusEnum('order_status').default('pending').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
    taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull(),
    shippingCharge: numeric('shipping_charge', { precision: 10, scale: 2 }).notNull(),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    couponCode: text('coupon_code'),
    shippingAddress: jsonb('shipping_address').notNull(),
    billingAddress: jsonb('billing_address').notNull(),
    customerNotes: text('customer_notes'),
    internalNotes: text('internal_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('orders_user_id_idx').on(table.userId),
    index('orders_order_number_idx').on(table.orderNumber),
    index('orders_order_status_idx').on(table.orderStatus),
    index('orders_payment_status_idx').on(table.paymentStatus),
    index('orders_created_at_idx').on(table.createdAt),
]);

export const orderItems = pgTable('order_items', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    variantId: bigint('variant_id', { mode: 'number' }).references(() => productVariants.id).notNull(),
    productName: text('product_name').notNull(),
    variantName: text('variant_name'),
    sku: text('sku').notNull(),
    quantity: integer('quantity').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull(),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    batchId: bigint('batch_id', { mode: 'number' }).references(() => batches.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    index('order_items_variant_id_idx').on(table.variantId),
    index('order_items_sku_idx').on(table.sku),
]);

export const payments = pgTable('payments', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    paymentGateway: text('payment_gateway').default('razorpay'),
    gatewayOrderId: text('gateway_order_id'),
    gatewayPaymentId: text('gateway_payment_id'),
    gatewaySignature: text('gateway_signature'),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('INR'),
    status: paymentStatusEnum('status').default('pending').notNull(),
    failureReason: text('failure_reason'),
    callbackPayload: jsonb('callback_payload'),
    initiatedAt: timestamp('initiated_at').defaultNow().notNull(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('payments_order_id_idx').on(table.orderId),
    index('payments_gateway_order_id_idx').on(table.gatewayOrderId),
    index('payments_status_idx').on(table.status),
    uniqueIndex('payments_gateway_payment_id_unq').on(table.gatewayPaymentId).where(sql`${table.gatewayPaymentId} IS NOT NULL`),
]);

export const paymentWebhooks = pgTable('payment_webhooks', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    provider: text('provider').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    signature: text('signature'),
    referenceId: bigint('reference_id', { mode: 'number' }).references(() => payments.id, { onDelete: 'cascade' }),
    verified: boolean('verified').default(false),
    processed: boolean('processed').default(false),
    processingError: text('processing_error'),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
}, (table) => [
    index('payment_webhooks_provider_idx').on(table.provider),
    index('payment_webhooks_event_type_idx').on(table.eventType),
    index('payment_webhooks_processed_idx').on(table.processed),
    index('payment_webhooks_received_at_idx').on(table.receivedAt),
]);

// =========================
// SHIPPING
// =========================

export const shipments = pgTable('shipments', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    shipmentNumber: text('shipment_number').unique().notNull(),
    courierName: text('courier_name').notNull(),
    trackingNumber: text('tracking_number'),
    trackingUrl: text('tracking_url'),
    shippingAddress: jsonb('shipping_address').notNull(),
    status: text('status').default('pending'),
    shippedAt: timestamp('shipped_at'),
    estimatedDelivery: timestamp('estimated_delivery'),
    deliveredAt: timestamp('delivered_at'),
    deliveryProof: text('delivery_proof'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('shipments_order_id_idx').on(table.orderId),
    index('shipments_shipment_number_idx').on(table.shipmentNumber),
    index('shipments_tracking_number_idx').on(table.trackingNumber),
    index('shipments_status_idx').on(table.status),
]);

// =========================
// RETURNS & REFUNDS
// =========================

export const returns = pgTable('returns', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    orderItemId: bigint('order_item_id', { mode: 'number' }).references(() => orderItems.id).notNull(),
    returnNumber: text('return_number').unique().notNull(),
    reason: text('reason').notNull(),
    status: returnStatusEnum('status').default('requested').notNull(),
    quantity: integer('quantity').notNull(),
    refundAmount: numeric('refund_amount', { precision: 10, scale: 2 }),
    customerNotes: text('customer_notes'),
    adminNotes: text('admin_notes'),
    requestedAt: timestamp('requested_at').defaultNow().notNull(),
    approvedAt: timestamp('approved_at'),
    rejectedAt: timestamp('rejected_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('returns_order_id_idx').on(table.orderId),
    index('returns_order_item_id_idx').on(table.orderItemId),
    index('returns_return_number_idx').on(table.returnNumber),
    index('returns_status_idx').on(table.status),
    check('returns_quantity_check', sql`${table.quantity} > 0`),
]);

export const refunds = pgTable('refunds', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    returnId: bigint('return_id', { mode: 'number' }).references(() => returns.id, { onDelete: 'cascade' }).notNull(),
    refundNumber: text('refund_number').unique().notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    refundMethod: text('refund_method').notNull(),
    gatewayRefundId: text('gateway_refund_id'),
    status: text('status').default('pending'),
    processedAt: timestamp('processed_at'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('refunds_return_id_idx').on(table.returnId),
    index('refunds_refund_number_idx').on(table.refundNumber),
    index('refunds_status_idx').on(table.status),
]);

// =========================
// REVIEWS
// =========================

export const reviews = pgTable('reviews', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    productId: bigint('product_id', { mode: 'number' }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull(),
    orderItemId: bigint('order_item_id', { mode: 'number' }).references(() => orderItems.id),
    rating: integer('rating').notNull(),
    title: text('title'),
    comment: text('comment').notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    isApproved: boolean('is_approved').default(true).notNull(),
    helpfulCount: integer('helpful_count').default(0),
    reportCount: integer('report_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('reviews_product_id_idx').on(table.productId),
    index('reviews_user_id_idx').on(table.userId),
    index('reviews_order_item_id_idx').on(table.orderItemId),
    index('reviews_rating_idx').on(table.rating),
    index('reviews_is_verified_idx').on(table.isVerified),
    index('reviews_is_approved_idx').on(table.isApproved),
    check('reviews_rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
]);

// =========================
// BANNERS
// =========================

export const banners = pgTable('banners', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    imageUrl: text('image_url').notNull(),
    mobileImageUrl: text('mobile_image_url'),
    link: text('link'),
    buttonText: text('button_text'),
    displayOrder: integer('display_order').default(0),
    isActive: boolean('is_active').default(true).notNull(),
    startDate: date('start_date'),
    endDate: date('end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('banners_is_active_idx').on(table.isActive),
    index('banners_display_order_idx').on(table.displayOrder),
    index('banners_dates_idx').on(table.startDate, table.endDate),
]);

// =========================
// AUDIT LOGS
// =========================

export const auditLogs = pgTable('audit_logs', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    userEmail: text('user_email'),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: bigint('entity_id', { mode: 'number' }),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('audit_logs_user_id_idx').on(table.userId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_entity_idx').on(table.entity),
    index('audit_logs_entity_id_idx').on(table.entityId),
    index('audit_logs_created_at_idx').on(table.createdAt),
]);

// =========================
// ENQUIRIES
// =========================

export const enquiries = pgTable('enquiries', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    status: enquiryStatusEnum('status').default('pending').notNull(),
    assignedTo: bigint('assigned_to', { mode: 'number' }).references(() => users.id),
    response: text('response'),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    index('enquiries_user_id_idx').on(table.userId),
    index('enquiries_email_idx').on(table.email),
    index('enquiries_status_idx').on(table.status),
    index('enquiries_created_at_idx').on(table.createdAt),
]);

//=========================
// RELATIONS
// =========================

export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(userProfiles, {
        fields: [users.id],
        references: [userProfiles.userId],
    }),
    addresses: many(addresses),
    sessions: many(userSessions),
    cart: one(carts),
    wishlists: many(wishlists),
    orders: many(orders),
    reviews: many(reviews),
    enquiries: many(enquiries),
    auditLogs: many(auditLogs),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id],
    }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
    user: one(users, {
        fields: [userSessions.userId],
        references: [users.id],
    }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
    user: one(users, {
        fields: [addresses.userId],
        references: [users.id],
    }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
    }),
    children: many(categories, {
        relationName: 'children',
    }),
    products: many(products),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    brand: one(brands, {
        fields: [products.brandId],
        references: [brands.id],
    }),
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    variants: many(productVariants),
    images: many(productImages),
    reviews: many(reviews),
    wishlistItems: many(wishlistItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
    }),
    images: many(productImages),
    inventory: many(inventory),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
    stockMovements: many(stockMovements),
    batches: many(batches),
    reservations: many(inventoryReservations),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
    variant: one(productVariants, {
        fields: [productImages.variantId],
        references: [productVariants.id],
    }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
    variant: one(productVariants, {
        fields: [inventory.variantId],
        references: [productVariants.id],
    }),
    warehouse: one(warehouses, {
        fields: [inventory.warehouseId],
        references: [warehouses.id],
    }),
}));

export const inventoryReservationsRelations = relations(inventoryReservations, ({ one }) => ({
    variant: one(productVariants, {
        fields: [inventoryReservations.variantId],
        references: [productVariants.id],
    }),
    order: one(orders, {
        fields: [inventoryReservations.orderId],
        references: [orders.id],
    }),
    cart: one(carts, {
        fields: [inventoryReservations.cartId],
        references: [carts.id],
    }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
    variant: one(productVariants, {
        fields: [stockMovements.variantId],
        references: [productVariants.id],
    }),
    warehouse: one(warehouses, {
        fields: [stockMovements.warehouseId],
        references: [warehouses.id],
    }),
    createdBy: one(users, {
        fields: [stockMovements.createdBy],
        references: [users.id],
    }),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
    variant: one(productVariants, {
        fields: [batches.variantId],
        references: [productVariants.id],
    }),
    warehouse: one(warehouses, {
        fields: [batches.warehouseId],
        references: [warehouses.id],
    }),
    orderItems: many(orderItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
    user: one(users, {
        fields: [carts.userId],
        references: [users.id],
    }),
    items: many(cartItems),
    reservations: many(inventoryReservations),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts, {
        fields: [cartItems.cartId],
        references: [carts.id],
    }),
    variant: one(productVariants, {
        fields: [cartItems.variantId],
        references: [productVariants.id],
    }),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
    user: one(users, {
        fields: [wishlists.userId],
        references: [users.id],
    }),
    items: many(wishlistItems),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
    wishlist: one(wishlists, {
        fields: [wishlistItems.wishlistId],
        references: [wishlists.id],
    }),
    product: one(products, {
        fields: [wishlistItems.productId],
        references: [products.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
    payment: one(payments),
    shipments: many(shipments),
    returns: many(returns),
    reservations: many(inventoryReservations),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    variant: one(productVariants, {
        fields: [orderItems.variantId],
        references: [productVariants.id],
    }),
    batch: one(batches, {
        fields: [orderItems.batchId],
        references: [batches.id],
    }),
    return: one(returns),
    review: one(reviews),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
    webhooks: many(paymentWebhooks),
}));

export const paymentWebhooksRelations = relations(paymentWebhooks, ({ one }) => ({
    payment: one(payments, {
        fields: [paymentWebhooks.referenceId],
        references: [payments.id],
    }),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
    order: one(orders, {
        fields: [shipments.orderId],
        references: [orders.id],
    }),
}));

export const returnsRelations = relations(returns, ({ one }) => ({
    order: one(orders, {
        fields: [returns.orderId],
        references: [orders.id],
    }),
    orderItem: one(orderItems, {
        fields: [returns.orderItemId],
        references: [orderItems.id],
    }),
    refund: one(refunds),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
    return: one(returns, {
        fields: [refunds.returnId],
        references: [returns.id],
    }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    product: one(products, {
        fields: [reviews.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [reviews.userId],
        references: [users.id],
    }),
    orderItem: one(orderItems, {
        fields: [reviews.orderItemId],
        references: [orderItems.id],
    }),
}));

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
    user: one(users, {
        fields: [enquiries.userId],
        references: [users.id],
    }),
    assignedTo: one(users, {
        fields: [enquiries.assignedTo],
        references: [users.id],
        relationName: 'assigned_enquiries',
    }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));