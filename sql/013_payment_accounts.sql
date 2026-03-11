-- ArmAI Extension: Merchant payment accounts (bank account / QR for receiving payments).

create table if not exists public.merchant_payment_accounts (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  bank_code text not null,
  account_name text,
  account_number text not null,
  account_holder_name text not null,
  currency text not null default 'THB',
  qr_image_path text,
  qr_image_object_key text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_payment_accounts is 'Merchant bank/payment accounts; AI sends only from these. No hardcoded accounts.';

create index if not exists idx_merchant_payment_accounts_merchant on public.merchant_payment_accounts (merchant_id);
create index if not exists idx_merchant_payment_accounts_primary on public.merchant_payment_accounts (merchant_id, is_primary) where is_primary = true;

create table if not exists public.merchant_payment_account_rules (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  payment_account_id uuid not null references public.merchant_payment_accounts (id) on delete cascade,
  rule_type text not null,
  rule_value text,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_payment_account_rules is 'Optional routing: default, by_category, by_product, by_amount_range, by_bank.';

create index if not exists idx_payment_account_rules_merchant on public.merchant_payment_account_rules (merchant_id);
