import React from 'react'
import { theme } from '../../theme'
import type { BankSyncTestResult } from '../../lib/api'

export function TestResultPanel({
  result,
  lastTestedAt,
  style,
}: {
  result: BankSyncTestResult | null
  lastTestedAt: string | null
  style?: React.CSSProperties
}) {
  if (!result) {
    return (
      <div
        style={{
          padding: 16,
          background: theme.surfaceElevated,
          borderRadius: 8,
          border: `1px solid ${theme.borderMuted}`,
          color: theme.textMuted,
          fontSize: 13,
          ...style,
        }}
      >
        Run test to validate your connection. Last tested:{' '}
        {lastTestedAt ? new Date(lastTestedAt).toLocaleString() : '—'}
      </div>
    )
  }

  const isSuccess = result.success
  const bg = isSuccess ? theme.successMuted : theme.dangerMuted
  const border = isSuccess ? theme.success : theme.danger

  return (
    <div
      style={{
        padding: 16,
        background: bg,
        borderRadius: 8,
        border: `1px solid ${border}`,
        ...style,
      }}
    >
      <div style={{ fontWeight: 600, color: theme.text, marginBottom: 6 }}>
        {isSuccess ? 'Connection valid' : 'Issue found'}
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: theme.text }}>{result.message}</p>
      {result.messages && result.messages.length > 0 && (
        <ul
          style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: theme.textSecondary }}
        >
          {result.messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
      {result.parsed_preview && (
        <div style={{ marginTop: 10, fontSize: 12, color: theme.textSecondary }}>
          Sample parse: amount {result.parsed_preview.amount}, ref{' '}
          {result.parsed_preview.reference_code ?? '—'}
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: 11, color: theme.textMuted }}>
        Last tested: {new Date(result.last_tested_at).toLocaleString()}
      </div>
    </div>
  )
}
