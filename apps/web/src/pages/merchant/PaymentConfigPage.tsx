import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { PageShell } from '../../components/ui'
import { Tabs, TabPanel } from '../../components/ui/Tabs'
import MerchantPaymentAccounts from './MerchantPaymentAccounts'
import MerchantBankSync from './MerchantBankSync'

type TabValue = 'accounts' | 'bank'

export default function PaymentConfigPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabValue>('accounts')

  const tabItems = [
    { value: 'accounts' as const, label: t('tabs.paymentAccounts') },
    { value: 'bank' as const, label: t('tabs.bankSync') },
  ]

  return (
    <PageShell title={t('page.paymentConfig.title')} description={t('nav.paymentConfig')}>
      <Tabs tabsId="payment-config" value={tab} onChange={setTab} items={tabItems} />
      <TabPanel>
        {tab === 'accounts' && <MerchantPaymentAccounts />}
        {tab === 'bank' && <MerchantBankSync />}
      </TabPanel>
    </PageShell>
  )
}
