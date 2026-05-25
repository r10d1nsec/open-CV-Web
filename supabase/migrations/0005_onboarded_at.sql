-- Folio · Migration 0005 — profiles.onboarded_at
-- Refs: spec:011 (onboarding), Sprint 5 S5.1
-- Date: 2026-05-24
--
-- Un usuario nuevo tiene una fila `profiles` provisional (creada por
-- `handle_new_user`) con `username = 'user-<8>'` y `full_name = ''`.
-- El wizard `/onboarding` rellena los campos esenciales y, al cerrar,
-- marca `onboarded_at = now()`. El middleware/redirects usan esa
-- ausencia para gatear al user fuera del dashboard.
--
-- Nullable (no `not null`): perfiles previos al deploy mantienen
-- onboarded_at = null y se les fuerza el wizard la próxima vez que
-- entren al dashboard.

begin;

alter table public.profiles
  add column if not exists onboarded_at timestamptz;

-- Índice para consultas tipo "todavía no onboarded" (oncoming dashboards
-- de admin, métricas para el profesor). Partial index — barato.
create index if not exists profiles_not_onboarded
  on public.profiles (user_id)
  where onboarded_at is null;

commit;
