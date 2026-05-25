'use server';

/**
 * Server Actions del wizard de onboarding — Sprint 5.
 *
 * Una action por paso (username / identity / headline / bio). Cada una:
 *   1. Resuelve el user autenticado.
 *   2. Valida el payload con su schema correspondiente.
 *   3. Persiste con RLS activo (ownership check redundante por seguridad).
 *   4. Revalida `/dashboard` y `/onboarding`.
 *
 * `completeOnboarding()` cierra el wizard (set `onboarded_at` + redirect).
 *
 * Refs: spec:011, spec:002 §Implementation.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { BioSchema } from '@/lib/validation/profile';
import { validateUsername } from '@/lib/validation/username';
import { calculateInitials } from '@/lib/profile/initials';

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type OwnedProfile = Awaited<ReturnType<typeof loadOwnedProfile>>;

async function loadOwnedProfile() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false as const, error: 'No has iniciado sesión.' };
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, user_id, username, onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !profile) {
    return { ok: false as const, error: 'Tu perfil aún no está disponible. Espera unos segundos y vuelve a intentarlo.' };
  }
  return { ok: true as const, supabase, user, profile };
}

function isOwned(o: OwnedProfile): o is Extract<OwnedProfile, { ok: true }> {
  return o.ok === true;
}

function revalidateOnboarding(username: string) {
  revalidatePath('/onboarding');
  revalidatePath('/dashboard');
  revalidatePath(`/${username}`);
}

// ---- Step 1: Username ----

export async function setUsername(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const raw = (fd.get('username') as string | null) ?? '';
  const v = validateUsername(raw);
  if (!v.ok) {
    return { ok: false, error: v.error, fieldErrors: { username: v.error } };
  }

  // Unique check — citext en DB, case-insensitive por defecto.
  const { data: existing, error: lookupErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', v.value)
    .maybeSingle();
  if (lookupErr) return { ok: false, error: 'No se pudo verificar el username.' };
  if (existing && existing.id !== profile.id) {
    return {
      ok: false,
      error: 'Ese username ya está en uso.',
      fieldErrors: { username: 'Ese username ya está en uso.' },
    };
  }

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ username: v.value })
    .eq('id', profile.id);
  if (updErr) return { ok: false, error: 'No se pudo guardar el username.' };

  revalidateOnboarding(v.value);
  return { ok: true };
}

// ---- Step 2: Identity (full_name + iniciales auto) ----

const IdentityWizardSchema = z.object({
  full_name: z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(80)),
});

export async function setIdentity(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const parsed = IdentityWizardSchema.safeParse({ full_name: fd.get('full_name') });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Escribe tu nombre completo.',
      fieldErrors: { full_name: parsed.error.issues[0]?.message ?? 'Inválido.' },
    };
  }
  const fullName = parsed.data.full_name;
  const initials = calculateInitials(fullName);

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, initials })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar.' };

  revalidateOnboarding(profile.username);
  return { ok: true };
}

// ---- Step 3: Headline ----

const HeadlineSchema = z.object({
  title: z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(120)),
});

export async function setHeadline(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const parsed = HeadlineSchema.safeParse({ title: fd.get('title') });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Escribe un titular profesional.',
      fieldErrors: { title: parsed.error.issues[0]?.message ?? 'Inválido.' },
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ title: parsed.data.title })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar.' };

  revalidateOnboarding(profile.username);
  return { ok: true };
}

// ---- Step 4: Bio ----

export async function setBio(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const parsed = BioSchema.safeParse({ bio: fd.get('bio') });
  if (!parsed.success) {
    return {
      ok: false,
      error: 'La bio es demasiado larga (máximo 500 caracteres).',
      fieldErrors: { bio: parsed.error.issues[0]?.message ?? 'Inválido.' },
    };
  }
  if (parsed.data.bio.length === 0) {
    return { ok: false, error: 'Cuéntanos algo sobre ti (al menos 1 carácter).', fieldErrors: { bio: 'Requerido.' } };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ bio: parsed.data.bio })
    .eq('id', profile.id);
  if (error) return { ok: false, error: 'No se pudo guardar.' };

  revalidateOnboarding(profile.username);
  return { ok: true };
}

// ---- Step 5/end: complete ----

export async function completeOnboarding(): Promise<never> {
  const owned = await loadOwnedProfile();
  if (!isOwned(owned)) redirect('/login?next=/onboarding' as Route);
  const { supabase, profile } = owned;

  // Completar onboarding implica publicar el perfil: a partir de aquí
  // `/<u>` y `/c/<u>` son visibles para anónimos y `contact_messages` acepta
  // INSERT (spec:012 §RLS).
  await supabase
    .from('profiles')
    .update({ onboarded_at: new Date().toISOString(), is_published: true })
    .eq('id', profile.id);

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');
  redirect('/dashboard?welcome=1' as Route);
}
