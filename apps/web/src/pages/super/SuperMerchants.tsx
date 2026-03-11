import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { superApi, type MerchantListItem } from '../../lib/api';

export default function SuperMerchants() {
  const { user } = useAuth();
  const [merchants, setMerchants] = useState<MerchantListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const token = user?.accessToken ?? null;

  const load = () => {
    if (!token) return;
    setLoading(true);
    superApi.merchants(token).then((r) => { setMerchants(r.merchants); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      await superApi.createMerchant(token!, { name, slug, admin_email: adminEmail });
      setAddOpen(false);
      setName('');
      setSlug('');
      setAdminEmail('');
      load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setAddLoading(false);
    }
  };

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Merchants</h1>
        <button onClick={() => setAddOpen(true)} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 0, borderRadius: 4 }}>
          Add Merchant
        </button>
      </div>
      {addOpen && (
        <div style={{ marginBottom: 24, padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Add Merchant</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', maxWidth: 320, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="a-z0-9-" style={{ width: '100%', maxWidth: 320, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Admin email</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required style={{ width: '100%', maxWidth: 320, padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            {addError && <p style={{ color: '#b91c1c', marginBottom: 8 }}>{addError}</p>}
            <button type="submit" disabled={addLoading} style={{ marginRight: 8, padding: '8px 16px', background: '#2563eb', color: '#fff', border: 0, borderRadius: 4 }}>
              Create
            </button>
            <button type="button" onClick={() => setAddOpen(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 4 }}>
              Cancel
            </button>
          </form>
        </div>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : merchants.length === 0 ? (
        <p>No merchants yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Slug</th>
              <th style={{ padding: 12 }}>Billing</th>
              <th style={{ padding: 12 }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{m.name}</td>
                <td style={{ padding: 12 }}>{m.slug}</td>
                <td style={{ padding: 12 }}>{m.billing_status}</td>
                <td style={{ padding: 12 }}>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
