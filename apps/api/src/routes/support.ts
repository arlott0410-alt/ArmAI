import { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.js';
import { getSupabaseAdmin } from '../lib/supabase.js';
import * as supportService from '../services/support.js';

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: import('../middleware/auth.js').AuthContext };
}>();

app.use('/*', authMiddleware);
app.use('/*', requireSuperAdmin);

/**
 * Start support session (read-only). Logs to support_access_logs.
 * Response includes merchantId for client to show read-only banner.
 */
app.post('/start', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const merchantId = body?.merchantId as string | undefined;
  if (!merchantId || typeof merchantId !== 'string') {
    return c.json({ error: 'merchantId required' }, 400);
  }
  const supabase = getSupabaseAdmin(c.env);
  const auth = c.get('auth');
  const logId = await supportService.startSupportAccess(supabase, {
    actorId: auth.userId,
    merchantId,
    userAgent: c.req.header('user-agent'),
  });
  return c.json({ supportSessionId: logId, merchantId, readOnly: true });
});

/**
 * Read-only: list orders for a merchant (support mode).
 */
app.get('/merchants/:merchantId/orders', async (c) => {
  const merchantId = c.req.param('merchantId');
  const supabase = getSupabaseAdmin(c.env);
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return c.json({ error: error.message }, 400);
  return c.json({ orders: data ?? [] });
});

/**
 * Read-only: merchant settings for support view.
 */
app.get('/merchants/:merchantId/settings', async (c) => {
  const merchantId = c.req.param('merchantId');
  const supabase = getSupabaseAdmin(c.env);
  const { data, error } = await supabase
    .from('merchant_settings')
    .select('*')
    .eq('merchant_id', merchantId)
    .single();
  if (error && error.code !== 'PGRST116') return c.json({ error: error.message }, 400);
  return c.json(data ?? {});
});

export default app;
