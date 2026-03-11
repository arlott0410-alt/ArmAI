import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi } from '../../lib/api';

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ merchantId: string; settings: Record<string, unknown> | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    merchantApi.dashboard(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: '#64748b' }}>Merchant ID: {data.merchantId}</p>
      <p>Settings and quick stats can be shown here. Realtime updates only where useful.</p>
    </div>
  );
}
