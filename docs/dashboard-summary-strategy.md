# Dashboard Summary Strategy

Dashboards are **summary-first**: they load precomputed counters from dedicated tables instead of running expensive aggregates on every request.

## Tables

### merchant_dashboard_summaries

One row per merchant. Fields:

- `orders_today`, `pending_payment_count`, `paid_today_count`
- `manual_review_count`, `probable_match_count`, `ready_to_ship_count`
- `active_products_count`, `active_payment_accounts_count`
- `readiness_score`, `updated_at`

**When it’s updated:**  
`refreshMerchantSummary()` is called:

- After order becomes paid (confirm-match, COD mark-collected)
- After bank matching runs (scoped transaction)
- After a shipment is created (dashboard or Telegram flow)

**When it’s read:**  
`GET /merchant/dashboard` uses `getMerchantDashboardSummary()`, which:

1. Reads from `merchant_dashboard_summaries` for that merchant.
2. If no row exists, calls `refreshMerchantSummary()`, then reads again and returns.

So the first load for a new merchant (or after DB reset) does one full recalc; subsequent loads use the cached row until the next event.

### super_dashboard_summaries

Single row (fixed UUID). Fields:

- `active_merchants`, `trialing_merchants`, `past_due_merchants`, `due_soon_merchants`
- `activation_ready_merchants`, `mrr_current_month`, `expected_next_billing_total`
- `new_merchants_this_month`, `updated_at`

**When it’s updated:**  
`refreshSuperSummary()` is called:

- When super dashboard is loaded and the summary row is **missing** (lazy init).
- Can be hooked to merchant create / plan change / billing events or a scheduled job.

**When it’s read:**  
`GET /super/dashboard` uses `getSuperDashboardSummary()`, which:

1. Reads the single row from `super_dashboard_summaries`.
2. If present, uses it for KPIs and revenue; still fetches merchants/plans for billing health and setup health lists (needed for UI).
3. If missing, runs the full computation, calls `refreshSuperSummary()`, and returns the computed result.

Billing health (due soon, overdue, trial ending) and setup health (per-merchant setup flags) are still derived from live merchant/plan (and optionally product/payment/settings) data so lists stay accurate; only the numeric KPIs and revenue come from the summary.

## Keeping Summaries Fresh

- **Merchant:** Event-driven. No cron required for merchant dashboard; each relevant business event triggers `refreshMerchantSummary(merchantId)`.
- **Super:** Lazy on first load; for fresher data without loading the dashboard, trigger `refreshSuperSummary()` from a cron or after merchant/billing changes.

## Fallback Recalculation

- Merchant: If the summary row is missing, the dashboard endpoint recalculates and upserts, then returns.
- Super: If the summary row is missing, the dashboard endpoint recalculates, calls `refreshSuperSummary()`, and returns the computed result.

No separate “recalc” endpoint is required for normal operation; optional admin endpoints can call `refreshMerchantSummary` or `refreshSuperSummary` for a specific merchant or the whole system.
