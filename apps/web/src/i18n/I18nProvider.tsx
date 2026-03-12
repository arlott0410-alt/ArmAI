import React, { createContext, useContext, useMemo, useState } from 'react'
import type { Locale } from './locales'
import { dictionaries } from './locales'
import type { I18nKey } from './keys'

type I18nContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: I18nKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'armai.locale'
const DEFAULT_LOCALE: Locale = 'lo'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'lo' || saved === 'th' || saved === 'en') return saved
    return DEFAULT_LOCALE
  })

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale]
    const t = (key: I18nKey) => dict[key] ?? key
    const set = (l: Locale) => {
      localStorage.setItem(STORAGE_KEY, l)
      setLocale(l)
    }
    return { locale, setLocale: set, t }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
