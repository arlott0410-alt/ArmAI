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
- **order_slips**: Slip image R2 key + AI extraction; optional detected_receiver_account, detected_receiver_bank, detected_receiver_name. Does not set order to paid by itself.
- **bank_configs**: Per-merchant bank/parser mapping.
- **bank_transactions**: Parsed incoming from bank webhook.
- **matching_results**: Links order + bank_transaction; score and status; optional `matched_payment_account_id`, `scoring_breakdown_json`. Only confirmed + business rule leads to paid.

## Commerce extension (all with `merchant_id`)

- **product_categories**: Categories for catalog; sort_order, is_active.
- **products**: Name, slug, base_price, sale_price, currency, status, requires_manual_confirmation, ai_visible. AI uses only active, ai_visible products from DB.
- **product_variants**: Option values, price_override, stock_qty.
- **product_keywords**: Searchable keywords for AI lookup.
- **product_images**: Optional R2 keys per product.
- **merchant_faqs**: FAQ Q&A for AI retrieval.
- **merchant_promotions**: Promotions; valid_from/until, keywords.
- **merchant_knowledge_entries**: Type, title, content, keywords, priority (shipping, hours, policies, etc.).
- **merchant_payment_accounts**: Bank code, account number, holder, QR key, is_primary, is_active. AI sends only from these; no hardcoded accounts.
- **merchant_payment_account_rules**: Optional routing (rule_type, rule_value, priority).
- **order_items**: Order line items; product_id, variant_id, product_name_snapshot, quantity, unit_price, total_price.
- **order_payment_targets**: Which payment account was assigned to the order (expected_amount, assignment_reason). Auditable; used by slip verification and matching.

## Observability and billing

- **ai_logs**: Job type, entity, success, metadata (privacy-conscious).
- **audit_logs**: Super admin and support actions.
- **support_access_logs**: Each support (God mode) access by merchant.
- **merchant_plans**: Billing/plan status (schema-ready).

## Order status enum

`pending` | `slip_uploaded` | `slip_extracted` | `bank_pending_match` | `probable_match` | `paid` | `manual_review` | `cancelled`.

## Matching result status enum

`unmatched` | `auto_matched` | `probable_match` | `manual_review` | `confirmed` | `rejected`.
