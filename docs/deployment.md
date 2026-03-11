# ArmAI Deployment

## Assumptions

- You push code to GitHub and connect the repo to Cloudflare for deployment.
- You configure Cloudflare (Workers, Pages, R2, env/secrets) and Supabase (SQL, Auth, env) manually in their dashboards.
- You do **not** rely on `wrangler dev` or local runtime as the main workflow.

## Build

- From repo root: `npm install`, `npm run build` (builds shared, api, web).
- API: `npm run build -w apps/api` (Wrangler dry-run build).
- Web: `npm run build -w apps/web` (Vite → `apps/web/dist`).

## Cloudflare Workers (API)

- Create a Worker in the Cloudflare dashboard (or connect GitHub and set build to `apps/api` with command `npm run build -w apps/api` and output `apps/api/dist` or per Wrangler config).
- Bind R2 bucket: variable name `SLIP_BUCKET`, bucket name from R2 creation.
- Set secrets / env in Dashboard (or `wrangler secret put`):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`
  - `FACEBOOK_APP_SECRET`, `FACEBOOK_VERIFY_TOKEN` (optional, for webhook)
- Route the desired domain (e.g. `api.armai.com`) to this Worker.

## Cloudflare Pages (Web)

- Create a Pages project connected to the same GitHub repo.
- Build command: `npm run build -w apps/web` (or `cd apps/web && npm install && npm run build` with root install).
- Output directory: `apps/web/dist`.
- Set env for the frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (e.g. `https://api.armai.com`).

## GitHub → Cloudflare

- Workers: Connect repo in Workers dashboard, set root directory to repo root, build command and output as above (or use `wrangler deploy` from CI).
- Pages: Connect repo in Pages dashboard, set build and output as above.
- No local deploy flow required; deployment is triggered by push or manual deploy from dashboard.

## Production env template

- **Worker (API)**  
  `ENVIRONMENT=production`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FACEBOOK_APP_SECRET`, `FACEBOOK_VERIFY_TOKEN`, R2 binding `SLIP_BUCKET`.

- **Pages (Web)**  
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.
