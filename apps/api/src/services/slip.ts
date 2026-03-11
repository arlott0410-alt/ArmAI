import type { SupabaseClient } from '@supabase/supabase-js';
import type { SlipExtraction } from '@armai/shared';
import { ORDER_STATUS } from '@armai/shared';

/**
 * Save slip extraction to order_slips and set order status to slip_extracted (staged; not paid).
 */
export async function saveSlipExtraction(
  supabase: SupabaseClient,
  payload: {
    merchantId: string;
    orderId: string;
    r2Key: string | null;
    extraction: SlipExtraction;
  }
) {
  const { error: slipErr } = await supabase.from('order_slips').insert({
    merchant_id: payload.merchantId,
    order_id: payload.orderId,
    r2_key: payload.r2Key,
    extraction_amount: payload.extraction.amount,
    extraction_sender_name: payload.extraction.sender_name,
    extraction_datetime: payload.extraction.datetime,
    extraction_reference_code: payload.extraction.reference_code,
    extraction_confidence: payload.extraction.confidence_score,
    extraction_raw_json: payload.extraction.raw_json,
  });
  if (slipErr) throw new Error(slipErr.message);
  await supabase
    .from('orders')
    .update({ status: ORDER_STATUS.SLIP_EXTRACTED, updated_at: new Date().toISOString() })
    .eq('id', payload.orderId)
    .eq('merchant_id', payload.merchantId);
}
