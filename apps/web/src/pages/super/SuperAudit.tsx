import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { superApi } from '../../lib/api'
import { PageShell, Card, CardHeader, CardBody, EmptyState } from '../../components/ui'
import { theme } from '../../theme'

export default function SuperAudit() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<unknown[]>([])
  const [error, setError] = useState<string | null>(null)
  const token = user?.accessToken ?? null

  useEffect(() => {
    if (!token) return
    superApi
      .auditLogs(token, 50)
      .then((r) => setLogs(r.logs ?? []))
      .catch((e) => setError(e.message))
  }, [token])

  if (error) return <p style={{ color: theme.danger }}>{error}</p>

  return (
    <PageShell title="Audit" description="Activity log for super admin actions">
      <Card>
        <CardHeader title="Audit log" />
        <CardBody>
          {logs.length === 0 ? (
            <EmptyState title="No audit entries" description="Actions will appear here." />
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
                    Time
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
                    Action
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
                    Resource
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
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const row = l as Record<string, unknown>
                  return (
                    <tr
                      key={String(row.id)}
                      style={{ borderBottom: `1px solid ${theme.borderMuted}` }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        {row.created_at ? new Date(String(row.created_at)).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{String(row.action ?? '—')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {String(row.resource_type ?? '—')}{' '}
                        {row.resource_id ? String(row.resource_id).slice(0, 8) + '…' : ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: theme.textSecondary }}>
                        {row.details ? JSON.stringify(row.details).slice(0, 60) + '…' : '—'}
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
