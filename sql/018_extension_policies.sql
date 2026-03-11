-- ArmAI Extension: RLS policies for new tables (same pattern: member or super).

-- product_categories
create policy "product_categories_select_member_or_super" on public.product_categories for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "product_categories_all_member_or_super" on public.product_categories for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- products
create policy "products_select_member_or_super" on public.products for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "products_all_member_or_super" on public.products for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- product_variants
create policy "product_variants_select_member_or_super" on public.product_variants for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "product_variants_all_member_or_super" on public.product_variants for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- product_keywords
create policy "product_keywords_select_member_or_super" on public.product_keywords for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "product_keywords_all_member_or_super" on public.product_keywords for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- product_images
create policy "product_images_select_member_or_super" on public.product_images for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "product_images_all_member_or_super" on public.product_images for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- merchant_faqs
create policy "merchant_faqs_select_member_or_super" on public.merchant_faqs for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_faqs_all_member_or_super" on public.merchant_faqs for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- merchant_promotions
create policy "merchant_promotions_select_member_or_super" on public.merchant_promotions for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_promotions_all_member_or_super" on public.merchant_promotions for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- merchant_knowledge_entries
create policy "merchant_knowledge_select_member_or_super" on public.merchant_knowledge_entries for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_knowledge_all_member_or_super" on public.merchant_knowledge_entries for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- merchant_payment_accounts
create policy "merchant_payment_accounts_select_member_or_super" on public.merchant_payment_accounts for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "merchant_payment_accounts_all_member_or_super" on public.merchant_payment_accounts for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- merchant_payment_account_rules
create policy "payment_account_rules_select_member_or_super" on public.merchant_payment_account_rules for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "payment_account_rules_all_member_or_super" on public.merchant_payment_account_rules for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- order_items
create policy "order_items_select_member_or_super" on public.order_items for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_items_all_member_or_super" on public.order_items for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));

-- order_payment_targets
create policy "order_payment_targets_select_member_or_super" on public.order_payment_targets for select
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
create policy "order_payment_targets_all_member_or_super" on public.order_payment_targets for all
  using (public.is_super_admin() or public.user_can_access_merchant(merchant_id));
