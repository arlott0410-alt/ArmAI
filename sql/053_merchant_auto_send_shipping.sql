-- ArmAI: Merchant setting for automatic shipping confirmation message. Additive only.

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'merchant_settings' and column_name = 'auto_send_shipping_confirmation') then
    alter table public.merchant_settings add column auto_send_shipping_confirmation boolean not null default false;
  end if;
end $$;

comment on column public.merchant_settings.auto_send_shipping_confirmation is 'When true, system sends shipping/tracking confirmation to customer after shipment creation.';
