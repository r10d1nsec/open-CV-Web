'use server';

import { forgotPasswordSchema, type ActionResult } from '@/lib/auth/schema';
import { createClient } from '@/lib/supabase/server';

import { originFromHeaders, parseForm } from './_shared';

export async function forgotPassword(formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(forgotPasswordSchema, formData);
  if (!parsed.ok) return parsed.result;

  const origin = await originFromHeaders();
  const supabase = await createClient();

  // Fire-and-acknowledge: we ALWAYS return { ok: true } regardless of whether
  // the email exists, to prevent account enumeration. Supabase's own error
  // (e.g. 404 user not found) is swallowed deliberately.
  await supabase.auth.resetPasswordForEmail(parsed.value.email, {
    redirectTo: `${origin}/reset-password`,
  });

  return { ok: true };
}
