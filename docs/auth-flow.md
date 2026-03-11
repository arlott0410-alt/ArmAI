# ArmAI Auth Flow

## Login

- Single login page: `/login`.
- Supabase Auth: `signInWithPassword(email, password)` from the frontend.
- Session is stored by Supabase client (e.g. localStorage); access token is used for API calls.

## Session handling

- Frontend sends `Authorization: Bearer <access_token>` on every API request.
- Worker auth middleware: reads Bearer token, calls Supabase `getUser(token)` to validate, then loads `profiles.role` and `merchant_members.merchant_id` via service-role client.
- No random logout: avoid globally intercepting 401 and signing out unless the response is explicitly “invalid session”; let Supabase client handle refresh where applicable.

## Roles

- **super_admin**: System owner; can access Control Plane and Support; can create merchants and view any tenant (read-only in support mode).
- **merchant_admin**: Merchant customer; can access only merchants they belong to (enforced by RLS and API middleware).

Role is stored in `profiles.role`; membership in `merchant_members`. Menu visibility is not security; backend and RLS enforce access.

## Route guards

- **Super admin only**: `/api/super/*`, `/api/support/*` — middleware `requireSuperAdmin` after `authMiddleware`.
- **Merchant**: `/api/merchant/*`, `/api/settings`, `/api/orders` — `authMiddleware` → `resolveMerchant` → `requireMerchantAdmin`; operations are scoped to `merchantId` from path or first merchant of user.

## Support (God) mode

- Super admin starts a support session by merchant_id; this is logged in `support_access_logs`.
- Support mode is read-only; no impersonation of merchant session. Frontend shows a clear “Read-only support mode” banner.
