import type { SupabaseClient } from '@supabase/supabase-js'
import { facebookWebhookQuerySchema, facebookWebhookBodySchema } from '@armai/shared'

export type FacebookWebhookQuery = ReturnType<typeof facebookWebhookQuerySchema.parse>
export type FacebookWebhookBody = ReturnType<typeof facebookWebhookBodySchema.parse>

/**
 * Resolve page_id to merchant_id. Returns null if not found.
 */
export async function resolvePageToMerchant(
  supabase: SupabaseClient,
  pageId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('facebook_pages')
    .select('merchant_id')
    .eq('page_id', pageId)
    .single()
  return data?.merchant_id ?? null
}

/**
 * Store raw webhook event for idempotency and audit.
 */
export async function storeWebhookEvent(
  supabase: SupabaseClient,
  payload: {
    merchantId: string | null
    kind: 'facebook_incoming' | 'facebook_verification'
    externalId: string | null
    rawPayload: unknown
  }
) {
  const { error } = await supabase.from('webhook_events').insert({
    merchant_id: payload.merchantId,
    kind: payload.kind,
    external_id: payload.externalId,
    raw_payload: payload.rawPayload as Record<string, unknown>,
  })
  if (error) throw new Error(error.message)
}

/**
 * Get or create conversation for merchant + page + customer_psid.
 */
export async function getOrCreateConversation(
  supabase: SupabaseClient,
  merchantId: string,
  pageId: string,
  customerPsid: string
) {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('merchant_id', merchantId)
    .eq('page_id', pageId)
    .eq('customer_psid', customerPsid)
    .single()
  if (existing) return existing.id
  const { data: inserted, error } = await supabase
    .from('conversations')
    .insert({ merchant_id: merchantId, page_id: pageId, customer_psid: customerPsid })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return inserted!.id
}

/**
 * Insert into message_buffers for debounce. Caller is responsible for flush logic.
 */
export async function bufferIncomingMessage(
  supabase: SupabaseClient,
  payload: {
    merchantId: string
    conversationId: string
    rawMid: string | null
    rawText: string | null
    rawAttachments: unknown
  }
) {
  const { error } = await supabase.from('message_buffers').insert({
    merchant_id: payload.merchantId,
    conversation_id: payload.conversationId,
    raw_mid: payload.rawMid,
    raw_text: payload.rawText,
    raw_attachments: payload.rawAttachments as Record<string, unknown>[] | null,
  })
  if (error) throw new Error(error.message)
}
