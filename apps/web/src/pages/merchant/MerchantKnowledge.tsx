import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { knowledgeApi } from '../../lib/api';

export default function MerchantKnowledge() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<unknown[]>([]);
  const [entries, setEntries] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    Promise.all([knowledgeApi.faqs(token), knowledgeApi.entries(token)])
      .then(([f, e]) => {
        setFaqs((f as { faqs: unknown[] }).faqs);
        setEntries((e as { entries: unknown[] }).entries);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Knowledge base</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>FAQs and knowledge entries for AI retrieval. No hardcoded answers.</p>
      <h2>FAQs</h2>
      {faqs.length === 0 ? <p>No FAQs yet.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {(faqs as { id: string; question: string }[]).map((f) => (
            <li key={f.id} style={{ padding: 12, background: '#fff', marginBottom: 8, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{f.question}</li>
          ))}
        </ul>
      )}
      <h2 style={{ marginTop: 24 }}>Knowledge entries</h2>
      {entries.length === 0 ? <p>No entries yet.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {(entries as { id: string; type: string; title: string }[]).map((e) => (
            <li key={e.id} style={{ padding: 12, background: '#fff', marginBottom: 8, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}><strong>{e.type}</strong>: {e.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
