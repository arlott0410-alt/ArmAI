import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { superApi } from '../../lib/api';

export default function SuperDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ mrr: number; merchantCount: number; activeMerchants: number; systemHealth: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    superApi.dashboard(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Super Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
        <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>MRR</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data.mrr}</div>
        </div>
        <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Merchants</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data.merchantCount}</div>
        </div>
        <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Active</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data.activeMerchants}</div>
        </div>
        <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Health</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{data.systemHealth}</div>
        </div>
      </div>
    </div>
  );
}
