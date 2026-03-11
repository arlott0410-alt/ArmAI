import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentAccountsApi } from '../../lib/api';

export default function MerchantPaymentAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    paymentAccountsApi.list(token).then((r) => { setAccounts((r as { paymentAccounts: unknown[] }).paymentAccounts); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Payment accounts</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Bank/payment accounts the AI can send to customers. No hardcoded accounts.</p>
      {accounts.length === 0 ? (
        <p>No payment accounts yet. Add at least one (and mark primary) so the system can assign payment targets to orders.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Account</th>
              <th style={{ padding: 12 }}>Number</th>
              <th style={{ padding: 12 }}>Bank</th>
              <th style={{ padding: 12 }}>Primary</th>
              <th style={{ padding: 12 }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {(accounts as { id: string; account_name: string | null; account_number: string; bank_code: string; is_primary: boolean; is_active: boolean }[]).map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{a.account_name ?? a.account_number}</td>
                <td style={{ padding: 12 }}>{a.account_number}</td>
                <td style={{ padding: 12 }}>{a.bank_code}</td>
                <td style={{ padding: 12 }}>{a.is_primary ? 'Yes' : 'No'}</td>
                <td style={{ padding: 12 }}>{a.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
