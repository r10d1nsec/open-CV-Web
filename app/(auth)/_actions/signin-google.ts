'use server';

/**
 * Google OAuth sign-in action — Sprint 6 S6.5.
 *
 * Llama `supabase.auth.signInWithOAuth({ provider: 'google' })` con el
 * redirectTo apuntando a nuestro `/auth/callback` (mismo que email/pwd).
 * El callback ya existe y maneja el code exchange + redirect al dashboard.
 *
 * Si el provider no está habilitado en Supabase Dashboard, la action
 * devuelve un error legible. La configuración externa (Google Cloud Console
 * client + Supabase Auth → Google provider) se documenta en ADR-0005.
 *
 * Refs: spec:001, adr:0002 §2, adr:0005, spec:012 §Google OAuth.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Route } from 'next';

import { createClient } from '@/lib/supabase/server';

export async function signInWithGoogle(): Promise<void> {
  const h = await headers();
  const xfh = h.get('x-forwarded-host');
  const origin = h.get('origin') ?? (xfh ? `https://${xfh}` : 'http://localhost:3000');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error || !data?.url) {
    redirect('/login?error=oauth_failed' as Route);
  }
  redirect(data.url as Route);
}
