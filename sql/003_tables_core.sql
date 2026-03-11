-- ArmAI SQL Schema - Part 3: Core tables (profiles, merchants, membership)
-- All business tables will carry merchant_id for tenant isolation.

-- Profiles: extended user data and role. id = auth.users.id.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role app_role not null default 'merchant_admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile and global role (super_admin vs merchant_admin).';

-- Merchants: tenants.
create table if not exists public.merchants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  billing_status billing_status not null default 'trialing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchants is 'Tenant (merchant) master. Every business table must have merchant_id.';

-- Merchant members: which users belong to which merchants (many-to-many).
create table if not exists public.merchant_members (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null default 'merchant_admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, user_id)
);

comment on table public.merchant_members is 'Maps users to merchants. One user can belong to multiple merchants.';

-- Merchant settings: AI prompt, bank parser, webhook token (per merchant).
create table if not exists public.merchant_settings (
  merchant_id uuid primary key references public.merchants (id) on delete cascade,
  ai_system_prompt text,
  bank_parser_id uuid,
  webhook_verify_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_settings is 'Per-merchant config: AI prompt, bank parser, Facebook verify token.';
