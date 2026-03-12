# Performance Hotspots and Fixes (Final)

This document lists the **real query/subrequest hotspots** identified from code evidence and the fixes applied to reduce fan-out and Supabase read pressure.

---

## Hotspots found (from repo code)

### 1) Merchant readiness: many independent count queries

- **Before:** `apps/api/src/services/merchant-dashboard.ts` ran 8 parallel queries:
  - products count, categories count, payment accounts count, primary payment account, merchant settings, faqs count, knowledge count, facebook pages count.
- **Cost:** 8 DB round trips per readiness call (and indirectly per dashboard load).

### 2) Merchant summary refresh: mixed counting + full row reads

- **Before:** `apps/api/src/services/summary-update.ts`:
  - fetched today’s orders rows, fetched all matching_results rows, plus multiple count queries, then upserted.
- **Cost:** multiple round trips and unnecessary row transfer (IDs/status) just to compute counts.

### 3) Super dashboard setup health + expanded list: “load all rows then reduce in JS”

- **Before:** `apps/api/src/services/super-dashboard.ts`:
  - selected **all** `products` rows (merchant_id only) and reduced counts in JS.
  - selected **all** `merchant_payment_accounts` rows (merchant_id only) and reduced counts in JS.
  - repeated this pattern for setup health and merchant list.
- **Cost:** high data transfer and CPU for large tenants; scales poorly with table size.

---

## Fixes implemented

### A) SQL-side aggregation views (no full table transfer)

Added in `sql/080_dashboard_rpc_optimizations.sql`:

- `v_products_count_by_merchant`
- `v_payment_accounts_count_by_merchant` (active only)
- `v_facebook_pages_count_by_merchant`
- `v_has_ai_prompt_by_merchant`

**Effect:** API fetches compact aggregated rows instead of scanning every record in Workers.

### B) RPC: readiness counts in one call

Added:

- `merchant_readiness_counts(p_merchant_id uuid)`

Updated:

- `apps/api/src/services/merchant-dashboard.ts` now calls the RPC once.

**Expected effect:** readiness path goes from ~8 DB queries → **1 DB RPC**.

### C) RPC: refresh merchant dashboard summary in one call

Added:

- `refresh_merchant_dashboard_summary(p_merchant_id uuid)`

Updated:

- `apps/api/src/services/summary-update.ts` now calls this RPC.

**Expected effect:** refresh path goes from many queries (incl. row transfers) → **1 DB RPC**.

### D) Super dashboard/service: use aggregation views

Updated:

- `apps/api/src/services/super-dashboard.ts` uses the aggregation views for:
  - setup health computation
  - expanded merchant list counts (products, payment accounts, connected pages, prompt presence)

**Expected effect:** significantly lower data transfer and CPU; fewer large scans.

---

## Indexes / SQL changes

- Added new views + functions only (no destructive schema change in 080).
- Currency cleanup (079) drops THB column defaults for currency columns and backfills NULLs (improves correctness and avoids relying on defaults).

---

## Request-scoped caching / context

- Not yet fully implemented as a generic middleware cache for merchant/settings/plan within one request, but the biggest fan-out (readiness + summary aggregation + super counts) was addressed via SQL-side aggregation first.

---

## Remaining follow-ups (medium priority)

- Consolidate router-context-loader and ai-context order/shipments lookups (these still do multiple selects per request path).
- Add request-scoped memoization layer in Hono context so repeated `getMerchantById` / `getMerchantSettings` inside one request don’t hit Supabase repeatedly.
- If super dashboard billing health becomes a hotspot, move more of it into SQL (views/RPC) with merchant_id grouping.
