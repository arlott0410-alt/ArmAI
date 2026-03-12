import React from 'react'
import { theme } from '../../theme'

export function EmptyState({
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
        padding: 48,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 10,
        border: `1px dashed ${theme.borderMuted}`,
        color: theme.textSecondary,
        ...style,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: theme.text, marginBottom: 4 }}>
        {title}
      </div>
      {description != null && <div style={{ fontSize: 13, marginBottom: 16 }}>{description}</div>}
      {action}
    </div>
  )
}
