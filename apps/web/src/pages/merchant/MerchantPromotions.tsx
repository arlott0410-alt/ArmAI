import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { promotionsApi } from '../../lib/api';

export default function MerchantPromotions() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    promotionsApi.list(token).then((r) => { setPromotions((r as { promotions: unknown[] }).promotions); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Promotions</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Active promotions for AI to use in context.</p>
      {promotions.length === 0 ? <p>No promotions yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Title</th>
              <th style={{ padding: 12 }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {(promotions as { id: string; title: string; is_active: boolean }[]).map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{p.title}</td>
                <td style={{ padding: 12 }}>{p.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
