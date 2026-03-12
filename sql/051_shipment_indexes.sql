-- ArmAI: Indexes for fulfillment queries. Additive only.

create index if not exists idx_orders_fulfillment_status
  on public.orders (merchant_id, fulfillment_status)
  where fulfillment_status is not null;

create index if not exists idx_order_shipments_status
  on public.order_shipments (merchant_id, shipment_status);
