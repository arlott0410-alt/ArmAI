import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsApi } from '../../lib/api';

export default function MerchantSettings() {
  const { user } = useAuth();
  const [aiPrompt, setAiPrompt] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    settingsApi.get(token).then((s) => {
      setAiPrompt(s.ai_system_prompt ?? '');
      setWebhookToken(s.webhook_verify_token ?? '');
      setLoading(false);
    }).catch((e) => { setError(e.message); setLoading(false); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await settingsApi.update(token, {
        ai_system_prompt: aiPrompt || null,
        webhook_verify_token: webhookToken || null,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>AI system prompt</label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={6}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="Per-merchant AI prompt for chatbot..."
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Webhook verify token</label>
          <input
            type="text"
            value={webhookToken}
            onChange={(e) => setWebhookToken(e.target.value)}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="Optional: Facebook webhook verification"
          />
        </div>
        {saved && <p style={{ color: '#059669', marginBottom: 16 }}>Saved.</p>}
        <button type="submit" disabled={saving} style={{ padding: '8px 24px', background: '#2563eb', color: '#fff', border: 0, borderRadius: 4 }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
