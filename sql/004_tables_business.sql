-- ArmAI SQL Schema - Part 4: Business tables (all with merchant_id)

-- Facebook pages: page_id -> merchant mapping for webhook routing.
create table if not exists public.facebook_pages (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  page_id text not null,
  page_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, page_id)
);

comment on table public.facebook_pages is 'Facebook Page ID to merchant. Used by webhook router.';

-- Webhook events: raw ingest for idempotency and audit.
create table if not exists public.webhook_events (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references public.merchants (id) on delete set null,
  kind webhook_event_kind not null,
  external_id text,
  raw_payload jsonb,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

comment on table public.webhook_events is 'Raw webhook events. merchant_id null for global verification events.';

create index if not exists idx_webhook_events_merchant_kind on public.webhook_events (merchant_id, kind);
create index if not exists idx_webhook_events_external_id on public.webhook_events (external_id) where external_id is not null;

-- Conversations: one per customer (PSID) per merchant.
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  customer_psid text not null,
  page_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, page_id, customer_psid)
);

-- Message buffer: for debounce/aggregation. Flush creates messages.
create table if not exists public.message_buffers (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  raw_mid text,
  raw_text text,
  raw_attachments jsonb,
  raw_at timestamptz not null default now(),
  flushed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.message_buffers is 'Incoming message buffer for debounce. Processed rows get flushed_at set.';

create index if not exists idx_message_buffers_conversation_flushed on public.message_buffers (conversation_id, flushed_at);

-- Messages: persisted timeline (from buffer flush or outbound).
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  content_type text not null default 'text',
  content_text text,
  content_metadata jsonb,
  external_mid text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages (conversation_id, created_at);

-- Orders: merchant orders (from chat or manual).
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  status order_status not null default 'pending',
  customer_name text,
  customer_psid text,
  amount numeric(14, 2),
  reference_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_merchant_status on public.orders (merchant_id, status);
create index if not exists idx_orders_merchant_created on public.orders (merchant_id, created_at desc);

-- Order slips: slip image + AI extraction. Does not directly set order to paid.
create table if not exists public.order_slips (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  r2_key text,
  extraction_amount numeric(14, 2),
  extraction_sender_name text,
  extraction_datetime timestamptz,
  extraction_reference_code text,
  extraction_confidence numeric(5, 4),
  extraction_raw_json text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_slips_order on public.order_slips (order_id);

-- Bank configs: per-merchant bank/parser mapping (schema-ready for multiple accounts).
create table if not exists public.bank_configs (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  display_name text,
  parser_id uuid not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.bank_configs is 'Per-merchant bank/parser config. parser_id references parser registry (app-level).';

-- Bank transactions: parsed incoming from webhook.
create table if not exists public.bank_transactions (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  bank_config_id uuid references public.bank_configs (id) on delete set null,
  amount numeric(14, 2) not null,
  sender_name text,
  transaction_at timestamptz not null,
  reference_code text,
  bank_tx_id text,
  raw_parser_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_bank_transactions_merchant_at on public.bank_transactions (merchant_id, transaction_at desc);

-- Matching results: link bank_tx to order/slip with score and status.
create table if not exists public.matching_results (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  bank_transaction_id uuid not null references public.bank_transactions (id) on delete cascade,
  status matching_result_status not null default 'unmatched',
  score numeric(5, 4),
  score_factors jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, bank_transaction_id)
);

create index if not exists idx_matching_results_merchant on public.matching_results (merchant_id, status);

-- AI jobs / logs: for observability (privacy-conscious, no PII in logs).
create table if not exists public.ai_logs (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid references public.merchants (id) on delete set null,
  job_type text not null,
  entity_type text,
  entity_id uuid,
  success boolean not null,
  error_message text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_logs_merchant_created on public.ai_logs (merchant_id, created_at desc);

-- Audit logs: super admin and support actions.
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references auth.users (id) on delete set null,
  action audit_action not null,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor_created on public.audit_logs (actor_id, created_at desc);

-- Support access logs: every time super admin enters support/god mode for a merchant.
create table if not exists public.support_access_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid not null references auth.users (id) on delete cascade,
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  ip_address text,
  user_agent text
);

comment on table public.support_access_logs is 'Read-only support mode access. Every view is logged; no silent impersonation.';

-- Billing/plan status (schema-ready).
create table if not exists public.merchant_plans (
  id uuid primary key default uuid_generate_v4(),
  merchant_id uuid not null references public.merchants (id) on delete cascade unique,
  plan_code text not null default 'starter',
  billing_status billing_status not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
