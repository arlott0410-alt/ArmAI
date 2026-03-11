# ArmAI Commerce Extension

This document describes the additive commerce knowledge layer. It does not replace or break the existing core flow.

## Purpose

- Let the AI know **only** from database: which products each merchant sells, prices, payment accounts, FAQs, promotions, and knowledge entries.
- No hardcoded products, prices, or bank accounts in code or prompts.
- Payment target assignment is deterministic and auditable (`order_payment_targets`).
- Slip verification and bank matching can use expected payment account (receiver account check).

## New domains

1. **Product catalog** — product_categories, products, product_variants, product_keywords (and optional product_images). Merchant manages from UI; AI retrieves active, ai_visible products.
2. **Knowledge base** — merchant_faqs, merchant_promotions, merchant_knowledge_entries. AI uses as retrieval context.
3. **Payment accounts** — merchant_payment_accounts, merchant_payment_account_rules. AI sends only from these; selection uses primary or first active (rules extensible later).
4. **Order payment targets** — order_payment_targets record which account was assigned to each order; slip verification and matching compare against this.
5. **Order items** — order_items store line items with product/variant snapshot and price.
6. **Draft orders** — POST `/api/orders/draft` creates order + items + payment target; conversation_id links chat-origin drafts.

## AI context builder

- `buildAiContext(merchantId, …)` assembles: platform system prompt (no guessing, no cross-tenant leak), merchant prompt from settings, and **retrieved** products, categories, faqs, promotions, knowledge entries, current order summary, and payment target for the order/conversation.
- AI must answer only from this structured context; if data is missing, say unavailable.

## Account-aware slip and matching

- Slip extraction (Gemini) can return receiver_account, receiver_bank, receiver_name when visible; stored on order_slips as detected_receiver_*.
- Matching score includes receiverAccountScore when expected account is set (from order_payment_targets); improves confidence when slip receiver matches assigned account.
- Existing amount/time/sender/reference scoring is preserved; receiver is an additional factor.

## SQL files (additive)

- 011–013: catalog, knowledge, payment account tables.
- 014: order_items, order_payment_targets; orders.conversation_id.
- 015: alter order_slips, bank_transactions, matching_results for new columns.
- 016–018: indexes, RLS enable, policies.

## Integration with existing flow

- Facebook message → resolve merchant → **retrieve products/knowledge** → (optional) detect intent, create/update draft order, assign payment target → AI response with correct account/QR from DB → customer may upload slip → slip extraction (with receiver fields) → bank webhook → **account-aware matching** → order status progression unchanged; only safe business rules set paid.
