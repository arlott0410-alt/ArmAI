-- ArmAI: Indexes for COD and payment method switching.

create index if not exists idx_merchant_cod_settings_merchant on public.merchant_cod_settings (merchant_id);

create index if not exists idx_order_shipping_details_order on public.order_shipping_details (order_id);
create index if not exists idx_order_shipping_details_merchant on public.order_shipping_details (merchant_id);

create index if not exists idx_order_cod_details_order on public.order_cod_details (order_id);
create index if not exists idx_order_cod_details_merchant on public.order_cod_details (merchant_id);
create index if not exists idx_order_cod_details_order_active on public.order_cod_details (order_id) where is_active = true;

create index if not exists idx_order_payment_method_events_order on public.order_payment_method_events (order_id);
create index if not exists idx_order_payment_method_events_merchant on public.order_payment_method_events (merchant_id);
create index if not exists idx_order_payment_method_events_created on public.order_payment_method_events (order_id, created_at desc);

-- At most one active payment target per order.
create unique index if not exists idx_order_payment_targets_order_active_unique
  on public.order_payment_targets (order_id) where is_active = true;
