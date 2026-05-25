'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { signupSchema, type ActionResult } from '@/lib/auth/schema';
import { createClient } from '@/lib/supabase/server';
import { checkSignupRateLimit } from '@/lib/rate-limit/signup';

import { clientIpHash, originFromHeaders, parseForm } from './_shared';

export async function signup(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(signupSchema, formData);
  if (!parsed.ok) return parsed.result;

  const limit = await checkSignupRateLimit(await clientIpHash());
  if (!limit.ok) {
    return {
      ok: false,
      error: 'Demasiados intentos de registro. Inténtalo de nuevo en un rato.',
      field: 'form',
    };
  }

  const origin = await originFromHeaders();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.value.email,
    password: parsed.value.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    const message = (error.message ?? '').toLowerCase();
    if (message.includes('already registered') || message.includes('already exists')) {
      return { ok: false, error: 'Ese email ya está registrado', field: 'email' };
    }
    if (message.includes('weak password') || message.includes('password')) {
      return { ok: false, error: 'La contraseña es demasiado débil', field: 'password' };
    }
    return { ok: false, error: 'No se pudo completar el registro', field: 'form' };
  }

  // When email confirmation is OFF (current dev setup), Supabase returns a
  // session immediately and the user is logged in. Otherwise, session is null
  // and we steer the user to the "check your email" page.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/dashboard'); // gate enruta a /onboarding si aún no se completó
  }

  const params = new URLSearchParams({ email: parsed.value.email });
  redirect(`/signup/check-email?${params.toString()}` as Route);
}
