import { z } from 'zod';

/** Bank webhook incoming payload - structure depends on parser; validate after parser selection. */
export const bankWebhookHeadersSchema = z.object({
  'x-bank-source': z.string().min(1).max(64).optional(),
  'x-idempotency-key': z.string().uuid().optional(),
});

/** Generic normalized transaction for matching. */
export const normalizedTransactionSchema = z.object({
  amount: z.number().positive(),
  sender_name: z.string().nullable(),
  datetime: z.string(),
  reference_code: z.string().nullable(),
  bank_tx_id: z.string().nullable(),
  raw_parser_id: z.string(),
});

export type NormalizedTransaction = z.infer<typeof normalizedTransactionSchema>;
