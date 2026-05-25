'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { loginSchema, type ActionResult } from '@/lib/auth/schema';
import { createClient } from '@/lib/supabase/server';

import { parseForm } from './_shared';

export async function login(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.ok) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.value.email,
    password: parsed.value.password,
  });

  if (error) {
    // Generic error — never leak whether the email exists (AC: no enumeration).
    return { ok: false, error: 'Email o contraseña incorrectos', field: 'form' };
  }

  // Destino: `next` interno y seguro (no `//`, no absoluto) o el dashboard.
  const next = String(formData.get('next') ?? '');
  const dest = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  revalidatePath('/', 'layout');
  redirect(dest as Route);
}
