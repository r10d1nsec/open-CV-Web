-- Folio · Migration 0006 — contact_messages
-- Refs: spec:012 (contact form), Sprint 6
-- Date: 2026-05-24
--
-- Tabla para logear mensajes recibidos vía /<u>/contact. Le permite al
-- alumno consultar mensajes en un futuro inbox (post-v1) y nos da una
-- pista de spam patterns durante la beta.
--
-- RLS: solo el owner del perfil destinatario puede leer SUS mensajes.
-- INSERT es público (cualquiera puede enviar) pero la session NO puede
-- contener auth.uid() del receptor — el insert escribe profile_id como
-- referencia a public.profiles.id, no a auth.users.id, y la política
-- with check no se basa en propiedad.

begin;

create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  sender_name   text not null,
  sender_email  text not null,
  message       text not null,
  delivered     boolean not null default false,
  delivery_err  text,
  created_at    timestamptz not null default now(),
  ip_hash       text
);

create index if not exists contact_messages_profile_id_created_at
  on public.contact_messages (profile_id, created_at desc);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.contact_messages enable row level security;

-- SELECT: solo el owner del perfil destinatario.
drop policy if exists "contact_messages owner read" on public.contact_messages;
create policy "contact_messages owner read"
on public.contact_messages for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = contact_messages.profile_id
      and p.user_id = auth.uid()
  )
);

-- INSERT: público (anon o authenticated) — la action server valida + rate-limits
-- antes de llamar al insert. with check exige que el profile_id apunte a un
-- perfil publicado (is_published = true) para que no se pueda escribir contra
-- perfiles privados.
drop policy if exists "contact_messages public insert" on public.contact_messages;
create policy "contact_messages public insert"
on public.contact_messages for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = contact_messages.profile_id
      and p.is_published = true
  )
);

-- Sin UPDATE/DELETE policies — solo escritura inicial y lectura del owner.
-- Cambio de estado `delivered` lo hace el service role desde la action.

commit;
