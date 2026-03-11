-- ArmAI SQL Schema - Part 2: Enums
-- Must match @armai/shared constants and application code.

do $$ begin
  create type app_role as enum ('super_admin', 'merchant_admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type order_status as enum (
    'pending',
    'slip_uploaded',
    'slip_extracted',
    'bank_pending_match',
    'probable_match',
    'paid',
    'manual_review',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type matching_result_status as enum (
    'unmatched',
    'auto_matched',
    'probable_match',
    'manual_review',
    'confirmed',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type billing_status as enum ('active', 'past_due', 'trialing', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type webhook_event_kind as enum (
    'facebook_incoming',
    'facebook_verification',
    'bank_incoming',
    'slip_upload'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type audit_action as enum (
    'merchant_created',
    'merchant_updated',
    'support_access_merchant',
    'support_access_orders',
    'support_access_bank',
    'match_confirmed',
    'match_rejected'
  );
exception
  when duplicate_object then null;
end $$;
