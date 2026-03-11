/**
 * Order status transition rules (staged; AI extraction does not set paid).
 */

import { describe, it, expect } from 'vitest';
import { ORDER_STATUS } from '../constants.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.SLIP_UPLOADED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SLIP_UPLOADED]: [ORDER_STATUS.SLIP_EXTRACTED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SLIP_EXTRACTED]: [ORDER_STATUS.BANK_PENDING_MATCH, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.BANK_PENDING_MATCH]: [ORDER_STATUS.PROBABLE_MATCH, ORDER_STATUS.MANUAL_REVIEW, ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROBABLE_MATCH]: [ORDER_STATUS.PAID, ORDER_STATUS.MANUAL_REVIEW, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.MANUAL_REVIEW]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

function canTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

describe('order state transitions', () => {
  it('pending can go to slip_uploaded or cancelled', () => {
    expect(canTransition(ORDER_STATUS.PENDING, ORDER_STATUS.SLIP_UPLOADED)).toBe(true);
    expect(canTransition(ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED)).toBe(true);
    expect(canTransition(ORDER_STATUS.PENDING, ORDER_STATUS.PAID)).toBe(false);
  });

  it('slip_extracted can go to bank_pending_match', () => {
    expect(canTransition(ORDER_STATUS.SLIP_EXTRACTED, ORDER_STATUS.BANK_PENDING_MATCH)).toBe(true);
    expect(canTransition(ORDER_STATUS.SLIP_EXTRACTED, ORDER_STATUS.PAID)).toBe(false);
  });

  it('paid and cancelled are terminal', () => {
    expect(canTransition(ORDER_STATUS.PAID, ORDER_STATUS.PENDING)).toBe(false);
    expect(canTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING)).toBe(false);
  });
});
