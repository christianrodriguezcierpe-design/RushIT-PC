alter table public.notification_logs
add column if not exists provider text;

update public.notification_logs
set provider = 'postmark'
where provider is null;

alter table public.notification_logs
alter column provider set default 'postmark';

alter table public.notification_logs
alter column provider set not null;

alter table public.notification_logs
drop constraint if exists notification_logs_provider_check;

alter table public.notification_logs
add constraint notification_logs_provider_check
check (provider in ('postmark'));

create index if not exists notification_logs_status_created_at_idx
  on public.notification_logs (status, created_at desc);
