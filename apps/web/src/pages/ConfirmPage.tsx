import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase'
import { getBaseUrl } from '../lib/api'
import { useI18n } from '../i18n/I18nProvider'
import { toast } from 'sonner'

/**
 * Handles redirect from Supabase email confirmation link.
 * URL is /auth/confirm#access_token=...&refresh_token=...&type=signup
 * Supabase client parses the hash and establishes session; we then run onboard and redirect.
 */
export default function ConfirmPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setStatus('error')
      setMessage('Auth not configured')
      return
    }
    const run = (session: { access_token: string } | null) => {
      if (!session?.access_token) {
        setStatus('error')
        setMessage(t('confirm.invalidOrExpiredLink'))
        return
      }
      const token = session.access_token
      const base = getBaseUrl()
      fetch(`${base}/onboard/merchant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json().catch(() => ({})))
        .then((data) => {
          if (data.ok || data.alreadyOnboarded) {
            toast.success(t('confirm.confirmSuccessToast'))
            setStatus('success')
            navigate('/merchant/dashboard', { replace: true })
          } else {
            setStatus('error')
            setMessage((data as { error?: string }).error ?? 'Onboard failed')
          }
        })
        .catch(() => {
          setStatus('error')
          setMessage('Request failed')
        })
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        run(session)
        return
      }
      const hash = window.location.hash
      if (hash && (hash.includes('access_token') || hash.includes('token_hash'))) {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s2 } }) => run(s2))
        }, 300)
      } else {
        run(null)
      }
    })
  }, [navigate, t])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--armai-bg)] p-4">
        <div className="w-full max-w-[400px] rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface)] shadow-xl p-8 text-center">
          <p className="text-[var(--armai-text)] font-medium mb-2">
            {t('confirm.invalidOrExpiredLink')}
          </p>
          <p className="text-sm text-[var(--armai-text-muted)] mb-4">{message}</p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="py-2 px-4 rounded-lg bg-[var(--armai-primary)] text-white font-medium"
          >
            {t('login.signIn')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--armai-bg)] p-4">
      <div className="text-center">
        <p className="text-[var(--armai-text-secondary)]">{t('common.loading')}</p>
        <p className="text-sm text-[var(--armai-text-muted)] mt-2">ກຳລັງຢືນຢັນ ແລະ ເລີ່ມໃຊ້ງານ…</p>
      </div>
    </div>
  )
}
