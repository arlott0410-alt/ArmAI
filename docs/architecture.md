# ArmAI Architecture

## Overview

ArmAI is a multi-tenant SaaS on a single domain (`armai.com`). One codebase, unlimited merchants. Strict data isolation by tenant (merchant) enforced at the database (RLS) and application layer.

## Stack

- **Backend/API**: Cloudflare Workers, Hono, TypeScript
- **Database/Auth/Realtime**: Supabase (Postgres, Auth, Realtime, RLS)
- **File storage**: Cloudflare R2 (slip images)
- **AI**: Gemini 1.5 Flash (slip extraction)
- **Frontend**: Vite + React + TypeScript, deployed to Cloudflare Pages

## Frontend deployment choice

The frontend is a **Vite SPA** deployed to **Cloudflare Pages**. The API runs on **Cloudflare Workers**. Rationale:

- Entire system stays on Cloudflare (Pages + Workers); no separate Node server.
- Supabase Auth and Postgres are used from the browser with the **anon key** and **RLS**; no service role key in the frontend.
- All authenticated API calls go to the Worker with a Bearer token; the Worker validates the token with Supabase and enforces role/tenant.
- Simpler than running Next.js (no server component or API routes on Cloudflare Workers), and more robust for a dashboard that primarily consumes a single API.

## Separation of concerns

### Control Plane

- Super admin management (KPIs, merchant list, add merchant).
- Merchant provisioning: create auth user (Supabase Admin API), merchant row, membership, settings.
- Billing status flags (schema-ready in `merchant_plans` / `merchants.billing_status`).
- Audit logs and support access logs.
- Support/God mode: read-only access to a merchant’s data with explicit audit; no session impersonation.

### Data Plane

- Facebook webhook ingest (page_id → merchant routing, raw events, message buffer).
- Message debounce/aggregation (persisted in `message_buffers`).
- AI generation/extraction (Gemini for slip).
- Slip image processing (R2 upload, then Gemini).
- Bank notification webhook (parser per merchant, normalized transaction storage).
- Auto-matching engine (score-based; does not set order to paid by itself).
- Orders and message timeline (tenant-scoped).

## Multi-tenancy

- Every business table has `merchant_id`.
- RLS policies enforce: merchant_admin sees only rows for merchants they belong to; super_admin can read/write where allowed.
- `merchant_members` maps users to merchants (many-to-many).
- Tenant context is resolved in the API from path param or first merchant of the user; access is validated before use.

## Caching

- Merchant config (e.g. settings, parser id) can be cached with a 5-minute TTL as a best-effort L1 cache.
- Source of truth is the database; correctness must not depend on cache.
- Cache invalidation: on merchant_settings update, invalidate that merchant’s cache (document in deployment/setup).

## Security

- No service role key in the browser.
- Admin and sensitive actions only from Worker routes with auth + role middleware.
- Secrets via Cloudflare bindings/env (no hardcoding).
- RLS deny-by-default; explicit policies per table.
- Webhook signature verification (Facebook) where secret is configured.
