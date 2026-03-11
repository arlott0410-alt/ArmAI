import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import {
  resolvePageToMerchant,
  storeWebhookEvent,
  getOrCreateConversation,
  bufferIncomingMessage,
} from '../../services/facebook-webhook.js';
import { facebookWebhookQuerySchema, facebookWebhookBodySchema } from '@armai/shared';

const app = new Hono<{ Bindings: Env }>();

function verifySignature(body: string, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = 'sha256=' + await hmacSha256(secret, body);
  return signature === expected;
}

async function hmacSha256(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

app.get('/', async (c) => {
  const query = Object.fromEntries(c.req.raw.url.split('?')[1]?.split('&').map((p) => p.split('=')) ?? []) as Record<string, string>;
  const parsed = facebookWebhookQuerySchema.safeParse({
    'hub.mode': query['hub.mode'],
    'hub.verify_token': query['hub.verify_token'],
    'hub.challenge': query['hub.challenge'],
  });
  if (!parsed.success) {
    return c.text('Bad request', 400);
  }
  if (parsed.data['hub.mode'] === 'subscribe') {
    const expectedToken = c.env.FACEBOOK_VERIFY_TOKEN;
    if (expectedToken && parsed.data['hub.verify_token'] !== expectedToken) {
      return c.text('Forbidden', 403);
    }
    return c.text(parsed.data['hub.challenge'] ?? '');
  }
  return c.text('OK');
});

app.post('/', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('x-hub-signature-256');
  const secret = c.env.FACEBOOK_APP_SECRET;
  if (secret && !verifySignature(rawBody, signature, secret)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }
  const body = facebookWebhookBodySchema.safeParse(JSON.parse(rawBody));
  if (!body.success) {
    return c.json({ error: 'Invalid payload' }, 400);
  }
  const supabase = getSupabaseAdmin(c.env);
  const entries = body.data.entry ?? [];
  for (const entry of entries) {
    const pageId = entry.id;
    const merchantId = await resolvePageToMerchant(supabase, pageId);
    await storeWebhookEvent(supabase, {
      merchantId,
      kind: 'facebook_incoming',
      externalId: null,
      rawPayload: body.data,
    });
    const messaging = entry.messaging ?? [];
    for (const msg of messaging) {
      const senderId = msg.sender?.id;
      if (!senderId) continue;
      if (!merchantId) continue;
      const conversationId = await getOrCreateConversation(supabase, merchantId, pageId, senderId);
      const text = msg.message?.text ?? null;
      const mid = msg.message?.mid ?? null;
      const attachments = msg.message?.attachments ?? null;
      await bufferIncomingMessage(supabase, {
        merchantId,
        conversationId,
        rawMid: mid,
        rawText: text,
        rawAttachments: attachments,
      });
    }
  }
  return c.json({ ok: true });
});

export default app;
