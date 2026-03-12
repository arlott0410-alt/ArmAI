import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { PageShell } from '../../components/ui'
import { Tabs, TabPanel } from '../../components/ui/Tabs'
import { Card, CardBody } from '../../components/ui'
import MerchantChannels from './MerchantChannels'
import MerchantTelegram from './MerchantTelegram'
import { Facebook } from 'lucide-react'

type TabValue = 'facebook' | 'whatsapp' | 'telegram'

export default function ChannelsPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabValue>('whatsapp')

  const tabItems = [
    {
      value: 'facebook' as const,
      label: t('tabs.facebook'),
      description: t('channels.facebook.description'),
    },
    {
      value: 'whatsapp' as const,
      label: t('tabs.whatsapp'),
      description: t('channels.whatsapp.description'),
    },
    {
      value: 'telegram' as const,
      label: t('tabs.telegram'),
      description: t('channels.telegram.description'),
    },
  ]

  return (
    <PageShell title={t('page.channels.title')} description={t('nav.channels')}>
      <Tabs tabsId="channels" value={tab} onChange={setTab} items={tabItems} />
      <TabPanel>
        {tab === 'facebook' && (
          <Card className="mt-4 border border-[var(--armai-border)] shadow-gold">
            <CardBody>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-[var(--armai-surface-elevated)] p-4 mb-4 border border-[var(--armai-border)]">
                  <Facebook className="h-10 w-10 text-[var(--armai-text-muted)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--armai-text)] mb-2">
                  {t('tabs.facebook')}
                </h3>
                <p className="text-sm text-[var(--armai-text-secondary)] max-w-md mb-6">
                  {t('channels.facebook.description')}. Connect your Facebook Page to receive and
                  reply to messages here.
                </p>
                <p className="text-xs text-[var(--armai-text-muted)]">
                  Coming soon. Use WhatsApp or Telegram for now.
                </p>
              </div>
            </CardBody>
          </Card>
        )}
        {tab === 'whatsapp' && (
          <div className="mt-4">
            <MerchantChannels />
          </div>
        )}
        {tab === 'telegram' && (
          <div className="mt-4">
            <MerchantTelegram />
          </div>
        )}
      </TabPanel>
    </PageShell>
  )
}
