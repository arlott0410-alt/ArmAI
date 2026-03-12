import React from 'react'
import { theme } from '../../theme'

export function SetupProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  style,
}: {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  style?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, ...style }}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const done = step < currentStep
        const active = step === currentStep
        return (
          <React.Fragment key={step}>
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: done ? theme.success : active ? theme.primary : theme.surfaceElevated,
                  color: done || active ? theme.background : theme.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  border: `2px solid ${done ? theme.success : active ? theme.primary : theme.borderMuted}`,
                }}
              >
                {done ? '✓' : step}
              </div>
              {stepLabels?.[i] != null && (
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: active ? theme.primary : theme.textMuted,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {stepLabels[i]}
                </span>
              )}
            </div>
            {step < totalSteps && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: step < currentStep ? theme.success : theme.borderMuted,
                  minWidth: 16,
                  alignSelf: 'flex-start',
                  marginTop: 11,
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
