/**
 * Shared constants. Must stay in sync with SQL enums and app behavior.
 */

/** Order lifecycle statuses. AI extraction does NOT directly set paid. */
export const ORDER_STATUS = {
  PENDING: 'pending',
  SLIP_UPLOADED: 'slip_uploaded',
  SLIP_EXTRACTED: 'slip_extracted',
  BANK_PENDING_MATCH: 'bank_pending_match',
  PROBABLE_MATCH: 'probable_match',
  PAID: 'paid',
  MANUAL_REVIEW: 'manual_review',
  CANCELLED: 'cancelled',
} as const

/** Matching result status. Only confirmed + business rule leads to paid. */
export const MATCHING_RESULT_STATUS = {
  UNMATCHED: 'unmatched',
  AUTO_MATCHED: 'auto_matched',
  PROBABLE_MATCH: 'probable_match',
  MANUAL_REVIEW: 'manual_review',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const

/** User/role from profiles + merchant_members. */
export const ROLE = {
  SUPER_ADMIN: 'super_admin',
  MERCHANT_ADMIN: 'merchant_admin',
} as const

/** Merchant config cache TTL in seconds. L1 best-effort only; DB is source of truth. */
export const MERCHANT_CONFIG_CACHE_TTL_SEC = 300

/** Debounce window for message aggregation (ms). */
export const MESSAGE_DEBOUNCE_MS = 4000

/** Minimum matching score (0-1) to consider auto_matched. */
export const AUTO_MATCH_MIN_SCORE = 0.9

/** Minimum score for probable_match. */
export const PROBABLE_MATCH_MIN_SCORE = 0.7

/** Active payment method per order. Only one at a time. */
export const PAYMENT_METHOD = {
  PREPAID_BANK_TRANSFER: 'prepaid_bank_transfer',
  PREPAID_QR: 'prepaid_qr',
  COD: 'cod',
} as const

/** Payment lifecycle status (separate from order_status). */
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING_TRANSFER: 'pending_transfer',
  SLIP_UPLOADED: 'slip_uploaded',
  PENDING_BANK_MATCH: 'pending_bank_match',
  PAID: 'paid',
  COD_PENDING_CONFIRMATION: 'cod_pending_confirmation',
  COD_READY_TO_SHIP: 'cod_ready_to_ship',
  COD_SHIPPED: 'cod_shipped',
  COD_COLLECTED: 'cod_collected',
  COD_FAILED: 'cod_failed',
  COD_CANCELLED: 'cod_cancelled',
} as const

/** COD detail row status. */
export const ORDER_COD_STATUS = {
  PENDING_CUSTOMER_DETAILS: 'pending_customer_details',
  PENDING_MERCHANT_CONFIRMATION: 'pending_merchant_confirmation',
  READY_TO_SHIP: 'ready_to_ship',
  SHIPPED: 'shipped',
  DELIVERY_FAILED: 'delivery_failed',
  DELIVERED_UNCOLLECTED: 'delivered_uncollected',
  COLLECTED: 'collected',
  CANCELLED: 'cancelled',
} as const

/** Payment method switch result. */
export const PAYMENT_SWITCH_RESULT = {
  ALLOWED: 'allowed',
  DENIED: 'denied',
  REQUIRES_MANUAL_CONFIRMATION: 'requires_manual_confirmation',
} as const

/** Who requested the payment method switch. */
export const PAYMENT_SWITCH_REQUESTED_BY = {
  CUSTOMER: 'customer',
  AI: 'ai',
  MERCHANT_ADMIN: 'merchant_admin',
  SYSTEM: 'system',
} as const

/** Switch count above which manual confirmation may be required. */
export const PAYMENT_SWITCH_CONFIRMATION_THRESHOLD = 2

/** Order fulfillment lifecycle (post-payment). */
export const FULFILLMENT_STATUS = {
  PENDING_FULFILLMENT: 'pending_fulfillment',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  DELIVERY_FAILED: 'delivery_failed',
  CANCELLED: 'cancelled',
} as const

/** Shipment record status. */
export const SHIPMENT_STATUS = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const

/** Shipment method. */
export const SHIPMENT_METHOD = {
  COURIER_TRACKING: 'courier_tracking',
  LOCAL_DELIVERY: 'local_delivery',
  PICKUP: 'pickup',
  MANUAL_DISPATCH: 'manual_dispatch',
} as const
