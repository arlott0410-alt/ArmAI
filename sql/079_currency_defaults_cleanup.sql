-- Remove THB-first column defaults where merchant-driven defaults should apply.
-- Backward compatible: backfill NULL currencies from merchant default_currency before dropping defaults.

-- 1) Backfill NULL currencies using merchants.default_currency (or THB as a last-resort fallback).

update public.products p
set currency = coalesce(m.default_currency, 'THB')
from public.merchants m
where p.merchant_id = m.id
  and p.currency is null;

update public.merchant_payment_accounts a
set currency = coalesce(m.default_currency, 'THB')
from public.merchants m
where a.merchant_id = m.id
  and a.currency is null;

update public.order_payment_targets t
set expected_currency = coalesce(m.default_currency, 'THB')
from public.merchants m
where t.merchant_id = m.id
  and t.expected_currency is null;

update public.merchant_plans mp
set currency = coalesce(m.default_currency, 'THB')
from public.merchants m
where mp.merchant_id = m.id
  and mp.currency is null;

update public.merchant_billing_events be
set currency = coalesce(m.default_currency, 'THB')
from public.merchants m
where be.merchant_id = m.id
  and be.currency is null;

-- 2) Drop THB column defaults so new rows rely on application-level merchant defaults.
-- Keeping NOT NULL constraints intact; app layer sets values (and tests cover currency helpers).

alter table public.products alter column currency drop default;
alter table public.merchant_payment_accounts alter column currency drop default;
alter table public.order_payment_targets alter column expected_currency drop default;
alter table public.merchant_plans alter column currency drop default;
alter table public.merchant_billing_events alter column currency drop default;

