-- Folio · Migration 0002 — RLS policies
-- Refs: spec:002 (profile), adr:0003 (schema & rls strategy)
-- Date: 2026-05-22
--
-- Enables RLS on every public.* table and applies the canonical 3-policy pattern:
--   - <table>_public_read    : anon + authenticated, gated by parent profile.is_published
--   - <table>_self_read      : authenticated, owner of the parent profile
--   - <table>_self_write     : authenticated, owner only (USING + WITH CHECK)
-- See ADR-0003 §3 for the pattern reference.

begin;

-- ============================================================================
-- profiles
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select to anon, authenticated
  using (is_published = true);

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists profiles_self_delete on public.profiles;
create policy profiles_self_delete on public.profiles
  for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- subtable policy template (applied to: social_links, skill_groups,
-- experience_items, projects, services, testimonials, username_history)
-- ============================================================================

-- social_links
alter table public.social_links enable row level security;
alter table public.social_links force row level security;

drop policy if exists social_links_public_read on public.social_links;
create policy social_links_public_read on public.social_links
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = social_links.profile_id and p.is_published = true
  ));

drop policy if exists social_links_self_read on public.social_links;
create policy social_links_self_read on public.social_links
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = social_links.profile_id and p.user_id = auth.uid()
  ));

drop policy if exists social_links_self_write on public.social_links;
create policy social_links_self_write on public.social_links
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = social_links.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = social_links.profile_id and p.user_id = auth.uid()
  ));

-- skill_groups
alter table public.skill_groups enable row level security;
alter table public.skill_groups force row level security;

drop policy if exists skill_groups_public_read on public.skill_groups;
create policy skill_groups_public_read on public.skill_groups
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = skill_groups.profile_id and p.is_published = true
  ));

drop policy if exists skill_groups_self_read on public.skill_groups;
create policy skill_groups_self_read on public.skill_groups
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = skill_groups.profile_id and p.user_id = auth.uid()
  ));

drop policy if exists skill_groups_self_write on public.skill_groups;
create policy skill_groups_self_write on public.skill_groups
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = skill_groups.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = skill_groups.profile_id and p.user_id = auth.uid()
  ));

-- experience_items
alter table public.experience_items enable row level security;
alter table public.experience_items force row level security;

drop policy if exists experience_items_public_read on public.experience_items;
create policy experience_items_public_read on public.experience_items
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = experience_items.profile_id and p.is_published = true
  ));

drop policy if exists experience_items_self_read on public.experience_items;
create policy experience_items_self_read on public.experience_items
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = experience_items.profile_id and p.user_id = auth.uid()
  ));

drop policy if exists experience_items_self_write on public.experience_items;
create policy experience_items_self_write on public.experience_items
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = experience_items.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = experience_items.profile_id and p.user_id = auth.uid()
  ));

-- projects
alter table public.projects enable row level security;
alter table public.projects force row level security;

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = projects.profile_id and p.is_published = true
  ));

drop policy if exists projects_self_read on public.projects;
create policy projects_self_read on public.projects
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = projects.profile_id and p.user_id = auth.uid()
  ));

drop policy if exists projects_self_write on public.projects;
create policy projects_self_write on public.projects
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = projects.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = projects.profile_id and p.user_id = auth.uid()
  ));

-- services
alter table public.services enable row level security;
alter table public.services force row level security;

drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = services.profile_id and p.is_published = true
  ) and is_active = true);

drop policy if exists services_self_read on public.services;
create policy services_self_read on public.services
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = services.profile_id and p.user_id = auth.uid()
  ));

drop policy if exists services_self_write on public.services;
create policy services_self_write on public.services
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = services.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = services.profile_id and p.user_id = auth.uid()
  ));

-- testimonials
alter table public.testimonials enable row level security;
alter table public.testimonials force row level security;

drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = testimonials.profile_id and p.is_published = true
  ));

drop policy if exists testimonials_self_read on public.testimonials;
create policy testimonials_self_read on public.testimonials
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = testimonials.profile_id and p.user_id = auth.uid()
  ));

drop policy if exists testimonials_self_write on public.testimonials;
create policy testimonials_self_write on public.testimonials
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = testimonials.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = testimonials.profile_id and p.user_id = auth.uid()
  ));

-- username_history (public read for 301 redirect resolution)
alter table public.username_history enable row level security;
alter table public.username_history force row level security;

drop policy if exists username_history_public_read on public.username_history;
create policy username_history_public_read on public.username_history
  for select to anon, authenticated
  using (true);

drop policy if exists username_history_self_write on public.username_history;
create policy username_history_self_write on public.username_history
  for all to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = username_history.profile_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = username_history.profile_id and p.user_id = auth.uid()
  ));

commit;
