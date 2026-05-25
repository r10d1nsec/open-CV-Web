-- Folio · Migration 0004 — Avatars storage bucket + RLS
-- Refs: spec:002 §Implementation (avatar), Sprint 4 S4.7
-- Date: 2026-05-24
--
-- Bucket público (los avatares son por definición visibles en el perfil
-- público). RLS limita INSERT/UPDATE/DELETE al owner: el path debe empezar
-- por `{auth.uid()}/` para que la regla pase. SELECT es público.

begin;

-- ============================================================================
-- 1) Crear bucket si no existe
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2 * 1024 * 1024, -- 2 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- 2) Policies sobre storage.objects para este bucket
-- ============================================================================

-- Lectura pública (los avatares se sirven en /<u> sin autenticación).
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- INSERT solo si el path empieza por `<user_id>/` y el user está autenticado.
drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE solo del owner.
drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE solo del owner.
drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
