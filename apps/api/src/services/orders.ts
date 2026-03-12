import type { SupabaseClient } from '@supabase/supabase-js';
import { ORDER_STATUS, MATCHING_RESULT_STATUS, PAYMENT_STATUS, FULFILLMENT_STATUS } from '@armai/shared';

export async function listOrders(
  supabase: SupabaseClient,
  merchantId: string,
  opts: { status?: string; fulfillment_status?: string; limit?: number } = {}
) {
  let q = supabase
    .from('orders')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });
  if (opts.status) q = q.eq('status', opts.status);
  if (opts.fulfillment_status) q = q.eq('fulfillment_status', opts.fulfillment_status);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrder(supabase: SupabaseClient, merchantId: string, orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('merchant_id', merchantId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Confirm or reject a matching result. Only confirmed + business rule leads to paid.
 */
export async function confirmMatch(
  supabase: SupabaseClient,
  merchantId: string,
  matchingResultId: string,
  confirm: boolean
) {
  const { data: mr, error: fetchErr } = await supabase
    .from('matching_results')
    .select('id, order_id, status')
    .eq('id', matchingResultId)
    .eq('merchant_id', merchantId)
    .single();
  if (fetchErr || !mr) throw new Error('Matching result not found');
  const newStatus = confirm ? ('confirmed' as const) : ('rejected' as const);
  const { error: updateMrErr } = await supabase
    .from('matching_results')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', matchingResultId);
  if (updateMrErr) throw new Error(updateMrErr.message);
  if (confirm) {
    const { data: orderRow } = await supabase
      .from('orders')
      .select('fulfillment_status')
      .eq('id', mr.order_id)
      .eq('merchant_id', merchantId)
      .single();
    const fulfillmentStatus = orderRow?.fulfillment_status == null ? FULFILLMENT_STATUS.PENDING_FULFILLMENT : undefined;
    await supabase
      .from('orders')
      .update({
        status: ORDER_STATUS.PAID,
        payment_status: PAYMENT_STATUS.PAID,
        ...(fulfillmentStatus && { fulfillment_status: fulfillmentStatus }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', mr.order_id)
      .eq('merchant_id', merchantId);
  }
  return { success: true, orderId: mr.order_id };
}
