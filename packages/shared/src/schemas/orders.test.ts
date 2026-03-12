import { describe, it, expect } from 'vitest'
import { orderSchema, confirmMatchBodySchema } from './orders.js'
import { ORDER_STATUS } from '../constants.js'

describe('orderSchema', () => {
  it('accepts valid order object', () => {
    const valid = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      merchant_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      status: ORDER_STATUS.PENDING,
      customer_name: 'John',
      customer_psid: null,
      amount: 100,
      reference_code: 'REF-001',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    expect(orderSchema.parse(valid)).toEqual(valid)
  })

  it('accepts all order statuses', () => {
    const statuses = Object.values(ORDER_STATUS)
    for (const status of statuses) {
      const order = {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        merchant_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        status,
        customer_name: null,
        customer_psid: null,
        amount: null,
        reference_code: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      expect(orderSchema.parse(order).status).toBe(status)
    }
  })

  it('rejects invalid uuid for id', () => {
    const invalid = {
      id: 'not-a-uuid',
      merchant_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      status: ORDER_STATUS.PENDING,
      customer_name: null,
      customer_psid: null,
      amount: null,
      reference_code: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    expect(() => orderSchema.parse(invalid)).toThrow()
  })

  it('rejects invalid status', () => {
    const invalid = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      merchant_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      status: 'invalid_status',
      customer_name: null,
      customer_psid: null,
      amount: null,
      reference_code: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    expect(() => orderSchema.parse(invalid)).toThrow()
  })
})

describe('confirmMatchBodySchema', () => {
  it('accepts valid confirm body', () => {
    const valid = {
      matching_result_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      confirm: true,
    }
    expect(confirmMatchBodySchema.parse(valid)).toEqual(valid)
  })

  it('accepts confirm: false', () => {
    const body = {
      matching_result_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      confirm: false,
    }
    expect(confirmMatchBodySchema.parse(body).confirm).toBe(false)
  })

  it('rejects invalid uuid', () => {
    expect(() => confirmMatchBodySchema.parse({ matching_result_id: 'x', confirm: true })).toThrow()
  })

  it('rejects non-boolean confirm', () => {
    expect(() =>
      confirmMatchBodySchema.parse({
        matching_result_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        confirm: 'yes',
      })
    ).toThrow()
  })
})
