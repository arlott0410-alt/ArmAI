import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi, type OrderRow } from '../../lib/api';

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

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <div>
      <h1>Orders</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}>Customer</th>
            <th style={{ padding: 12 }}>Amount</th>
            <th style={{ padding: 12 }}>Reference</th>
            <th style={{ padding: 12 }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: 12 }}>{o.status}</td>
              <td style={{ padding: 12 }}>{o.customer_name ?? '—'}</td>
              <td style={{ padding: 12 }}>{o.amount ?? '—'}</td>
              <td style={{ padding: 12 }}>{o.reference_code ?? '—'}</td>
              <td style={{ padding: 12 }}>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
