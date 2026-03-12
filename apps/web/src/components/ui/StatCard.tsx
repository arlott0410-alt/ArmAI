import React from 'react'
import { Card } from './Card'
import { theme } from '../../theme'

export function StatCard({
  label,
  value,
  sub,
  accent,
  style,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  accent?: boolean
  style?: React.CSSProperties
}) {
  return (
    <Card
      style={{
        padding: 18,
        borderLeft: accent ? `3px solid ${theme.primary}` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: theme.textMuted,
          marginBottom: 6,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: accent ? theme.highlight : theme.text,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sub != null && (
        <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>{sub}</div>
      )}
    </Card>
  )
}
