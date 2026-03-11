import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { authMiddleware, resolveMerchant, requireMerchantAdmin } from '../../middleware/auth.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import * as paymentAccounts from '../../services/payment-accounts.js';
import { merchantPaymentAccountSchema } from '@armai/shared';

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: import('../../middleware/auth.js').AuthContext; merchantId: string };
}>();

app.use('/*', authMiddleware);
app.use('/*', resolveMerchant);
app.use('/*', requireMerchantAdmin);

app.get('/', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const activeOnly = c.req.query('activeOnly') !== 'false';
  const list = await paymentAccounts.listPaymentAccounts(supabase, merchantId, activeOnly);
  return c.json({ paymentAccounts: list });
});

app.get('/:accountId', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const account = await paymentAccounts.getPaymentAccount(supabase, merchantId, c.req.param('accountId'));
  return c.json(account);
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = merchantPaymentAccountSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const account = await paymentAccounts.createPaymentAccount(supabase, merchantId, parsed.data);
  return c.json(account, 201);
});

app.patch('/:accountId', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = merchantPaymentAccountSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const account = await paymentAccounts.updatePaymentAccount(supabase, merchantId, c.req.param('accountId'), parsed.data);
  return c.json(account);
});

export default app;
