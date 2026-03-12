import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import * as codSettings from '../../services/cod-settings.js';

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: import('../../middleware/auth.js').AuthContext; merchantId: string };
}>();

app.get('/', async (c) => {
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  const settings = await codSettings.getMerchantCodSettings(supabase, merchantId);
  if (!settings) {
    return c.json({
      merchant_id: merchantId,
      enable_cod: false,
      cod_min_order_amount: null,
      cod_max_order_amount: null,
      cod_fee_amount: 0,
      require_phone_for_cod: true,
      require_full_address_for_cod: true,
      cod_requires_manual_confirmation: false,
      cod_notes_for_ai: null,
    });
  }
  return c.json(settings);
});

const updateSchema = {
  enable_cod: (v: unknown) => (typeof v === 'boolean' ? v : undefined),
  cod_min_order_amount: (v: unknown) => (typeof v === 'number' && v >= 0 ? v : v === null ? null : undefined),
  cod_max_order_amount: (v: unknown) => (typeof v === 'number' && v >= 0 ? v : v === null ? null : undefined),
  cod_fee_amount: (v: unknown) => (typeof v === 'number' && v >= 0 ? v : undefined),
  require_phone_for_cod: (v: unknown) => (typeof v === 'boolean' ? v : undefined),
  require_full_address_for_cod: (v: unknown) => (typeof v === 'boolean' ? v : undefined),
  cod_requires_manual_confirmation: (v: unknown) => (typeof v === 'boolean' ? v : undefined),
  cod_notes_for_ai: (v: unknown) => (typeof v === 'string' || v === null ? v : undefined),
};

app.patch('/', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  for (const [key, fn] of Object.entries(updateSchema)) {
    const val = (fn as (v: unknown) => unknown)(body[key]);
    if (val !== undefined) update[key] = val;
  }
  if (Object.keys(update).length === 0) return c.json({ error: 'No valid fields to update' }, 400);
  const supabase = getSupabaseAdmin(c.env);
  const merchantId = c.get('merchantId');
  await codSettings.upsertMerchantCodSettings(supabase, merchantId, update as Partial<codSettings.MerchantCodSettingsRow>);
  const settings = await codSettings.getMerchantCodSettings(supabase, merchantId);
  return c.json(settings ?? { merchant_id: merchantId, ...update });
});

export default app;
