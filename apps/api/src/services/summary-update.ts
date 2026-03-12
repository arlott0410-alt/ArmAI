import type { SupabaseClient } from '@supabase/supabase-js';

const SUPER_SUMMARY_ID = '00000000-0000-0000-0000-000000000001';
const TODAY_START_ISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/**
 * Compute and upsert merchant_dashboard_summaries for one merchant.
 * Called from event hooks (order paid, matching, shipment, etc.) and as fallback when summary missing.
 */
export async function refreshMerchantSummary(supabase: SupabaseClient, merchantId: string): Promise<void> {
  const todayStart = TODAY_START_ISO();

  const [
    ordersRes,
    matchingRes,
    readyToShipRes,
    productCountRes,
    paymentCountRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from('orders').select('id, status, created_at').eq('merchant_id', merchantId).gte('created_at', todayStart),
    supabase.from('matching_results').select('id, status').eq('merchant_id', merchantId),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId).in('payment_status', ['paid', 'cod_collected']).eq('fulfillment_status', 'pending_fulfillment'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId).eq('status', 'active'),
    supabase.from('merchant_payment_accounts').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId).eq('is_active', true),
    supabase.from('merchant_settings').select('ai_system_prompt').eq('merchant_id', merchantId).maybeSingle(),
  ]);

  const ordersToday = (ordersRes.data ?? []).length;
  const paidToday = (ordersRes.data ?? []).filter((o: { status: string }) => o.status === 'paid').length;

  const matchList = matchingRes.data ?? [];
  const manualReviewCount = matchList.filter((m: { status: string }) => m.status === 'manual_review').length;
  const probableMatchCount = matchList.filter((m: { status: string }) => m.status === 'probable_match').length;

  const pendingPaymentRes = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId).in('status', ['pending', 'slip_uploaded', 'bank_pending_match']);
  const pendingPaymentCount = (pendingPaymentRes.count as number) ?? 0;
  const readyToShipCount = (readyToShipRes.count as number) ?? 0;
  const activeProductsCount = (productCountRes.count as number) ?? 0;
  const activePaymentAccountsCount = (paymentCountRes.count as number) ?? 0;

  const hasPrompt = !!(settingsRes.data?.ai_system_prompt?.trim());
  const readinessScore = activeProductsCount > 0 && activePaymentAccountsCount > 0 && hasPrompt ? 100 : activeProductsCount > 0 || activePaymentAccountsCount > 0 || hasPrompt ? 50 : 0;

  const now = new Date().toISOString();
  await supabase.from('merchant_dashboard_summaries').upsert(
    {
      merchant_id: merchantId,
      orders_today: ordersToday,
      pending_payment_count: pendingPaymentCount,
      paid_today_count: paidToday,
      manual_review_count: manualReviewCount,
      probable_match_count: probableMatchCount,
      ready_to_ship_count: readyToShipCount,
      active_products_count: activeProductsCount,
      active_payment_accounts_count: activePaymentAccountsCount,
      readiness_score: readinessScore,
      updated_at: now,
    },
    { onConflict: 'merchant_id' }
  );
}

/**
 * Compute and upsert super_dashboard_summaries (single row).
 * Called from billing/merchant events or scheduled refresh.
 */
export async function refreshSuperSummary(supabase: SupabaseClient): Promise<void> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [merchants, plans, productCounts, paymentCounts, settings] = await Promise.all([
    supabase.from('merchants').select('id, name, billing_status, created_at'),
    supabase.from('merchant_plans').select('merchant_id, billing_status, monthly_price_usd, trial_ends_at, next_billing_at'),
    supabase.from('products').select('merchant_id').then((r) => (r.data ?? []).reduce((acc: Record<string, number>, row: { merchant_id: string }) => {
      acc[row.merchant_id] = (acc[row.merchant_id] ?? 0) + 1;
      return acc;
    }, {})),
    supabase.from('merchant_payment_accounts').select('merchant_id').then((r) => (r.data ?? []).reduce((acc: Record<string, number>, row: { merchant_id: string }) => {
      acc[row.merchant_id] = (acc[row.merchant_id] ?? 0) + 1;
      return acc;
    }, {})),
    supabase.from('merchant_settings').select('merchant_id, ai_system_prompt').then((r) => {
      const map: Record<string, boolean> = {};
      (r.data ?? []).forEach((row: { merchant_id: string; ai_system_prompt: string | null }) => { map[row.merchant_id] = !!(row.ai_system_prompt?.trim()); });
      return map;
    }),
  ]);

  const merchantList = merchants.data ?? [];
  const planList = plans.data ?? [];
  const planByMerchant: Record<string, { billing_status: string; monthly_price_usd?: number; trial_ends_at?: string | null; next_billing_at?: string | null }> = {};
  planList.forEach((p: { merchant_id: string; billing_status: string; monthly_price_usd?: number; trial_ends_at?: string | null; next_billing_at?: string | null }) => {
    planByMerchant[p.merchant_id] = p;
  });

  let activeMerchants = 0;
  let trialingMerchants = 0;
  let pastDueMerchants = 0;
  let dueSoonMerchants = 0;
  let activationReadyMerchants = 0;
  let mrrCurrentMonth = 0;
  let expectedNextBillingTotal = 0;
  let newMerchantsThisMonth = 0;

  for (const m of merchantList) {
    const plan = planByMerchant[m.id];
    const status = (m as { billing_status: string }).billing_status ?? plan?.billing_status ?? 'trialing';
    const price = (plan?.monthly_price_usd as number) ?? 0;

    if (status === 'active') {
      activeMerchants++;
      mrrCurrentMonth += price;
    } else if (status === 'trialing') trialingMerchants++;
    else if (status === 'past_due') pastDueMerchants++;

    if (status === 'active' || status === 'trialing') expectedNextBillingTotal += price;

    const nextBilling = plan?.next_billing_at ?? null;
    if (nextBilling && nextBilling <= in7Days && nextBilling >= now.toISOString()) dueSoonMerchants++;

    const productCount = productCounts[m.id] ?? 0;
    const paymentCount = paymentCounts[m.id] ?? 0;
    const hasPrompt = settings[m.id] ?? false;
    if (productCount > 0 && paymentCount > 0 && hasPrompt) activationReadyMerchants++;

    const created = (m as { created_at: string }).created_at;
    if (created >= startOfMonth) newMerchantsThisMonth++;
  }

  const updatedAt = new Date().toISOString();
  await supabase.from('super_dashboard_summaries').upsert(
    {
      id: SUPER_SUMMARY_ID,
      active_merchants: activeMerchants,
      trialing_merchants: trialingMerchants,
      past_due_merchants: pastDueMerchants,
      due_soon_merchants: dueSoonMerchants,
      activation_ready_merchants: activationReadyMerchants,
      mrr_current_month: mrrCurrentMonth,
      expected_next_billing_total: expectedNextBillingTotal,
      pending_billing_review_count: 0,
      new_merchants_this_month: newMerchantsThisMonth,
      updated_at: updatedAt,
    },
    { onConflict: 'id' }
  );
}
