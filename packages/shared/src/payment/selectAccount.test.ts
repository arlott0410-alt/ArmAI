import { describe, it, expect } from 'vitest';
import { selectPaymentAccountForOrder } from './selectAccount.js';

describe('selectPaymentAccountForOrder', () => {
  const account1 = {
    id: 'a1',
    merchant_id: 'm1',
    bank_code: 'SCB',
    account_number: '123',
    account_holder_name: 'Test',
    is_primary: false,
    is_active: true,
    sort_order: 1,
  } as import('./types.js').MerchantPaymentAccount;

  const account2 = {
    ...account1,
    id: 'a2',
    account_number: '456',
    is_primary: true,
    sort_order: 0,
  } as import('./types.js').MerchantPaymentAccount;

  it('returns null when no accounts', () => {
    expect(selectPaymentAccountForOrder([])).toBeNull();
  });

  it('returns primary when present', () => {
    const result = selectPaymentAccountForOrder([account1, account2]);
    expect(result?.id).toBe('a2');
    expect(result?.is_primary).toBe(true);
  });

  it('returns first active by sort_order when no primary', () => {
    const a = { ...account1, is_primary: false };
    const b = { ...account2, id: 'a2', is_primary: false, sort_order: 2 };
    const result = selectPaymentAccountForOrder([b, a]);
    expect(result?.id).toBe('a1');
  });

  it('ignores inactive accounts', () => {
    const inactive = { ...account1, is_active: false };
    expect(selectPaymentAccountForOrder([inactive])).toBeNull();
  });
});
