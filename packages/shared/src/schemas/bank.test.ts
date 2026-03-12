import { describe, it, expect } from 'vitest'
import {
  bankWebhookHeadersSchema,
  normalizedTransactionSchema,
  normalizedTransactionCandidateSchema,
} from './bank.js'

describe('bankWebhookHeadersSchema', () => {
  it('accepts empty object', () => {
    expect(bankWebhookHeadersSchema.parse({})).toEqual({})
  })

  it('accepts valid optional headers', () => {
    const headers = {
      'x-bank-source': 'scb',
      'x-idempotency-key': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    }
    expect(bankWebhookHeadersSchema.parse(headers)).toEqual(headers)
  })

  it('rejects x-bank-source longer than 64', () => {
    expect(() => bankWebhookHeadersSchema.parse({ 'x-bank-source': 'a'.repeat(65) })).toThrow()
  })

  it('rejects invalid uuid for x-idempotency-key', () => {
    expect(() => bankWebhookHeadersSchema.parse({ 'x-idempotency-key': 'not-uuid' })).toThrow()
  })
})

describe('normalizedTransactionSchema', () => {
  it('accepts valid normalized transaction', () => {
    const tx = {
      amount: 100.5,
      sender_name: 'Alice',
      datetime: '2024-01-15T14:00:00Z',
      reference_code: 'REF-1',
      bank_tx_id: 'btx-1',
      raw_parser_id: 'parser-1',
    }
    expect(normalizedTransactionSchema.parse(tx)).toEqual(tx)
  })

  it('accepts null sender_name and reference_code', () => {
    const tx = {
      amount: 50,
      sender_name: null,
      datetime: '2024-01-01T00:00:00Z',
      reference_code: null,
      bank_tx_id: null,
      raw_parser_id: 'p',
    }
    expect(normalizedTransactionSchema.parse(tx)).toEqual(tx)
  })

  it('rejects zero or negative amount', () => {
    expect(() =>
      normalizedTransactionSchema.parse({
        amount: 0,
        sender_name: null,
        datetime: '2024-01-01T00:00:00Z',
        reference_code: null,
        bank_tx_id: null,
        raw_parser_id: 'p',
      })
    ).toThrow()
    expect(() =>
      normalizedTransactionSchema.parse({
        amount: -1,
        sender_name: null,
        datetime: '2024-01-01T00:00:00Z',
        reference_code: null,
        bank_tx_id: null,
        raw_parser_id: 'p',
      })
    ).toThrow()
  })

  it('rejects missing required fields', () => {
    expect(() => normalizedTransactionSchema.parse({ amount: 10 })).toThrow()
  })
})

describe('normalizedTransactionCandidateSchema', () => {
  it('accepts minimal valid candidate', () => {
    const c = {
      amount: 100,
      sender_name: null,
      reference_code: null,
      transaction_time: '2024-01-15T14:00:00Z',
      datetime: '2024-01-15T14:00:00Z',
      raw_parser_id: 'parser-1',
    }
    expect(normalizedTransactionCandidateSchema.parse(c)).toMatchObject({
      amount: 100,
      raw_parser_id: 'parser-1',
    })
  })

  it('accepts full optional receiver fields', () => {
    const c = {
      amount: 200,
      currency: 'THB',
      sender_name: 'Bob',
      reference_code: 'R2',
      transaction_time: '2024-01-15T15:00:00Z',
      receiver_account_number: '1234567890',
      receiver_account_suffix: '12',
      receiver_account_name: 'Merchant',
      receiver_bank_code: 'SCB',
      parser_profile_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      parse_confidence: 0.95,
      datetime: '2024-01-15T15:00:00Z',
      bank_tx_id: 'btx-2',
      raw_parser_id: 'p2',
    }
    const parsed = normalizedTransactionCandidateSchema.parse(c)
    expect(parsed.amount).toBe(200)
    expect(parsed.parse_confidence).toBe(0.95)
    expect(parsed.receiver_account_number).toBe('1234567890')
  })

  it('rejects parse_confidence outside 0-1', () => {
    expect(() =>
      normalizedTransactionCandidateSchema.parse({
        amount: 100,
        transaction_time: '2024-01-01T00:00:00Z',
        datetime: '2024-01-01T00:00:00Z',
        raw_parser_id: 'p',
        parse_confidence: 1.5,
      })
    ).toThrow()
  })
})
