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
} as const;

/** Matching result status. Only confirmed + business rule leads to paid. */
export const MATCHING_RESULT_STATUS = {
  UNMATCHED: 'unmatched',
  AUTO_MATCHED: 'auto_matched',
  PROBABLE_MATCH: 'probable_match',
  MANUAL_REVIEW: 'manual_review',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;

/** User/role from profiles + merchant_members. */
export const ROLE = {
  SUPER_ADMIN: 'super_admin',
  MERCHANT_ADMIN: 'merchant_admin',
} as const;

/** Merchant config cache TTL in seconds. L1 best-effort only; DB is source of truth. */
export const MERCHANT_CONFIG_CACHE_TTL_SEC = 300;

/** Debounce window for message aggregation (ms). */
export const MESSAGE_DEBOUNCE_MS = 4000;

/** Minimum matching score (0-1) to consider auto_matched. */
export const AUTO_MATCH_MIN_SCORE = 0.9;

/** Minimum score for probable_match. */
export const PROBABLE_MATCH_MIN_SCORE = 0.7;
