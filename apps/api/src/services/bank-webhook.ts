import type { SupabaseClient } from '@supabase/supabase-js'
import { genericBankParser } from '@armai/shared'
import type { BankParser } from '@armai/shared'
import type { NormalizedTransaction } from '@armai/shared'

const PARSER_REGISTRY: Record<string, BankParser> = {
  [genericBankParser.id]: genericBankParser,
}

export function getParser(parserId: string): BankParser | null {
  return PARSER_REGISTRY[parserId] ?? null
}

/**
 * Parse raw payload with merchant's configured parser. Returns normalized transaction or throws.
 */
export function parseBankPayload(parserId: string, payload: unknown): NormalizedTransaction {
  const parser = getParser(parserId)
  if (!parser) throw new Error(`Unknown parser: ${parserId}`)
  return parser.parse(payload)
}

/**
 * Store raw webhook event then insert bank_transaction. Idempotency by external_id if provided.
 */
export async function ingestBankTransaction(
  supabase: SupabaseClient,
  payload: {
    merchantId: string
    bankConfigId: string | null
    normalized: NormalizedTransaction
    rawPayload: unknown
  }
) {
  const { error: eventErr } = await supabase.from('webhook_events').insert({
    merchant_id: payload.merchantId,
    kind: 'bank_incoming',
    external_id: payload.normalized.bank_tx_id ?? undefined,
    raw_payload: payload.rawPayload as Record<string, unknown>,
    processed_at: new Date().toISOString(),
  })
  if (eventErr) throw new Error(eventErr.message)
  const { data: tx, error: txErr } = await supabase
    .from('bank_transactions')
    .insert({
      merchant_id: payload.merchantId,
      bank_config_id: payload.bankConfigId,
      amount: payload.normalized.amount,
      sender_name: payload.normalized.sender_name,
      transaction_at: payload.normalized.datetime,
      reference_code: payload.normalized.reference_code,
      bank_tx_id: payload.normalized.bank_tx_id,
      raw_parser_id: payload.normalized.raw_parser_id,
      raw_payload: payload.rawPayload as Record<string, unknown>,
    })
    .select('id')
    .single()
  if (txErr) throw new Error(txErr.message)
  return tx!.id
}
