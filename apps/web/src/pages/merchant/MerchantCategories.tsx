import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { categoriesApi } from '../../lib/api';

export default function MerchantCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    categoriesApi.list(token).then((r) => { setCategories((r as { categories: unknown[] }).categories); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Categories</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Product categories for catalog and AI context.</p>
      {categories.length === 0 ? <p>No categories yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {(categories as { id: string; name: string; is_active: boolean }[]).map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{c.name}</td>
                <td style={{ padding: 12 }}>{c.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
