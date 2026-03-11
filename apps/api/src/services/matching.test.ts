/**
 * Matching logic tests - pure functions only; no Supabase.
 */
import { describe, it, expect } from 'vitest';
import { computeMatchScore, classifyMatchOutcome } from '@armai/shared';
import type { SlipExtraction } from '@armai/shared';
import type { BankTransactionNormalized } from '@armai/shared';

describe('matching score and outcome', () => {
  it('high score yields auto_matched', () => {
    const slip: SlipExtraction = {
      amount: 500,
      sender_name: 'Alice',
      datetime: '2024-01-15T14:00:00Z',
      reference_code: 'ORD-001',
      confidence_score: 0.95,
      raw_json: '{}',
    };
    const bank: BankTransactionNormalized = {
      amount: 500,
      sender_name: 'Alice',
      datetime: '2024-01-15T14:02:00Z',
      reference_code: 'ORD-001',
      bank_tx_id: null,
      raw_parser_id: 'p',
    };
    const factors = computeMatchScore(slip, bank);
    expect(classifyMatchOutcome(factors.totalScore)).toBe('auto_matched');
  });
});
