create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  service_key text not null,
  service_label text not null,
  preferred_date date not null,
  preferred_time time not null,
  message text not null default '',
  status text not null default 'submitted',
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint appointment_requests_status check (status in ('submitted', 'accepted', 'rejected'))
);

create index if not exists appointment_requests_status_idx
  on public.appointment_requests (status);

create index if not exists appointment_requests_created_at_idx
  on public.appointment_requests (created_at desc);

create table if not exists public.appointment_request_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_request_id uuid not null references public.appointment_requests (id) on delete cascade,
  note text not null,
  created_by uuid,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists appointment_request_notes_request_id_idx
  on public.appointment_request_notes (appointment_request_id, created_at asc);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_request_id uuid not null references public.appointment_requests (id) on delete cascade,
  event_type text not null,
  channel text not null default 'email',
  recipient text,
  status text not null default 'pending',
  provider_message_id text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_logs_event_type check (event_type in ('admin_new_request', 'customer_accepted', 'customer_rejected')),
  constraint notification_logs_channel check (channel = 'email'),
  constraint notification_logs_status check (status in ('pending', 'sent', 'failed', 'skipped')),
  constraint notification_logs_payload_is_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists notification_logs_request_id_idx
  on public.notification_logs (appointment_request_id, created_at desc);

drop trigger if exists appointment_requests_set_updated_at on public.appointment_requests;
create trigger appointment_requests_set_updated_at
before update on public.appointment_requests
for each row
execute function public.set_updated_at();

drop trigger if exists notification_logs_set_updated_at on public.notification_logs;
create trigger notification_logs_set_updated_at
before update on public.notification_logs
for each row
execute function public.set_updated_at();

create or replace function public.queue_admin_notification_for_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  business_email text;
begin
  select email into business_email
  from public.business_profile
  where id = 'default';

  insert into public.notification_logs (
    appointment_request_id,
    event_type,
    channel,
    recipient,
    status,
    error_message,
    payload
  )
  values (
    new.id,
    'admin_new_request',
    'email',
    business_email,
    case when coalesce(business_email, '') = '' then 'skipped' else 'pending' end,
    case when coalesce(business_email, '') = '' then 'Missing business email for admin notification.' else null end,
    jsonb_build_object(
      'customerName', new.customer_name,
      'customerEmail', new.customer_email,
      'serviceLabel', new.service_label,
      'preferredDate', new.preferred_date,
      'preferredTime', new.preferred_time
    )
  );

  return new;
end;
$$;

create or replace function public.queue_customer_notification_for_request_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_event_type text;
begin
  if old.status is distinct from new.status and new.status in ('accepted', 'rejected') then
    next_event_type := case when new.status = 'accepted' then 'customer_accepted' else 'customer_rejected' end;

    insert into public.notification_logs (
      appointment_request_id,
      event_type,
      channel,
      recipient,
      status,
      error_message,
      payload
    )
    values (
      new.id,
      next_event_type,
      'email',
      new.customer_email,
      case when coalesce(new.customer_email, '') = '' then 'skipped' else 'pending' end,
      case when coalesce(new.customer_email, '') = '' then 'Missing customer email for decision notification.' else null end,
      jsonb_build_object(
        'customerName', new.customer_name,
        'serviceLabel', new.service_label,
        'status', new.status
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists appointment_requests_queue_admin_notification on public.appointment_requests;
create trigger appointment_requests_queue_admin_notification
after insert on public.appointment_requests
for each row
execute function public.queue_admin_notification_for_request();

drop trigger if exists appointment_requests_queue_customer_notification on public.appointment_requests;
create trigger appointment_requests_queue_customer_notification
after update on public.appointment_requests
for each row
execute function public.queue_customer_notification_for_request_decision();

alter table public.appointment_requests enable row level security;
alter table public.appointment_request_notes enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "Public submit appointment requests" on public.appointment_requests;
create policy "Public submit appointment requests"
on public.appointment_requests
for insert
to anon, authenticated
with check (
  status = 'submitted'
  and reviewed_at is null
  and reviewed_by is null
);

drop policy if exists "Authenticated read appointment requests" on public.appointment_requests;
create policy "Authenticated read appointment requests"
on public.appointment_requests
for select
to authenticated
using (true);

drop policy if exists "Authenticated update appointment requests" on public.appointment_requests;
create policy "Authenticated update appointment requests"
on public.appointment_requests
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated read appointment request notes" on public.appointment_request_notes;
create policy "Authenticated read appointment request notes"
on public.appointment_request_notes
for select
to authenticated
using (true);

drop policy if exists "Authenticated create appointment request notes" on public.appointment_request_notes;
create policy "Authenticated create appointment request notes"
on public.appointment_request_notes
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated read notification logs" on public.notification_logs;
create policy "Authenticated read notification logs"
on public.notification_logs
for select
to authenticated
using (true);

drop policy if exists "Authenticated update notification logs" on public.notification_logs;
create policy "Authenticated update notification logs"
on public.notification_logs
for update
to authenticated
using (true)
with check (true);
