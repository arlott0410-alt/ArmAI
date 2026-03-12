import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabase } from '../lib/supabase'
import { getBaseUrl } from '../lib/api'
import { useI18n } from '../i18n/I18nProvider'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

const SESSION_POLL_MS = 250
const SESSION_POLL_MAX_ATTEMPTS = 16

/** Parse token_hash and type from URL (query or hash). Supabase can send ?token_hash=...&type=email or #access_token=... */
function getConfirmParams(): { token_hash: string | null; type: string } {
  const params = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const token_hash = params.get('token_hash') ?? hashParams.get('token_hash')
  const type = params.get('type') ?? hashParams.get('type') ?? 'email'
  return { token_hash, type }
}

function hasAccessTokenInHash(): boolean {
  return window.location.hash.includes('access_token=')
}

/**
 * Handles redirect from Supabase email confirmation link.
 * Supports: (1) ?token_hash=...&type=email → verifyOtp then onboard
 *          (2) #access_token=...&refresh_token=... → getSession then onboard
 * Then: POST /api/onboard/merchant (role + trial), refreshUser, redirect to dashboard.
 */
export default function ConfirmPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current) return
    const supabase = getSupabase()
    if (!supabase) {
      setStatus('error')
      setMessage('Auth not configured')
      return
    }

    const runOnboardAndRedirect = async (session: { access_token: string }) => {
      const token = session.access_token
      const base = getBaseUrl()
      const res = await fetch(`${base}/onboard/merchant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      const ok = res.status === 200 || res.status === 201
      if (ok && (data.ok || data.alreadyOnboarded)) {
        await refreshUser()
        toast.success(t('confirm.confirmSuccessToast'))
        doneRef.current = true
        setStatus('success')
        navigate('/merchant/dashboard', { replace: true })
      } else {
        const errMsg = (data as { error?: string }).error ?? 'Onboard failed'
        setStatus('error')
        setMessage(errMsg)
        toast.error(errMsg)
      }
    }

    const run = async (session: { access_token: string } | null) => {
      if (!session?.access_token) {
        setStatus('error')
        setMessage(t('confirm.invalidOrExpiredLink'))
        return
      }
      try {
        await runOnboardAndRedirect(session)
      } catch {
        setStatus('error')
        setMessage('Request failed')
        toast.error('Request failed')
      }
    }

    const { token_hash, type } = getConfirmParams()

    // Path 1: Supabase sends token_hash in query (PKCE) — must call verifyOtp to get session
    if (token_hash) {
      supabase.auth
        .verifyOtp({ token_hash, type: type as 'email' | 'signup' | 'recovery' })
        .then(({ data, error }) => {
          if (error) {
            setStatus('error')
            setMessage(error.message ?? t('confirm.invalidOrExpiredLink'))
            return
          }
          const session = data?.session
          if (session?.access_token) {
            run(session)
          } else {
            setStatus('error')
            setMessage(t('confirm.invalidOrExpiredLink'))
          }
        })
        .catch(() => {
          setStatus('error')
          setMessage('Request failed')
        })
      return
    }

    // Path 2: Old-style fragment #access_token=... — Supabase client may set session; poll getSession
    const hasHash = hasAccessTokenInHash()
    const tryGetSession = (attempt: number) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          run(session)
          return
        }
        if (hasHash && attempt < SESSION_POLL_MAX_ATTEMPTS) {
          setTimeout(() => tryGetSession(attempt + 1), SESSION_POLL_MS)
        } else if (!hasHash) {
          run(null)
        } else {
          setStatus('error')
          setMessage(t('confirm.invalidOrExpiredLink'))
        }
      })
    }
    tryGetSession(0)
  }, [navigate, t, refreshUser])

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
