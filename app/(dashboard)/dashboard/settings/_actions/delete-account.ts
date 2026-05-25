'use server';

/**
 * Borrado de cuenta (RGPD) — Sprint 9 (spec:015).
 *
 * Doble fricción + re-autenticación:
 *   1. El usuario debe escribir su username exacto (confirma intención, igual
 *      que la maqueta de Claude Design `settings` → DeleteModal).
 *   2. Debe re-introducir su contraseña; la verificamos con
 *      `signInWithPassword` antes de borrar (re-auth real).
 *
 * El borrado usa el admin client (`auth.admin.deleteUser`). Al eliminar el
 * usuario de `auth.users`, el FK `profiles.user_id … on delete cascade` +
 * los `on delete cascade` de las tablas hijas propagan el borrado a TODOS los
 * datos del alumno (RGPD). Tras borrar, cerramos sesión y redirigimos.
 *
 * Refs: spec:015, adr:0003 (cascade), master.md §10 (RGPD).
 */
import { redirect } from 'next/navigation';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type DeleteAccountResult = { ok: false; error: string };

export async function deleteAccount(
  _prev: DeleteAccountResult | null,
  formData: FormData,
): Promise<DeleteAccountResult> {
  const confirmUsername = String(formData.get('confirmUsername') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, error: 'No has iniciado sesión.' };
  }

  // Username actual del perfil (fricción de confirmación).
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!profile) {
    return { ok: false, error: 'Perfil no encontrado.' };
  }
  if (confirmUsername.toLowerCase() !== profile.username.toLowerCase()) {
    return { ok: false, error: 'El username no coincide. Escríbelo exactamente para confirmar.' };
  }

  // Re-autenticación real con contraseña.
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (authErr) {
    return { ok: false, error: 'Contraseña incorrecta.' };
  }

  // Borrado con cascade vía admin client.
  const admin = await createAdminClient();
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return { ok: false, error: 'No se pudo borrar la cuenta. Inténtalo de nuevo.' };
  }

  await supabase.auth.signOut();
  redirect('/?deleted=1');
}
