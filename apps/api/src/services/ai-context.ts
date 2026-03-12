import type { SupabaseClient } from '@supabase/supabase-js';
import * as catalog from './catalog.js';
import * as knowledge from './knowledge.js';
import * as orderDraft from './order-draft.js';
import * as codSettings from './cod-settings.js';

const PLATFORM_SYSTEM_PROMPT = `You are a merchant chatbot. Rules:
- Never invent products, prices, payment accounts, or QR codes. Use only the structured context provided.
- If information is not in the context, say it is unavailable. Do not guess.
- Do not leak data across merchants. Answer only from this merchant's context.
- Do not mark payment as completed. Only the system can confirm payment after verification.
- Be helpful and concise.`;

export interface AiContextInput {
  merchantId: string;
  merchantPrompt?: string | null;
  conversationId?: string | null;
  orderId?: string | null;
  customerMessage?: string;
}

export interface BuiltContext {
  systemPrompt: string;
  structuredContext: {
    products: unknown[];
    categories: unknown[];
    faqs: unknown[];
    promotions: unknown[];
    knowledgeEntries: unknown[];
    currentOrderSummary: string | null;
    paymentTargetForOrder: unknown | null;
    codSettings: unknown | null;
  };
}

/**
 * Build AI runtime context from DB for one merchant. No hardcoded products/prices/accounts.
 */
export async function buildAiContext(supabase: SupabaseClient, input: AiContextInput): Promise<BuiltContext> {
  const { merchantId, merchantPrompt, conversationId, orderId } = input;
  const [products, categories, faqs, promotions, knowledgeEntries, codSettingsRow] = await Promise.all([
    catalog.listProducts(supabase, merchantId, { status: 'active', aiVisibleOnly: true }),
    catalog.listCategories(supabase, merchantId, true),
    knowledge.listFaqs(supabase, merchantId, true),
    knowledge.listPromotions(supabase, merchantId, true),
    knowledge.listKnowledgeEntries(supabase, merchantId, { activeOnly: true }),
    codSettings.getMerchantCodSettings(supabase, merchantId),
  ]);
  let currentOrderSummary: string | null = null;
  let paymentTargetForOrder: unknown = null;
  if (orderId) {
    const target = await orderDraft.getOrderPaymentTarget(supabase, merchantId, orderId);
    paymentTargetForOrder = target;
    const { data: order } = await supabase.from('orders').select('id, status, amount').eq('id', orderId).eq('merchant_id', merchantId).single();
    if (order) {
      const { data: orderItems } = await supabase.from('order_items').select('product_name_snapshot, quantity, unit_price, total_price').eq('order_id', orderId);
      const lines = (orderItems ?? []).map((i) => `${i.product_name_snapshot} x${i.quantity} = ${i.total_price}`).join('; ');
      currentOrderSummary = `Order ${order.id} (${order.status}): ${order.amount} total. Items: ${lines}`;
    }
  } else if (conversationId) {
    const { data: recentOrder } = await supabase
      .from('orders')
      .select('id, status, amount')
      .eq('merchant_id', merchantId)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (recentOrder) {
      const target = await orderDraft.getOrderPaymentTarget(supabase, merchantId, recentOrder.id);
      paymentTargetForOrder = target;
      currentOrderSummary = `Latest order: ${recentOrder.id} (${recentOrder.status}), amount ${recentOrder.amount}.`;
    }
  }
  const merchantSection = merchantPrompt ? `\n\nMerchant instructions:\n${merchantPrompt}` : '';
  const systemPrompt = PLATFORM_SYSTEM_PROMPT + merchantSection;
  return {
    systemPrompt,
    structuredContext: {
      products,
      categories,
      faqs,
      promotions,
      knowledgeEntries,
      currentOrderSummary,
      paymentTargetForOrder,
      codSettings: codSettingsRow ? {
        enable_cod: codSettingsRow.enable_cod,
        cod_min_order_amount: codSettingsRow.cod_min_order_amount,
        cod_max_order_amount: codSettingsRow.cod_max_order_amount,
        cod_fee_amount: codSettingsRow.cod_fee_amount,
        require_phone_for_cod: codSettingsRow.require_phone_for_cod,
        require_full_address_for_cod: codSettingsRow.require_full_address_for_cod,
        cod_requires_manual_confirmation: codSettingsRow.cod_requires_manual_confirmation,
        cod_notes_for_ai: codSettingsRow.cod_notes_for_ai,
      } : null,
    },
  };
}
