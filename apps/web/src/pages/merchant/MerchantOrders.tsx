import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi, type OrderRow } from '../../lib/api';
import { PageShell, Card, CardBody, StatusBadge, Badge, EmptyState, FulfillmentStatusBadge } from '../../components/ui';
import { theme } from '../../theme';

const paymentMethodLabel: Record<string, string> = {
  prepaid_bank_transfer: 'Bank transfer',
  prepaid_qr: 'QR',
  cod: 'COD',
};

export default function MerchantOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = user?.accessToken ?? null;
  const statusFilter = searchParams.get('status') ?? '';
  const paymentMethodFilter = searchParams.get('payment_method') ?? '';
  const fulfillmentFilter = searchParams.get('fulfillment_status') ?? '';

  useEffect(() => {
    if (!token) return;
    merchantApi
      .orders(token, { status: statusFilter || undefined, payment_method: paymentMethodFilter || undefined, fulfillment_status: fulfillmentFilter || undefined, limit: 50 })
      .then((r) => {
        setOrders(r.orders);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [token, statusFilter, paymentMethodFilter, fulfillmentFilter]);

  if (error) return <p style={{ color: theme.danger }}>{error}</p>;
  if (loading) return <p style={{ color: theme.textSecondary }}>Loading...</p>;

  return (
    <PageShell title="Orders" description="Order list and payment status">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: theme.textMuted }}>Status</span>
        <select
          value={statusFilter}
          onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), status: e.target.value || '' })}
          style={{
            padding: '6px 10px',
            background: theme.surfaceElevated,
            border: `1px solid ${theme.borderMuted}`,
            borderRadius: 6,
            color: theme.text,
            fontSize: 13,
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span style={{ fontSize: 12, color: theme.textMuted, marginLeft: 8 }}>Fulfillment</span>
        <select
          value={fulfillmentFilter}
          onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), fulfillment_status: e.target.value || '' })}
          style={{
            padding: '6px 10px',
            background: theme.surfaceElevated,
            border: `1px solid ${theme.borderMuted}`,
            borderRadius: 6,
            color: theme.text,
            fontSize: 13,
          }}
        >
          <option value="">All</option>
          <option value="pending_fulfillment">Ready to fulfill</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="delivery_failed">Delivery failed</option>
        </select>
        <span style={{ fontSize: 12, color: theme.textMuted, marginLeft: 8 }}>Payment</span>
        <select
          value={paymentMethodFilter}
          onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), payment_method: e.target.value || '' })}
          style={{
            padding: '6px 10px',
            background: theme.surfaceElevated,
            border: `1px solid ${theme.borderMuted}`,
            borderRadius: 6,
            color: theme.text,
            fontSize: 13,
          }}
        >
          <option value="">All</option>
          <option value="prepaid_bank_transfer">Bank transfer</option>
          <option value="prepaid_qr">QR</option>
          <option value="cod">COD</option>
        </select>
      </div>
      <Card>
        <CardBody style={{ padding: 0 }}>
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" description="Orders from chat or manual entry will appear here." />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${theme.borderMuted}` }}>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Payment</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Fulfillment</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Reference</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    style={{ borderBottom: `1px solid ${theme.borderMuted}`, cursor: 'pointer' }}
                    onClick={() => navigate(`/merchant/orders/${o.id}`)}
                  >
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={o.payment_method === 'cod' ? 'gold' : 'default'}>
                        {paymentMethodLabel[o.payment_method ?? ''] ?? o.payment_method ?? '—'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{o.customer_name ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{o.amount ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}><FulfillmentStatusBadge status={o.fulfillment_status} /></td>
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
