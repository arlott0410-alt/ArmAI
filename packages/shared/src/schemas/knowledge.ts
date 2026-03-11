import { z } from 'zod';

export const merchantFaqSchema = z.object({
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(5000),
  keywords: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const merchantPromotionSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(5000).nullable().optional(),
  valid_from: z.string().datetime().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
  keywords: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const merchantKnowledgeEntrySchema = z.object({
  type: z.string().min(1).max(64),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(10000),
  keywords: z.string().max(500).nullable().optional(),
  priority: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type CreateMerchantFaqBody = z.infer<typeof merchantFaqSchema>;
export type CreateMerchantPromotionBody = z.infer<typeof merchantPromotionSchema>;
export type CreateMerchantKnowledgeEntryBody = z.infer<typeof merchantKnowledgeEntrySchema>;
