# ArmAI Consistency Checklist

Use this to verify schema, code, types, UI, and docs stay aligned.

## Tables and code

- [ ] `profiles` — used in auth middleware and RLS; `role` enum matches `ROLE` in shared.
- [ ] `merchants`, `merchant_members`, `merchant_settings` — match shared types and API routes.
- [ ] `facebook_pages`, `webhook_events`, `conversations`, `message_buffers`, `messages` — match Facebook webhook service and SQL.
- [ ] `orders`, `order_slips` — status enum matches `ORDER_STATUS` in shared; slip extraction does not set paid.
- [ ] `bank_configs`, `bank_transactions`, `matching_results` — match bank webhook and matching service; matching status matches `MATCHING_RESULT_STATUS`.
- [ ] `ai_logs`, `audit_logs`, `support_access_logs`, `merchant_plans` — match support and audit services.
- [ ] `product_categories`, `products`, `product_variants`, `product_keywords`, `product_images` — catalog services and RLS.
- [ ] `merchant_faqs`, `merchant_promotions`, `merchant_knowledge_entries` — knowledge services and RLS.
- [ ] `merchant_payment_accounts`, `merchant_payment_account_rules` — payment-accounts services and RLS.
- [ ] `order_items`, `order_payment_targets` — order-draft and matching; orders.conversation_id for chat drafts.

## Enums

- [ ] `order_status` (SQL) = `ORDER_STATUS` (shared constants).
- [ ] `matching_result_status` (SQL) = `MATCHING_RESULT_STATUS` (shared).
- [ ] `app_role` (SQL) = `ROLE` (shared).

## Routes and frontend

- [ ] `/api/auth/me` — used by frontend AuthContext and API client.
- [ ] `/api/super/dashboard`, `/api/super/merchants`, POST `/api/super/merchants` — SuperDashboard, SuperMerchants.
- [ ] `/api/support/start`, `/api/support/merchants/:merchantId/orders` — SuperSupport.
- [ ] `/api/merchant/dashboard`, `/api/merchant/orders`, `/api/merchant/bank-sync` — MerchantDashboard, MerchantOrders, MerchantBankSync.
- [ ] `/api/merchant/products`, `/api/merchant/categories`, `/api/merchant/knowledge/*`, `/api/merchant/promotions`, `/api/merchant/payment-accounts` — Products, Categories, Knowledge, Promotions, PaymentAccounts pages.
- [ ] `/api/merchant/ai/context` POST — AI context builder (structured context from DB).
- [ ] `/api/orders/draft` POST — draft order with payment target assignment.
- [ ] `/api/settings` GET/PATCH — MerchantSettings.
- [ ] `/api/orders/confirm-match` — confirm match from merchant (when implemented in UI).
- [ ] `/api/webhooks/facebook`, `/api/webhooks/bank/:merchantId` — webhook handlers.

## RLS and tenant model

- [ ] Merchant_admin can only read/write rows where `user_can_access_merchant(merchant_id)`.
- [ ] Super_admin allowed only where policies explicitly allow (merchants, audit, support).
- [ ] Support mode is read-only; no insert/update policies that allow merchant data mutation from support routes; audit via support_access_logs.

## Security

- [ ] No service role key in browser or frontend bundle.
- [ ] No critical flow depends solely on in-memory cache; DB is source of truth.
- [ ] AI extraction does not directly set order to paid; only confirm-match + business rule.
- [ ] Matching is score-based; outcome enum used in DB and shared; account-aware scoring uses expected_account_number from order_payment_targets.
- [ ] No merchant-specific products, prices, or payment accounts hardcoded; AI uses only DB-retrieved context.

## Tests

- [ ] Parser tests reference real parser ID and schema from shared.
- [ ] Matching tests use `computeMatchScore` and `classifyMatchOutcome` from shared.
- [ ] Tenant tests align with RLS semantics (super_admin vs merchant_admin, merchant list).
- [ ] Payment account selection test (primary / first active).
- [ ] Price resolution test (base, sale, variant override).
- [ ] Account-aware matching score test (receiver_account vs expected).
