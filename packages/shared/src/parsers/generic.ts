/**
 * Generic/example bank parser for testing and placeholder.
 * Real parsers (e.g. scb, kbank) would live in apps/api or shared with versioned IDs.
 */
import { z } from 'zod';
import type { BankParser } from './types.js';
import { normalizedTransactionSchema } from '../schemas/bank.js';

const GENERIC_PARSER_ID = '00000000-0000-4000-8000-000000000001';
const VERSION = '1.0.0';

const genericPayloadSchema = z.object({
  amount: z.number().positive(),
  sender_name: z.string().nullable().optional(),
  datetime: z.string(),
  reference_code: z.string().nullable().optional(),
  transaction_id: z.string().nullable().optional(),
});

export const genericBankParser: BankParser = {
  id: GENERIC_PARSER_ID,
  version: VERSION,
  parse(payload: unknown) {
    const parsed = genericPayloadSchema.parse(payload);
    return normalizedTransactionSchema.parse({
      amount: parsed.amount,
      sender_name: parsed.sender_name ?? null,
      datetime: parsed.datetime,
      reference_code: parsed.reference_code ?? null,
      bank_tx_id: parsed.transaction_id ?? null,
      raw_parser_id: GENERIC_PARSER_ID,
    });
  },
};
