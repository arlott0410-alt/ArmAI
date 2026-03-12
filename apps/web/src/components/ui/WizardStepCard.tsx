import React from 'react'
import { theme } from '../../theme'

export function WizardStepCard({
  stepNumber,
  title,
  subtitle,
  isActive,
  isComplete,
  isDisabled,
  children,
  action,
  style,
}: {
  stepNumber: number
  title: string
  subtitle?: string
  isActive: boolean
  isComplete: boolean
  isDisabled?: boolean
  children: React.ReactNode
  action?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: theme.surface,
        borderRadius: 10,
        border: `1px solid ${isActive ? theme.primary : theme.borderMuted}`,
        overflow: 'hidden',
        opacity: isDisabled ? 0.7 : 1,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: isComplete
                ? theme.success
                : isActive
                  ? theme.primary
                  : theme.surfaceElevated,
              color: isComplete || isActive ? theme.background : theme.textMuted,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {isComplete ? '✓' : stepNumber}
          </span>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: theme.text,
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </h3>
            {subtitle != null && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.textMuted }}>{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}
