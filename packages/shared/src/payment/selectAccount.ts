import type { MerchantPaymentAccount } from './types.js';

/**
 * Select payment account for an order. Safe minimal strategy: use primary, else first active.
 * No hardcoded accounts; only from provided list. Rules (by_category, by_amount) can be extended later.
 */
export function selectPaymentAccountForOrder(
  accounts: MerchantPaymentAccount[],
  _context?: { categoryId?: string | null; totalAmount?: number; productIds?: string[] }
): MerchantPaymentAccount | null {
  const active = accounts.filter((a) => a.is_active);
  if (active.length === 0) return null;
  const primary = active.find((a) => a.is_primary);
  if (primary) return primary;
  const sorted = [...active].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0] ?? null;
}
