-- Single plan: Standard 1,999,000 LAK/month, all features.
-- Removes Basic/Pro; one plan only.

delete from public.subscription_plans where code in ('basic', 'pro');

insert into public.subscription_plans (name, code, price_lak, features, max_users, active, sort_order)
values (
  'Standard',
  'standard',
  1999000,
  '[
    "Core AI features",
    "Unlimited users",
    "Analytics",
    "Priority support",
    "All channels (Facebook, WhatsApp, Telegram)",
    "Bank sync & payment config",
    "Knowledge base & promotions"
  ]'::jsonb,
  null,
  true,
  0
)
on conflict (code) do update set
  name = excluded.name,
  price_lak = excluded.price_lak,
  features = excluded.features,
  max_users = excluded.max_users,
  active = true,
  updated_at = now();
