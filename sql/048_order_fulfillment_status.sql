-- ArmAI: Fulfillment lifecycle (separate from payment). Additive only.

do $$ begin
  create type fulfillment_status_enum as enum (
    'pending_fulfillment',
    'packed',
    'shipped',
    'delivered',
    'delivery_failed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'orders' and column_name = 'fulfillment_status') then
    alter table public.orders add column fulfillment_status fulfillment_status_enum;
  end if;
end $$;

comment on column public.orders.fulfillment_status is 'Post-payment fulfillment state. Set to pending_fulfillment when payment becomes paid (prepaid or COD collected).';
