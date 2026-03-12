# API Optimization Notes

## Realtime (recommended)

For subscription/plan updates, prefer **Supabase Realtime** on the frontend instead of polling:

- Subscribe to `merchant_plans` or relevant channel for the current merchant.
- On `UPDATE` or `INSERT`, refresh subscription state once instead of polling `/api/merchant/subscription` on a timer.
- Reduces request volume and improves perceived freshness.

Example (frontend): use `supabase.channel('merchant_plans').on('postgres_changes', { ... }, callback)` for the merchant’s row.

## Implemented

- **Caching**: GET `/api/plans` and GET `/api/system/settings` use Cache API (1h TTL, stale-while-revalidate).
- **KV**: System settings (bank details) are read from KV when bound; PATCH updates both Supabase and KV.
- **Rate limiting**: `/api/subscribe` and `/api/onboard` are limited to 10 req/min per IP (hono-rate-limiter).
- **Telegram webhook**: Request body is read with a 5MB limit (stream + size cap) to avoid OOM on large payloads.
- **Structured logging**: JSON logs (timestamp, level, path, correlationId) for key endpoints and errors.
