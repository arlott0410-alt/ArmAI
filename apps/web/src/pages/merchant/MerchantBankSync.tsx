import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi } from '../../lib/api';

interface BankTx {
  id: string;
  amount: number;
  sender_name: string | null;
  transaction_at: string;
  reference_code: string | null;
  created_at: string;
}

export default function MerchantBankSync() {
  const { user } = useAuth();
  const [bankTransactions, setBankTransactions] = useState<BankTx[]>([]);
  const [matchingResults, setMatchingResults] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    merchantApi.bankSync(token).then((r) => {
      setBankTransactions((r.bankTransactions as BankTx[]) ?? []);
      setMatchingResults(r.matchingResults ?? []);
      setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Bank Sync</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Incoming bank transactions and matching results.</p>
      <h2>Recent transactions</h2>
      {bankTransactions.length === 0 ? (
        <p>No bank transactions yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Amount</th>
              <th style={{ padding: 12 }}>Sender</th>
              <th style={{ padding: 12 }}>Time</th>
              <th style={{ padding: 12 }}>Reference</th>
            </tr>
          </thead>
          <tbody>
            {bankTransactions.map((tx) => (
              <tr key={tx.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: 12 }}>{tx.amount}</td>
                <td style={{ padding: 12 }}>{tx.sender_name ?? '—'}</td>
                <td style={{ padding: 12 }}>{new Date(tx.transaction_at).toLocaleString()}</td>
                <td style={{ padding: 12 }}>{tx.reference_code ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2>Matching results</h2>
      {matchingResults.length === 0 ? <p>No matching results yet.</p> : <p>{matchingResults.length} result(s).</p>}
    </div>
  );
}
