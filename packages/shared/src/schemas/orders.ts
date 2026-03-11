import { z } from 'zod';
import { ORDER_STATUS } from '../constants.js';

const orderStatusEnum = z.enum([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.SLIP_UPLOADED,
  ORDER_STATUS.SLIP_EXTRACTED,
  ORDER_STATUS.BANK_PENDING_MATCH,
  ORDER_STATUS.PROBABLE_MATCH,
  ORDER_STATUS.PAID,
  ORDER_STATUS.MANUAL_REVIEW,
  ORDER_STATUS.CANCELLED,
]);

export const orderSchema = z.object({
  id: z.string().uuid(),
  merchant_id: z.string().uuid(),
  status: orderStatusEnum,
  customer_name: z.string().nullable(),
  customer_psid: z.string().nullable(),
  amount: z.number().nullable(),
  reference_code: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const confirmMatchBodySchema = z.object({
  matching_result_id: z.string().uuid(),
  confirm: z.boolean(),
});

export type ConfirmMatchBody = z.infer<typeof confirmMatchBodySchema>;
