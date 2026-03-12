-- ArmAI: Retention-ready design for raw event tables.
-- Adds retention_class and optional retained_until for cleanup eligibility.
-- Additive only; no automatic deletion. Cleanup via admin/scheduler using these columns.

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'webhook_events' and column_name = 'retention_class') then
    alter table public.webhook_events add column retention_class text default 'short';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'webhook_events' and column_name = 'retained_until') then
    alter table public.webhook_events add column retained_until timestamptz;
  end if;
end $$;

comment on column public.webhook_events.retention_class is 'short | medium | long. short = eligible for purge sooner (e.g. 30d).';
comment on column public.webhook_events.retained_until is 'Earliest time after which row is eligible for archive/delete. NULL = use policy default.';

-- bank_raw_notification_events: add if table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'bank_raw_notification_events') then
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_raw_notification_events' and column_name = 'retention_class') then
      alter table public.bank_raw_notification_events add column retention_class text default 'short';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_raw_notification_events' and column_name = 'retained_until') then
      alter table public.bank_raw_notification_events add column retained_until timestamptz;
    end if;
  end if;
end $$;

-- telegram_messages: raw intake
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'telegram_messages') then
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'telegram_messages' and column_name = 'retention_class') then
      alter table public.telegram_messages add column retention_class text default 'short';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'telegram_messages' and column_name = 'retained_until') then
      alter table public.telegram_messages add column retained_until timestamptz;
    end if;
  end if;
end $$;

-- bank_transaction_processing_logs: medium retention
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'bank_transaction_processing_logs') then
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_transaction_processing_logs' and column_name = 'retention_class') then
      alter table public.bank_transaction_processing_logs add column retention_class text default 'medium';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bank_transaction_processing_logs' and column_name = 'retained_until') then
      alter table public.bank_transaction_processing_logs add column retained_until timestamptz;
    end if;
  end if;
end $$;
