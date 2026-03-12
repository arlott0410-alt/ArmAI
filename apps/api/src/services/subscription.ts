import type { SupabaseClient } from '@supabase/supabase-js'
import { STANDARD_PLAN_CODE, STANDARD_PLAN, getPlanByCode as getCatalogPlan } from '@armai/shared'
import * as billing from './billing.js'
import * as merchantService from './merchant.js'
import * as plansDb from './plans-db.js'

/** Single plan: Standard 1,999,000 LAK/month. */
export const STANDARD_PRICE_LAK = 1_999_000

export interface PlanPublic {
  id?: string
  code: string
  name: string
  priceLak: number
  features: string[]
  maxUsers: number | null
}

/** List plans: single Standard plan from DB or fallback. */
export async function getPlansPublic(supabase: SupabaseClient): Promise<PlanPublic[]> {
  const rows = await plansDb.listPlansPublic(supabase)
  const standard = rows.find((r) => r.code === STANDARD_PLAN_CODE) ?? null
  if (standard) {
    return [
      {
        id: standard.id,
        code: standard.code,
        name: standard.name,
        priceLak: standard.price_lak,
        features: standard.features,
        maxUsers: standard.max_users,
      },
    ]
  }
  return [
    {
      code: STANDARD_PLAN.code,
      name: STANDARD_PLAN.nameKey,
      priceLak: STANDARD_PRICE_LAK,
      features: [...STANDARD_PLAN.features],
      maxUsers: STANDARD_PLAN.maxUsers,
    },
  ]
}

export async function getMerchantSubscription(
  supabase: SupabaseClient,
  merchantId: string
): Promise<{
  plan: PlanPublic | null
  planCode: string
  billingStatus: string
  currentPeriodEnd: string | null
  nextBillingAt: string | null
} | null> {
  const planRow = await billing.getMerchantPlan(supabase, merchantId)
  if (!planRow) return null
  const dbPlan = await plansDb.getPlanByCode(supabase, planRow.plan_code)
  const plan: PlanPublic | null = dbPlan
    ? {
        id: dbPlan.id,
        code: dbPlan.code,
        name: dbPlan.name,
        priceLak: dbPlan.price_lak,
        features: dbPlan.features,
        maxUsers: dbPlan.max_users,
      }
    : null
  return {
    plan,
    planCode: planRow.plan_code,
    billingStatus: planRow.billing_status,
    currentPeriodEnd: planRow.current_period_end ?? null,
    nextBillingAt: planRow.next_billing_at ?? null,
  }
}

export interface CreateCheckoutParams {
  merchantId: string
  planCode: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string | null
  customerPhone?: string | null
  billingAddress?: {
    name?: string
    address_line1?: string
    city?: string
    country?: string
    postal_code?: string
  } | null
}

export interface CreateCheckoutResult {
  checkoutUrl: string | null
  paymentId: string | null
  error?: string
}

/**
 * Create a pending subscription payment (manual slip). Amount fixed 1,999,000 LAK.
 * Superadmin approves via Billing page → subscription active, expiry +1 month.
 */
export async function createCheckout(
  supabase: SupabaseClient,
  env: {
    STRIPE_SECRET_KEY?: string
    BCEL_ONEPAY_API_URL?: string
    BCEL_ONEPAY_MERCHANT_ID?: string
    BCEL_ONEPAY_SECRET_KEY?: string
  },
  params: CreateCheckoutParams
): Promise<CreateCheckoutResult> {
  const planCode = params.planCode === STANDARD_PLAN_CODE ? params.planCode : STANDARD_PLAN_CODE
  const priceLak = STANDARD_PRICE_LAK
  const dbPlan = await plansDb.getPlanByCode(supabase, planCode)
  const catalogPlan = getCatalogPlan(planCode)
  const planName = dbPlan?.name ?? catalogPlan?.nameKey ?? 'Standard'
  const features = dbPlan?.features ?? catalogPlan?.features ?? []

  const merchant = await merchantService
    .getMerchantById(supabase, params.merchantId)
    .catch(() => null)
  if (!merchant) return { checkoutUrl: null, paymentId: null, error: 'Merchant not found' }

  // Manual slip flow: create pending payment (1,999,000 LAK), no redirect. Super approves later.
  const { data: paymentRow, error: insertError } = await supabase
    .from('subscription_payments')
    .insert({
      merchant_id: params.merchantId,
      provider: 'manual_slip',
      amount: STANDARD_PRICE_LAK,
      currency: 'LAK',
      status: 'pending',
      customer_email: params.customerEmail ?? null,
      customer_phone: params.customerPhone ?? null,
      billing_address: params.billingAddress ?? null,
      metadata: { plan_code: planCode, plan_name: planName },
    })
    .select('id')
    .single()
  if (insertError) return { checkoutUrl: null, paymentId: null, error: insertError.message }
  return { checkoutUrl: null, paymentId: paymentRow.id }
}

/**
 * Activate subscription after successful payment (called from webhook or after redirect).
 * Optional paymentExternalId: when provided (e.g. Stripe session id), update that subscription_payment row.
 */
export async function activateSubscription(
  supabase: SupabaseClient,
  merchantId: string,
  planCode: string,
  paymentExternalId?: string
): Promise<void> {
  const code = planCode === STANDARD_PLAN_CODE ? planCode : STANDARD_PLAN_CODE
  const priceLak = STANDARD_PRICE_LAK

  const now = new Date()
  const periodStart = now
  const periodEnd = new Date(now)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  const nextBilling = new Date(periodEnd)

  await billing.upsertMerchantPlan(supabase, merchantId, {
    plan_code: code,
    billing_status: 'active',
    monthly_price_usd: priceLak / 20000,
    currency: 'LAK',
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd.toISOString(),
    next_billing_at: nextBilling.toISOString(),
    last_paid_at: now.toISOString(),
    grace_until: null,
    cancel_at_period_end: false,
    is_auto_renew: true,
  })

  await billing.createBillingEvent(supabase, merchantId, {
    event_type: 'subscription_charge',
    amount: priceLak,
    currency: 'LAK',
    invoice_period_start: periodStart.toISOString(),
    invoice_period_end: periodEnd.toISOString(),
    due_at: now.toISOString(),
    paid_at: now.toISOString(),
    status: 'paid',
    reference_note: paymentExternalId ? `Payment ${paymentExternalId}` : 'Subscription activated',
  })

  if (paymentExternalId) {
    await supabase
      .from('subscription_payments')
      .update({ status: 'succeeded', paid_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('merchant_id', merchantId)
      .eq('external_id', paymentExternalId)
  }
}

/** Mark subscription_payment by our row id (e.g. BCEL callback with ref=id). */
export async function markPaymentSucceeded(
  supabase: SupabaseClient,
  paymentId: string,
  externalId?: string | null
): Promise<void> {
  await supabase
    .from('subscription_payments')
    .update({
      status: 'succeeded',
      external_id: externalId ?? undefined,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
}

export interface PendingPaymentRow {
  id: string
  merchant_id: string
  amount: number
  currency: string
  status: string
  created_at: string
  merchant_name?: string
}

/** List pending subscription payments (for superadmin Billing page). */
export async function listPendingSubscriptionPayments(
  supabase: SupabaseClient
): Promise<PendingPaymentRow[]> {
  const { data: payments, error } = await supabase
    .from('subscription_payments')
    .select('id, merchant_id, amount, currency, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message)
  const list = (payments ?? []) as PendingPaymentRow[]
  if (list.length === 0) return []
  const merchantIds = [...new Set(list.map((p) => p.merchant_id))]
  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, name')
    .in('id', merchantIds)
  const nameById = new Map(
    (merchants ?? []).map((m: { id: string; name: string }) => [m.id, m.name])
  )
  return list.map((p) => ({ ...p, merchant_name: nameById.get(p.merchant_id) ?? undefined }))
}

/** Approve a pending payment: activate subscription (expiry +1 month) and mark payment succeeded. */
export async function approveSubscriptionPayment(
  supabase: SupabaseClient,
  paymentId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: payment, error: fetchError } = await supabase
    .from('subscription_payments')
    .select('id, merchant_id, status')
    .eq('id', paymentId)
    .single()
  if (fetchError || !payment) return { ok: false, error: 'Payment not found' }
  if ((payment as { status: string }).status !== 'pending') {
    return { ok: false, error: 'Payment is not pending' }
  }
  const merchantId = (payment as { merchant_id: string }).merchant_id
  await activateSubscription(supabase, merchantId, STANDARD_PLAN_CODE)
  await markPaymentSucceeded(supabase, paymentId)
  return { ok: true }
}
