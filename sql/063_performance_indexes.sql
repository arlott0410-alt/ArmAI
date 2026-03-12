-- ArmAI: Performance indexes for 100-merchant scale.
-- Align with actual query patterns: merchant_id, status, created_at, recent windows.

-- order_slips: matching fetches by merchant_id and extraction_amount not null
create index if not exists idx_order_slips_merchant_extraction on public.order_slips (merchant_id) where extraction_amount is not null;

-- matching_results: filter by merchant and status (manual_review, probable_match)
create index if not exists idx_matching_results_merchant_status_created on public.matching_results (merchant_id, status, created_at desc);

-- orders: ready_to_ship = paid + pending_fulfillment (dashboard summary)
create index if not exists idx_orders_merchant_fulfillment on public.orders (merchant_id, fulfillment_status) where fulfillment_status is not null;

-- telegram_operation_events: feed by merchant, recent first (already have merchant_id, created_at desc in 056)
-- shipment_images: awaiting/ambiguous by merchant (already in 056)
-- audit_logs: super dashboard recent activity
create index if not exists idx_audit_logs_created_desc on public.audit_logs (created_at desc);

-- support_access_logs: recent
create index if not exists idx_support_access_logs_started_desc on public.support_access_logs (started_at desc);
