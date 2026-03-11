import { z } from 'zod';

export const merchantPaymentAccountSchema = z.object({
  bank_code: z.string().min(1).max(32),
  account_name: z.string().max(128).nullable().optional(),
  account_number: z.string().min(1).max(64),
  account_holder_name: z.string().min(1).max(255),
  currency: z.string().length(3).optional(),
  qr_image_path: z.string().max(512).nullable().optional(),
  qr_image_object_key: z.string().max(512).nullable().optional(),
  is_primary: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const merchantPaymentAccountRuleSchema = z.object({
  payment_account_id: z.string().uuid(),
  rule_type: z.string().min(1).max(64),
  rule_value: z.string().max(255).nullable().optional(),
  priority: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type CreateMerchantPaymentAccountBody = z.infer<typeof merchantPaymentAccountSchema>;
export type CreateMerchantPaymentAccountRuleBody = z.infer<typeof merchantPaymentAccountRuleSchema>;
