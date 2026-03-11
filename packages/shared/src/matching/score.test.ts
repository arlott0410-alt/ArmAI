import { describe, it, expect } from 'vitest';
import { computeMatchScore, classifyMatchOutcome } from './score.js';
import type { SlipExtraction } from '../types.js';
import type { BankTransactionNormalized } from '../types.js';

describe('computeMatchScore', () => {
  it('scores exact amount and same sender highly', () => {
    const slip: SlipExtraction = {
      amount: 100,
      sender_name: 'John Doe',
      datetime: '2024-01-15T10:00:00Z',
      reference_code: 'REF123',
      confidence_score: 0.9,
      raw_json: '{}',
    };
    const bank: BankTransactionNormalized = {
      amount: 100,
      sender_name: 'John Doe',
      datetime: '2024-01-15T10:05:00Z',
      reference_code: 'REF123',
      bank_tx_id: null,
      raw_parser_id: 'x',
    };
    const factors = computeMatchScore(slip, bank);
    expect(factors.amountExact).toBe(true);
    expect(factors.amountScore).toBe(1);
    expect(factors.totalScore).toBeGreaterThan(0.9);
  });

  it('scores amount mismatch lower', () => {
    const slip: SlipExtraction = {
      amount: 100,
      sender_name: 'John',
      datetime: null,
      reference_code: null,
      confidence_score: 0.8,
      raw_json: '{}',
    };
    const bank: BankTransactionNormalized = {
      amount: 200,
      sender_name: 'John',
      datetime: '2024-01-15T10:00:00Z',
      reference_code: null,
      bank_tx_id: null,
      raw_parser_id: 'x',
    };
    const factors = computeMatchScore(slip, bank);
    expect(factors.amountExact).toBe(false);
    expect(factors.amountScore).toBe(0);
    expect(factors.totalScore).toBeLessThan(0.5);
  });

  it('handles null slip amount', () => {
    const slip: SlipExtraction = {
      amount: null,
      sender_name: 'Jane',
      datetime: null,
      reference_code: null,
      confidence_score: 0.5,
      raw_json: '{}',
    };
    const bank: BankTransactionNormalized = {
      amount: 50,
      sender_name: 'Jane',
      datetime: '2024-01-15T10:00:00Z',
      reference_code: null,
      bank_tx_id: null,
      raw_parser_id: 'x',
    };
    const factors = computeMatchScore(slip, bank);
    expect(factors.amountScore).toBe(0.5);
  });
});

describe('classifyMatchOutcome', () => {
  it('returns auto_matched for high score', () => {
    expect(classifyMatchOutcome(0.95)).toBe('auto_matched');
    expect(classifyMatchOutcome(0.9)).toBe('auto_matched');
  });
  it('returns probable_match for medium score', () => {
    expect(classifyMatchOutcome(0.75)).toBe('probable_match');
  });
  it('returns manual_review for low positive score', () => {
    expect(classifyMatchOutcome(0.5)).toBe('manual_review');
  });
  it('returns unmatched for zero', () => {
    expect(classifyMatchOutcome(0)).toBe('unmatched');
  });
});
