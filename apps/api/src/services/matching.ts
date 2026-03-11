import type { SupabaseClient } from '@supabase/supabase-js';
import { computeMatchScore, classifyMatchOutcome } from '@armai/shared';
import type { SlipExtraction } from '@armai/shared';
import type { BankTransactionNormalized } from '@armai/shared';
import { ORDER_STATUS } from '@armai/shared';

/**
 * Run matching for one bank transaction against order candidates (with slip extracted).
 * Inserts matching_results with score and status. Does NOT set order to paid.
 */
export async function runMatchingForBankTransaction(
  supabase: SupabaseClient,
  payload: {
    merchantId: string;
    bankTransactionId: string;
    amount: number;
    senderName: string | null;
    datetime: string;
    referenceCode: string | null;
  }
) {
  const { data: candidates } = await supabase
    .from('order_slips')
    .select(`
      id,
      order_id,
      extraction_amount,
      extraction_sender_name,
      extraction_datetime,
      extraction_reference_code,
      extraction_confidence,
      extraction_raw_json
    `)
    .eq('merchant_id', payload.merchantId)
    .not('extraction_amount', 'is', null);
  if (!candidates?.length) return;

  const bankNorm: BankTransactionNormalized = {
    amount: payload.amount,
    sender_name: payload.senderName,
    datetime: payload.datetime,
    reference_code: payload.referenceCode,
    bank_tx_id: null,
    raw_parser_id: '',
  };

  for (const slip of candidates) {
    const extraction: SlipExtraction = {
      amount: slip.extraction_amount != null ? Number(slip.extraction_amount) : null,
      sender_name: slip.extraction_sender_name ?? null,
      datetime: slip.extraction_datetime ?? null,
      reference_code: slip.extraction_reference_code ?? null,
      confidence_score: Number(slip.extraction_confidence ?? 0),
      raw_json: slip.extraction_raw_json ?? '{}',
    };
    const factors = computeMatchScore(extraction, bankNorm);
    const outcome = classifyMatchOutcome(factors.totalScore);
    await supabase.from('matching_results').upsert(
      {
        merchant_id: payload.merchantId,
        order_id: slip.order_id,
        bank_transaction_id: payload.bankTransactionId,
        status: outcome,
        score: factors.totalScore,
        score_factors: factors,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'order_id,bank_transaction_id' }
    );
    const orderStatus =
      outcome === 'auto_matched' ? ORDER_STATUS.PROBABLE_MATCH : outcome === 'probable_match' ? ORDER_STATUS.PROBABLE_MATCH : ORDER_STATUS.BANK_PENDING_MATCH;
    await supabase
      .from('orders')
      .update({ status: orderStatus, updated_at: new Date().toISOString() })
      .eq('id', slip.order_id)
      .eq('merchant_id', payload.merchantId);
  }
}
