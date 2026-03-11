-- ArmAI Extension: Product catalog tables (additive only).
-- All tables have merchant_id for strict tenant isolation.

-- Product categories per merchant.
create table if not exists public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_categories is 'Merchant product categories for catalog and AI context.';

create index if not exists idx_product_categories_merchant_active on public.product_categories (merchant_id, is_active);

-- Products per merchant.
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  category_id uuid references public.product_categories (id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  base_price numeric(14, 2) not null,
  sale_price numeric(14, 2),
  currency text not null default 'THB',
  sku text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  requires_manual_confirmation boolean not null default false,
  ai_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, slug)
);

comment on table public.products is 'Merchant product catalog. AI uses only ai_visible active products from DB.';

create index if not exists idx_products_merchant_status on public.products (merchant_id, status);
create index if not exists idx_products_merchant_category on public.products (merchant_id, category_id);
create index if not exists idx_products_merchant_ai_visible on public.products (merchant_id, ai_visible) where ai_visible = true;

-- Product variants/options.
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  option_value_1 text,
  option_value_2 text,
  option_value_3 text,
  price_override numeric(14, 2),
  stock_qty int,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_variants is 'Product variants; price_override overrides product base_price when set.';

create index if not exists idx_product_variants_product on public.product_variants (product_id);
create index if not exists idx_product_variants_merchant on public.product_variants (merchant_id);

-- Searchable keywords/aliases for AI lookup.
create table if not exists public.product_keywords (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_keywords_merchant on public.product_keywords (merchant_id);
create index if not exists idx_product_keywords_product on public.product_keywords (product_id);
create index if not exists idx_product_keywords_keyword on public.product_keywords (merchant_id, lower(keyword));

-- Optional: product images (schema-ready).
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  r2_key text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on public.product_images (product_id);
