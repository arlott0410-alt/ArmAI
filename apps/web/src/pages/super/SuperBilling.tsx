import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { superApi } from '../../lib/api'
import { PageShell, Card, CardHeader, CardBody, EmptyState } from '../../components/ui'
import { theme } from '../../theme'

export default function SuperBilling() {
  const { user } = useAuth()
  const [events, setEvents] = useState<unknown[]>([])
  const [error, setError] = useState<string | null>(null)
  const token = user?.accessToken ?? null

  useEffect(() => {
    if (!token) return
    superApi
      .billingEvents(token)
      .then((r) => setEvents(r.events ?? []))
      .catch((e) => setError(e.message))
  }, [token])

  if (error) return <p style={{ color: theme.danger }}>{error}</p>

  return (
    <PageShell title="Billing" description="Billing events across merchants">
      <Card>
        <CardHeader title="Recent billing events" />
        <CardBody>
          {events.length === 0 ? (
            <EmptyState
              title="No billing events"
              description="Events will appear when invoices or payments are recorded."
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${theme.borderMuted}` }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      color: theme.textMuted,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                    }}
                  >
                    Merchant
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      color: theme.textMuted,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      color: theme.textMuted,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      color: theme.textMuted,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      color: theme.textMuted,
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: 'uppercase',
                    }}
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 50).map((ev) => {
                  const e = ev as Record<string, unknown>
                  return (
                    <tr
                      key={String(e.id)}
                      style={{ borderBottom: `1px solid ${theme.borderMuted}` }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        {String(e.merchant_id ?? '—').slice(0, 8)}…
                      </td>
                      <td style={{ padding: '12px 16px' }}>{String(e.event_type ?? '—')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {Number(e.amount ?? 0)} {String(e.currency ?? '')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{String(e.status ?? '—')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {e.created_at ? new Date(String(e.created_at)).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </PageShell>
  )
}
