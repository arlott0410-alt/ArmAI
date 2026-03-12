import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { merchantApi } from '../lib/api'
import { theme } from '../theme'
import { useI18n } from '../i18n/I18nProvider'
import { deriveLocaleFromMerchant } from '../i18n/locales'

export default function MerchantLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t, setLocale } = useI18n()
  const token = user?.accessToken ?? null

  useEffect(() => {
    if (!token) return
    merchantApi
      .dashboard(token)
      .then((r) => {
        const l = deriveLocaleFromMerchant(r.merchant ?? null)
        setLocale(l)
      })
      .catch(() => {})
  }, [token, setLocale])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    padding: '8px 12px',
    borderRadius: 6,
    color: isActive ? theme.highlight : theme.textSecondary,
    textDecoration: 'none' as const,
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    borderLeft: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.background }}>
      <aside
        style={{
          width: 240,
          background: theme.surface,
          borderRight: `1px solid ${theme.borderMuted}`,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <span
            style={{ fontSize: 18, fontWeight: 700, color: theme.text, letterSpacing: '-0.02em' }}
          >
            ArmAI
          </span>
          <span
            style={{
              fontSize: 11,
              color: theme.primary,
              marginLeft: 6,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {t('app.workspace')}
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavLink to="/merchant/dashboard" style={navStyle}>
            {t('nav.overview')}
          </NavLink>
          <NavLink to="/merchant/orders" style={navStyle}>
            {t('nav.orders')}
          </NavLink>
          <NavLink to="/merchant/products" style={navStyle}>
            {t('nav.products')}
          </NavLink>
          <NavLink to="/merchant/categories" style={navStyle}>
            {t('nav.categories')}
          </NavLink>
          <NavLink to="/merchant/knowledge" style={navStyle}>
            {t('nav.knowledge')}
          </NavLink>
          <NavLink to="/merchant/promotions" style={navStyle}>
            {t('nav.promotions')}
          </NavLink>
          <NavLink to="/merchant/payment-accounts" style={navStyle}>
            {t('nav.paymentAccounts')}
          </NavLink>
          <NavLink to="/merchant/bank-sync" style={navStyle}>
            {t('nav.bankSync')}
          </NavLink>
          <NavLink to="/merchant/operations" style={navStyle}>
            {t('nav.operations')}
          </NavLink>
          <NavLink to="/merchant/telegram" style={navStyle}>
            {t('nav.telegram')}
          </NavLink>
          <NavLink to="/merchant/channels" style={navStyle}>
            {t('nav.messaging')}
          </NavLink>
          <NavLink to="/merchant/customers" style={navStyle}>
            {t('nav.customers')}
          </NavLink>
          <NavLink to="/merchant/settings" style={navStyle}>
            {t('nav.settings')}
          </NavLink>
        </nav>
        <div
          style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${theme.borderMuted}` }}
        >
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 8 }}>{user?.email}</div>
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              color: theme.textSecondary,
              border: `1px solid ${theme.borderMuted}`,
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {t('action.signOut')}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 28, overflow: 'auto', background: theme.background }}>
        <Outlet />
      </main>
    </div>
  )
}
