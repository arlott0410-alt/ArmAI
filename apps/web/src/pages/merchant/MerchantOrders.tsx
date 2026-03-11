import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi, type OrderRow } from '../../lib/api';
import { PageShell, Card, CardBody, StatusBadge, EmptyState } from '../../components/ui';
import { theme } from '../../theme';

export default function MerchantOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    merchantApi.orders(token).then((r) => { setOrders(r.orders); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  if (error) return <p style={{ color: theme.danger }}>{error}</p>;
  if (loading) return <p style={{ color: theme.textSecondary }}>Loading...</p>;

  return (
    <PageShell title="Orders" description="Order list and payment status">
      <Card>
        <CardBody style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders from chat or manual entry will appear here." />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${theme.borderMuted}` }}>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Reference</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${theme.borderMuted}` }}>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '12px 16px' }}>{o.customer_name ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{o.amount ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{o.reference_code ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </PageShell>
  );
}
