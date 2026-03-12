-- Reduce dashboard query fan-out by moving aggregation into SQL (single RPC calls).
-- This improves Workers latency and reduces Supabase read pressure.

-- Views: per-merchant counts without scanning into application memory.
create or replace view public.v_products_count_by_merchant as
select merchant_id, count(*)::int as product_count
from public.products
group by merchant_id;

create or replace view public.v_payment_accounts_count_by_merchant as
select merchant_id, count(*)::int as payment_account_count
from public.merchant_payment_accounts
where is_active is true
group by merchant_id;

create or replace view public.v_facebook_pages_count_by_merchant as
select merchant_id, count(*)::int as connected_page_count
from public.facebook_pages
group by merchant_id;

create or replace view public.v_has_ai_prompt_by_merchant as
select merchant_id, (max(case when coalesce(nullif(trim(ai_system_prompt),''), '') <> '' then 1 else 0 end) = 1) as has_prompt
from public.merchant_settings
group by merchant_id;

-- RPC: readiness counts in one DB round-trip
create or replace function public.merchant_readiness_counts(p_merchant_id uuid)
returns table (
  product_count int,
  category_count int,
  active_payment_account_count int,
  has_primary_payment_account boolean,
  has_ai_prompt boolean,
  has_bank_parser boolean,
  faq_count int,
  knowledge_count int,
  connected_facebook_page_count int
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*)::int from public.products where merchant_id = p_merchant_id) as product_count,
    (select count(*)::int from public.product_categories where merchant_id = p_merchant_id) as category_count,
    (select count(*)::int from public.merchant_payment_accounts where merchant_id = p_merchant_id and is_active is true) as active_payment_account_count,
    exists(select 1 from public.merchant_payment_accounts where merchant_id = p_merchant_id and is_primary is true) as has_primary_payment_account,
    (select coalesce(nullif(trim(ms.ai_system_prompt),''), '') <> '' from public.merchant_settings ms where ms.merchant_id = p_merchant_id) as has_ai_prompt,
    (select ms.bank_parser_id is not null from public.merchant_settings ms where ms.merchant_id = p_merchant_id) as has_bank_parser,
    (select count(*)::int from public.merchant_faqs where merchant_id = p_merchant_id) as faq_count,
    (select count(*)::int from public.merchant_knowledge_entries where merchant_id = p_merchant_id) as knowledge_count,
    (select count(*)::int from public.facebook_pages where merchant_id = p_merchant_id) as connected_facebook_page_count;
$$;

-- RPC: refresh merchant dashboard summary in SQL (single call). Matches current summary-update intent.
create or replace function public.refresh_merchant_dashboard_summary(p_merchant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today_start timestamptz := date_trunc('day', now());
  orders_today int;
  paid_today int;
  pending_payment int;
  manual_review int;
  probable_match int;
  ready_to_ship int;
  active_products int;
  active_payment_accounts int;
  has_prompt boolean;
  readiness_score int;
begin
  select count(*)::int into orders_today
  from public.orders
  where merchant_id = p_merchant_id and created_at >= today_start;

  select count(*)::int into paid_today
  from public.orders
  where merchant_id = p_merchant_id and created_at >= today_start and status = 'paid';

  select count(*)::int into pending_payment
  from public.orders
  where merchant_id = p_merchant_id and status in ('pending','slip_uploaded','bank_pending_match');

  select count(*)::int into manual_review
  from public.matching_results
  where merchant_id = p_merchant_id and status = 'manual_review';

  select count(*)::int into probable_match
  from public.matching_results
  where merchant_id = p_merchant_id and status = 'probable_match';

  select count(*)::int into ready_to_ship
  from public.orders
  where merchant_id = p_merchant_id
    and payment_status in ('paid','cod_collected')
    and fulfillment_status = 'pending_fulfillment';

  select count(*)::int into active_products
  from public.products
  where merchant_id = p_merchant_id and status = 'active';

  select count(*)::int into active_payment_accounts
  from public.merchant_payment_accounts
  where merchant_id = p_merchant_id and is_active is true;

  select coalesce(nullif(trim(ms.ai_system_prompt),''), '') <> '' into has_prompt
  from public.merchant_settings ms
  where ms.merchant_id = p_merchant_id;

  readiness_score := case
    when active_products > 0 and active_payment_accounts > 0 and coalesce(has_prompt,false) then 100
    when active_products > 0 or active_payment_accounts > 0 or coalesce(has_prompt,false) then 50
    else 0
  end;

  insert into public.merchant_dashboard_summaries (
    merchant_id,
    orders_today,
    pending_payment_count,
    paid_today_count,
    manual_review_count,
    probable_match_count,
    ready_to_ship_count,
    active_products_count,
    active_payment_accounts_count,
    readiness_score,
    updated_at
  )
  values (
    p_merchant_id,
    orders_today,
    pending_payment,
    paid_today,
    manual_review,
    probable_match,
    ready_to_ship,
    active_products,
    active_payment_accounts,
    readiness_score,
    now()
  )
  on conflict (merchant_id) do update set
    orders_today = excluded.orders_today,
    pending_payment_count = excluded.pending_payment_count,
    paid_today_count = excluded.paid_today_count,
    manual_review_count = excluded.manual_review_count,
    probable_match_count = excluded.probable_match_count,
    ready_to_ship_count = excluded.ready_to_ship_count,
    active_products_count = excluded.active_products_count,
    active_payment_accounts_count = excluded.active_payment_accounts_count,
    readiness_score = excluded.readiness_score,
    updated_at = excluded.updated_at;
end;
$$;

