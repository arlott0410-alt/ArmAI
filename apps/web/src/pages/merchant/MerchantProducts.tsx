import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productsApi } from '../../lib/api';
import { PageShell, Card, CardBody, StatusBadge, EmptyState } from '../../components/ui';
import { theme } from '../../theme';

export default function MerchantProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    productsApi.list(token)
      .then((p) => setProducts((p as { products: unknown[] }).products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (error) return <p style={{ color: theme.danger }}>{error}</p>;
  if (loading) return <p style={{ color: theme.textSecondary }}>Loading...</p>;

  const rows = products as { id: string; name: string; base_price: number; sale_price?: number | null; status: string; ai_visible: boolean }[];

  return (
    <PageShell title="Products" description="Product catalog. AI uses active, AI-visible products.">
      <Card>
        <CardBody style={{ padding: 0 }}>
          {rows.length === 0 ? (
            <EmptyState title="No products yet" description="Add products and categories so the AI can answer accurately." />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${theme.borderMuted}` }}>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: theme.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>AI visible</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${theme.borderMuted}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '12px 16px' }}>{p.sale_price ?? p.base_price} THB</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: '12px 16px' }}>{p.ai_visible ? <StatusBadge status="ready" label="Yes" /> : <span style={{ color: theme.textMuted }}>No</span>}</td>
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
