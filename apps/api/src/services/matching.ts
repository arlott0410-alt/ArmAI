import type { SupabaseClient } from '@supabase/supabase-js';
import { computeMatchScore, classifyMatchOutcome } from '@armai/shared';
import type { SlipExtraction } from '@armai/shared';
import type { BankTransactionNormalized } from '@armai/shared';
import { ORDER_STATUS } from '@armai/shared';

/** Only match against orders in these statuses (not yet paid). */
const ELIGIBLE_ORDER_STATUSES = ['pending', 'slip_uploaded', 'slip_extracted', 'bank_pending_match', 'probable_match'] as const;
/** Match only against orders created in the last N days. */
const MATCHING_ORDER_WINDOW_DAYS = 90;
const MAX_ELIGIBLE_ORDERS = 500;

/**
 * Run matching for one bank transaction against order candidates (with slip extracted).
 * Only scoped transactions should call this. Candidates are narrowed to eligible orders (recent, unpaid).
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
    detectedAccountNumber?: string | null;
  }
) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MATCHING_ORDER_WINDOW_DAYS);
  const cutoffIso = cutoff.toISOString();

  const { data: eligibleOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('merchant_id', payload.merchantId)
    .in('status', [...ELIGIBLE_ORDER_STATUSES])
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: false })
    .limit(MAX_ELIGIBLE_ORDERS);
  const orderIds = (eligibleOrders ?? []).map((o: { id: string }) => o.id);
  if (!orderIds.length) return;

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
      extraction_raw_json,
      detected_receiver_account,
      detected_receiver_bank,
      detected_receiver_name
    `)
    .eq('merchant_id', payload.merchantId)
    .in('order_id', orderIds)
    .not('extraction_amount', 'is', null);
  if (!candidates?.length) return;

  const bankNormExtended = {
    amount: payload.amount,
    sender_name: payload.senderName,
    datetime: payload.datetime,
    reference_code: payload.referenceCode,
    bank_tx_id: null,
    raw_parser_id: '',
    detected_account_number: payload.detectedAccountNumber ?? null,
    expected_account_number: null as string | null,
  };

  for (const slip of candidates) {
    const { data: orderRow } = await supabase
      .from('orders')
      .select('payment_method')
      .eq('id', slip.order_id)
      .eq('merchant_id', payload.merchantId)
      .single();
    if (!orderRow || orderRow.payment_method === 'cod') continue;
    const { data: target } = await supabase
      .from('order_payment_targets')
      .select('payment_account_id')
      .eq('order_id', slip.order_id)
      .eq('merchant_id', payload.merchantId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (!target) continue;
    let expectedAccount: string | null = null;
    let paymentAccountId: string | null = null;
    if (target?.payment_account_id) {
      paymentAccountId = target.payment_account_id;
      const { data: acc } = await supabase
        .from('merchant_payment_accounts')
        .select('account_number')
        .eq('id', target.payment_account_id)
        .eq('merchant_id', payload.merchantId)
        .single();
      expectedAccount = acc?.account_number ?? null;
    }
    bankNormExtended.expected_account_number = expectedAccount;
    const extraction: SlipExtraction = {
      amount: slip.extraction_amount != null ? Number(slip.extraction_amount) : null,
      sender_name: slip.extraction_sender_name ?? null,
      datetime: slip.extraction_datetime ?? null,
      reference_code: slip.extraction_reference_code ?? null,
      confidence_score: Number(slip.extraction_confidence ?? 0),
      raw_json: slip.extraction_raw_json ?? '{}',
      receiver_account: slip.detected_receiver_account ?? undefined,
      receiver_bank: slip.detected_receiver_bank ?? undefined,
      receiver_name: slip.detected_receiver_name ?? undefined,
    };
    const factors = computeMatchScore(extraction, bankNormExtended as BankTransactionNormalized & { detected_account_number?: string | null; expected_account_number?: string | null });
    const outcome = classifyMatchOutcome(factors.totalScore);
    await supabase.from('matching_results').upsert(
      {
        merchant_id: payload.merchantId,
        order_id: slip.order_id,
        bank_transaction_id: payload.bankTransactionId,
        status: outcome,
        score: factors.totalScore,
        score_factors: factors,
        matched_payment_account_id: paymentAccountId,
        scoring_breakdown_json: factors,
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
