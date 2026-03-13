drop policy if exists "Authenticated update business profile" on public.business_profile;
create policy "Authenticated update business profile"
on public.business_profile
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated update managed section content" on public.managed_section_content;
create policy "Authenticated update managed section content"
on public.managed_section_content
for update
to authenticated
using (true)
with check (true);
