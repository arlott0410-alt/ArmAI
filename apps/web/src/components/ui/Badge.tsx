import React from 'react'
import { theme } from '../../theme'

const variants: Record<string, React.CSSProperties> = {
  default: { background: 'rgba(255,255,255,0.1)', color: theme.textSecondary },
  success: { background: theme.successMuted, color: theme.success },
  warning: { background: theme.warningMuted, color: theme.warning },
  danger: { background: theme.dangerMuted, color: theme.danger },
  info: { background: theme.infoMuted, color: theme.info },
  gold: { background: 'rgba(212, 175, 55, 0.2)', color: theme.highlight },
}

export function Badge({
  children,
  variant = 'default',
  style,
}: {
  children: React.ReactNode
  variant?: keyof typeof variants
  style?: React.CSSProperties
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        ...(variants[variant] ?? variants.default),
        ...style,
      }}
    >
      {children}
    </span>
  )
}
