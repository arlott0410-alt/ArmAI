/**
 * Single plan: Standard — 1,999,000 LAK/month, all features.
 */

export const STANDARD_PLAN_CODE = 'standard' as const
export type PlanCode = typeof STANDARD_PLAN_CODE

export const STANDARD_PLAN = {
  code: STANDARD_PLAN_CODE,
  nameKey: 'plan.standard',
  monthlyPriceUsd: 1_999_000 / 20_000,
  features: [
    'Core AI features',
    'Unlimited users',
    'Analytics',
    'Priority support',
    'All channels (Facebook, WhatsApp, Telegram)',
    'Bank sync & payment config',
    'Knowledge base & promotions',
  ],
  maxUsers: null,
  supportLevel: 'priority',
} as const

export const SUBSCRIPTION_PLAN_CATALOG: Record<PlanCode, typeof STANDARD_PLAN> = {
  [STANDARD_PLAN_CODE]: STANDARD_PLAN,
}

export function getPlanByCode(code: string): typeof STANDARD_PLAN | null {
  return code === STANDARD_PLAN_CODE ? STANDARD_PLAN : null
}
