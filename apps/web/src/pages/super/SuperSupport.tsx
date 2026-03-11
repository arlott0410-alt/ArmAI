import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { superApi, supportApi } from '../../lib/api';
import type { OrderRow } from '../../lib/api';

export default function SuperSupport() {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [merchantId, setMerchantId] = useState('');
  const [supportActive, setSupportActive] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  const loadMerchants = () => {
    if (!token) return;
    superApi.merchants(token).then((r) => setMerchants(r.merchants)).catch(() => {});
  };
  useEffect(() => { loadMerchants(); }, [token]);

  const startSupport = async () => {
    if (!token || !merchantId) return;
    setError(null);
    setLoading(true);
    try {
      await superApi.supportStart(token, merchantId);
      setSupportActive(true);
      const res = await supportApi.merchantOrders(token, merchantId);
      setOrders(res.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = () => {
    if (!token || !merchantId) return;
    supportApi.merchantOrders(token, merchantId).then((r) => setOrders(r.orders)).catch(() => {});
  };

  return (
    <div>
      <h1>Support (God Mode)</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>
        Read-only access to merchant data. All access is audited. Never impersonates session.
      </p>
      {supportActive && (
        <div style={{ padding: 12, background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 4, marginBottom: 24 }}>
          <strong>Read-only support mode active</strong> for merchant {merchants.find((m) => m.id === merchantId)?.name ?? merchantId}.
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Select merchant</label>
        <select
          value={merchantId}
          onChange={(e) => { setMerchantId(e.target.value); setOrders([]); }}
          style={{ padding: 8, minWidth: 240, border: '1px solid #ccc', borderRadius: 4 }}
        >
          <option value="">—</option>
          {merchants.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.slug})</option>
          ))}
        </select>
        <button onClick={startSupport} disabled={!merchantId || loading} style={{ marginLeft: 12, padding: '8px 16px', background: '#2563eb', color: '#fff', border: 0, borderRadius: 4 }}>
          {loading ? 'Starting...' : 'Start support view'}
        </button>
      </div>
      {error && <p style={{ color: '#b91c1c', marginBottom: 16 }}>{error}</p>}
      {supportActive && orders.length >= 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>Orders (read-only)</h2>
            <button onClick={loadOrders} style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4 }}>Refresh</button>
          </div>
          {orders.length === 0 ? (
            <p>No orders.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>ID</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Amount</th>
                  <th style={{ padding: 12 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: 12 }}>{o.id.slice(0, 8)}…</td>
                    <td style={{ padding: 12 }}>{o.status}</td>
                    <td style={{ padding: 12 }}>{o.amount ?? '—'}</td>
                    <td style={{ padding: 12 }}>{new Date(o.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
