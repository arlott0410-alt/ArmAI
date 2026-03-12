import { z } from 'zod'
import { PRODUCT_STATUS } from '../catalog/constants.js'

export const productCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

export const productSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).nullable().optional(),
  base_price: z.number().min(0),
  sale_price: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).optional(),
  sku: z.string().max(64).nullable().optional(),
  status: z
    .enum([PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE, PRODUCT_STATUS.ARCHIVED])
    .optional(),
  requires_manual_confirmation: z.boolean().optional(),
  ai_visible: z.boolean().optional(),
  is_cod_allowed: z.boolean().optional(),
  requires_manual_cod_confirmation: z.boolean().optional(),
})

export const productVariantSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  option_value_1: z.string().max(128).nullable().optional(),
  option_value_2: z.string().max(128).nullable().optional(),
  option_value_3: z.string().max(128).nullable().optional(),
  price_override: z.number().min(0).nullable().optional(),
  stock_qty: z.number().int().min(0).nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

export const productKeywordSchema = z.object({
  product_id: z.string().uuid(),
  keyword: z.string().min(1).max(128),
})

export type CreateProductCategoryBody = z.infer<typeof productCategorySchema>
export type CreateProductBody = z.infer<typeof productSchema>
export type CreateProductVariantBody = z.infer<typeof productVariantSchema>
export type CreateProductKeywordBody = z.infer<typeof productKeywordSchema>
