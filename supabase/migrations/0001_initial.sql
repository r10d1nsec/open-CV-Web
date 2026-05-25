-- Folio · Migration 0001 — Initial schema
-- Refs: spec:002 (profile), adr:0003 (schema & rls strategy)
-- Date: 2026-05-22
--
-- Creates the core profile schema (profiles + child tables).
-- RLS policies live in 0002_rls_policies.sql.
-- Triggers live in 0003_triggers.sql.

begin;

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ============================================================================
-- profiles
-- ============================================================================
create table if not exists public.profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  username        citext not null unique,
  full_name       text not null,
  initials        text not null default '',
  title           text not null default '',
  bio             text not null default '',
  location        text not null default '',
  languages       text[] not null default '{}',
  avatar_url      text,
  available       boolean not null default false,
  available_line  text,
  hourly          text,
  email_public    text,
  phone_public    text,
  website         text,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_username_format check (
    username ~ '^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$'
  )
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_published_idx on public.profiles(is_published) where is_published = true;

-- ============================================================================
-- social_links
-- ============================================================================
create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in ('github','linkedin','twitter','figma','read','website','custom')),
  handle      text not null,
  url         text,
  label       text,
  position    integer not null default 0
);

create index if not exists social_links_profile_id_idx on public.social_links(profile_id);

-- ============================================================================
-- skill_groups
-- ============================================================================
create table if not exists public.skill_groups (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  items       text[] not null default '{}',
  position    integer not null default 0
);

create index if not exists skill_groups_profile_id_idx on public.skill_groups(profile_id);

-- ============================================================================
-- experience_items
-- ============================================================================
create table if not exists public.experience_items (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  role        text not null,
  org         text not null,
  period      text not null,
  blurb       text not null default '',
  "current"   boolean not null default false,
  position    integer not null default 0
);

create index if not exists experience_items_profile_id_idx on public.experience_items(profile_id);

-- ============================================================================
-- projects
-- ============================================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  tag         text not null default '',
  blurb       text not null default '',
  stack       text[] not null default '{}',
  color       text not null default '#3b82f6',
  github_url  text,
  live_url    text,
  highlight   boolean not null default false,
  position    integer not null default 0,
  constraint projects_color_hex check (color ~ '^#[0-9a-fA-F]{6}$')
);

create index if not exists projects_profile_id_idx on public.projects(profile_id);

-- ============================================================================
-- services
-- ============================================================================
create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references public.profiles(id) on delete cascade,
  external_id       text not null,
  name              text not null,
  duration_minutes  integer,
  duration_text     text,
  price             text not null,
  blurb             text not null default '',
  popular           boolean not null default false,
  is_active         boolean not null default true,
  position          integer not null default 0,
  unique (profile_id, external_id),
  constraint services_duration_present check (
    duration_minutes is not null or duration_text is not null
  )
);

create index if not exists services_profile_id_idx on public.services(profile_id);

-- ============================================================================
-- testimonials
-- ============================================================================
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  quote       text not null,
  author      text not null,
  org         text not null default '',
  position    integer not null default 0
);

create index if not exists testimonials_profile_id_idx on public.testimonials(profile_id);

-- ============================================================================
-- username_history (for 301 redirects after username change, 30-day TTL)
-- ============================================================================
create table if not exists public.username_history (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  old_username  citext not null,
  changed_at    timestamptz not null default now()
);

create index if not exists username_history_old_username_idx on public.username_history(old_username);
create index if not exists username_history_profile_id_idx on public.username_history(profile_id);

commit;
