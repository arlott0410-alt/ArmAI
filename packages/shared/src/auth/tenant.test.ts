/**
 * Tenant authorization helper tests (pure logic).
 * Real RLS is in DB; this tests app-side guard logic.
 */

import { describe, it, expect } from 'vitest'

function userCanAccessMerchant(
  userRole: 'super_admin' | 'merchant_admin',
  userMerchantIds: string[],
  targetMerchantId: string
): boolean {
  if (userRole === 'super_admin') return true
  return userMerchantIds.includes(targetMerchantId)
}

describe('userCanAccessMerchant', () => {
  const merchantId = '11111111-1111-4111-8111-111111111111'

  it('allows super_admin for any merchant', () => {
    expect(userCanAccessMerchant('super_admin', [], merchantId)).toBe(true)
    expect(userCanAccessMerchant('super_admin', ['other'], merchantId)).toBe(true)
  })

  it('allows merchant_admin only for own merchants', () => {
    expect(userCanAccessMerchant('merchant_admin', [merchantId], merchantId)).toBe(true)
    expect(userCanAccessMerchant('merchant_admin', ['other-id'], merchantId)).toBe(false)
    expect(userCanAccessMerchant('merchant_admin', [], merchantId)).toBe(false)
  })

  it('allows merchant_admin with multiple merchants', () => {
    expect(userCanAccessMerchant('merchant_admin', [merchantId, 'other'], merchantId)).toBe(true)
  })
})
