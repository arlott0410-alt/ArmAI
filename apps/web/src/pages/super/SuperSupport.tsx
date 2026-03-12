import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { superApi, supportApi } from '../../lib/api'
import type { OrderRow } from '../../lib/api'
import { PageShell, Card, CardHeader, CardBody, StatusBadge } from '../../components/ui'
import { theme } from '../../theme'

export default function SuperSupport() {
  const { user } = useAuth()
  const [merchants, setMerchants] = useState<{ id: string; name: string; slug: string }[]>([])
  const [merchantId, setMerchantId] = useState('')
  const [supportActive, setSupportActive] = useState(false)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const token = user?.accessToken ?? null

  const loadMerchants = () => {
    if (!token) return
    superApi
      .merchants(token)
      .then((r) => setMerchants(r.merchants))
      .catch(() => {})
  }
  useEffect(() => {
    loadMerchants()
  }, [token])

  const startSupport = async () => {
    if (!token || !merchantId) return
    setError(null)
    setLoading(true)
    try {
      await superApi.supportStart(token, merchantId)
      setSupportActive(true)
      const res = await supportApi.merchantOrders(token, merchantId)
      setOrders(res.orders)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = () => {
    if (!token || !merchantId) return
    supportApi
      .merchantOrders(token, merchantId)
      .then((r) => setOrders(r.orders))
      .catch(() => {})
  }

  return (
    <PageShell
      title="Support"
      description="Read-only access to merchant data. All access is audited."
    >
      {supportActive && (
        <div
          style={{
            padding: 14,
            background: 'rgba(234, 179, 8, 0.15)',
            border: `1px solid ${theme.warning}`,
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <strong style={{ color: theme.text }}>Read-only support mode active</strong>
          <span style={{ color: theme.textSecondary, marginLeft: 8 }}>
            for {merchants.find((m) => m.id === merchantId)?.name ?? merchantId}
          </span>
        </div>
      )}
      <Card style={{ marginBottom: 24 }}>
        <CardBody>
          <label
            style={{ display: 'block', marginBottom: 8, color: theme.textSecondary, fontSize: 13 }}
          >
            Select merchant
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={merchantId}
              onChange={(e) => {
                setMerchantId(e.target.value)
                setOrders([])
              }}
              style={{ padding: 10, minWidth: 260 }}
            >
              <option value="">—</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.slug})
                </option>
              ))}
            </select>
            <button
              onClick={startSupport}
              disabled={!merchantId || loading}
              style={{
                padding: '10px 18px',
                background: theme.primary,
                color: theme.background,
                border: 0,
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {loading ? 'Starting...' : 'Start support view'}
            </button>
          </div>
        </CardBody>
      </Card>
      {error && <p style={{ color: theme.danger, marginBottom: 16 }}>{error}</p>}
      {supportActive && (
        <Card>
          <CardHeader
            title="Orders (read-only)"
            action={
              <button
                onClick={loadOrders}
                style={{
                  padding: '8px 14px',
                  border: `1px solid ${theme.borderMuted}`,
                  borderRadius: 6,
                  background: 'transparent',
                  color: theme.textSecondary,
                  fontSize: 13,
                }}
              >
                Refresh
              </button>
            }
          />
          <CardBody style={{ padding: 0 }}>
            {orders.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: theme.textMuted }}>
                No orders.
              </div>
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
                      ID
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
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${theme.borderMuted}` }}>
                      <td style={{ padding: '12px 16px' }}>{o.id.slice(0, 8)}…</td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={o.status} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>{o.amount ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}
    </PageShell>
  )
}
