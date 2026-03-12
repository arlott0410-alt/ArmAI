-- ArmAI: Summary-first dashboards. Precomputed counters for ~100-merchant scale.
-- Dashboards read from these tables; updated via event-driven hooks (see summary-update service).
-- Additive only.

create table if not exists public.merchant_dashboard_summaries (
  merchant_id uuid primary key references public.merchants (id) on delete cascade,
  orders_today int not null default 0,
  pending_payment_count int not null default 0,
  paid_today_count int not null default 0,
  manual_review_count int not null default 0,
  probable_match_count int not null default 0,
  ready_to_ship_count int not null default 0,
  active_products_count int not null default 0,
  active_payment_accounts_count int not null default 0,
  readiness_score int,
  updated_at timestamptz not null default now()
);

comment on table public.merchant_dashboard_summaries is 'Precomputed merchant dashboard KPIs. Updated on order/payment/matching/shipment/config events.';

create table if not exists public.super_dashboard_summaries (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  active_merchants int not null default 0,
  trialing_merchants int not null default 0,
  past_due_merchants int not null default 0,
  due_soon_merchants int not null default 0,
  activation_ready_merchants int not null default 0,
  mrr_current_month numeric(14, 2) not null default 0,
  expected_next_billing_total numeric(14, 2) not null default 0,
  pending_billing_review_count int not null default 0,
  new_merchants_this_month int not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.super_dashboard_summaries is 'Single-row super dashboard KPIs. Upsert by id; refreshed on billing/merchant events or scheduled.';
