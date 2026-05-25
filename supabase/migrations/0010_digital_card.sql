-- Folio · Migration 0010 — Rediseño Digital Card (mobile-first, personalizable)
-- Refs: spec:005 (digital card), promptdesign.md (card v2)
-- Date: 2026-05-25
--
-- Añade personalización de la card y enlaces personalizados ilimitados.

begin;

-- ── profiles: campos de card ────────────────────────────────────────────────
alter table public.profiles
  add column if not exists company text,
  add column if not exists whatsapp text,
  add column if not exists whatsapp_message text,
  add column if not exists card_style text not null default 'aurora',
  add column if not exists card_cover_url text;

alter table public.profiles drop constraint if exists profiles_card_style_set;
alter table public.profiles
  add constraint profiles_card_style_set check (card_style in ('aurora', 'minimal', 'mesh'));

-- ── card_links: enlaces personalizados (link-in-bio) ────────────────────────
create table if not exists public.card_links (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  icon        text not null default 'link',
  label       text not null,
  url         text not null,
  position    integer not null default 0
);
create index if not exists card_links_profile_idx on public.card_links(profile_id);

alter table public.card_links enable row level security;

drop policy if exists "card_links public read" on public.card_links;
create policy "card_links public read" on public.card_links for select
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.is_published = true));
drop policy if exists "card_links owner read" on public.card_links;
create policy "card_links owner read" on public.card_links for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));
drop policy if exists "card_links owner write" on public.card_links;
create policy "card_links owner write" on public.card_links for all to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));

commit;
