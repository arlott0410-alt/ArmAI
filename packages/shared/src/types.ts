/**
 * Shared domain types. Align with DB schema and API contracts.
 */

import type { ORDER_STATUS, MATCHING_RESULT_STATUS, ROLE } from './constants.js';

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type MatchingResultStatus = (typeof MATCHING_RESULT_STATUS)[keyof typeof MATCHING_RESULT_STATUS];
export type Role = (typeof ROLE)[keyof typeof ROLE];

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface MerchantMember {
  id: string;
  merchant_id: string;
  user_id: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  billing_status: 'active' | 'past_due' | 'trialing' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface MerchantSettings {
  merchant_id: string;
  ai_system_prompt: string | null;
  bank_parser_id: string | null;
  webhook_verify_token: string | null;
  created_at: string;
  updated_at: string;
}

/** Normalized slip extraction from AI. Includes receiver when visible. */
export interface SlipExtraction {
  amount: number | null;
  sender_name: string | null;
  datetime: string | null;
  reference_code: string | null;
  confidence_score: number;
  raw_json: string;
  /** Account-aware: receiver account number when visible on slip. */
  receiver_account?: string | null;
  receiver_bank?: string | null;
  receiver_name?: string | null;
}

/** Normalized bank transaction from parser. */
export interface BankTransactionNormalized {
  amount: number;
  sender_name: string | null;
  datetime: string;
  reference_code: string | null;
  bank_tx_id: string | null;
  raw_parser_id: string;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
  correlationId?: string;
}
