-- ArmAI: Fulfillment event log for audit. Additive only.

do $$ begin
  create type fulfillment_event_type_enum as enum (
    'payment_confirmed',
    'shipment_created',
    'tracking_sent_to_customer',
    'shipment_marked_shipped',
    'shipment_marked_delivered',
    'shipment_failed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type fulfillment_actor_type_enum as enum (
    'system',
    'merchant_admin',
    'ai_agent'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.order_fulfillment_events (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  shipment_id uuid references public.order_shipments (id) on delete set null,
  event_type text not null,
  event_note text,
  actor_type fulfillment_actor_type_enum not null default 'merchant_admin',
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.order_fulfillment_events is 'Audit log for fulfillment actions.';
create index if not exists idx_order_fulfillment_events_order on public.order_fulfillment_events (order_id);
create index if not exists idx_order_fulfillment_events_merchant_created on public.order_fulfillment_events (merchant_id, created_at desc);
