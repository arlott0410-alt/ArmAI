-- ArmAI: Dedicated shipment records for fulfillment. Additive only.

do $$ begin
  create type shipment_method_enum as enum (
    'courier_tracking',
    'local_delivery',
    'pickup',
    'manual_dispatch'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type shipment_status_enum as enum (
    'pending',
    'shipped',
    'in_transit',
    'delivered',
    'failed'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.order_shipments (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  courier_name text,
  shipment_method shipment_method_enum not null default 'courier_tracking',
  tracking_number text,
  tracking_url text,
  shipping_note text,
  shipment_status shipment_status_enum not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.order_shipments is 'Shipment/tracking records. One order can have multiple shipments.';
create index if not exists idx_order_shipments_order on public.order_shipments (order_id);
create index if not exists idx_order_shipments_merchant on public.order_shipments (merchant_id);
