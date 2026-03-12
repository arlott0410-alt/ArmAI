import { useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { PageShell } from '../../components/ui'
import { Tabs, TabPanel } from '../../components/ui/Tabs'
import MerchantProducts from './MerchantProducts'
import MerchantCategories from './MerchantCategories'

type TabValue = 'products' | 'categories'

export default function ProductsAndCategoriesPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabValue>('products')

  const tabItems = [
    { value: 'products' as const, label: t('tabs.products') },
    { value: 'categories' as const, label: t('tabs.categories') },
  ]

  return (
    <PageShell
      title={t('page.productsAndCategories.title')}
      description={t('nav.productsAndCategories')}
    >
      <Tabs tabsId="products-categories" value={tab} onChange={setTab} items={tabItems} />
      <TabPanel>
        {tab === 'products' && <MerchantProducts />}
        {tab === 'categories' && <MerchantCategories />}
      </TabPanel>
    </PageShell>
  )
}
