-- ArmAI: Shipping details, COD details, payment method events. Additive only.

-- Shipping details per order (for COD and future shipping).
create table if not exists public.order_shipping_details (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  recipient_name text,
  phone_number text,
  province_or_prefecture text,
  district text,
  village_or_area text,
  street_address text,
  landmark text,
  address_text text,
  delivery_notes text,
  shipping_method text,
  shipping_fee numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id)
);

comment on table public.order_shipping_details is 'Shipping/recipient details for order (COD or delivery).';

-- COD-specific details per order; one active row, history preserved via is_active/superseded.
create table if not exists public.order_cod_details (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  is_active boolean not null default true,
  cod_amount numeric(14, 2) not null,
  cod_fee numeric(14, 2) not null default 0,
  cod_status order_cod_status_enum not null default 'pending_customer_details',
  requires_manual_confirmation boolean not null default false,
  cod_confirmed_at timestamptz,
  ready_to_ship_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  collected_at timestamptz,
  collection_note text,
  superseded_at timestamptz,
  superseded_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.order_cod_details is 'COD lifecycle per order; only one active row per order when payment_method is cod.';

-- Payment method switch history (audit and timeline).
create table if not exists public.order_payment_method_events (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_method payment_method_enum not null,
  to_method payment_method_enum not null,
  switch_result payment_switch_result_enum not null,
  reason text,
  requested_by_type payment_switch_requested_by_enum not null,
  requested_by_id uuid,
  created_at timestamptz not null default now()
);

comment on table public.order_payment_method_events is 'History of payment method change requests and outcomes.';

-- order_payment_targets: allow multiple rows per order (history); one active.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_payment_targets' and column_name = 'is_active') then
    alter table public.order_payment_targets add column is_active boolean not null default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_payment_targets' and column_name = 'invalidated_at') then
    alter table public.order_payment_targets add column invalidated_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_payment_targets' and column_name = 'invalidation_reason') then
    alter table public.order_payment_targets add column invalidation_reason text;
  end if;
end $$;

-- Drop unique constraint that enforced one target per order (we now allow multiple, one active).
drop index if exists public.idx_order_payment_targets_order_unique;

-- Products: COD eligibility.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'is_cod_allowed') then
    alter table public.products add column is_cod_allowed boolean not null default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'requires_manual_cod_confirmation') then
    alter table public.products add column requires_manual_cod_confirmation boolean not null default false;
  end if;
end $$;

comment on column public.order_payment_targets.is_active is 'False when superseded by payment method switch (e.g. to COD).';
comment on column public.order_payment_targets.invalidated_at is 'When this target was invalidated.';
comment on column public.products.is_cod_allowed is 'Whether this product can be paid by COD when merchant allows COD.';
comment on column public.products.requires_manual_cod_confirmation is 'If true, COD orders for this product require merchant confirmation.';
