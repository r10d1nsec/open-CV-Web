-- Folio · Migration 0003 — Triggers
-- Refs: spec:001 (auth), spec:002 (profile), adr:0003 (schema & rls strategy)
-- Date: 2026-05-22
--
-- Two triggers:
--   1. set_updated_at()  — generic, applied to profiles. Reused by future tables.
--   2. handle_new_user() — fires after auth.users INSERT, seeds public.profiles
--                          skeleton with a provisional username.

begin;

-- ============================================================================
-- 1) set_updated_at()
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2) handle_new_user()
--
-- On signup, Supabase Auth inserts into auth.users. We create a matching
-- profiles row with a provisional username `user-<8-char-suffix>` so the user
-- always has a profile to land on. Sprint 5 (onboarding) lets them claim a
-- proper username.
--
-- SECURITY DEFINER so the trigger can write to public.profiles regardless of
-- the calling role. We pin search_path to avoid hijacking.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  provisional_username citext;
begin
  provisional_username := ('user-' || substr(new.id::text, 1, 8))::citext;

  insert into public.profiles (user_id, username, full_name)
  values (
    new.id,
    provisional_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
