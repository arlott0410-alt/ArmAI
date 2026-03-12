-- ArmAI: RLS for COD and payment method tables.

alter table public.merchant_cod_settings enable row level security;
alter table public.order_shipping_details enable row level security;
alter table public.order_cod_details enable row level security;
alter table public.order_payment_method_events enable row level security;
