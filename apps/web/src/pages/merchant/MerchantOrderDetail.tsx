import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { merchantApi, type OrderDetailResponse } from '../../lib/api';
import { PageShell, PanelCard, StatusBadge, Badge } from '../../components/ui';
import { theme } from '../../theme';

const paymentMethodLabel: Record<string, string> = {
  prepaid_bank_transfer: 'Bank transfer',
  prepaid_qr: 'QR',
  cod: 'COD',
};

export default function MerchantOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.accessToken ?? null;
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    if (!token || !orderId) return;
    setError(null);
    merchantApi
      .orderDetail(token, orderId)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token, orderId]);

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const switchPaymentMethod = async (desiredMethod: string) => {
    if (!token || !orderId) return;
    setActionError(null);
    try {
      const res = await merchantApi.orderSwitchPaymentMethod(token, orderId, { desired_method: desiredMethod, requested_by: 'merchant_admin' });
      if (res.order) setOrder(res.order);
      else load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Switch failed');
    }
  };

  if (error) return <p style={{ color: theme.danger }}>{error}</p>;
  if (loading || !order) return <p style={{ color: theme.textSecondary }}>Loading…</p>;

  const isCod = order.payment_method === 'cod';
  const codDetails = order.cod_details as { cod_status?: string; cod_amount?: number; cod_fee?: number } | null;
  const events = order.payment_method_events ?? [];
  const canSwitch = !order.payment_method_locked_at && order.status !== 'paid' && order.payment_status !== 'paid' && order.payment_status !== 'cod_collected';

  return (
    <PageShell
      title={`Order ${orderId?.slice(0, 8)}…`}
      description="Order detail, payment method, and actions"
      breadcrumb={
        <button
          type="button"
          onClick={() => navigate('/merchant/orders')}
          style={{ background: 'none', border: 0, color: theme.primary, cursor: 'pointer', fontSize: 13 }}
        >
          ← Orders
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PanelCard title="Order" subtitle="Status and payment">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div><span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Status</span><StatusBadge status={order.status} /></div>
            <div><span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Payment method</span><Badge variant={isCod ? 'gold' : 'default'}>{paymentMethodLabel[order.payment_method ?? ''] ?? order.payment_method}</Badge></div>
            <div><span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Payment status</span><span style={{ fontSize: 13 }}>{order.payment_status ?? '—'}</span></div>
            <div><span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Switch count</span><span style={{ fontSize: 13 }}>{order.payment_switch_count ?? 0}</span></div>
            <div><span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Amount</span><span style={{ fontSize: 13 }}>{order.amount ?? '—'}</span></div>
            <div><span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Customer</span><span style={{ fontSize: 13 }}>{order.customer_name ?? '—'}</span></div>
          </div>
          {canSwitch && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.borderMuted}` }}>
              <span style={{ fontSize: 12, color: theme.textMuted, marginRight: 8 }}>Switch payment method</span>
              {!isCod && (
                <button type="button" onClick={() => switchPaymentMethod('cod')} style={{ marginRight: 8, padding: '6px 12px', background: theme.surfaceElevated, border: `1px solid ${theme.borderMuted}`, borderRadius: 6, color: theme.text, fontSize: 12, cursor: 'pointer' }}>
                  Switch to COD
                </button>
              )}
              {isCod && (
                <button type="button" onClick={() => switchPaymentMethod('prepaid_bank_transfer')} style={{ marginRight: 8, padding: '6px 12px', background: theme.surfaceElevated, border: `1px solid ${theme.borderMuted}`, borderRadius: 6, color: theme.text, fontSize: 12, cursor: 'pointer' }}>
                  Switch to bank transfer
                </button>
              )}
            </div>
          )}
          {actionError && <p style={{ color: theme.danger, fontSize: 13, marginTop: 8 }}>{actionError}</p>}
        </PanelCard>

        {events.length > 0 && (
          <PanelCard title="Payment method history" subtitle="Timeline of payment method changes">
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.textSecondary }}>
              {events.map((ev) => (
                <li key={ev.id} style={{ marginBottom: 6 }}>
                  {ev.from_method} → {ev.to_method} ({ev.switch_result}) {ev.reason ? `— ${ev.reason}` : ''} — {new Date(ev.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          </PanelCard>
        )}

        {isCod && codDetails && (
          <PanelCard title="COD details" subtitle="Cash on Delivery status">
            <div style={{ marginBottom: 12 }}>Status: <StatusBadge status={codDetails.cod_status ?? ''} /> Amount: {codDetails.cod_amount} Fee: {codDetails.cod_fee ?? 0}</div>
            {actionError && <p style={{ color: theme.danger, fontSize: 13 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {codDetails.cod_status === 'pending_merchant_confirmation' && (
                <button
                  type="button"
                  onClick={() => token && orderId && runAction(() => merchantApi.orderCodConfirm(token, orderId))}
                  style={{ padding: '8px 16px', background: theme.primary, color: theme.background, border: 0, borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Confirm COD
                </button>
              )}
              {(codDetails.cod_status === 'ready_to_ship' || codDetails.cod_status === 'pending_merchant_confirmation') && (
                <button
                  type="button"
                  onClick={() => token && orderId && runAction(() => merchantApi.orderCodMarkShipped(token, orderId))}
                  style={{ padding: '8px 16px', background: theme.surfaceElevated, border: `1px solid ${theme.borderMuted}`, color: theme.text, borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
                >
                  Mark shipped
                </button>
              )}
              {codDetails.cod_status === 'shipped' && (
                <button
                  type="button"
                  onClick={() => token && orderId && runAction(() => merchantApi.orderCodMarkCollected(token, orderId))}
                  style={{ padding: '8px 16px', background: theme.success, color: theme.background, border: 0, borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  Mark collected
                </button>
              )}
              {(codDetails.cod_status === 'ready_to_ship' || codDetails.cod_status === 'shipped') && (
                <button
                  type="button"
                  onClick={() => token && orderId && runAction(() => merchantApi.orderCodMarkFailed(token, orderId))}
                  style={{ padding: '8px 16px', background: theme.dangerMuted, color: theme.danger, border: `1px solid ${theme.danger}`, borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
                >
                  Mark failed
                </button>
              )}
            </div>
          </PanelCard>
        )}

        {order.order_items?.length > 0 && (
          <PanelCard title="Items" subtitle="">
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
              {order.order_items.map((item) => (
                <li key={item.id}>{item.product_name_snapshot} x{item.quantity} = {item.total_price}</li>
              ))}
            </ul>
          </PanelCard>
        )}

        {order.shipping_details && (
          <PanelCard title="Shipping details" subtitle="">
            <pre style={{ margin: 0, fontSize: 12, color: theme.textSecondary, whiteSpace: 'pre-wrap' }}>{JSON.stringify(order.shipping_details, null, 2)}</pre>
          </PanelCard>
        )}
      </div>
    </PageShell>
  );
}
