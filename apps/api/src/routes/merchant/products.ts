import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { authMiddleware, resolveMerchant, requireMerchantAdmin } from '../../middleware/auth.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import * as catalog from '../../services/catalog.js';
import { productSchema, productVariantSchema, productKeywordSchema } from '@armai/shared';

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
  const categoryId = c.req.query('categoryId');
  const status = c.req.query('status');
  const aiVisibleOnly = c.req.query('aiVisibleOnly') === 'true';
  const list = await catalog.listProducts(supabase, merchantId, { categoryId, status, aiVisibleOnly });
  return c.json({ products: list });
});

app.get('/search', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const q = c.req.query('q') ?? '';
  const list = await catalog.searchProductsByKeyword(supabase, merchantId, q);
  return c.json({ products: list });
});

app.get('/:productId', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const product = await catalog.getProduct(supabase, merchantId, c.req.param('productId'));
  return c.json(product);
});

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const product = await catalog.createProduct(supabase, merchantId, parsed.data);
  return c.json(product, 201);
});

app.patch('/:productId', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const product = await catalog.updateProduct(supabase, merchantId, c.req.param('productId'), parsed.data);
  return c.json(product);
});

app.get('/:productId/variants', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const list = await catalog.listVariants(supabase, merchantId, c.req.param('productId'));
  return c.json({ variants: list });
});

app.post('/:productId/variants', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = productVariantSchema.safeParse({ ...body, product_id: c.req.param('productId') });
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const variant = await catalog.createVariant(supabase, merchantId, parsed.data);
  return c.json(variant, 201);
});

app.get('/:productId/keywords', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const list = await catalog.listKeywords(supabase, merchantId, c.req.param('productId'));
  return c.json({ keywords: list });
});

app.post('/:productId/keywords', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = productKeywordSchema.safeParse({ ...body, product_id: c.req.param('productId') });
  if (!parsed.success) return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const keyword = await catalog.createKeyword(supabase, merchantId, parsed.data);
  return c.json(keyword, 201);
});

app.delete('/:productId/keywords/:keywordId', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  await catalog.deleteKeyword(supabase, merchantId, c.req.param('keywordId'));
  return c.json({ ok: true });
});

export default app;
