# Scaling ArmAI to ~100 Merchants

This document describes how the system is optimized for approximately 100 merchants on Cloudflare Workers + Supabase + R2 + Gemini without cost explosions.

## Principles

1. **Workers as orchestration** — Business logic and DB access live in services; routes stay thin. No heavy compute in Workers.
2. **Summary-first dashboards** — Merchant and super dashboards read from precomputed `merchant_dashboard_summaries` and `super_dashboard_summaries` instead of aggregating over large tables on every request.
3. **Raw vs operational separation** — Raw event tables (webhook_events, bank_raw_notification_events, telegram_messages) are for audit/debug; normal UI and business flows use operational tables and summaries.
4. **Realtime only where needed** — No Supabase Realtime for dashboard/list data; only auth state uses subscription.
5. **R2 for files** — Payment slips and other binaries use R2; only metadata/object keys in Supabase.
6. **Narrow matching** — Bank matching runs only for scoped transactions and only against eligible recent orders (e.g. 90-day window).
7. **Pagination** — Orders list, super merchants list, audit, and operations feed use limit/offset or bounded limits.
8. **Event-driven summary updates** — Summaries are updated when orders are paid, matching runs, shipments are created, etc., not on every dashboard load.
9. **Index-friendly queries** — All list and filter queries use indexed columns (merchant_id, status, created_at).
10. **AI only when needed** — Gemini is used for slip extraction only; rules and data retrieval handle routing and matching.

## Cost / Risk Areas Addressed

- **Supabase reads** — Reduced by summary tables and pagination; no full-table scans for dashboard KPIs.
- **Supabase egress** — Smaller payloads; list endpoints return bounded rows.
- **Raw table growth** — Retention columns and cleanup helpers allow scheduled purge of old raw events.
- **Matching** — Only scoped bank transactions enter matching; candidate set limited to recent eligible orders.
- **Dashboard load** — Single row read for merchant summary; single row for super summary when present.

## Summary Refresh Triggers

- **Merchant summary**: After order paid (confirm-match, COD mark-collected), after bank matching (scoped), after shipment created.
- **Super summary**: On first super dashboard load when missing (lazy); can be triggered by billing/merchant events or a scheduled job.

## Pagination Defaults

- Orders list: default limit 50, max 100; offset supported.
- Super merchants: default limit 50, max 100; offset supported.
- Audit logs: limit 20–50.
- Bank sync / operations feed: limit 50–100.

## Retention

- Raw events (webhook_events, telegram_messages, bank_raw_notification_events) have optional `retention_class` and `retained_until`.
- Cleanup is **not** automatic; use `retention-cleanup` service from an admin endpoint or scheduled Worker/cron.
- See `docs/raw-event-retention.md`.
