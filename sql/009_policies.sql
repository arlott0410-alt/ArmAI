-- ArmAI SQL Schema - Part 9: RLS policies (deny-by-default, explicit allow)

-- ---------- PROFILES ----------
-- Users can read/update own profile only.
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
-- Insert is done by trigger or service role. No insert policy for anon/authenticated.

-- ---------- MERCHANTS ----------
-- Merchant admin: only merchants they belong to. Super admin: all (handled in policy).
create policy "merchants_select_member_or_super" on public.merchants for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(id)
  );
-- Insert/update/delete: super_admin only (control plane).
create policy "merchants_insert_super" on public.merchants for insert with check (public.is_super_admin());
create policy "merchants_update_super" on public.merchants for update using (public.is_super_admin());
create policy "merchants_delete_super" on public.merchants for delete using (public.is_super_admin());

-- ---------- MERCHANT_MEMBERS ----------
create policy "merchant_members_select_member_or_super" on public.merchant_members for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "merchant_members_insert_super" on public.merchant_members for insert with check (public.is_super_admin());
create policy "merchant_members_update_super" on public.merchant_members for update using (public.is_super_admin());
create policy "merchant_members_delete_super" on public.merchant_members for delete using (public.is_super_admin());

-- ---------- MERCHANT_SETTINGS ----------
create policy "merchant_settings_select_member_or_super" on public.merchant_settings for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "merchant_settings_update_member_or_super" on public.merchant_settings for update
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
-- Insert: when merchant is created (service role or super). Allow super or member of merchant (e.g. first-time setup).
create policy "merchant_settings_insert_super_or_member" on public.merchant_settings for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- FACEBOOK_PAGES ----------
create policy "facebook_pages_select_member_or_super" on public.facebook_pages for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "facebook_pages_all_member_or_super" on public.facebook_pages for all
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- WEBHOOK_EVENTS ----------
-- Backend/service role writes (no insert/update policy = only service role can write when RLS is on).
-- Merchants see own only.
create policy "webhook_events_select_member_or_super" on public.webhook_events for select
  using (
    public.is_super_admin()
    or (merchant_id is not null and public.user_can_access_merchant(merchant_id))
  );

-- ---------- CONVERSATIONS ----------
create policy "conversations_select_member_or_super" on public.conversations for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "conversations_insert_member_or_super" on public.conversations for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "conversations_update_member_or_super" on public.conversations for update
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- MESSAGE_BUFFERS ----------
create policy "message_buffers_select_member_or_super" on public.message_buffers for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "message_buffers_insert_member_or_super" on public.message_buffers for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "message_buffers_update_member_or_super" on public.message_buffers for update
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- MESSAGES ----------
create policy "messages_select_member_or_super" on public.messages for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "messages_insert_member_or_super" on public.messages for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- ORDERS ----------
create policy "orders_select_member_or_super" on public.orders for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "orders_insert_member_or_super" on public.orders for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "orders_update_member_or_super" on public.orders for update
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- ORDER_SLIPS ----------
create policy "order_slips_select_member_or_super" on public.order_slips for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "order_slips_insert_member_or_super" on public.order_slips for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "order_slips_update_member_or_super" on public.order_slips for update
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- BANK_CONFIGS ----------
create policy "bank_configs_select_member_or_super" on public.bank_configs for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "bank_configs_all_member_or_super" on public.bank_configs for all
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- BANK_TRANSACTIONS ----------
create policy "bank_transactions_select_member_or_super" on public.bank_transactions for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "bank_transactions_insert_member_or_super" on public.bank_transactions for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- MATCHING_RESULTS ----------
create policy "matching_results_select_member_or_super" on public.matching_results for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "matching_results_insert_member_or_super" on public.matching_results for insert
  with check (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "matching_results_update_member_or_super" on public.matching_results for update
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );

-- ---------- AI_LOGS ----------
-- Read: merchant own or super. Write: service role (no anon insert from client).
create policy "ai_logs_select_member_or_super" on public.ai_logs for select
  using (
    public.is_super_admin()
    or (merchant_id is not null and public.user_can_access_merchant(merchant_id))
  );

-- ---------- AUDIT_LOGS ----------
-- Only super_admin can read audit logs.
create policy "audit_logs_select_super" on public.audit_logs for select using (public.is_super_admin());
-- Insert from backend only (service role). Allow authenticated for trigger-generated inserts if any.
create policy "audit_logs_insert" on public.audit_logs for insert with check (true);

-- ---------- SUPPORT_ACCESS_LOGS ----------
create policy "support_access_logs_select_super" on public.support_access_logs for select using (public.is_super_admin());
create policy "support_access_logs_insert" on public.support_access_logs for insert with check (auth.uid() is not null);

-- ---------- MERCHANT_PLANS ----------
create policy "merchant_plans_select_member_or_super" on public.merchant_plans for select
  using (
    public.is_super_admin()
    or public.user_can_access_merchant(merchant_id)
  );
create policy "merchant_plans_update_super" on public.merchant_plans for update using (public.is_super_admin());
