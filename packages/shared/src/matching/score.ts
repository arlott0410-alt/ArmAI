/**
 * Score-based matching: amount, time, sender, reference.
 * Used by auto-matching engine; only high score + business rule leads to paid.
 */

import type { SlipExtraction } from '../types.js';
import type { BankTransactionNormalized } from '../types.js';
import { AUTO_MATCH_MIN_SCORE, PROBABLE_MATCH_MIN_SCORE } from '../constants.js';

export interface MatchScoreFactors {
  amountExact: boolean;
  amountScore: number;
  timeScore: number;
  senderScore: number;
  referenceScore: number;
  receiverAccountScore: number;
  totalScore: number;
}

const TIME_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const AMOUNT_WEIGHT = 0.35;
const TIME_WEIGHT = 0.2;
const SENDER_WEIGHT = 0.15;
const REFERENCE_WEIGHT = 0.1;
const RECEIVER_ACCOUNT_WEIGHT = 0.2;

function normalizeForSimilarity(s: string | null | undefined): string {
  if (s == null || s === '') return '';
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardLikeTokenScore(a: string, b: string): number {
  if (a === '' && b === '') return 1;
  if (a === '' || b === '') return 0;
  const setA = new Set(a.split(/\s+/).filter(Boolean));
  const setB = new Set(b.split(/\s+/).filter(Boolean));
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/**
 * Compute matching score between a slip extraction and a bank transaction.
 * Returns factors and total score in [0, 1].
 */
export function computeMatchScore(
  slip: SlipExtraction,
  bank: BankTransactionNormalized
): MatchScoreFactors {
  const amountExact = slip.amount != null && Math.abs(slip.amount - bank.amount) < 0.01;
  const amountScore = amountExact ? 1 : slip.amount != null ? 0 : 0.5;

  let timeScore = 0;
  if (slip.datetime && bank.datetime) {
    const slipTime = new Date(slip.datetime).getTime();
    const bankTime = new Date(bank.datetime).getTime();
    const diff = Math.abs(slipTime - bankTime);
    if (diff <= TIME_WINDOW_MS) {
      timeScore = 1 - diff / TIME_WINDOW_MS;
    }
  } else {
    timeScore = 0.5;
  }

  const senderA = normalizeForSimilarity(slip.sender_name);
  const senderB = normalizeForSimilarity(bank.sender_name);
  const senderScore = jaccardLikeTokenScore(senderA, senderB);

  let referenceScore = 0.5;
  if (slip.reference_code != null && slip.reference_code !== '' && bank.reference_code != null && bank.reference_code !== '') {
    referenceScore = normalizeForSimilarity(slip.reference_code) === normalizeForSimilarity(bank.reference_code) ? 1 : 0;
  }

  let receiverAccountScore = 0.5;
  const expectedAccount = (bank as { detected_account_number?: string | null; expected_account_number?: string | null }).expected_account_number ??
    (bank as { detected_account_number?: string | null }).detected_account_number;
  const slipReceiver = slip.receiver_account ?? null;
  const bankDetected = (bank as { detected_account_number?: string | null }).detected_account_number ?? null;
  if (expectedAccount != null && expectedAccount !== '') {
    const normalizedExpected = expectedAccount.replace(/\s/g, '');
    if (slipReceiver != null && slipReceiver !== '' && normalizedExpected === slipReceiver.replace(/\s/g, '')) receiverAccountScore = 1;
    else if (bankDetected != null && normalizedExpected === bankDetected.replace(/\s/g, '')) receiverAccountScore = 1;
    else if (slipReceiver != null && slipReceiver !== '' && bankDetected != null && slipReceiver.replace(/\s/g, '') === bankDetected.replace(/\s/g, '')) receiverAccountScore = 0.8;
  }

  const totalScore =
    AMOUNT_WEIGHT * amountScore +
    TIME_WEIGHT * timeScore +
    SENDER_WEIGHT * senderScore +
    REFERENCE_WEIGHT * referenceScore +
    RECEIVER_ACCOUNT_WEIGHT * receiverAccountScore;

  return {
    amountExact,
    amountScore,
    timeScore,
    senderScore,
    referenceScore,
    receiverAccountScore,
    totalScore,
  };
}

export type MatchOutcome = 'auto_matched' | 'probable_match' | 'manual_review' | 'unmatched';

/**
 * Classify match outcome from score. Does NOT set order to paid; that requires explicit confirm.
 */
export function classifyMatchOutcome(score: number): MatchOutcome {
  if (score >= AUTO_MATCH_MIN_SCORE) return 'auto_matched';
  if (score >= PROBABLE_MATCH_MIN_SCORE) return 'probable_match';
  if (score > 0) return 'manual_review';
  return 'unmatched';
}
