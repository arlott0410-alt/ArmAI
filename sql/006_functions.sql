-- ArmAI SQL Schema - Part 6: Helper functions for RLS and role checks

-- Current user's profile role (super_admin or merchant_admin).
create or replace function public.current_user_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- Is current user super_admin?
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (public.current_user_role() = 'super_admin');
$$;

-- Is current user a member of the given merchant?
create or replace function public.user_merchant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select merchant_id from public.merchant_members where user_id = auth.uid();
$$;

-- Check if uid is member of merchant_id (for use in RLS).
create or replace function public.user_can_access_merchant(merchant_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.merchant_members
    where user_id = auth.uid() and merchant_id = merchant_uuid
  );
$$;

-- Updated_at trigger helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
