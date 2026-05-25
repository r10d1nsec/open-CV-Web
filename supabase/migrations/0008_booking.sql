-- Folio · Migration 0008 — Booking autogestionado (sin Google Calendar)
-- Refs: spec:007 (booking, re-scoped), maqueta booking/booking-admin
-- Date: 2026-05-25
--
-- Modelo simple, single-timezone (Europe/Madrid): el dueño define franjas
-- semanales recurrentes; los visitantes reservan un slot (fecha + minuto local
-- + duración) que entra como 'pending' hasta que el dueño lo confirma.
-- Sin OAuth, sin sync externo. Las horas se interpretan en hora de España
-- (se indica en la página).

begin;

-- ── availability_rules: franjas semanales recurrentes ───────────────────────
-- weekday: 0=Lunes … 6=Domingo. *_min: minutos desde medianoche (0..1440).
create table if not exists public.availability_rules (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6),
  start_min   smallint not null check (start_min between 0 and 1439),
  end_min     smallint not null check (end_min between 1 and 1440),
  position    integer not null default 0,
  constraint availability_range_valid check (end_min > start_min)
);
create index if not exists availability_rules_profile_idx
  on public.availability_rules (profile_id, weekday);

-- ── bookings ────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  service_external_id text,
  service_name        text not null default '',
  slot_date           date not null,
  start_min           smallint not null check (start_min between 0 and 1439),
  duration_minutes    smallint not null check (duration_minutes between 5 and 1440),
  booker_name         text not null,
  booker_email        text not null,
  message             text not null default '',
  status              text not null default 'pending'
                        check (status in ('pending','confirmed','rejected','cancelled')),
  created_at          timestamptz not null default now()
);
create index if not exists bookings_profile_status_idx
  on public.bookings (profile_id, slot_date, status);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.availability_rules enable row level security;
alter table public.bookings enable row level security;

-- availability: lectura pública si el perfil está publicado (para pintar slots);
-- escritura solo el dueño.
drop policy if exists "availability public read" on public.availability_rules;
create policy "availability public read" on public.availability_rules for select
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.is_published = true));
drop policy if exists "availability owner read" on public.availability_rules;
create policy "availability owner read" on public.availability_rules for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));
drop policy if exists "availability owner write" on public.availability_rules;
create policy "availability owner write" on public.availability_rules for all to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));

-- bookings: el dueño lee/gestiona las suyas; el público puede INSERTAR solo
-- como 'pending' contra perfiles publicados (igual patrón que contact_messages).
drop policy if exists "bookings owner read" on public.bookings;
create policy "bookings owner read" on public.bookings for select to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));
drop policy if exists "bookings owner update" on public.bookings;
create policy "bookings owner update" on public.bookings for update to authenticated
  using (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p
                 where p.id = profile_id and p.user_id = auth.uid()));
drop policy if exists "bookings public insert" on public.bookings;
create policy "bookings public insert" on public.bookings for insert
  with check (
    status = 'pending'
    and exists (select 1 from public.profiles p
                where p.id = profile_id and p.is_published = true)
  );

commit;
