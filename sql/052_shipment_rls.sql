-- ArmAI: RLS for order_shipments and order_fulfillment_events. Tenant-safe.

alter table public.order_shipments enable row level security;
alter table public.order_fulfillment_events enable row level security;

create policy "order_shipments_select_member_or_super" on public.order_shipments for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_shipments_insert_member_or_super" on public.order_shipments for insert
  with check (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_shipments_update_member_or_super" on public.order_shipments for update
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

create policy "order_fulfillment_events_select_member_or_super" on public.order_fulfillment_events for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_fulfillment_events_insert_member_or_super" on public.order_fulfillment_events for insert
  with check (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
