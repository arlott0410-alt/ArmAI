import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../i18n/I18nProvider'
import { superApi, type AdminPlanRow } from '../../lib/api'
import { PageShell } from '../../components/ui'
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton'

const LAK_FORMAT = new Intl.NumberFormat('lo-LA', { maximumFractionDigits: 0 })

/** Single plan: Standard 1,999,000 LAK/month, all features. */
const SINGLE_PLAN: AdminPlanRow = {
  id: '',
  name: 'Standard',
  code: 'standard',
  price_lak: 1_999_000,
  features: [
    'Core AI features',
    'Unlimited users',
    'Analytics',
    'Priority support',
    'All channels (Facebook, WhatsApp, Telegram)',
    'Bank sync & payment config',
    'Knowledge base & promotions',
  ],
  max_users: null,
  active: true,
  sort_order: 0,
  created_at: '',
  updated_at: '',
}

export default function SuperPlans() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [plans, setPlans] = useState<AdminPlanRow[]>([SINGLE_PLAN])
  const [loading, setLoading] = useState(true)
  const token = user?.accessToken ?? null

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    superApi
      .plans(token)
      .then((r) => {
        const standard = r.plans.find((p) => p.code === 'standard')
        if (standard)
          setPlans([{ ...standard, features: standard.features ?? SINGLE_PLAN.features }])
        else setPlans([SINGLE_PLAN])
      })
      .catch(() => setPlans([SINGLE_PLAN]))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <PageShell title={t('admin.plans')} description={t('pricing.subtitleSingle')}>
        <DashboardSkeleton />
      </PageShell>
    )
  }

  return (
    <PageShell title={t('admin.plans')} description={t('pricing.subtitleSingle')} actions={null}>
      <div className="py-4">
        <div className="rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface)] overflow-hidden glass-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--armai-border-muted)] bg-[var(--armai-surface-elevated)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--armai-text)]">
                  {t('plan.name')}
                </th>
                <th className="text-left px-4 py-3 font-medium text-[var(--armai-text)]">Code</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--armai-text)]">
                  Price (LAK)
                </th>
                <th className="text-left px-4 py-3 font-medium text-[var(--armai-text)]">
                  Max users
                </th>
                <th className="text-left px-4 py-3 font-medium text-[var(--armai-text)]">Active</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.id || plan.code}
                  className="border-b border-[var(--armai-border-muted)] last:border-b-0"
                >
                  <td className="px-4 py-3 text-[var(--armai-text)]">{plan.name}</td>
                  <td className="px-4 py-3 text-[var(--armai-text-secondary)]">{plan.code}</td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--armai-text)]">
                    ₭{LAK_FORMAT.format(plan.price_lak)}
                  </td>
                  <td className="px-4 py-3 text-[var(--armai-text-secondary)]">
                    {plan.max_users ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-600">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-[var(--armai-text-muted)]">{t('pricing.singlePlanNote')}</p>
      </div>
    </PageShell>
  )
}
