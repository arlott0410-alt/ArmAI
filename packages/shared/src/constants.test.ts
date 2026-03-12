import { describe, it, expect } from 'vitest'
import {
  ORDER_STATUS,
  MATCHING_RESULT_STATUS,
  FULFILLMENT_STATUS,
  AUTO_MATCH_MIN_SCORE,
  PROBABLE_MATCH_MIN_SCORE,
  MERCHANT_CONFIG_CACHE_TTL_SEC,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './constants.js'

describe('constants', () => {
  describe('ORDER_STATUS', () => {
    it('includes expected lifecycle statuses', () => {
      expect(ORDER_STATUS.PENDING).toBe('pending')
      expect(ORDER_STATUS.PAID).toBe('paid')
      expect(ORDER_STATUS.CANCELLED).toBe('cancelled')
      expect(ORDER_STATUS.SLIP_UPLOADED).toBe('slip_uploaded')
      expect(ORDER_STATUS.BANK_PENDING_MATCH).toBe('bank_pending_match')
      expect(ORDER_STATUS.PROBABLE_MATCH).toBe('probable_match')
      expect(ORDER_STATUS.MANUAL_REVIEW).toBe('manual_review')
    })

    it('all values are non-empty strings', () => {
      for (const v of Object.values(ORDER_STATUS)) {
        expect(typeof v).toBe('string')
        expect(v.length).toBeGreaterThan(0)
      }
    })
  })

  describe('MATCHING_RESULT_STATUS', () => {
    it('includes unmatched, auto_matched, confirmed, rejected', () => {
      expect(MATCHING_RESULT_STATUS.UNMATCHED).toBe('unmatched')
      expect(MATCHING_RESULT_STATUS.AUTO_MATCHED).toBe('auto_matched')
      expect(MATCHING_RESULT_STATUS.CONFIRMED).toBe('confirmed')
      expect(MATCHING_RESULT_STATUS.REJECTED).toBe('rejected')
    })
  })

  describe('FULFILLMENT_STATUS', () => {
    it('includes expected fulfillment states', () => {
      expect(FULFILLMENT_STATUS.PENDING_FULFILLMENT).toBe('pending_fulfillment')
      expect(FULFILLMENT_STATUS.SHIPPED).toBe('shipped')
      expect(FULFILLMENT_STATUS.DELIVERED).toBe('delivered')
      expect(FULFILLMENT_STATUS.CANCELLED).toBe('cancelled')
    })
  })

  describe('score thresholds', () => {
    it('AUTO_MATCH_MIN_SCORE is 0.9', () => {
      expect(AUTO_MATCH_MIN_SCORE).toBe(0.9)
    })
    it('PROBABLE_MATCH_MIN_SCORE is 0.7', () => {
      expect(PROBABLE_MATCH_MIN_SCORE).toBe(0.7)
    })
  })

  describe('MERCHANT_CONFIG_CACHE_TTL_SEC', () => {
    it('is a positive number', () => {
      expect(MERCHANT_CONFIG_CACHE_TTL_SEC).toBe(300)
    })
  })

  describe('PAYMENT_METHOD', () => {
    it('includes prepaid and COD', () => {
      expect(PAYMENT_METHOD.PREPAID_BANK_TRANSFER).toBe('prepaid_bank_transfer')
      expect(PAYMENT_METHOD.COD).toBe('cod')
    })
  })

  describe('PAYMENT_STATUS', () => {
    it('includes unpaid, paid, COD states', () => {
      expect(PAYMENT_STATUS.UNPAID).toBe('unpaid')
      expect(PAYMENT_STATUS.PAID).toBe('paid')
      expect(PAYMENT_STATUS.COD_COLLECTED).toBe('cod_collected')
    })
  })
})
