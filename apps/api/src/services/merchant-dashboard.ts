import type { SupabaseClient } from '@supabase/supabase-js'
import * as summaryUpdate from './summary-update.js'

export interface MerchantDashboardSummary {
  merchantId: string
  ordersToday: number
  pendingPayment: number
  paidToday: number
  manualReviewCount: number
  probableMatchCount: number
  readyToShipCount?: number
  activeProductsCount: number
  activePaymentAccountsCount: number
}

export interface ReadinessItem {
  key: string
  label: string
  status: 'not_started' | 'in_progress' | 'ready'
  detail?: string
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
    .select(
      'orders_today, pending_payment_count, paid_today_count, manual_review_count, probable_match_count, ready_to_ship_count, active_products_count, active_payment_accounts_count'
    )
    .eq('merchant_id', merchantId)
    .maybeSingle()

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
    }
  }

  await summaryUpdate.refreshMerchantSummary(supabase, merchantId)
  const { data: after } = await supabase
    .from('merchant_dashboard_summaries')
    .select(
      'orders_today, pending_payment_count, paid_today_count, manual_review_count, probable_match_count, ready_to_ship_count, active_products_count, active_payment_accounts_count'
    )
    .eq('merchant_id', merchantId)
    .single()

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
    }
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
  }
}

export async function getMerchantReadiness(
  supabase: SupabaseClient,
  merchantId: string
): Promise<ReadinessItem[]> {
  const { data, error } = await supabase
    .rpc('merchant_readiness_counts', { p_merchant_id: merchantId })
    .single()
  if (error) throw new Error(error.message)
  const productCount = (data?.product_count as number) ?? 0
  const categoryCount = (data?.category_count as number) ?? 0
  const paymentCount = (data?.active_payment_account_count as number) ?? 0
  const hasPrimary = Boolean(data?.has_primary_payment_account)
  const hasPrompt = Boolean(data?.has_ai_prompt)
  const hasBankParser = Boolean(data?.has_bank_parser)
  const faqCount = (data?.faq_count as number) ?? 0
  const knowledgeCount = (data?.knowledge_count as number) ?? 0
  const pageCount = (data?.connected_facebook_page_count as number) ?? 0

  const items: ReadinessItem[] = [
    {
      key: 'products',
      label: 'Products',
      status: productCount > 0 ? 'ready' : 'not_started',
      detail: productCount > 0 ? `${productCount} products` : undefined,
    },
    {
      key: 'categories',
      label: 'Categories',
      status: categoryCount > 0 ? 'ready' : productCount > 0 ? 'in_progress' : 'not_started',
      detail: categoryCount > 0 ? `${categoryCount} categories` : undefined,
    },
    {
      key: 'payment_account',
      label: 'Payment account',
      status: paymentCount > 0 ? 'ready' : 'not_started',
      detail: paymentCount > 0 ? `${paymentCount} account(s)` : undefined,
    },
    {
      key: 'primary_payment',
      label: 'Primary payment account',
      status: hasPrimary ? 'ready' : paymentCount > 0 ? 'in_progress' : 'not_started',
    },
    { key: 'ai_prompt', label: 'AI prompt', status: hasPrompt ? 'ready' : 'in_progress' },
    {
      key: 'faq_knowledge',
      label: 'FAQ / Knowledge',
      status: faqCount > 0 || knowledgeCount > 0 ? 'ready' : 'in_progress',
      detail:
        faqCount + knowledgeCount > 0 ? `${faqCount} FAQs, ${knowledgeCount} entries` : undefined,
    },
    {
      key: 'bank_parser',
      label: 'Bank parser config',
      status: hasBankParser ? 'ready' : 'in_progress',
    },
    {
      key: 'connected_page',
      label: 'Connected Facebook page',
      status: pageCount > 0 ? 'ready' : 'in_progress',
      detail: pageCount > 0 ? `${pageCount} page(s)` : undefined,
    },
  ]
  return items
}
