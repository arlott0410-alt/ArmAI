import React from 'react'
import { theme } from '../../theme'

export function PageShell({
  title,
  description,
  breadcrumb,
  actions,
  children,
  style,
}: {
  title: string
  description?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{ ...style }}>
      {breadcrumb != null && (
        <div style={{ marginBottom: 8, fontSize: 13, color: theme.textMuted }}>{breadcrumb}</div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              color: theme.text,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {description != null && (
            <p style={{ margin: '4px 0 0', fontSize: 14, color: theme.textSecondary }}>
              {description}
            </p>
          )}
        </div>
        {actions != null && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>
        )}
      </div>
      {children}
    </div>
  )
}
