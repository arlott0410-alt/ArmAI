import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { authMiddleware, resolveMerchant, requireMerchantAdmin } from '../../middleware/auth.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import * as catalog from '../../services/catalog.js';
import { productCategorySchema } from '@armai/shared';

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
  const list = await catalog.listCategories(supabase, merchantId, activeOnly);
  return c.json({ categories: list });
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = productCategorySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const category = await catalog.createCategory(supabase, merchantId, parsed.data);
  return c.json(category, 201);
});

app.patch('/:categoryId', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = productCategorySchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const category = await catalog.updateCategory(supabase, merchantId, c.req.param('categoryId'), parsed.data);
  return c.json(category);
});

export default app;
