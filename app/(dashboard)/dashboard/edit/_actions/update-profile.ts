'use server';

/**
 * Server Actions del editor de perfil (Sprint 4 S4.6).
 *
 * Una action por sección. Cada una:
 *   1. Resuelve el user autenticado (server-only, vía Supabase auth).
 *   2. Valida el payload con el schema zod correspondiente.
 *   3. Persiste con RLS activo — los UPDATE/DELETE solo afectan filas del
 *      perfil cuyo `user_id = auth.uid()`.
 *   4. Revalida `/dashboard` y la ruta pública del perfil para que el cambio
 *      sea visible inmediatamente.
 *
 * Refs: spec:002 §Implementation, adr:0003 (RLS), Sprint 4 S4.6.
 */

import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  BioSchema,
  IdentitySchema,
  SkillsSchema,
  SocialSchema,
  ExperienceSchema,
  ProjectsSchema,
  TestimonialsSchema,
  ServicesSchema,
  BrandSchema,
  CardSchema,
  CardLinksSchema,
} from '@/lib/validation/profile';
import type { SocialKind } from '@/types/profile';

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const SOCIAL_KINDS = ['github', 'linkedin', 'twitter', 'figma', 'read', 'website', 'custom'] as const;

type OwnedProfile = Awaited<ReturnType<typeof loadOwnedProfile>>;

async function loadOwnedProfile() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return { ok: false, error: 'No has iniciado sesión.' } as const;
  }
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !profile) {
    return {
      ok: false,
      error: 'Perfil no encontrado. Completa tu onboarding antes de editar.',
    } as const;
  }
  return { ok: true as const, supabase, user, profile };
}

function isOwned(o: OwnedProfile): o is Extract<OwnedProfile, { ok: true }> {
  return o.ok === true;
}

function flattenZodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_root';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function revalidateProfileSurfaces(username: string) {
  revalidatePath('/dashboard');
  revalidatePath(`/${username}`);
  revalidatePath(`/c/${username}`);
}

function languagesFromFormData(fd: FormData): string[] {
  const raw = (fd.get('languages') as string | null) ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ---- Identity ----

export async function updateIdentity(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const parsed = IdentitySchema.safeParse({
    name: fd.get('name'),
    title: fd.get('title'),
    location: fd.get('location'),
    languages: languagesFromFormData(fd),
    hourly: fd.get('hourly'),
    available: fd.get('available'),
    availableLine: fd.get('availableLine'),
    cvUrl: fd.get('cvUrl'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.name,
      title: parsed.data.title,
      location: parsed.data.location,
      languages: parsed.data.languages,
      hourly: parsed.data.hourly ?? null,
      available: parsed.data.available,
      available_line: parsed.data.availableLine ?? null,
      cv_url: parsed.data.cvUrl ?? null,
    })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar. Inténtalo de nuevo.' };

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Bio ----

export async function updateBio(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const parsed = BioSchema.safeParse({ bio: fd.get('bio') });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'La bio es demasiado larga (máximo 500 caracteres).',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ bio: parsed.data.bio })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar la bio.' };

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Social ----

export async function updateSocial(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const payload = Object.fromEntries(SOCIAL_KINDS.map((k) => [k, fd.get(k)]));
  const parsed = SocialSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los enlaces sociales.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  // Replace strategy: borrar todos los social_links del perfil y reinsertar
  // los que tienen handle. Atómico para v1 — el usuario verá un blip si el
  // server cae entre delete y insert; aceptable para MVP educativo.
  const { error: delErr } = await supabase
    .from('social_links')
    .delete()
    .eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = SOCIAL_KINDS.flatMap((kind, i) => {
    const handle = parsed.data[kind as SocialKind];
    if (!handle) return [];
    return [{ profile_id: profile.id, kind, handle, position: i }];
  });
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('social_links').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudieron guardar los enlaces.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Skills ----

export async function updateSkills(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  // El form serializa cada grupo como `groups[i][name]` y los items separados
  // por coma en un campo `groups[i][items]`. Reconstruimos el array.
  const groups: { name: string; items: string[] }[] = [];
  let i = 0;
  while (fd.has(`groups[${i}][name]`)) {
    const name = (fd.get(`groups[${i}][name]`) as string) ?? '';
    const itemsRaw = (fd.get(`groups[${i}][items]`) as string) ?? '';
    const items = itemsRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    groups.push({ name, items });
    i += 1;
  }
  const parsed = SkillsSchema.safeParse({ groups });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los grupos de skills.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const { error: delErr } = await supabase
    .from('skill_groups')
    .delete()
    .eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.groups.map((g, idx) => ({
    profile_id: profile.id,
    name: g.name,
    items: g.items,
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('skill_groups').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudieron guardar las skills.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Brand / personalización ----

export async function updateBrand(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const csv = (key: string) =>
    ((fd.get(key) as string | null) ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const parsed = BrandSchema.safeParse({
    accentColor: fd.get('accentColor'),
    fontFamily: fd.get('fontFamily'),
    layoutVariant: fd.get('layoutVariant'),
    sectionOrder: csv('sectionOrder'),
    sectionHidden: csv('sectionHidden'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa las opciones de personalización.',
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      accent_color: parsed.data.accentColor,
      font_family: parsed.data.fontFamily,
      layout_variant: parsed.data.layoutVariant,
      section_order: parsed.data.sectionOrder,
      section_hidden: parsed.data.sectionHidden,
    })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar la personalización.' };

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Digital Card: estilo, whatsapp, empresa ----

export async function updateCard(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const parsed = CardSchema.safeParse({
    cardStyle: fd.get('cardStyle'),
    company: fd.get('company'),
    whatsapp: fd.get('whatsapp'),
    whatsappMessage: fd.get('whatsappMessage'),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los datos de la tarjeta.', fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      card_style: parsed.data.cardStyle,
      company: parsed.data.company ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      whatsapp_message: parsed.data.whatsappMessage ?? null,
    })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar la tarjeta.' };

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Digital Card: enlaces personalizados (replace) ----

export async function updateCardLinks(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const items = readIndexedRows(fd, 'items', 'label').map((r) => ({
    icon: r.icon ?? 'link',
    label: r.label ?? '',
    url: r.url ?? '',
  }));
  const parsed = CardLinksSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los enlaces de la tarjeta.', fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { error: delErr } = await supabase.from('card_links').delete().eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.items.map((it, idx) => ({
    profile_id: profile.id,
    icon: it.icon,
    label: it.label,
    url: it.url,
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('card_links').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudieron guardar los enlaces.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- shared: read indexed rows from FormData (`prefix[i][field]`) ----

function readIndexedRows(fd: FormData, prefix: string, anchor: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  let i = 0;
  while (fd.has(`${prefix}[${i}][${anchor}]`)) {
    const row: Record<string, string> = {};
    for (const [key, value] of fd.entries()) {
      const m = key.match(new RegExp(`^${prefix}\\[${i}\\]\\[(.+)\\]$`));
      if (m && m[1] && typeof value === 'string') row[m[1]] = value;
    }
    rows.push(row);
    i += 1;
  }
  return rows;
}

function splitCsv(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ---- Experience ----

export async function updateExperience(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const items = readIndexedRows(fd, 'items', 'role').map((r) => ({
    role: r.role ?? '',
    org: r.org ?? '',
    period: r.period ?? '',
    blurb: r.blurb ?? '',
    current: r.current,
  }));
  const parsed = ExperienceSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos de experiencia.', fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { error: delErr } = await supabase.from('experience_items').delete().eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.items.map((it, idx) => ({
    profile_id: profile.id,
    role: it.role,
    org: it.org,
    period: it.period,
    blurb: it.blurb ?? '',
    current: it.current,
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('experience_items').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudo guardar la experiencia.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Projects ----

export async function updateProjects(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const items = readIndexedRows(fd, 'items', 'title').map((r) => ({
    title: r.title ?? '',
    tag: r.tag ?? '',
    blurb: r.blurb ?? '',
    stack: splitCsv(r.stack),
    color: r.color ?? '',
    githubUrl: r.githubUrl ?? '',
    liveUrl: r.liveUrl ?? '',
    highlight: r.highlight,
  }));
  const parsed = ProjectsSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos de proyectos.', fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { error: delErr } = await supabase.from('projects').delete().eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.items.map((it, idx) => ({
    profile_id: profile.id,
    title: it.title,
    tag: it.tag ?? '',
    blurb: it.blurb ?? '',
    stack: it.stack,
    color: it.color,
    github_url: it.githubUrl ?? null,
    live_url: it.liveUrl ?? null,
    highlight: it.highlight,
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('projects').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudieron guardar los proyectos.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Testimonials ----

export async function updateTestimonials(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const items = readIndexedRows(fd, 'items', 'quote').map((r) => ({
    quote: r.quote ?? '',
    author: r.author ?? '',
    org: r.org ?? '',
  }));
  const parsed = TestimonialsSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los testimonios.', fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { error: delErr } = await supabase.from('testimonials').delete().eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.items.map((it, idx) => ({
    profile_id: profile.id,
    quote: it.quote,
    author: it.author,
    org: it.org ?? '',
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('testimonials').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudieron guardar los testimonios.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}

// ---- Services ----

export async function updateServices(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const items = readIndexedRows(fd, 'items', 'name').map((r) => ({
    name: r.name ?? '',
    duration: r.duration ?? '',
    price: r.price ?? '',
    blurb: r.blurb ?? '',
    popular: r.popular,
  }));
  const parsed = ServicesSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los servicios.', fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { error: delErr } = await supabase.from('services').delete().eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.items.map((it, idx) => ({
    profile_id: profile.id,
    external_id: `svc-${idx}`,
    name: it.name,
    duration_text: it.duration,
    price: it.price,
    blurb: it.blurb ?? '',
    popular: it.popular,
    is_active: true,
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('services').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudieron guardar los servicios.' };
  }

  revalidateProfileSurfaces(profile.username);
  return { ok: true };
}
