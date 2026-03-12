import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nProvider'
import { plansApi, subscribeApi, subscriptionApi, type PlanPublic } from '../lib/api'

const LAK_FORMAT = new Intl.NumberFormat('lo-LA', { maximumFractionDigits: 0 })
const STANDARD_PLAN_CODE = 'standard'
const STANDARD_PRICE_LAK = 1_999_000

const STANDARD_FEATURES = [
  'Core AI features',
  'Unlimited users',
  'Analytics',
  'Priority support',
  'All channels (Facebook, WhatsApp, Telegram)',
  'Bank sync & payment config',
  'Knowledge base & promotions',
]

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [plan, setPlan] = useState<PlanPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState<{ planCode: string; nextBillingAt: string | null } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  useEffect(() => {
    plansApi
      .list()
      .then((r) => {
        const p = r.plans.find((x) => x.code === STANDARD_PLAN_CODE)
        setPlan(
          p ?? {
            code: STANDARD_PLAN_CODE,
            name: 'Standard',
            priceLak: STANDARD_PRICE_LAK,
            features: STANDARD_FEATURES,
            maxUsers: null,
          }
        )
      })
      .catch(() =>
        setPlan({
          code: STANDARD_PLAN_CODE,
          name: 'Standard',
          priceLak: STANDARD_PRICE_LAK,
          features: STANDARD_FEATURES,
          maxUsers: null,
        })
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.accessToken) return
    subscriptionApi
      .get(user.accessToken)
      .then((r) => {
        if (r.subscription)
          setSub({ planCode: r.subscription.planCode, nextBillingAt: r.subscription.nextBillingAt })
      })
      .catch(() => {})
  }, [user?.accessToken])

  const handleSubscribeOrRenew = async () => {
    if (!user?.accessToken) {
      navigate('/login')
      return
    }
    setError(null)
    setPendingMessage(null)
    setSubmitLoading(true)
    const base = window.location.origin
    try {
      const res = await subscribeApi.createCheckout(user.accessToken, {
        plan_code: STANDARD_PLAN_CODE,
        success_url: `${base}/pricing`,
        cancel_url: `${base}/pricing`,
        customer_email: user.email ?? undefined,
      })
      if (res.payment_id) {
        setPendingMessage(t('pricing.pendingPayment'))
        setModalOpen(true)
      } else {
        setError('Could not create payment')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const isActive = sub?.planCode === STANDARD_PLAN_CODE && sub?.nextBillingAt
  const expiryDate = sub?.nextBillingAt
    ? new Date(sub.nextBillingAt).toLocaleDateString('lo-LA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--armai-bg)]">
        <p className="text-[var(--armai-text-muted)]">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--armai-bg)] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[var(--armai-text)] mb-2">
          {t('pricing.title')}
        </h1>
        <p className="text-[var(--armai-text-secondary)] mb-8">{t('pricing.subtitleSingle')}</p>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface)] p-6 glass-card shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--armai-text)] mb-1">
            {plan?.name ?? t('plan.standard')}
          </h2>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-[var(--armai-gradient-start)] to-[var(--armai-gradient-end)] bg-clip-text text-transparent">
              ₭{LAK_FORMAT.format(plan?.priceLak ?? STANDARD_PRICE_LAK)}
            </span>
            <span className="text-[var(--armai-text-muted)]">{t('plan.perMonth')}</span>
          </div>
          <ul className="space-y-2 mb-6">
            {(plan?.features ?? STANDARD_FEATURES).map((f, i) => (
              <li
                key={i}
                className="text-sm text-[var(--armai-text-secondary)] flex items-center gap-2"
              >
                <span className="text-accent">✓</span> {f}
              </li>
            ))}
          </ul>
          {isActive ? (
            <>
              <p className="text-sm text-[var(--armai-text)] mb-2">
                {t('pricing.currentPlan')}: {t('plan.standard')} ({t('pricing.expiresAt')}{' '}
                {expiryDate})
              </p>
              <button
                type="button"
                disabled={!!submitLoading}
                onClick={handleSubscribeOrRenew}
                className="w-full py-2.5 px-4 rounded-lg font-medium bg-[var(--armai-primary)] text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--armai-primary)] focus-visible:ring-offset-2"
              >
                {submitLoading ? t('common.loading') : t('pricing.renew')}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={!!submitLoading}
              onClick={handleSubscribeOrRenew}
              className="w-full py-2.5 px-4 rounded-lg font-medium bg-[var(--armai-primary)] text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--armai-primary)] focus-visible:ring-offset-2"
            >
              {submitLoading ? t('common.loading') : t('pricing.subscribeCta')}
            </button>
          )}
        </div>

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface)] shadow-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--armai-text)] mb-2">
                {t('pricing.bankDetails')}
              </h2>
              <p className="text-sm text-[var(--armai-text-secondary)] mb-2">
                ກີບ 1,999,000 / ເດືອນ — ໂອນເຂົ້າບັນຊີທະນາຄານຕາມລາຍລະອຽດດ້ານລຸ່ມ. ຫຼັງໂອນແລ້ວ
                ທີມງານຈະກວດສອບ ແລະ ເປີດໃຊ້ງານໃຫ້.
              </p>
              <div className="rounded-lg bg-[var(--armai-bg)] p-3 text-sm text-[var(--armai-text)] font-mono mb-4">
                BCEL — ບັນຊີ ArmAI Subscription
                <br />
                ຫມາຍເຫດ: ຊື່ຮ້ານ / ເບີຕິດຕໍ່
              </div>
              {pendingMessage && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">{pendingMessage}</p>
              )}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full py-2 rounded-lg border border-[var(--armai-border)] text-[var(--armai-text)] hover:bg-[var(--armai-surface-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--armai-primary)]"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
