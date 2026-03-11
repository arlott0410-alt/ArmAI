-- ArmAI Extension: Merchant knowledge base (FAQs, promotions, generic entries).

create table if not exists public.merchant_faqs (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  question text not null,
  answer text not null,
  keywords text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_faqs is 'Merchant FAQs for AI retrieval; no hardcoded answers.';

create index if not exists idx_merchant_faqs_merchant_active on public.merchant_faqs (merchant_id, is_active);

create table if not exists public.merchant_promotions (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  title text not null,
  content text,
  valid_from timestamptz,
  valid_until timestamptz,
  keywords text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_merchant_promotions_merchant_active on public.merchant_promotions (merchant_id, is_active);

create table if not exists public.merchant_knowledge_entries (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  type text not null,
  title text not null,
  content text not null,
  keywords text,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_knowledge_entries is 'Generic knowledge (shipping, hours, policies). type: shipping, hours, pickup, payment_policy, refund, etc.';

create index if not exists idx_merchant_knowledge_merchant_type_active on public.merchant_knowledge_entries (merchant_id, type, is_active);
