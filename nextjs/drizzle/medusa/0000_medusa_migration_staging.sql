-- Guna Herbals -> Medusa migration staging foundation
--
-- SAFETY: This file is intentionally outside drizzle.config.ts and is NOT part of
-- the live application migration chain. It creates an isolated schema only.
-- Run it against a database copy or a dedicated migration branch after backup.
-- It does not insert into or alter any Medusa tables.
--
-- The final import into a Medusa installation must be performed by a reviewed
-- ETL script using the target Medusa version's documented API/data model.

BEGIN;

CREATE SCHEMA IF NOT EXISTS medusa_migration;

CREATE TABLE IF NOT EXISTS medusa_migration.run (
    id bigserial PRIMARY KEY,
    source_database text NOT NULL DEFAULT current_database(),
    target_medusa_version text,
    status text NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'validated', 'exported', 'applied', 'rolled_back')),
    created_at timestamptz NOT NULL DEFAULT now(),
    validated_at timestamptz,
    notes text
);

CREATE TABLE IF NOT EXISTS medusa_migration.product_map (
    run_id bigint NOT NULL REFERENCES medusa_migration.run(id) ON DELETE CASCADE,
    source_product_id bigint NOT NULL,
    source_variant_id bigint,
    source_category_id bigint,
    source_name text NOT NULL,
    source_slug text,
    source_description text,
    source_category_name text,
    source_variant_name text,
    source_sku text,
    source_price numeric(18,2),
    source_compare_at_price numeric(18,2),
    source_unit text,
    source_weight numeric(18,3),
    source_stock integer,
    source_is_active boolean,
    target_product_id text,
    target_variant_id text,
    import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'ready', 'imported', 'skipped', 'error')),
    error_message text,
    PRIMARY KEY (run_id, source_product_id, source_variant_id)
);

CREATE TABLE IF NOT EXISTS medusa_migration.customer_map (
    run_id bigint NOT NULL REFERENCES medusa_migration.run(id) ON DELETE CASCADE,
    source_user_id bigint NOT NULL,
    source_email text NOT NULL,
    source_name text,
    source_phone text,
    source_status text,
    source_created_at timestamptz,
    target_customer_id text,
    target_auth_user_id text,
    import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'ready', 'imported', 'skipped', 'error')),
    error_message text,
    PRIMARY KEY (run_id, source_user_id)
);

CREATE TABLE IF NOT EXISTS medusa_migration.order_map (
    run_id bigint NOT NULL REFERENCES medusa_migration.run(id) ON DELETE CASCADE,
    source_order_id bigint NOT NULL,
    source_order_number text,
    source_user_id bigint,
    source_order_status text,
    source_payment_status text,
    source_payment_method text,
    source_currency text NOT NULL DEFAULT 'INR',
    source_total numeric(18,2),
    source_created_at timestamptz,
    target_order_id text,
    import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'ready', 'imported', 'skipped', 'error')),
    error_message text,
    PRIMARY KEY (run_id, source_order_id)
);

CREATE TABLE IF NOT EXISTS medusa_migration.order_item_map (
    run_id bigint NOT NULL,
    source_order_id bigint NOT NULL,
    source_order_item_id bigint NOT NULL,
    source_variant_id bigint,
    source_title text,
    source_sku text,
    source_quantity integer,
    source_unit_price numeric(18,2),
    target_line_item_id text,
    import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'ready', 'imported', 'skipped', 'error')),
    error_message text,
    PRIMARY KEY (run_id, source_order_id, source_order_item_id),
    FOREIGN KEY (run_id, source_order_id) REFERENCES medusa_migration.order_map(run_id, source_order_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medusa_migration.payment_map (
    run_id bigint NOT NULL,
    source_payment_id bigint NOT NULL,
    source_order_id bigint,
    source_provider text,
    source_gateway_order_id text,
    source_gateway_payment_id text,
    source_status text,
    source_amount numeric(18,2),
    source_created_at timestamptz,
    target_payment_id text,
    import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'ready', 'imported', 'skipped', 'error')),
    error_message text,
    PRIMARY KEY (run_id, source_payment_id)
);

CREATE TABLE IF NOT EXISTS medusa_migration.shipment_map (
    run_id bigint NOT NULL,
    source_shipment_id bigint NOT NULL,
    source_order_id bigint,
    source_courier_name text,
    source_shipment_number text,
    source_tracking_number text,
    source_tracking_url text,
    source_status text,
    source_estimated_delivery timestamptz,
    target_fulfillment_id text,
    import_status text NOT NULL DEFAULT 'pending' CHECK (import_status IN ('pending', 'ready', 'imported', 'skipped', 'error')),
    error_message text,
    PRIMARY KEY (run_id, source_shipment_id)
);

CREATE OR REPLACE VIEW medusa_migration.validation_summary AS
SELECT 'products' AS entity, count(*)::bigint AS rows, count(*) FILTER (WHERE import_status = 'error')::bigint AS errors FROM medusa_migration.product_map
UNION ALL SELECT 'customers', count(*), count(*) FILTER (WHERE import_status = 'error') FROM medusa_migration.customer_map
UNION ALL SELECT 'orders', count(*), count(*) FILTER (WHERE import_status = 'error') FROM medusa_migration.order_map
UNION ALL SELECT 'order_items', count(*), count(*) FILTER (WHERE import_status = 'error') FROM medusa_migration.order_item_map
UNION ALL SELECT 'payments', count(*), count(*) FILTER (WHERE import_status = 'error') FROM medusa_migration.payment_map
UNION ALL SELECT 'shipments', count(*), count(*) FILTER (WHERE import_status = 'error') FROM medusa_migration.shipment_map;

COMMIT;

-- Recommended execution sequence:
-- 1. Clone Neon to a migration branch and take a logical backup.
-- 2. Run this file only on the migration branch.
-- 3. Populate *_map tables with reviewed SELECT/INSERT ETL statements.
-- 4. Validate validation_summary, foreign keys, totals, payment references, and stock counts.
-- 5. Import into a pinned Medusa version through its documented API/workflows.
-- 6. Run dual-read comparison against the existing application before cutover.
-- 7. Keep the current application as rollback source until reconciliation is complete.
