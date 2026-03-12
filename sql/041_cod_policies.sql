-- ArmAI: RLS policies for COD and payment method tables.

create policy "merchant_cod_settings_select_member_or_super" on public.merchant_cod_settings for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_cod_settings_all_member_or_super" on public.merchant_cod_settings for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

create policy "order_shipping_details_select_member_or_super" on public.order_shipping_details for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_shipping_details_all_member_or_super" on public.order_shipping_details for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

create policy "order_cod_details_select_member_or_super" on public.order_cod_details for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_cod_details_all_member_or_super" on public.order_cod_details for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

create policy "order_payment_method_events_select_member_or_super" on public.order_payment_method_events for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_payment_method_events_insert_member_or_super" on public.order_payment_method_events for insert
  with check (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
