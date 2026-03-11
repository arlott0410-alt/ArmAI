import type { ProductStatus, ProductVariantStatus } from './constants.js';

export interface ProductCategory {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  merchant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  sale_price: number | null;
  currency: string;
  sku: string | null;
  status: ProductStatus;
  requires_manual_confirmation: boolean;
  ai_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  merchant_id: string;
  product_id: string;
  name: string;
  option_value_1: string | null;
  option_value_2: string | null;
  option_value_3: string | null;
  price_override: number | null;
  stock_qty: number | null;
  status: ProductVariantStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductKeyword {
  id: string;
  merchant_id: string;
  product_id: string;
  keyword: string;
  created_at: string;
}

/** Resolved price for display/order: product or variant override. */
export function resolveProductPrice(product: { base_price: number; sale_price?: number | null }, variant?: { price_override?: number | null } | null): number {
  if (variant?.price_override != null) return variant.price_override;
  if (product.sale_price != null) return product.sale_price;
  return product.base_price;
}
