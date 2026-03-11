import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { authMiddleware, resolveMerchant, requireMerchantAdmin } from '../../middleware/auth.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import * as merchantService from '../../services/merchant.js';
import * as orderService from '../../services/orders.js';

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: import('../../middleware/auth.js').AuthContext; merchantId: string };
}>();

app.use('/*', authMiddleware);
app.use('/*', resolveMerchant);
app.use('/*', requireMerchantAdmin);

app.get('/dashboard', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const settings = await merchantService.getMerchantSettings(supabase, merchantId);
  return c.json({ merchantId, settings });
});

app.get('/orders', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const status = c.req.query('status');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit'), 10) : 50;
  const list = await orderService.listOrders(supabase, merchantId, { status, limit });
  return c.json({ orders: list });
});

app.get('/orders/:orderId', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const orderId = c.req.param('orderId');
  const order = await orderService.getOrder(supabase, merchantId, orderId);
  return c.json(order);
});

app.get('/bank-sync', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 100);
  const { data: transactions } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('transaction_at', { ascending: false })
    .limit(limit);
  const { data: matchings } = await supabase
    .from('matching_results')
    .select('*, orders(*), bank_transactions(*)')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return c.json({ bankTransactions: transactions ?? [], matchingResults: matchings ?? [] });
});

export default app;
