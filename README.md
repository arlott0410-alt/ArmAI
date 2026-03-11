# ArmAI

Multi-tenant SaaS for merchants: Facebook page chatbot, AI prompt per merchant, slip verification, bank notification webhook, auto-matching of transfers to orders, merchant dashboard, and super admin + support mode.

## Stack

- **API**: Cloudflare Workers, Hono, TypeScript
- **DB/Auth**: Supabase (Postgres, Auth, RLS)
- **Storage**: Cloudflare R2 (slip images)
- **AI**: Gemini 1.5 Flash
- **Frontend**: Vite + React, deployed on Cloudflare Pages

## Repo structure

```
apps/
  api/          # Cloudflare Worker (Hono)
  web/          # Vite React dashboard
packages/
  shared/       # Types, Zod schemas, matching, parsers
sql/            # Supabase SQL (001–010)
docs/           # Architecture, data model, auth, deployment, manual setup, testing
```

## Quick start (local)

1. Install dependencies: `npm install`. (With pnpm, use `pnpm install` and you can switch shared to `workspace:*` in apps if desired.)
2. Copy env: see `docs/manual-setup-checklist.md` for required vars.
3. Run SQL in Supabase in order: `sql/001_extensions.sql` … `sql/010_seed_minimal.sql`.
4. Create a user in Supabase Auth and set `profiles.role = 'super_admin'` for that user.
5. `npm run build`
6. API: `npm run dev -w apps/api` (Wrangler dev). Web: `npm run dev -w apps/web`.
7. Open web app, sign in, use Super or Merchant flows.

## Deployment

- Push to GitHub; connect repo to Cloudflare (Workers + Pages).
- Configure secrets and env in Cloudflare and Supabase as in `docs/manual-setup-checklist.md`.
- No reliance on local Wrangler as primary workflow; deploy from GitHub/dashboard.

## Frontend choice

The dashboard is a **Vite SPA on Cloudflare Pages** talking to the **Worker API**. This keeps the whole system on Cloudflare, uses Supabase Auth + RLS from the browser with the anon key, and avoids running a Node server. See `docs/architecture.md`.

## Tests

- `npm run test` — runs Vitest in shared and api (no Wrangler required).
- Covers: matching score/outcome, bank parser, tenant guard logic, order state transitions.

## Docs

- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)
- [Auth flow](docs/auth-flow.md)
- [Deployment](docs/deployment.md)
- [Manual setup checklist](docs/manual-setup-checklist.md)
- [Testing](docs/testing.md)
- [Commerce extension](docs/extension-commerce.md) — product catalog, knowledge base, payment accounts, draft orders, account-aware slip/matching.

## Security

- Strict RLS on all tenant tables; no service role key in the browser.
- Admin and support actions only from Worker with auth/role middleware; support mode is read-only and audited.
