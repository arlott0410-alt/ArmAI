-- ArmAI Extension: Additional indexes for new tables (already created in 011-014 where needed).
-- Add any composite indexes for common queries.

create index if not exists idx_products_slug_merchant on public.products (merchant_id, slug);
create index if not exists idx_order_payment_targets_payment_account on public.order_payment_targets (payment_account_id);
