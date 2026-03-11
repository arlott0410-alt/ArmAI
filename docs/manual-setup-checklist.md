# ArmAI Manual Setup Checklist

Run these steps in order. Use placeholders below where values must be filled in by you.

## 1. Cloudflare Dashboard

- [ ] Create R2 bucket; note bucket name → `TODO_REQUIRED_MANUAL_INPUT_R2_BUCKET_NAME`.
- [ ] Create Worker for API; attach R2 binding `SLIP_BUCKET` to the bucket above.
- [ ] Set Worker secrets / env:
  - `SUPABASE_URL` = `TODO_REQUIRED_MANUAL_INPUT_SUPABASE_URL`
  - `SUPABASE_ANON_KEY` = `TODO_REQUIRED_MANUAL_INPUT_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` = `TODO_REQUIRED_MANUAL_INPUT_SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY` = `TODO_REQUIRED_MANUAL_INPUT_GEMINI_API_KEY`
  - `FACEBOOK_APP_SECRET` = `TODO_REQUIRED_MANUAL_INPUT_FACEBOOK_APP_SECRET`
  - `FACEBOOK_VERIFY_TOKEN` = (optional) token you will use in Facebook webhook verification.
- [ ] Create Pages project for web; set env:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (your Worker URL).

## 2. Supabase Dashboard

- [ ] Create project; note Project URL → `SUPABASE_URL`, anon key → `SUPABASE_ANON_KEY`, service_role key → `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] In SQL Editor, run the SQL files in order:
  - `sql/001_extensions.sql`
  - `sql/002_enums.sql`
  - `sql/003_tables_core.sql`
  - `sql/004_tables_business.sql`
  - `sql/005_indexes.sql`
  - `sql/006_functions.sql`
  - `sql/007_triggers.sql`
  - `sql/008_rls_enable.sql`
  - `sql/009_policies.sql`
  - `sql/010_seed_minimal.sql`
  - `sql/011_catalog_tables.sql`
  - `sql/012_knowledge_tables.sql`
  - `sql/013_payment_accounts.sql`
  - `sql/014_order_items_and_targets.sql`
  - `sql/015_extension_alter.sql`
  - `sql/016_extension_indexes.sql`
  - `sql/017_extension_rls.sql`
  - `sql/018_extension_policies.sql`
- [ ] Create first user in Authentication → Users (e.g. invite or sign up).
- [ ] In SQL Editor, set super_admin role (replace `YOUR_USER_UUID` with the user’s UUID from Auth):
  ```sql
  insert into public.profiles (id, email, full_name, role)
  values ('YOUR_USER_UUID', 'admin@armai.com', 'Super Admin', 'super_admin')
  on conflict (id) do update set role = 'super_admin', updated_at = now();
  ```
- [ ] (Optional) Create profile trigger on `auth.users` insert so new users get a default profile row; see comment in `sql/007_triggers.sql`.

## 3. Facebook Webhook

- [ ] In Meta Developer app, set Webhook URL to your Worker URL, e.g. `https://api.armai.com/api/webhooks/facebook`.
- [ ] Set Verify Token to the same value you set as `FACEBOOK_VERIFY_TOKEN` in the Worker (or leave unset if you accept any token during verification).
- [ ] Subscribe to `messages` and other needed webhook events.

## 4. Gemini API Key

- [ ] Obtain API key from Google AI Studio; set as `GEMINI_API_KEY` in the Worker (see step 1).

## 5. R2 Bucket

- [ ] Already created in step 1; ensure Worker has `SLIP_BUCKET` binding and CORS if you need direct browser uploads (otherwise uploads go via Worker).

## 6. Post-deploy verification

- [ ] Open web app; sign in with super_admin user; open Super Dashboard and Merchants.
- [ ] Create a test merchant from Super → Merchants.
- [ ] Sign in as that merchant’s user (or use same user if added to merchant_members); open Merchant Dashboard, Orders, Products, Categories, Knowledge, Promotions, Payment accounts, Settings.
- [ ] Call `GET /api/health` on the Worker; expect `{ ok: true, service: 'armai-api' }`.
