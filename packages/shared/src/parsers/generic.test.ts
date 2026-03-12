import { describe, it, expect } from 'vitest'
import { genericBankParser } from './generic.js'

describe('genericBankParser', () => {
  it('parses valid payload', () => {
    const payload = {
      amount: 100.5,
      sender_name: 'Test User',
      datetime: '2024-01-15T10:00:00Z',
      reference_code: 'REF123',
      transaction_id: 'tx-1',
    }
    const result = genericBankParser.parse(payload)
    expect(result.amount).toBe(100.5)
    expect(result.sender_name).toBe('Test User')
    expect(result.datetime).toBe('2024-01-15T10:00:00Z')
    expect(result.reference_code).toBe('REF123')
    expect(result.bank_tx_id).toBe('tx-1')
    expect(result.raw_parser_id).toBe(genericBankParser.id)
  })

  it('allows null optional fields', () => {
    const payload = { amount: 50, datetime: '2024-01-15T12:00:00Z' }
    const result = genericBankParser.parse(payload)
    expect(result.amount).toBe(50)
    expect(result.sender_name).toBeNull()
    expect(result.reference_code).toBeNull()
    expect(result.bank_tx_id).toBeNull()
  })

  it('throws on invalid payload', () => {
    expect(() => genericBankParser.parse({ amount: -1, datetime: 'x' })).toThrow()
    expect(() => genericBankParser.parse({})).toThrow()
    expect(() => genericBankParser.parse({ amount: 10 })).toThrow() // datetime required
  })
})
