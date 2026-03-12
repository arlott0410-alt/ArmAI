export interface MerchantFaq {
  id: string
  merchant_id: string
  question: string
  answer: string
  keywords: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MerchantPromotion {
  id: string
  merchant_id: string
  title: string
  content: string | null
  valid_from: string | null
  valid_until: string | null
  keywords: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MerchantKnowledgeEntry {
  id: string
  merchant_id: string
  type: string
  title: string
  content: string
  keywords: string | null
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}
