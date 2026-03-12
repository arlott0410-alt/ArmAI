-- ArmAI: COD and payment method switching. Additive only.
-- Part 1: Enums and merchant COD settings.

-- Payment method: one active per order.
do $$ begin
  create type payment_method_enum as enum (
    'prepaid_bank_transfer',
    'prepaid_qr',
    'cod'
  );
exception when duplicate_object then null;
end $$;

-- Payment status: separate from order_status for clarity.
do $$ begin
  create type payment_status_enum as enum (
    'unpaid',
    'pending_transfer',
    'slip_uploaded',
    'pending_bank_match',
    'paid',
    'cod_pending_confirmation',
    'cod_ready_to_ship',
    'cod_shipped',
    'cod_collected',
    'cod_failed',
    'cod_cancelled'
  );
exception when duplicate_object then null;
end $$;

-- COD detail row status.
do $$ begin
  create type order_cod_status_enum as enum (
    'pending_customer_details',
    'pending_merchant_confirmation',
    'ready_to_ship',
    'shipped',
    'delivery_failed',
    'delivered_uncollected',
    'collected',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

-- Payment method switch result.
do $$ begin
  create type payment_switch_result_enum as enum (
    'allowed',
    'denied',
    'requires_manual_confirmation'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_switch_requested_by_enum as enum (
    'customer',
    'ai',
    'merchant_admin',
    'system'
  );
exception when duplicate_object then null;
end $$;

-- Merchant COD settings (dedicated table for clarity).
create table if not exists public.merchant_cod_settings (
  merchant_id uuid primary key references public.merchants (id) on delete cascade,
  enable_cod boolean not null default false,
  cod_min_order_amount numeric(14, 2),
  cod_max_order_amount numeric(14, 2),
  cod_fee_amount numeric(14, 2) not null default 0,
  require_phone_for_cod boolean not null default true,
  require_full_address_for_cod boolean not null default true,
  cod_requires_manual_confirmation boolean not null default false,
  cod_notes_for_ai text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_cod_settings is 'Per-merchant COD (Cash on Delivery) configuration.';

-- Orders: add payment method and payment status (additive).
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_method') then
    alter table public.orders add column payment_method payment_method_enum not null default 'prepaid_bank_transfer';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_status') then
    alter table public.orders add column payment_status payment_status_enum not null default 'unpaid';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_method_locked_at') then
    alter table public.orders add column payment_method_locked_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_switch_count') then
    alter table public.orders add column payment_switch_count int not null default 0;
  end if;
end $$;

comment on column public.orders.payment_method is 'Current active payment method for this order.';
comment on column public.orders.payment_status is 'Payment lifecycle status; separate from order status.';
comment on column public.orders.payment_method_locked_at is 'When payment method was locked (e.g. after payment confirmed).';
comment on column public.orders.payment_switch_count is 'Number of payment method switches; used for risk/confirmation rules.';
