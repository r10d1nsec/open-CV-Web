-- Folio · Migration 0007 — Personalización del portfolio
-- Refs: spec:014 (personalización), adr:0006 (theming), maqueta brand
-- Date: 2026-05-25
--
-- Añade a profiles los campos de personalización visual (acento, cover,
-- fuente, layout, orden y visibilidad de secciones) y a projects una imagen
-- de preview. Sin RLS nueva: hereda las políticas de profiles/projects (0002).

begin;

-- ── profiles: personalización ───────────────────────────────────────────────
alter table public.profiles
  add column if not exists accent_color text not null default '#3b82f6',
  add column if not exists cover_image_url text,
  add column if not exists font_family text not null default 'plus-jakarta',
  add column if not exists layout_variant text not null default 'default',
  add column if not exists section_order text[] not null
    default '{hero,skills,experience,projects,testimonials,services,contact}',
  add column if not exists section_hidden text[] not null default '{}';

-- Color de acento: hex de 6 dígitos.
alter table public.profiles
  drop constraint if exists profiles_accent_color_hex;
alter table public.profiles
  add constraint profiles_accent_color_hex
  check (accent_color ~ '^#[0-9a-fA-F]{6}$');

-- Fuente: conjunto cerrado.
alter table public.profiles
  drop constraint if exists profiles_font_family_set;
alter table public.profiles
  add constraint profiles_font_family_set
  check (font_family in ('plus-jakarta', 'inter', 'tiempos'));

-- Layout: conjunto cerrado.
alter table public.profiles
  drop constraint if exists profiles_layout_variant_set;
alter table public.profiles
  add constraint profiles_layout_variant_set
  check (layout_variant in ('default', 'sidebar', 'minimal'));

-- ── projects: imagen de preview ──────────────────────────────────────────────
alter table public.projects
  add column if not exists image_url text;

commit;
