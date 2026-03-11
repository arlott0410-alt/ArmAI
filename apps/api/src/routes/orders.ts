import { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware, resolveMerchant, requireMerchantAdmin } from '../middleware/auth.js';
import { getSupabaseAdmin } from '../lib/supabase.js';
import * as orderService from '../services/orders.js';
import { confirmMatchBodySchema } from '@armai/shared';

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: import('../middleware/auth.js').AuthContext; merchantId: string };
}>();

app.use('/*', authMiddleware);
app.use('/*', resolveMerchant);
app.use('/*', requireMerchantAdmin);

app.post('/confirm-match', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = confirmMatchBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  await orderService.confirmMatch(supabase, merchantId, parsed.data.matching_result_id, parsed.data.confirm);
  return c.json({ ok: true });
});

export default app;
