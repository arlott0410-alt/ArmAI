import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../i18n/I18nProvider'
import { settingsApi } from '../../lib/api'
import { PageShell } from '../../components/ui'
import { Tabs, TabPanel } from '../../components/ui/Tabs'
import { Card, CardBody } from '../../components/ui'
import MerchantKnowledge from './MerchantKnowledge'
import { theme } from '../../theme'

type TabValue = 'prompt' | 'knowledge' | 'escalations'

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 560,
  padding: '10px 12px',
  background: theme.surfaceElevated,
  border: `1px solid ${theme.borderMuted}`,
  borderRadius: 6,
  color: theme.text,
  fontSize: 13,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
  color: theme.textSecondary,
  fontSize: 13,
}

export default function AiConfigPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const token = user?.accessToken ?? null
  const [tab, setTab] = useState<TabValue>('prompt')

  const [aiPrompt, setAiPrompt] = useState('')
  const [telegramAllowAiEscalation, setTelegramAllowAiEscalation] = useState(false)
  const [telegramRequireAuthorizedAdmins, setTelegramRequireAuthorizedAdmins] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!token) return
    settingsApi
      .get(token)
      .then((s) => {
        setAiPrompt(s.ai_system_prompt ?? '')
        setTelegramAllowAiEscalation(s.telegram_allow_ai_escalation ?? false)
        setTelegramRequireAuthorizedAdmins(s.telegram_require_authorized_admins ?? true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaveError(null)
    setSaved(false)
    setSaving(true)
    try {
      await settingsApi.update(token, {
        ai_system_prompt: aiPrompt.trim() || null,
      })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEscalations = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaveError(null)
    setSaved(false)
    setSaving(true)
    try {
      await settingsApi.update(token, {
        telegram_allow_ai_escalation: telegramAllowAiEscalation,
        telegram_require_authorized_admins: telegramRequireAuthorizedAdmins,
      })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const tabItems = [
    { value: 'prompt' as const, label: t('tabs.prompt'), description: t('ai.prompt.description') },
    { value: 'knowledge' as const, label: t('tabs.knowledge') },
    {
      value: 'escalations' as const,
      label: t('tabs.escalations'),
      description: t('ai.escalations.description'),
    },
  ]

  return (
    <PageShell title={t('page.aiConfig.title')} description={t('nav.aiConfig')}>
      <Tabs tabsId="ai-config" value={tab} onChange={setTab} items={tabItems} />
      <TabPanel>
        {tab === 'prompt' && (
          <Card className="mt-4 border border-[var(--armai-border)] shadow-gold">
            <CardBody>
              {loading ? (
                <p className="text-[var(--armai-text-muted)]">{t('common.loading')}</p>
              ) : (
                <form onSubmit={handleSavePrompt}>
                  <label style={labelStyle}>{t('tabs.prompt')}</label>
                  <p className="text-xs text-[var(--armai-text-muted)] mb-2">
                    {t('ai.prompt.description')}
                  </p>
                  <textarea
                    style={{ ...inputStyle, minHeight: 120 }}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="You are a helpful assistant for..."
                    rows={5}
                  />
                  {saveError && (
                    <p className="text-sm text-[var(--armai-danger)] mt-2">{saveError}</p>
                  )}
                  {saved && <p className="text-sm text-[var(--armai-success)] mt-2">Saved.</p>}
                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--armai-primary)] text-black hover:opacity-90 disabled:opacity-50 shadow-gold"
                  >
                    {saving ? t('common.loading') : t('common.save')}
                  </button>
                </form>
              )}
            </CardBody>
          </Card>
        )}
        {tab === 'knowledge' && (
          <div className="mt-4">
            <MerchantKnowledge />
          </div>
        )}
        {tab === 'escalations' && (
          <Card className="mt-4 border border-[var(--armai-border)] shadow-gold">
            <CardBody>
              {loading ? (
                <p className="text-[var(--armai-text-muted)]">{t('common.loading')}</p>
              ) : (
                <form onSubmit={handleSaveEscalations}>
                  <p className="text-sm text-[var(--armai-text-secondary)] mb-4">
                    {t('ai.escalations.description')}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={telegramAllowAiEscalation}
                      onChange={(e) => setTelegramAllowAiEscalation(e.target.checked)}
                      className="rounded border-[var(--armai-border)]"
                    />
                    <span className="text-sm text-[var(--armai-text)]">
                      Allow AI to escalate to staff (Telegram)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={telegramRequireAuthorizedAdmins}
                      onChange={(e) => setTelegramRequireAuthorizedAdmins(e.target.checked)}
                      className="rounded border-[var(--armai-border)]"
                    />
                    <span className="text-sm text-[var(--armai-text)]">
                      Require authorized admins for actions
                    </span>
                  </label>
                  {saveError && (
                    <p className="text-sm text-[var(--armai-danger)] mt-2">{saveError}</p>
                  )}
                  {saved && <p className="text-sm text-[var(--armai-success)] mt-2">Saved.</p>}
                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--armai-primary)] text-black hover:opacity-90 disabled:opacity-50 shadow-gold"
                  >
                    {saving ? t('common.loading') : t('common.save')}
                  </button>
                </form>
              )}
            </CardBody>
          </Card>
        )}
      </TabPanel>
    </PageShell>
  )
}
