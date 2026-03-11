-- ArmAI Extension: Add columns to existing tables for account-aware slip and matching.
-- Additive only; no dropping or breaking changes.

-- order_slips: receiver account detection from slip image.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_slips' and column_name = 'detected_receiver_account') then
    alter table public.order_slips add column detected_receiver_account text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_slips' and column_name = 'detected_receiver_bank') then
    alter table public.order_slips add column detected_receiver_bank text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'order_slips' and column_name = 'detected_receiver_name') then
    alter table public.order_slips add column detected_receiver_name text;
  end if;
end $$;

-- bank_transactions: link to payment account and detected receiver when available.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_transactions' and column_name = 'payment_account_id') then
    alter table public.bank_transactions add column payment_account_id uuid references public.merchant_payment_accounts (id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_transactions' and column_name = 'detected_account_number') then
    alter table public.bank_transactions add column detected_account_number text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_transactions' and column_name = 'detected_bank_code') then
    alter table public.bank_transactions add column detected_bank_code text;
  end if;
end $$;

-- matching_results: which payment account matched; full scoring breakdown.
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'matching_results' and column_name = 'matched_payment_account_id') then
    alter table public.matching_results add column matched_payment_account_id uuid references public.merchant_payment_accounts (id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'matching_results' and column_name = 'scoring_breakdown_json') then
    alter table public.matching_results add column scoring_breakdown_json jsonb;
  end if;
end $$;
