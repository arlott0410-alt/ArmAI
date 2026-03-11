-- ArmAI Extension: Order line items and payment target assignment.
-- Preserves existing orders table; adds conversation_id for draft-from-chat and new tables.

-- Link orders to conversation when created from chat (nullable for existing/manual orders).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'conversation_id'
  ) then
    alter table public.orders add column conversation_id uuid references public.conversations (id) on delete set null;
  end if;
end $$;

create index if not exists idx_orders_conversation on public.orders (conversation_id) where conversation_id is not null;

-- Order line items (product + variant + qty + price snapshot).
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_variant_id uuid references public.product_variants (id) on delete set null,
  product_name_snapshot text not null,
  quantity int not null default 1,
  unit_price numeric(14, 2) not null,
  total_price numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.order_items is 'Order line items; snapshot of product name and price at order time.';

create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_order_items_merchant on public.order_items (merchant_id);

-- Which payment account the system instructed the customer to pay (auditable).
create table if not exists public.order_payment_targets (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  payment_account_id uuid not null references public.merchant_payment_accounts (id) on delete restrict,
  expected_amount numeric(14, 2) not null,
  expected_currency text not null default 'THB',
  assignment_reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.order_payment_targets is 'Payment account assigned to order; AI and slip verification use this. Deterministic and auditable.';

create index if not exists idx_order_payment_targets_order on public.order_payment_targets (order_id);
create index if not exists idx_order_payment_targets_merchant on public.order_payment_targets (merchant_id);
create unique index if not exists idx_order_payment_targets_order_unique on public.order_payment_targets (order_id);
