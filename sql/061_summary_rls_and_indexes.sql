-- ArmAI: RLS and indexes for dashboard summary tables.

alter table public.merchant_dashboard_summaries enable row level security;
alter table public.super_dashboard_summaries enable row level security;

create policy "merchant_dashboard_summaries_select_member_or_super" on public.merchant_dashboard_summaries for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_dashboard_summaries_insert_member_or_super" on public.merchant_dashboard_summaries for insert
  with check (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_dashboard_summaries_update_member_or_super" on public.merchant_dashboard_summaries for update
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- Super summary: only super_admin can read/write.
create policy "super_dashboard_summaries_select_super" on public.super_dashboard_summaries for select
  using (public.is_super_admin());
create policy "super_dashboard_summaries_insert_super" on public.super_dashboard_summaries for insert
  with check (public.is_super_admin());
create policy "super_dashboard_summaries_update_super" on public.super_dashboard_summaries for update
  using (public.is_super_admin());

-- Index for quick summary lookup by merchant (primary key already covers).
-- Super summary: index on updated_at for "latest row" query.
-- Already added in 060: idx_super_dashboard_summaries_updated
