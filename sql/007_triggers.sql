-- ArmAI SQL Schema - Part 7: Triggers (timestamps, profile init)

-- Auto-update updated_at on core tables.
create or replace function public.trg_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'profiles_updated_at') then
    create trigger profiles_updated_at
      before update on public.profiles
      for each row execute function public.trg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'merchants_updated_at') then
    create trigger merchants_updated_at
      before update on public.merchants
      for each row execute function public.trg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'merchant_members_updated_at') then
    create trigger merchant_members_updated_at
      before update on public.merchant_members
      for each row execute function public.trg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'merchant_settings_updated_at') then
    create trigger merchant_settings_updated_at
      before update on public.merchant_settings
      for each row execute function public.trg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'orders_updated_at') then
    create trigger orders_updated_at
      before update on public.orders
      for each row execute function public.trg_set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'matching_results_updated_at') then
    create trigger matching_results_updated_at
      before update on public.matching_results
      for each row execute function public.trg_set_updated_at();
  end if;
end $$;

-- Create profile on signup (auth.users insert). Uncomment to enable; requires Supabase to allow trigger on auth.users.
-- create or replace function public.handle_new_user()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   insert into public.profiles (id, email, full_name, role)
--   values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 'merchant_admin');
--   return new;
-- end;
-- $$;
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
