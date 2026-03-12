import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n/I18nProvider'
import { toast } from 'sonner'

const RESEND_COOLDOWN_SEC = 60

type SignupForm = {
  email: string
  password: string
  confirmPassword: string
}

function validateSignup(data: SignupForm): Record<string, string> {
  const err: Record<string, string> = {}
  if (!data.email?.trim()) err.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = 'Invalid email'
  if (!data.password || data.password.length < 6) err.password = 'Password at least 6 characters'
  if (data.password !== data.confirmPassword) err.confirmPassword = 'Passwords do not match'
  return err
}

export default function SignupPage() {
  const { signUp, resendConfirmation, user, loading } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<SignupForm>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const onSubmit = async (data: SignupForm) => {
    clearErrors('root')
    const validation = validateSignup(data)
    if (Object.keys(validation).length > 0) {
      Object.entries(validation).forEach(([field, message]) =>
        setError(field as keyof SignupForm, { type: 'manual', message })
      )
      return
    }
    try {
      const result = await signUp(data.email, data.password)
      if (result.needsConfirmation && result.email) {
        setPendingEmail(result.email)
        return
      }
      toast.success(t('signup.success'))
      navigate('/merchant/dashboard', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed'
      setError('root', { type: 'manual', message: msg })
      toast.error(msg)
    }
  }

  const onResend = async () => {
    if (!pendingEmail || resendCooldown > 0 || resendLoading) return
    setResendLoading(true)
    try {
      await resendConfirmation(pendingEmail)
      toast.success(t('confirm.resendSuccess'))
      setResendCooldown(RESEND_COOLDOWN_SEC)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendLoading(false)
    }
  }

  if (user) {
    const to = user.role === 'super_admin' ? '/super/dashboard' : '/merchant/dashboard'
    navigate(to, { replace: true })
    return null
  }

  if (pendingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--armai-bg)] p-4">
        <div className="w-full max-w-[400px] rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface)] shadow-xl p-8">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-[var(--armai-text)] tracking-tight">
              ArmAI
            </span>
            <span className="text-xs font-semibold text-[var(--armai-primary)] uppercase tracking-wider">
              Platform
            </span>
          </div>
          <h1 className="text-lg font-semibold text-[var(--armai-text)] mb-2">
            {t('confirm.confirmEmailTitle')}
          </h1>
          <p className="text-sm text-[var(--armai-text-secondary)] mb-4">
            {t('confirm.emailSentTo').replace('{email}', pendingEmail)}
          </p>
          <button
            type="button"
            onClick={onResend}
            disabled={resendCooldown > 0 || resendLoading}
            className="w-full py-3 px-4 rounded-lg font-semibold border-2 border-[var(--armai-primary)] text-[var(--armai-primary)] bg-transparent hover:bg-[var(--armai-primary)]/10 disabled:opacity-50 transition-colors"
          >
            {resendLoading
              ? t('common.loading')
              : resendCooldown > 0
                ? t('confirm.resendCooldown').replace('{seconds}', String(resendCooldown))
                : t('confirm.resendButton')}
          </button>
          <p className="mt-6 text-center text-sm text-[var(--armai-text-muted)]">
            <Link to="/login" className="font-medium text-[var(--armai-primary)] hover:underline">
              {t('login.signIn')}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--armai-bg)] p-4">
      <div className="w-full max-w-[400px] rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface)] shadow-xl p-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-[var(--armai-text)] tracking-tight">ArmAI</span>
          <span className="text-xs font-semibold text-[var(--armai-primary)] uppercase tracking-wider">
            Platform
          </span>
        </div>
        <p className="text-[var(--armai-text-secondary)] text-sm mb-6">{t('signup.subtitle')}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-[var(--armai-text-secondary)] mb-1"
            >
              {t('signup.emailLabel')}
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--armai-border)] bg-[var(--armai-bg)] text-[var(--armai-text)] placeholder:text-[var(--armai-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--armai-primary)]"
              placeholder="store@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-[var(--armai-text-secondary)] mb-1"
            >
              {t('signup.passwordLabel')}
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--armai-border)] bg-[var(--armai-bg)] text-[var(--armai-text)] focus:outline-none focus:ring-2 focus:ring-[var(--armai-primary)]"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="signup-confirm"
              className="block text-sm font-medium text-[var(--armai-text-secondary)] mb-1"
            >
              {t('signup.confirmPasswordLabel')}
            </label>
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--armai-border)] bg-[var(--armai-bg)] text-[var(--armai-text)] focus:outline-none focus:ring-2 focus:ring-[var(--armai-primary)]"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p className="text-sm text-red-500 dark:text-red-400" role="alert">
              {errors.root.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-[var(--armai-bg)] bg-[var(--armai-primary)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--armai-primary)] focus:ring-offset-2 focus:ring-offset-[var(--armai-bg)] disabled:opacity-50 transition-opacity"
          >
            {isSubmitting || loading ? t('common.loading') : t('signup.submitButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--armai-text-muted)]">
          {t('signup.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-[var(--armai-primary)] hover:underline">
            {t('login.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
