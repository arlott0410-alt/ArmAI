import React from 'react'
import { theme } from '../../theme'

export function InlineInstructionList({
  steps,
  style,
}: {
  steps: string[]
  style?: React.CSSProperties
}) {
  return (
    <ol
      style={{
        margin: 0,
        paddingLeft: 20,
        fontSize: 13,
        color: theme.textSecondary,
        lineHeight: 1.9,
        ...style,
      }}
    >
      {steps.map((step, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          {step}
        </li>
      ))}
    </ol>
  )
}
