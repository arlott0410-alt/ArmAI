# Performance Optimization Notes

## Bank Matching

- **Eligibility:** Only transactions with `scope_status = 'scoped'` enter matching. `ambiguous` and `out_of_scope` do not.
- **Candidate narrowing:** Matching runs only against orders in statuses `pending`, `slip_uploaded`, `slip_extracted`, `bank_pending_match`, `probable_match` and created in the last **90 days**, up to **500** orders per merchant. Slips for those orders are then loaded. This avoids scanning all historical slips.
- **Indexes:** `order_slips (merchant_id)` where `extraction_amount is not null`; `orders (merchant_id, status, created_at)`.

## Indexes (Main Tables)

- **orders:** merchant_id + status; merchant_id + created_at desc; merchant_id + fulfillment_status (partial).
- **order_slips:** order_id; merchant_id (partial, extraction not null).
- **matching_results:** merchant_id + status + created_at desc.
- **bank_transactions:** merchant_id + transaction_at desc; scope_status; payment_account_id.
- **telegram_operation_events, shipment_images:** merchant_id + created_at or status.
- **audit_logs, support_access_logs:** created_at/started_at desc for recent activity.
- **merchant_dashboard_summaries:** primary key (merchant_id).
- **super_dashboard_summaries:** single row by fixed id.

## Query Patterns

- **Dashboard:** Single row read from summary table(s).
- **Orders list:** Filter by merchant_id, optional status/fulfillment_status, order by created_at desc, range(offset, offset+limit-1).
- **Super merchants:** Same with range; product/payment/settings counts are still fetched for the current page of merchants only (not full table scan then filter).
- **Operations feed:** Paginated telegram_operation_events and shipment_images by merchant_id.

## R2 / File Storage

- Payment slip images: stored in R2; `order_slips.r2_key` holds the object key. No binary in DB.
- Shipment images: `shipment_images.image_url` / `image_object_key` — today often Telegram file URL or key; for production, prefer uploading to R2 and storing only the key. See product docs for R2-first guidance.

## AI Usage

- Gemini is used only for **slip image extraction** (amount, sender, reference, etc.). It is not used for every message or webhook.
- Bank parsing and matching use rule-based logic and shared scoring. No AI in the hot path for matching.

## Realtime

- No Supabase Realtime subscriptions for tables. Only auth state change is subscribed. Dashboard and lists rely on request/response and optional manual refresh.
