create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.business_profile (
  id text primary key default 'default',
  name text not null,
  tagline text not null,
  logo_icon text not null,
  phone_label text not null,
  phone_href text not null,
  email text not null,
  address_lines jsonb not null default '[]'::jsonb,
  hours jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_profile_singleton check (id = 'default'),
  constraint business_profile_address_lines_is_array check (jsonb_typeof(address_lines) = 'array'),
  constraint business_profile_hours_is_array check (jsonb_typeof(hours) = 'array')
);

create table if not exists public.deployment_config (
  id text primary key default 'default',
  package_tier text not null,
  theme_preset text not null,
  enabled_add_ons jsonb not null default '[]'::jsonb,
  allowed_managed_sections jsonb not null default '[]'::jsonb,
  locked_fixed_sections jsonb not null default '[]'::jsonb,
  can_reorder_managed_sections boolean not null default false,
  can_reorder_collection_items boolean not null default false,
  allowed_collections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint deployment_config_singleton check (id = 'default'),
  constraint deployment_config_package_tier check (package_tier in ('base', 'growth', 'premium')),
  constraint deployment_config_enabled_add_ons_is_array check (jsonb_typeof(enabled_add_ons) = 'array'),
  constraint deployment_config_allowed_managed_sections_is_array check (jsonb_typeof(allowed_managed_sections) = 'array'),
  constraint deployment_config_locked_fixed_sections_is_array check (jsonb_typeof(locked_fixed_sections) = 'array'),
  constraint deployment_config_allowed_collections_is_array check (jsonb_typeof(allowed_collections) = 'array')
);

create table if not exists public.fixed_section_content (
  section_key text primary key,
  enabled boolean not null default true,
  locked_position text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint fixed_section_content_key check (section_key in ('emergencyBanner', 'navbar', 'hero', 'footer')),
  constraint fixed_section_content_locked_position check (locked_position in ('announcement', 'header', 'hero', 'footer')),
  constraint fixed_section_content_content_is_object check (jsonb_typeof(content) = 'object')
);

create table if not exists public.managed_section_content (
  section_key text primary key,
  enabled boolean not null default true,
  order_index integer not null,
  admin_reorderable boolean not null default true,
  add_on_id text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint managed_section_content_key check (
    section_key in (
      'trustBar',
      'services',
      'pricing',
      'howItWorks',
      'beforeAfterGallery',
      'reviews',
      'caseStudies',
      'team',
      'leadMagnet',
      'serviceArea',
      'faq',
      'booking',
      'blogPreview'
    )
  ),
  constraint managed_section_content_add_on_id check (
    add_on_id is null or add_on_id in ('pricing', 'beforeAfterGallery', 'caseStudies', 'team', 'leadMagnet', 'blogPreview')
  ),
  constraint managed_section_content_content_is_object check (jsonb_typeof(content) = 'object')
);

create index if not exists managed_section_content_order_index_idx
  on public.managed_section_content (order_index);

drop trigger if exists business_profile_set_updated_at on public.business_profile;
create trigger business_profile_set_updated_at
before update on public.business_profile
for each row
execute function public.set_updated_at();

drop trigger if exists deployment_config_set_updated_at on public.deployment_config;
create trigger deployment_config_set_updated_at
before update on public.deployment_config
for each row
execute function public.set_updated_at();

drop trigger if exists fixed_section_content_set_updated_at on public.fixed_section_content;
create trigger fixed_section_content_set_updated_at
before update on public.fixed_section_content
for each row
execute function public.set_updated_at();

drop trigger if exists managed_section_content_set_updated_at on public.managed_section_content;
create trigger managed_section_content_set_updated_at
before update on public.managed_section_content
for each row
execute function public.set_updated_at();

alter table public.business_profile enable row level security;
alter table public.deployment_config enable row level security;
alter table public.fixed_section_content enable row level security;
alter table public.managed_section_content enable row level security;

drop policy if exists "Public read business profile" on public.business_profile;
create policy "Public read business profile"
on public.business_profile
for select
to anon, authenticated
using (true);

drop policy if exists "Public read deployment config" on public.deployment_config;
create policy "Public read deployment config"
on public.deployment_config
for select
to anon, authenticated
using (true);

drop policy if exists "Public read fixed section content" on public.fixed_section_content;
create policy "Public read fixed section content"
on public.fixed_section_content
for select
to anon, authenticated
using (true);

drop policy if exists "Public read managed section content" on public.managed_section_content;
create policy "Public read managed section content"
on public.managed_section_content
for select
to anon, authenticated
using (true);
