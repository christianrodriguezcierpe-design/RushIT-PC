alter table public.deployment_config
add column if not exists notification_provider text;

update public.deployment_config
set notification_provider = 'postmark'
where notification_provider is null;

alter table public.deployment_config
alter column notification_provider set default 'postmark';

alter table public.deployment_config
alter column notification_provider set not null;

alter table public.deployment_config
drop constraint if exists deployment_config_notification_provider_check;

alter table public.deployment_config
add constraint deployment_config_notification_provider_check
check (notification_provider in ('postmark', 'smtp'));

alter table public.notification_logs
alter column provider drop default;

alter table public.notification_logs
drop constraint if exists notification_logs_provider_check;

alter table public.notification_logs
add constraint notification_logs_provider_check
check (provider is null or provider in ('postmark', 'smtp'));
