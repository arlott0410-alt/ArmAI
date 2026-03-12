export interface MerchantPaymentAccount {
  id: string
  merchant_id: string
  bank_code: string
  account_name: string | null
  account_number: string
  account_holder_name: string
  currency: string
  qr_image_path: string | null
  qr_image_object_key: string | null
  is_primary: boolean
  is_active: boolean
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MerchantPaymentAccountRule {
  id: string
  merchant_id: string
  payment_account_id: string
  rule_type: string
  rule_value: string | null
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrderPaymentTarget {
  id: string
  merchant_id: string
  order_id: string
  payment_account_id: string
  expected_amount: number
  expected_currency: string
  assignment_reason: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}
