import type { NormalizedTransaction } from '../types.js';

/**
 * Bank-specific parser: raw payload -> normalized transaction or throw.
 * Parser is selected by merchant bank config (parser_id).
 */
export interface BankParser {
  id: string;
  version: string;
  /** Parse raw JSON body. Returns normalized transaction. */
  parse(payload: unknown): NormalizedTransaction;
}
