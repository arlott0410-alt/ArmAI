import { describe, it, expect } from 'vitest'
import { computeMatchScore } from './score.js'
import type { SlipExtraction } from '../types.js'

describe('account-aware matching score', () => {
  it('increases score when slip receiver matches expected account', () => {
    const slip: SlipExtraction = {
      amount: 100,
      sender_name: 'A',
      datetime: '2024-01-15T10:00:00Z',
      reference_code: null,
      confidence_score: 0.9,
      raw_json: '{}',
      receiver_account: '1234567890',
      receiver_bank: 'SCB',
      receiver_name: 'Merchant',
    }
    const bank = {
      amount: 100,
      sender_name: 'A',
      datetime: '2024-01-15T10:02:00Z',
      reference_code: null,
      bank_tx_id: null,
      raw_parser_id: 'x',
      expected_account_number: '1234567890',
      detected_account_number: null,
    }
    const factors = computeMatchScore(slip, bank as never)
    expect(factors.receiverAccountScore).toBe(1)
    expect(factors.totalScore).toBeGreaterThanOrEqual(0.9)
  })

  it('uses 0.5 receiver score when no expected account', () => {
    const slip: SlipExtraction = {
      amount: 50,
      sender_name: 'B',
      datetime: null,
      reference_code: null,
      confidence_score: 0.5,
      raw_json: '{}',
    }
    const bank = {
      amount: 50,
      sender_name: 'B',
      datetime: '2024-01-15T12:00:00Z',
      reference_code: null,
      bank_tx_id: null,
      raw_parser_id: 'x',
    }
    const factors = computeMatchScore(slip, bank as never)
    expect(factors.receiverAccountScore).toBe(0.5)
  })
})
