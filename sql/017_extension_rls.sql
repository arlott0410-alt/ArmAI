-- ArmAI Extension: Enable RLS on all new tables.

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_keywords enable row level security;
alter table public.product_images enable row level security;
alter table public.merchant_faqs enable row level security;
alter table public.merchant_promotions enable row level security;
alter table public.merchant_knowledge_entries enable row level security;
alter table public.merchant_payment_accounts enable row level security;
alter table public.merchant_payment_account_rules enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payment_targets enable row level security;
