# ArmAI Consistency Checklist

Use this to verify schema, code, types, UI, and docs stay aligned.

## Tables and code

- [ ] `profiles` — used in auth middleware and RLS; `role` enum matches `ROLE` in shared.
- [ ] `merchants`, `merchant_members`, `merchant_settings` — match shared types and API routes.
- [ ] `facebook_pages`, `webhook_events`, `conversations`, `message_buffers`, `messages` — match Facebook webhook service and SQL.
- [ ] `orders`, `order_slips` — status enum matches `ORDER_STATUS` in shared; slip extraction does not set paid.
- [ ] `bank_configs`, `bank_transactions`, `matching_results` — match bank webhook and matching service; matching status matches `MATCHING_RESULT_STATUS`.
- [ ] `ai_logs`, `audit_logs`, `support_access_logs`, `merchant_plans` — match support and audit services.

## Enums

- [ ] `order_status` (SQL) = `ORDER_STATUS` (shared constants).
- [ ] `matching_result_status` (SQL) = `MATCHING_RESULT_STATUS` (shared).
- [ ] `app_role` (SQL) = `ROLE` (shared).

## Routes and frontend

- [ ] `/api/auth/me` — used by frontend AuthContext and API client.
- [ ] `/api/super/dashboard`, `/api/super/merchants`, POST `/api/super/merchants` — SuperDashboard, SuperMerchants.
- [ ] `/api/support/start`, `/api/support/merchants/:merchantId/orders` — SuperSupport.
- [ ] `/api/merchant/dashboard`, `/api/merchant/orders`, `/api/merchant/bank-sync` — MerchantDashboard, MerchantOrders, MerchantBankSync.
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
- [ ] Matching is score-based; outcome enum used in DB and shared.

## Tests

- [ ] Parser tests reference real parser ID and schema from shared.
- [ ] Matching tests use `computeMatchScore` and `classifyMatchOutcome` from shared.
- [ ] Tenant tests align with RLS semantics (super_admin vs merchant_admin, merchant list).
