import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsApi } from '../../lib/api';
import { PageShell, PanelCard } from '../../components/ui';
import { theme } from '../../theme';

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

  if (error) return <p style={{ color: theme.danger }}>{error}</p>;
  if (loading) return <p style={{ color: theme.textSecondary }}>Loading...</p>;

  return (
    <PageShell title="Settings" description="AI prompt and webhook configuration">
      <PanelCard title="AI & Webhook" subtitle="Per-merchant AI prompt and Facebook webhook verify token">
        <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: theme.textSecondary, fontSize: 13 }}>AI system prompt</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={6}
              style={{ width: '100%', padding: 12 }}
              placeholder="Per-merchant AI prompt for chatbot..."
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: theme.textSecondary, fontSize: 13 }}>Webhook verify token</label>
            <input
              type="text"
              value={webhookToken}
              onChange={(e) => setWebhookToken(e.target.value)}
              style={{ width: '100%', padding: 12 }}
              placeholder="Optional: Facebook webhook verification"
            />
          </div>
          {saved && <p style={{ color: theme.success, marginBottom: 16, fontSize: 13 }}>Saved.</p>}
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 24px', background: theme.primary, color: theme.background, border: 0, borderRadius: 6, fontWeight: 600, fontSize: 13 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </PanelCard>
    </PageShell>
  );
}
