import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { parseBankPayload, ingestBankTransaction } from '../../services/bank-webhook.js';
import { runMatchingForBankTransaction } from '../../services/matching.js';

const app = new Hono<{ Bindings: Env }>();

app.post('/:merchantId', async (c) => {
  const merchantId = c.req.param('merchantId');
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  const supabase = getSupabaseAdmin(c.env);
  const { data: settings } = await supabase
    .from('merchant_settings')
    .select('bank_parser_id')
    .eq('merchant_id', merchantId)
    .single();
  const parserId = settings?.bank_parser_id ?? '00000000-0000-4000-8000-000000000001';
  let normalized;
  try {
    normalized = parseBankPayload(parserId, body);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Parse failed' }, 400);
  }
  const { data: bankConfig } = await supabase
    .from('bank_configs')
    .select('id')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .limit(1)
    .single();
  const bankTxId = await ingestBankTransaction(supabase, {
    merchantId,
    bankConfigId: bankConfig?.id ?? null,
    normalized,
    rawPayload: body,
  });
  await runMatchingForBankTransaction(supabase, {
    merchantId,
    bankTransactionId: bankTxId,
    amount: normalized.amount,
    senderName: normalized.sender_name,
    datetime: normalized.datetime,
    referenceCode: normalized.reference_code,
  });
  return c.json({ ok: true, bankTransactionId: bankTxId });
});

export default app;
