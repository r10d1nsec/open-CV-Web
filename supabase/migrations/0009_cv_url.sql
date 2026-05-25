-- Folio · Migration 0009 — CV vía URL (Google Drive u otro)
-- Refs: spec:004 (CV, re-scoped a URL en vez de upload), spec:002
-- Date: 2026-05-25
--
-- En vez de subir el PDF (storage + signed URLs), el alumno pega un enlace
-- compartible (Drive, Dropbox, su web…). Se muestra como botón en portfolio
-- y card. Additive, sin RLS nueva (hereda profiles).

begin;

alter table public.profiles
  add column if not exists cv_url text;

commit;
