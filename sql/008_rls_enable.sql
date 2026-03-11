-- ArmAI SQL Schema - Part 8: Enable RLS on all tenant and sensitive tables

alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.merchant_members enable row level security;
alter table public.merchant_settings enable row level security;
alter table public.facebook_pages enable row level security;
alter table public.webhook_events enable row level security;
alter table public.conversations enable row level security;
alter table public.message_buffers enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;
alter table public.order_slips enable row level security;
alter table public.bank_configs enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.matching_results enable row level security;
alter table public.ai_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.support_access_logs enable row level security;
alter table public.merchant_plans enable row level security;
