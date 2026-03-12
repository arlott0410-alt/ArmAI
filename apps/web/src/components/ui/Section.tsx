import React from 'react'
import { theme } from '../../theme'

export function SectionHeader({
  title,
  description,
  action,
  style,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 8,
        ...style,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: theme.text,
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </h2>
        {description != null && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.textMuted }}>{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function Section({
  title,
  description,
  children,
  action,
  style,
}: {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <section style={{ marginBottom: 32, ...style }}>
      <SectionHeader title={title} description={description} action={action} />
      {children}
    </section>
  )
}
