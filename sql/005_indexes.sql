-- ArmAI SQL Schema - Part 5: Additional indexes
-- Core indexes are in 003/004; add any composite or lookup indexes here.

create index if not exists idx_merchant_members_user_id on public.merchant_members (user_id);
create index if not exists idx_facebook_pages_page_id on public.facebook_pages (page_id);
create index if not exists idx_conversations_merchant on public.conversations (merchant_id);
