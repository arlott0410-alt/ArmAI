import type { SupabaseClient } from '@supabase/supabase-js';
import * as summaryUpdate from './summary-update.js';

export interface MerchantDashboardSummary {
  merchantId: string;
  ordersToday: number;
  pendingPayment: number;
  paidToday: number;
  manualReviewCount: number;
  probableMatchCount: number;
  readyToShipCount?: number;
  activeProductsCount: number;
  activePaymentAccountsCount: number;
}

export interface ReadinessItem {
  key: string;
  label: string;
  status: 'not_started' | 'in_progress' | 'ready';
  detail?: string;
}

/**
 * Load merchant dashboard summary from precomputed table. If missing, refresh and return.
 * Summary-first: avoids expensive live aggregation on every page load.
 */
export async function getMerchantDashboardSummary(
  supabase: SupabaseClient,
  merchantId: string
): Promise<MerchantDashboardSummary> {
  const { data: row } = await supabase
    .from('merchant_dashboard_summaries')
    .select('orders_today, pending_payment_count, paid_today_count, manual_review_count, probable_match_count, ready_to_ship_count, active_products_count, active_payment_accounts_count')
    .eq('merchant_id', merchantId)
    .maybeSingle();

  if (row) {
    return {
      merchantId,
      ordersToday: row.orders_today ?? 0,
      pendingPayment: row.pending_payment_count ?? 0,
      paidToday: row.paid_today_count ?? 0,
      manualReviewCount: row.manual_review_count ?? 0,
      probableMatchCount: row.probable_match_count ?? 0,
      readyToShipCount: row.ready_to_ship_count ?? 0,
      activeProductsCount: row.active_products_count ?? 0,
      activePaymentAccountsCount: row.active_payment_accounts_count ?? 0,
    };
  }

  await summaryUpdate.refreshMerchantSummary(supabase, merchantId);
  const { data: after } = await supabase
    .from('merchant_dashboard_summaries')
    .select('orders_today, pending_payment_count, paid_today_count, manual_review_count, probable_match_count, ready_to_ship_count, active_products_count, active_payment_accounts_count')
    .eq('merchant_id', merchantId)
    .single();

  if (after) {
    return {
      merchantId,
      ordersToday: after.orders_today ?? 0,
      pendingPayment: after.pending_payment_count ?? 0,
      paidToday: after.paid_today_count ?? 0,
      manualReviewCount: after.manual_review_count ?? 0,
      probableMatchCount: after.probable_match_count ?? 0,
      readyToShipCount: after.ready_to_ship_count ?? 0,
      activeProductsCount: after.active_products_count ?? 0,
      activePaymentAccountsCount: after.active_payment_accounts_count ?? 0,
    };
  }

  return {
    merchantId,
    ordersToday: 0,
    pendingPayment: 0,
    paidToday: 0,
    manualReviewCount: 0,
    probableMatchCount: 0,
    readyToShipCount: 0,
    activeProductsCount: 0,
    activePaymentAccountsCount: 0,
  };
}

export async function getMerchantReadiness(
  supabase: SupabaseClient,
  merchantId: string
): Promise<ReadinessItem[]> {
  const [products, categories, paymentAccounts, primaryAccount, settings, faqs, knowledge, pages] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId),
    supabase.from('product_categories').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId),
    supabase.from('merchant_payment_accounts').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId).eq('is_active', true),
    supabase.from('merchant_payment_accounts').select('id').eq('merchant_id', merchantId).eq('is_primary', true).maybeSingle(),
    supabase.from('merchant_settings').select('ai_system_prompt, bank_parser_id').eq('merchant_id', merchantId).single(),
    supabase.from('merchant_faqs').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId),
    supabase.from('merchant_knowledge_entries').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId),
    supabase.from('facebook_pages').select('id', { count: 'exact', head: true }).eq('merchant_id', merchantId),
  ]);

  const productCount = (products.count as number) ?? 0;
  const categoryCount = (categories.count as number) ?? 0;
  const paymentCount = (paymentAccounts.count as number) ?? 0;
  const hasPrimary = !!primaryAccount.data;
  const hasPrompt = !!(settings.data?.ai_system_prompt?.trim());
  const hasBankParser = !!settings.data?.bank_parser_id;
  const faqCount = (faqs.count as number) ?? 0;
  const knowledgeCount = (knowledge.count as number) ?? 0;
  const pageCount = (pages.count as number) ?? 0;

  const items: ReadinessItem[] = [
    { key: 'products', label: 'Products', status: productCount > 0 ? 'ready' : 'not_started', detail: productCount > 0 ? `${productCount} products` : undefined },
    { key: 'categories', label: 'Categories', status: categoryCount > 0 ? 'ready' : productCount > 0 ? 'in_progress' : 'not_started', detail: categoryCount > 0 ? `${categoryCount} categories` : undefined },
    { key: 'payment_account', label: 'Payment account', status: paymentCount > 0 ? 'ready' : 'not_started', detail: paymentCount > 0 ? `${paymentCount} account(s)` : undefined },
    { key: 'primary_payment', label: 'Primary payment account', status: hasPrimary ? 'ready' : paymentCount > 0 ? 'in_progress' : 'not_started' },
    { key: 'ai_prompt', label: 'AI prompt', status: hasPrompt ? 'ready' : 'in_progress' },
    { key: 'faq_knowledge', label: 'FAQ / Knowledge', status: faqCount > 0 || knowledgeCount > 0 ? 'ready' : 'in_progress', detail: faqCount + knowledgeCount > 0 ? `${faqCount} FAQs, ${knowledgeCount} entries` : undefined },
    { key: 'bank_parser', label: 'Bank parser config', status: hasBankParser ? 'ready' : 'in_progress' },
    { key: 'connected_page', label: 'Connected Facebook page', status: pageCount > 0 ? 'ready' : 'in_progress', detail: pageCount > 0 ? `${pageCount} page(s)` : undefined },
  ];
  return items;
}
