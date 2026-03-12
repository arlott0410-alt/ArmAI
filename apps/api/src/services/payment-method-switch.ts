import type { SupabaseClient } from '@supabase/supabase-js'
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ORDER_STATUS,
  PAYMENT_SWITCH_RESULT,
  PAYMENT_SWITCH_CONFIRMATION_THRESHOLD,
} from '@armai/shared'
import type { PaymentMethod, PaymentSwitchResult } from '@armai/shared'
import type { MerchantCodSettingsRow } from './cod-settings.js'

export interface OrderForSwitch {
  id: string
  merchant_id: string
  status: string
  payment_method: string
  payment_status: string
  payment_method_locked_at: string | null
  payment_switch_count: number
  amount: number | null
}

export interface CanSwitchResult {
  result: PaymentSwitchResult
  reason: string
}

/**
 * Determines if an order can switch to the desired payment method.
 * Used by AI runtime and merchant actions. Does not mutate state.
 */
export async function canSwitchPaymentMethod(
  supabase: SupabaseClient,
  params: {
    order: OrderForSwitch
    desiredMethod: PaymentMethod
    codSettings: MerchantCodSettingsRow | null
    orderAmount: number
    allProductsCodAllowed: boolean
    anyProductRequiresManualCod: boolean
  }
): Promise<CanSwitchResult> {
  const {
    order,
    desiredMethod,
    codSettings,
    orderAmount,
    allProductsCodAllowed,
    anyProductRequiresManualCod,
  } = params

  if (order.payment_method_locked_at) {
    return {
      result: PAYMENT_SWITCH_RESULT.DENIED,
      reason: 'Payment method is locked (e.g. payment already confirmed).',
    }
  }

  if (order.status === ORDER_STATUS.PAID) {
    return { result: PAYMENT_SWITCH_RESULT.DENIED, reason: 'Order is already paid.' }
  }

  if (order.payment_status === PAYMENT_STATUS.PAID) {
    return { result: PAYMENT_SWITCH_RESULT.DENIED, reason: 'Payment already completed.' }
  }

  if (order.payment_status === PAYMENT_STATUS.COD_COLLECTED) {
    return { result: PAYMENT_SWITCH_RESULT.DENIED, reason: 'COD already collected.' }
  }

  if (desiredMethod === order.payment_method) {
    return {
      result: PAYMENT_SWITCH_RESULT.DENIED,
      reason: 'Order already uses this payment method.',
    }
  }

  if (desiredMethod === PAYMENT_METHOD.COD) {
    if (!codSettings?.enable_cod) {
      return {
        result: PAYMENT_SWITCH_RESULT.DENIED,
        reason: 'COD is not enabled for this merchant.',
      }
    }
    if (!allProductsCodAllowed) {
      return {
        result: PAYMENT_SWITCH_RESULT.DENIED,
        reason: 'One or more items in this order are not eligible for COD.',
      }
    }
    const min = codSettings.cod_min_order_amount ?? 0
    const max = codSettings.cod_max_order_amount
    if (orderAmount < min) {
      return {
        result: PAYMENT_SWITCH_RESULT.DENIED,
        reason: `Order amount is below minimum for COD (${min}).`,
      }
    }
    if (max != null && orderAmount > max) {
      return {
        result: PAYMENT_SWITCH_RESULT.DENIED,
        reason: `Order amount exceeds maximum for COD (${max}).`,
      }
    }
    const needsConfirmation =
      codSettings.cod_requires_manual_confirmation ||
      anyProductRequiresManualCod ||
      order.payment_switch_count >= PAYMENT_SWITCH_CONFIRMATION_THRESHOLD
    if (needsConfirmation) {
      return {
        result: PAYMENT_SWITCH_RESULT.REQUIRES_MANUAL_CONFIRMATION,
        reason: 'Switch to COD requires merchant confirmation.',
      }
    }
  }

  if (
    desiredMethod === PAYMENT_METHOD.PREPAID_BANK_TRANSFER ||
    desiredMethod === PAYMENT_METHOD.PREPAID_QR
  ) {
    const needsConfirmation = order.payment_switch_count >= PAYMENT_SWITCH_CONFIRMATION_THRESHOLD
    if (needsConfirmation) {
      return {
        result: PAYMENT_SWITCH_RESULT.REQUIRES_MANUAL_CONFIRMATION,
        reason: 'Multiple payment method changes; merchant confirmation required.',
      }
    }
  }

  return { result: PAYMENT_SWITCH_RESULT.ALLOWED, reason: 'Switch allowed.' }
}

/**
 * Load COD eligibility for order items (product-level).
 */
export async function getOrderProductsCodEligibility(
  supabase: SupabaseClient,
  merchantId: string,
  orderId: string
): Promise<{ allCodAllowed: boolean; anyRequiresManualCod: boolean }> {
  const { data: items } = await supabase
    .from('order_items')
    .select('product_id')
    .eq('order_id', orderId)
    .eq('merchant_id', merchantId)
  if (!items?.length) return { allCodAllowed: true, anyRequiresManualCod: false }
  const productIds = [...new Set(items.map((i) => i.product_id).filter(Boolean))] as string[]
  if (productIds.length === 0) return { allCodAllowed: true, anyRequiresManualCod: false }
  const { data: products } = await supabase
    .from('products')
    .select('is_cod_allowed, requires_manual_cod_confirmation')
    .eq('merchant_id', merchantId)
    .in('id', productIds)
  const allCodAllowed = (products ?? []).every((p) => p.is_cod_allowed !== false)
  const anyRequiresManualCod = (products ?? []).some(
    (p) => p.requires_manual_cod_confirmation === true
  )
  return { allCodAllowed, anyRequiresManualCod }
}
