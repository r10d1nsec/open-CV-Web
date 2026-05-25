'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { resetPasswordSchema, type ActionResult } from '@/lib/auth/schema';
import { createClient } from '@/lib/supabase/server';

import { parseForm } from './_shared';

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(resetPasswordSchema, formData);
  if (!parsed.ok) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.value.password });

  if (error) {
    return {
      ok: false,
      error: 'No se pudo actualizar la contraseña. Pide un nuevo enlace de reset.',
      field: 'form',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/login?reset=ok' as Route);
}
