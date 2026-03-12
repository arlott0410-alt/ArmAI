import React from 'react'
import { theme } from '../../theme'

export function PanelCard({
  title,
  subtitle,
  action,
  children,
  style,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: theme.surface,
        borderRadius: 10,
        border: `1px solid ${theme.borderMuted}`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.borderMuted}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: theme.text,
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </h3>
          {subtitle != null && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: theme.textMuted }}>{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}
