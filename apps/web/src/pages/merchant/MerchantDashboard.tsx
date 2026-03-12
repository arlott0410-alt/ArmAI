import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi, type MerchantDashboardResponse } from '../../lib/api';
import { PageShell, StatCard, Card, CardBody, Section, EmptyState, StatusBadge, PanelCard } from '../../components/ui';
import { theme } from '../../theme';

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<MerchantDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = user?.accessToken ?? null;

  useEffect(() => {
    if (!token) return;
    merchantApi.dashboard(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <p style={{ color: theme.danger }}>{error}</p>;
  if (!data) return <p style={{ color: theme.textSecondary }}>Loading...</p>;

  const summary = data.summary;
  const readiness = data.readiness ?? [];
  const readyCount = readiness.filter((r) => r.status === 'ready').length;
  const totalSteps = readiness.length;
  const progressPct = totalSteps > 0 ? Math.round((readyCount / totalSteps) * 100) : 0;

  return (
    <PageShell title="Overview" description="Store Operations Workspace">
      {summary != null && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatCard label="Orders today" value={summary.ordersToday} accent={summary.ordersToday > 0} />
          <StatCard label="Pending payment" value={summary.pendingPayment} />
          <StatCard label="Paid today" value={summary.paidToday} />
          <StatCard label="Manual review" value={summary.manualReviewCount} />
          <StatCard label="Probable match" value={summary.probableMatchCount} />
          <StatCard label="Ready to ship" value={summary.readyToShipCount ?? 0} />
          <StatCard label="Active products" value={summary.activeProductsCount} />
          <StatCard label="Payment accounts" value={summary.activePaymentAccountsCount} />
        </div>
      )}

      <Section
        title="Setup readiness"
        description={totalSteps > 0 ? `${readyCount} of ${totalSteps} steps complete` : 'Complete setup to start selling.'}
      >
        <PanelCard
          title="Setup checklist"
          subtitle={totalSteps > 0 ? `${progressPct}% complete` : undefined}
        >
          {readiness.length === 0 ? (
            <EmptyState title="Loading setup status…" />
          ) : (
            <>
              <div style={{ marginBottom: 16, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: theme.primary, borderRadius: 3 }} />
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {readiness.map((r) => (
                  <li key={r.key} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={r.status} />
                    <span style={{ color: theme.text }}>{r.label}</span>
                    {r.detail != null && <span style={{ color: theme.textMuted, fontSize: 12 }}>{r.detail}</span>}
                    {r.status !== 'ready' && (
                      <Link
                        to={
                          r.key === 'products' ? '/merchant/products' :
                          r.key === 'categories' ? '/merchant/categories' :
                          r.key === 'payment_account' || r.key === 'primary_payment' ? '/merchant/payment-accounts' :
                          r.key === 'ai_prompt' ? '/merchant/settings' :
                          r.key === 'faq_knowledge' ? '/merchant/knowledge' :
                          r.key === 'bank_parser' ? '/merchant/settings' : '/merchant/settings'
                        }
                        style={{ marginLeft: 'auto', fontSize: 13, color: theme.primary, fontWeight: 500 }}
                      >
                        Set up →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </PanelCard>
      </Section>

      {!summary && !data.settings && (
        <Card>
          <CardBody>
            <p style={{ color: theme.textMuted, margin: 0 }}>Merchant ID: {data.merchantId}. Complete setup above to enable full dashboard.</p>
          </CardBody>
        </Card>
      )}
    </PageShell>
  );
}
