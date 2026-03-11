import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productsApi, categoriesApi } from '../../lib/api';

export default function MerchantProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    Promise.all([productsApi.list(token), categoriesApi.list(token)])
      .then(([p, c]) => {
        setProducts((p as { products: unknown[] }).products);
        setCategories((c as { categories: unknown[] }).categories);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Products</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Manage your product catalog. AI uses only active, AI-visible products from the database.</p>
      {products.length === 0 ? (
        <p>No products yet. Add products and categories to let the AI answer accurately.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Price</th>
              <th style={{ padding: 12 }}>Status</th>
              <th style={{ padding: 12 }}>AI visible</th>
            </tr>
          </thead>
          <tbody>
            {(products as { id: string; name: string; base_price: number; sale_price?: number | null; status: string; ai_visible: boolean }[]).map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{p.name}</td>
                <td style={{ padding: 12 }}>{p.sale_price ?? p.base_price} THB</td>
                <td style={{ padding: 12 }}>{p.status}</td>
                <td style={{ padding: 12 }}>{p.ai_visible ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
