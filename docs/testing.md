# ArmAI Testing

## Strategy

Tests are written to run **without** the Cloudflare local runtime (`wrangler dev`) as the primary flow. Business logic is isolated in pure functions or testable modules so that Vitest can run in Node.

## What is tested

- **Shared package** (`packages/shared`):
  - Matching score and outcome: `matching/score.test.ts`
  - Bank parser (generic): `parsers/generic.test.ts`
  - Tenant auth helper (app-side guard logic): `auth/tenant.test.ts`
  - Order state transitions: `orders/state.test.ts`
- **API** (`apps/api`):
  - Matching score/outcome again against shared logic: `services/matching.test.ts`
  - (Additional parser tests, payload normalization, and route-level tests can be added; all should avoid depending on a live Wrangler runtime.)

## Running tests

- From repo root: `npm run test` (runs tests in all workspaces).
- Shared only: `npm run test -w packages/shared`.
- API only: `npm run test -w apps/api`.

## Coverage goals

- Parser logic: valid/invalid payloads, normalized output.
- Matching: score factors, classification (auto_matched, probable_match, manual_review, unmatched).
- Tenant authorization: super_admin vs merchant_admin, merchant list.
- Payload normalization: webhook and bank payloads (Zod schemas).
- Order state: allowed transitions; no direct transition to paid from AI-only.

## What is not tested locally

- Full Worker request/response with real Supabase or R2 (use deployed env or integration tests with test project).
- Facebook webhook signature verification (can be unit-tested with a mock HMAC).
- End-to-end flows (deploy and verify manually or with E2E tooling).
