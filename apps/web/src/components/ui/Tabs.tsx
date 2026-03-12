import React from 'react'
import { motion } from 'framer-motion'

export type TabItem<T extends string> = {
  value: T
  label: string
  /** Optional short description or tooltip */
  description?: string
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className = '',
  tabsId = 'tabs',
}: {
  value: T
  onChange: (v: T) => void
  items: TabItem<T>[]
  className?: string
  tabsId?: string
}) {
  return (
    <div
      className={`flex flex-wrap gap-0 rounded-xl border border-[var(--armai-border)] bg-[var(--armai-surface-elevated)] p-1 ${className}`}
      role="tablist"
      aria-label="Tabs"
    >
      {items.map((item) => {
        const isActive = value === item.value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={item.description ?? item.label}
            title={item.description}
            onClick={() => onChange(item.value)}
            className={`
              relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--armai-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--armai-surface-elevated)]
              ${isActive ? 'text-[var(--armai-primary)]' : 'text-[var(--armai-text-secondary)] hover:text-[var(--armai-text)] hover:bg-[var(--armai-surface)]'}
            `}
          >
            {isActive && (
              <motion.span
                layoutId={`tab-${tabsId}`}
                className="absolute inset-0 rounded-lg border border-[var(--armai-primary)] bg-[var(--armai-primary)]/10 shadow-gold"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`mt-4 ${className}`}
      role="tabpanel"
    >
      {children}
    </motion.div>
  )
}
