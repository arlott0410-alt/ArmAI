import { theme } from '../../theme'

const LABELS: Record<string, string> = {
  pending_fulfillment: 'Pending fulfillment',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  delivery_failed: 'Delivery failed',
  cancelled: 'Cancelled',
}

const STYLES: Record<string, { bg: string; color: string }> = {
  pending_fulfillment: { bg: theme.warningMuted, color: theme.warning },
  packed: { bg: theme.infoMuted, color: theme.info },
  shipped: { bg: theme.infoMuted, color: theme.info },
  delivered: { bg: theme.successMuted, color: theme.success },
  delivery_failed: { bg: theme.dangerMuted, color: theme.danger },
  cancelled: { bg: theme.borderMuted, color: theme.textMuted },
}

export function FulfillmentStatusBadge({ status }: { status: string | null | undefined }) {
  if (status == null || status === '') return <span style={{ color: theme.textMuted }}>—</span>
  const { bg, color } = STYLES[status] ?? { bg: theme.surfaceElevated, color: theme.text }
  const label = LABELS[status] ?? status
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        background: bg,
        color,
      }}
    >
      {label}
    </span>
  )
}
