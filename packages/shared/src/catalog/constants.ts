/** Product status - must match DB check constraint. */
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const

export const PRODUCT_VARIANT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]
export type ProductVariantStatus =
  (typeof PRODUCT_VARIANT_STATUS)[keyof typeof PRODUCT_VARIANT_STATUS]
