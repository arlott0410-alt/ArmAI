import React from 'react'
import { theme } from '../../theme'
import { Badge } from './Badge'

export interface OrderSummaryCardProps {
  total: number
  currency?: string
  itemCount: number
  status?: string
  referenceCode?: string | null
  style?: React.CSSProperties
}

export function OrderSummaryCard({
  total,
  currency = 'THB',
  itemCount,
  status,
  referenceCode,
  style,
}: OrderSummaryCardProps) {
  const formattedTotal =
    currency === 'THB' ? `฿${total.toLocaleString()}` : `${currency} ${total.toLocaleString()}`
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.borderMuted}`,
        borderRadius: 10,
        padding: 16,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, color: theme.textMuted }}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        {status != null && status !== '' && (
          <Badge
            variant={status === 'paid' ? 'success' : status === 'cancelled' ? 'danger' : 'default'}
          >
            {status}
          </Badge>
        )}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: theme.text, marginTop: 8 }}>
        {formattedTotal}
      </div>
      {referenceCode != null && referenceCode !== '' && (
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
          Ref: {referenceCode}
        </div>
      )}
    </div>
  )
}
