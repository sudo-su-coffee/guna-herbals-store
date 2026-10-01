ALTER TABLE "payment_webhooks" ADD COLUMN IF NOT EXISTS "reference_id" bigint;--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payment_webhooks_reference_id_payments_id_fk'
    ) THEN
        ALTER TABLE "payment_webhooks"
            ADD CONSTRAINT "payment_webhooks_reference_id_payments_id_fk"
            FOREIGN KEY ("reference_id") REFERENCES "public"."payments"("id")
            ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_webhooks_reference_id_idx" ON "payment_webhooks" USING btree ("reference_id");
