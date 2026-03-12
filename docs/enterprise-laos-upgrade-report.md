# Enterprise Laos Upgrade Report (Final)

This report describes the in-place refactor that upgrades ArmAI into a more enterprise-grade SaaS platform that is **truly Laos-ready** while preserving the existing stack (Cloudflare Workers + Hono + Supabase + packages/shared) and strict multi-tenant isolation.

---

## What changed

### Laos currency + merchant defaults (LAK-first)
- Added merchant-level defaults: `merchants.default_country` and `merchants.default_currency` (078).
- Centralized currency logic in `@armai/shared`:
  - `getDefaultCurrencyForCountry()`, `getMerchantDefaultCurrency()`, `formatMoney()`, `parseMoneyInput()`
  - Supported currencies: LAK, THB, USD
- API now derives defaults from merchant country/currency for:
  - product creation
  - payment account creation
  - billing events
  - super merchant provisioning and plan currency
- Web pages (Products / Payment Accounts) use merchant defaults for currency fields.

### Phone normalization (Laos +856 / 020)
- Added `@armai/shared` phone normalization:
  - `normalizePhoneByCountry()` supports Laos (+856 and local 020 → canonical 856…)
  - generic fallback preserved
- API customer identity uses `normalizePhoneForMerchant()` so WhatsApp + manual customer edits do not create duplicates.

### Lao-language visible UI (real i18n layer)
- Added lightweight typed i18n layer in `apps/web` (no heavy frameworks):
  - `I18nProvider`, typed translation keys, dictionaries for `lo`, `th`, `en`
  - merchant locale derived from `merchant.default_country` (`LA` → `lo`, `TH` → `th`)
- Migrated key visible UI surfaces:
  - Merchant sidebar navigation (Lao/Thai/English)
  - Merchant Dashboard KPIs + setup readiness text (Lao/Thai/English)

### Performance & query fan-out reductions
- Moved readiness and summary aggregation into SQL RPCs / views (080) to reduce DB round-trips and avoid “load entire table then count in JS”.
- Merchant readiness now uses **one RPC** instead of 8 separate count queries.
- Merchant summary refresh now uses **one RPC** instead of multiple queries + in-app reductions.
- Super dashboard “setup health” and “expanded merchant list” now use SQL aggregation views instead of selecting *all* product/payment rows into the Worker.

### Safer currency defaults (SQL)
- Backfilled NULL currency fields from merchant defaults and dropped THB column defaults for tables where merchant-driven behavior is required (079).

---

## Why it changed
- **Laos readiness:** LAK and +856/020 must be first-class and consistent to avoid duplicated customers and incorrect currency UX.
- **Enterprise correctness:** currency/locale must be tenant-derived, not hardcoded THB-first.
- **Performance:** dashboards must not pull entire tables just to compute counts; RPC/views reduce Supabase reads and Worker time.
- **Maintainability:** shared helpers + typed i18n improves extensibility and Cursor-assisted development safety.

---

## Major files touched

### Shared
- `packages/shared/src/currency.ts`
- `packages/shared/src/phone.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types.ts`
- `packages/shared/src/schemas/merchant.ts`
- `packages/shared/src/currency.test.ts`
- `packages/shared/src/phone.test.ts`

### API
- `apps/api/src/services/catalog.ts`
- `apps/api/src/services/payment-accounts.ts`
- `apps/api/src/services/billing.ts`
- `apps/api/src/services/order-detail.ts`
- `apps/api/src/services/customer-identity.ts`
- `apps/api/src/services/conversation-router.ts`
- `apps/api/src/services/merchant-dashboard.ts` (readiness RPC)
- `apps/api/src/services/summary-update.ts` (summary refresh RPC)
- `apps/api/src/services/super-dashboard.ts` (views for counts)
- `apps/api/src/routes/merchant/index.ts` (dashboard includes merchant)
- `apps/api/src/routes/super/index.ts` (merchant create plan currency derived)

### Web
- `apps/web/src/i18n/*` (new)
- `apps/web/src/main.tsx` (wrap with I18nProvider)
- `apps/web/src/layouts/MerchantLayout.tsx` (locale derived from merchant, translated nav)
- `apps/web/src/pages/merchant/MerchantDashboard.tsx` (translated titles/KPIs)

---

## Migrations added
- `sql/078_merchant_defaults.sql` — add `default_country`, `default_currency` to `merchants` + backfill TH/THB for legacy.
- `sql/079_currency_defaults_cleanup.sql` — backfill NULL currencies from merchant defaults; drop THB column defaults for currency columns.
- `sql/080_dashboard_rpc_optimizations.sql` — aggregation views + RPCs to reduce dashboard subrequests.

---

## Localization added
- `lo`, `th`, `en` dictionaries in `apps/web/src/i18n/locales.ts`
- locale derived from merchant default country (LA → lo, TH → th) and persisted in localStorage
- translated surfaces: Merchant sidebar + Merchant Dashboard (visible Lao UI)

---

## Performance/query improvements added
- `merchant_readiness_counts` RPC (single call for readiness counts)
- `refresh_merchant_dashboard_summary` RPC (single call for summary upsert)
- aggregation views for super dashboard / super merchant list counts:
  - `v_products_count_by_merchant`
  - `v_payment_accounts_count_by_merchant`
  - `v_facebook_pages_count_by_merchant`
  - `v_has_ai_prompt_by_merchant`

---

## UI system improvements added
- Lightweight typed i18n foundation (no heavy dependency)
- Existing UI primitives retained; new primitives remain available for incremental rollout.

---

## Remaining recommended future work (short)
- Expand i18n coverage across remaining merchant pages (Orders, Order Detail, Products, Payment Accounts, Customers, Settings, Telegram, Bank Sync) and core super pages.
- Add explicit merchant UI locale override (e.g. `merchant_settings.ui_locale`) if needed.
- Move additional dashboard computations (billing health, recent activity grouping) into SQL where beneficial.
- Fix unrelated pre-existing shared tests (`matching/score.test.ts`, `parsers/generic.test.ts`) in a separate pass.

# Enterprise Laos Upgrade — Implementation Report

This document summarizes the in-place refactor applied to make the ArmAI platform enterprise-ready for Laos merchants while preserving the existing architecture (Cloudflare Workers + Hono + Supabase + shared package) and multi-tenant safety.

---

## 1. What Was Changed

### Currency and money model
- **Merchant-level defaults:** Added `default_country` (ISO 3166-1 alpha-2) and `default_currency` (ISO 4217) on `merchants`. New merchants can be created with `LA`/`LAK` for Laos; existing rows backfilled to `TH`/`THB`.
- **Shared currency module:** New `packages/shared/src/currency.ts` with `getDefaultCurrencyForCountry`, `getMerchantDefaultCurrency`, `formatMoney`, `parseMoneyInput`, `FALLBACK_CURRENCY`, `SUPPORTED_CURRENCIES` (LAK, THB, USD).
- **API:** Product creation, payment account creation, billing event creation, and super-admin merchant/plan creation now resolve currency from merchant defaults (or payment account for order payment targets) instead of hardcoded `THB`. Order-detail switch-to-prepaid uses the selected payment account’s currency for `expected_currency`.
- **Web:** Merchant dashboard response now includes `merchant` (with `default_currency` / `default_country`). Products and Payment Accounts pages use dashboard merchant to set form default currency (LAK for Laos merchants, THB otherwise).

### Laos phone normalization
- **Shared phone module:** New `packages/shared/src/phone.ts` with `normalizePhoneByCountry(phone, countryCode)` supporting Laos (+856, local 020 → canonical 856…), Thailand (66/0), and generic fallback. `normalizePhone` retained for backward compatibility.
- **API customer-identity:** New `normalizePhoneForMerchant(supabase, merchantId, phone)` uses merchant’s `default_country` for country-aware normalization. `getOrCreateChannelIdentity` and `createMerchantCustomer` use it; PATCH customer and WhatsApp webhook auto-link use it so duplicate identities from format variations (e.g. 020 vs +856) are avoided.

### Laos language / routing
- **Conversation router:** Greeting patterns extended with Lao: `sabaidee`, `ສະບາຍດີ`, `ສະບາຍ` so Lao-language greetings are routed to template response.

### Enterprise UI foundation
- **Theme:** Added `spacing` and `typography` design tokens in `apps/web/src/theme.ts` for consistent layout and hierarchy.
- **New components:** `FormSection`, `FieldHint`, `DataTableShell` in `apps/web/src/components/ui` for form grouping, field help text, and table toolbar/loading/empty states. Exported from `components/ui/index.ts`.

### Developer / shared
- **Merchant type and schema:** `Merchant` in `types.ts` now includes `default_country` and `default_currency`. `createMerchantBodySchema` extended with optional `default_country`, `default_currency`; password error message made language-neutral.
- **Shared exports:** `currency` and `phone` modules exported from `packages/shared`; `phone` uses `COUNTRY_LA`/`COUNTRY_TH` from `currency` to avoid duplicate exports.
- **Unused import removed:** `channelTypeSchema` import removed from `schemas/customer-identity.ts` (fixes build).

### Tests
- **packages/shared:** `currency.test.ts` (getDefaultCurrencyForCountry, getMerchantDefaultCurrency, formatMoney, parseMoneyInput) and `phone.test.ts` (normalizePhone, normalizePhoneByCountry for LA/TH/generic). All new tests pass.

---

## 2. Why It Was Changed

- **Laos readiness:** Merchants in Laos need LAK as first-class default and correct phone normalization (+856, 020) to avoid duplicate customers and failed matches.
- **Enterprise correctness:** Currency and phone must not be hardcoded to Thailand; they must derive from merchant (or payment account) and country.
- **Scalability:** Single source of truth for currency (shared + merchant defaults) and phone (country-aware normalization) makes future countries and features easier.
- **Consistency:** Design tokens and reusable UI primitives reduce inline-style sprawl and improve maintainability for Cursor and future engineers.

---

## 3. Files Touched

| Area | Files |
|------|--------|
| **SQL** | `sql/078_merchant_defaults.sql` (new) |
| **Shared** | `packages/shared/src/currency.ts` (new), `packages/shared/src/phone.ts` (new), `packages/shared/src/index.ts`, `packages/shared/src/types.ts`, `packages/shared/src/schemas/merchant.ts`, `packages/shared/src/schemas/customer-identity.ts`, `packages/shared/src/currency.test.ts` (new), `packages/shared/src/phone.test.ts` (new) |
| **API** | `apps/api/src/services/merchant.ts`, `apps/api/src/services/catalog.ts`, `apps/api/src/services/payment-accounts.ts`, `apps/api/src/services/billing.ts`, `apps/api/src/services/order-detail.ts`, `apps/api/src/services/customer-identity.ts`, `apps/api/src/services/conversation-router.ts`, `apps/api/src/services/whatsapp-webhook.ts`, `apps/api/src/routes/super/index.ts`, `apps/api/src/routes/merchant/index.ts`, `apps/api/src/routes/merchant/customers.ts` |
| **Web** | `apps/web/src/theme.ts`, `apps/web/src/lib/api.ts`, `apps/web/src/pages/merchant/MerchantProducts.tsx`, `apps/web/src/pages/merchant/MerchantPaymentAccounts.tsx`, `apps/web/src/pages/super/SuperMerchants.tsx`, `apps/web/src/components/ui/index.ts`, `apps/web/src/components/ui/FormSection.tsx` (new), `apps/web/src/components/ui/DataTableShell.tsx` (new) |

---

## 4. Migrations Added

- **078_merchant_defaults.sql:** Adds `merchants.default_country` and `merchants.default_currency` (nullable then backfilled to `TH`/`THB`), with defaults for new rows set to `TH`/`THB`. No destructive changes; existing data remains valid.

---

## 5. UI System Improvements Added

- **Design tokens:** `spacing` (xs–xxl) and `typography` (pageTitle, sectionTitle, body, bodySmall, caption) in `theme.ts`.
- **Components:** `FormSection` (title + hint + children), `FieldHint` (inline help), `DataTableShell` (toolbar + loading/empty + table content). These are ready for use on products, payment accounts, orders, and super-admin pages to replace repeated inline styles.

---

## 6. Laos Localization Improvements

- **Currency:** LAK as default for `default_country = LA`; merchant and plan creation accept `default_country`/`default_currency`; products, payment accounts, and billing events use merchant default when currency not explicitly provided.
- **Phone:** Laos numbers normalized to canonical 856… (e.g. 020… → 85620…); Thailand and generic fallback preserved; customer identity and auto-link use country-aware normalization when merchant is known.
- **Language:** Lao greetings (sabaidee, ສະບາຍດີ, ສະບາຍ) in conversation router for template greeting response.

---

## 7. Developer Architecture Improvements

- **Single source of truth:** Currency and phone logic live in `@armai/shared` and are used by both API and web.
- **Clear contracts:** Merchant type and create-merchant schema include locale defaults; dashboard response includes `merchant` for client-side default currency.
- **Testability:** Currency and phone behavior covered by unit tests in shared.

---

## 8. Remaining Recommended Future Work (Brief)

- **Super admin UI:** Implemented — “Add Merchant” in SuperMerchants includes Default country (TH/LA) and optional Default currency; values are sent to `createMerchant`.
- **More pages:** Apply `DataTableShell`, `FormSection`, and `FieldHint` to MerchantOrders, MerchantOrderDetail, SuperBilling, SuperAudit, and settings/onboarding flows.
- **Merchant settings:** Allow merchants to edit their own `default_country`/`default_currency` (and surface in API) if business requires.
- **Observability:** Add structured logging or request context (e.g. merchantId) in key routes for easier diagnostics.
- **Pre-existing tests:** Two existing shared tests currently fail (matching/score totalScore threshold, parsers/generic invalid payload). Fix or relax assertions as needed.

---

**Build status:** Full monorepo build (shared, api, web) succeeds. New currency and phone tests pass.
