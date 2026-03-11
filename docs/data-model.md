# ArmAI Data Model

## Core (tenant-agnostic or tenant root)

- **profiles**: Extended user data; `id` = `auth.users.id`; `role` = `super_admin` | `merchant_admin`.
- **merchants**: Tenant master; `slug` unique; `billing_status`.
- **merchant_members**: `(merchant_id, user_id)` with role; many-to-many.
- **merchant_settings**: Per-merchant; AI prompt, `bank_parser_id`, `webhook_verify_token`.

## Business (all have `merchant_id`)

- **facebook_pages**: `(merchant_id, page_id)` for webhook routing.
- **webhook_events**: Raw events; `merchant_id` nullable for global verification.
- **conversations**: One per (merchant, page_id, customer_psid).
- **message_buffers**: Incoming messages before flush; debounce/aggregation.
- **messages**: Persisted timeline (inbound/outbound).
- **orders**: Status lifecycle (pending → slip_uploaded → slip_extracted → bank_pending_match → probable_match | manual_review → paid | cancelled).
- **order_slips**: Slip image R2 key + AI extraction; does not set order to paid by itself.
- **bank_configs**: Per-merchant bank/parser mapping.
- **bank_transactions**: Parsed incoming from bank webhook.
- **matching_results**: Links order + bank_transaction; score and status (unmatched, auto_matched, probable_match, manual_review, confirmed, rejected). Only confirmed + business rule leads to paid.

## Observability and billing

- **ai_logs**: Job type, entity, success, metadata (privacy-conscious).
- **audit_logs**: Super admin and support actions.
- **support_access_logs**: Each support (God mode) access by merchant.
- **merchant_plans**: Billing/plan status (schema-ready).

## Order status enum

`pending` | `slip_uploaded` | `slip_extracted` | `bank_pending_match` | `probable_match` | `paid` | `manual_review` | `cancelled`.

## Matching result status enum

`unmatched` | `auto_matched` | `probable_match` | `manual_review` | `confirmed` | `rejected`.
