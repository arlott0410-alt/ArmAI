# Raw Event Retention Strategy

Raw event and log tables are kept for audit and debugging but can grow unbounded. This document describes the retention-ready design and how to run cleanup.

## Retention-Ready Design

The following tables have optional columns (added in migration `062_retention_support.sql`):

- **retention_class** — `short` | `medium` | `long`. Suggests purge eligibility (e.g. short = 30 days).
- **retained_until** — Timestamp after which the row is eligible for archive/delete. `NULL` = use policy default.

### Tables

| Table | Default retention_class | Purpose |
|-------|-------------------------|--------|
| webhook_events | short | Facebook/bank webhook intake |
| bank_raw_notification_events | short | Raw bank payloads |
| telegram_messages | short | Raw Telegram updates |
| bank_transaction_processing_logs | medium | Processing pipeline logs |

Core business and audit tables (orders, matching_results, order_shipments, telegram_operation_events, audit_logs, support_access_logs) are **not** given retention columns and should not be purged by retention logic. Only raw intake and processing logs are candidates.

## Cleanup Helpers

Service: `apps/api/src/services/retention-cleanup.ts`.

- **purgeWebhookEvents(supabase, options?)** — Deletes `webhook_events` older than `shortDays` (default 30). Returns count deleted. Batch size 1000.
- **purgeTelegramMessages(supabase, options?)** — Deletes `telegram_messages` older than `shortDays`. Batch 500.
- **purgeBankRawEvents(supabase, options?)** — Deletes `bank_raw_notification_events` older than `shortDays` (uses `received_at` if present). Batch 500.

These functions are **not** called in normal request path. They are intended for:

- A super-admin-only API route (e.g. `POST /super/retention/run`), or
- A scheduled Worker / cron that runs with service role.

## Recommended Policy

- **short (e.g. 30 days):** webhook_events, bank_raw_notification_events, telegram_messages.
- **medium (e.g. 90 days):** bank_transaction_processing_logs (optional).
- **long / keep:** audit_logs, support_access_logs, telegram_operation_events, order_fulfillment_events — do not purge by retention; use legal/compliance policy if ever.

## Implementation Notes

- Cleanup runs in batches to avoid long-running transactions.
- No automatic scheduling is implemented in the repo; add a cron trigger or admin button that calls the purge functions with appropriate days.
- Preserve referential integrity: e.g. if another table references `webhook_events.id`, either add a soft-delete or run purge only when safe.
