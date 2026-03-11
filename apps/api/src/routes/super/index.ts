import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { authMiddleware, requireSuperAdmin } from '../../middleware/auth.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import * as merchantService from '../../services/merchant.js';
import * as supportService from '../../services/support.js';
import { createMerchantBodySchema } from '@armai/shared';

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: import('../../middleware/auth.js').AuthContext };
}>();

app.use('/*', authMiddleware);
app.use('/*', requireSuperAdmin);

app.get('/dashboard', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchants = await merchantService.listMerchantsForSuper(supabase);
  const activeCount = merchants.filter((m) => m.billing_status === 'active' || m.billing_status === 'trialing').length;
  return c.json({
    mrr: 0,
    merchantCount: merchants.length,
    activeMerchants: activeCount,
    systemHealth: 'ok',
  });
});

app.get('/merchants', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const list = await merchantService.listMerchantsForSuper(supabase);
  return c.json({ merchants: list });
});

app.post('/merchants', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = createMerchantBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }
  const supabase = getSupabaseAdmin(c.env);
  const auth = c.get('auth');
  try {
    const { merchantId } = await merchantService.createMerchant(supabase, parsed.data);
    const userId = await createAuthUserAndMembership(c.env, parsed.data);
    await supabase.from('merchant_members').insert({
      merchant_id: merchantId,
      user_id: userId,
      role: 'merchant_admin',
    });
    await supabase.from('merchant_settings').insert({ merchant_id: merchantId });
    await supportService.logAudit(supabase, {
      actorId: auth.userId,
      action: 'merchant_created',
      resourceType: 'merchant',
      resourceId: merchantId,
      details: { slug: parsed.data.slug },
    });
    return c.json({ merchantId, userId }, 201);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Failed' }, 400);
  }
});

async function createAuthUserAndMembership(
  env: Env,
  input: { admin_email: string; admin_full_name?: string }
): Promise<string> {
  const supabase = getSupabaseAdmin(env);
  const { data: authData, error } = await supabase.auth.admin.createUser({
    email: input.admin_email,
    email_confirm: true,
    user_metadata: { full_name: input.admin_full_name },
  });
  if (error || !authData?.user) {
    throw new Error(error?.message ?? 'Failed to create auth user');
  }
  const userId = authData.user.id;
  await supabase.from('profiles').upsert({
    id: userId,
    email: input.admin_email,
    full_name: input.admin_full_name ?? null,
    role: 'merchant_admin',
    updated_at: new Date().toISOString(),
  });
  return userId;
}

export default app;
