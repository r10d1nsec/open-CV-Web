'use server';

/**
 * Server Action: subir avatar al bucket `avatars` y actualizar
 * `profiles.avatar_url`. RLS de Storage hace el ownership check (path debe
 * empezar por `<auth.uid()>/`), pero validamos otra vez aquí para errores
 * limpios al cliente.
 *
 * Refs: spec:002 §Implementation, supabase/migrations/0004_avatars_storage.sql,
 *       Sprint 4 S4.7.
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { avatarObjectPath, shortHash, validateAvatarFile } from '@/lib/storage/avatar';

export type AvatarActionResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const BUCKET = 'avatars';

export async function uploadAvatar(
  _prev: AvatarActionResult | null,
  fd: FormData,
): Promise<AvatarActionResult> {
  const file = fd.get('avatar');
  if (!(file instanceof File)) {
    return { ok: false, error: 'No se ha recibido ningún archivo.' };
  }

  const valid = validateAvatarFile(file);
  if (!valid.ok) return valid;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'No has iniciado sesión.' };

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle();
  if (profileErr || !profile) {
    return { ok: false, error: 'Perfil no encontrado.' };
  }

  // Path: <user_id>/avatar-<hash>.<ext> — el hash cambia entre subidas para
  // evitar que el CDN sirva la versión antigua tras un replace.
  const hash = shortHash(`${user.id}:${file.size}:${Date.now()}`);
  const path = avatarObjectPath(user.id, file.type, hash);

  const buf = new Uint8Array(await file.arrayBuffer());
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    });
  if (uploadErr) {
    return { ok: false, error: `No se pudo subir la imagen: ${uploadErr.message}` };
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', profile.id);
  if (updErr) {
    return { ok: false, error: 'Imagen subida pero no se pudo asociar al perfil.' };
  }

  // Best-effort: borrar avatar previo si existía y vivía en nuestro bucket.
  if (profile.avatar_url) {
    const prevPath = extractObjectPath(profile.avatar_url, BUCKET);
    if (prevPath && prevPath !== path) {
      await supabase.storage.from(BUCKET).remove([prevPath]);
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/edit');
  revalidatePath(`/${profile.username}`);
  revalidatePath(`/c/${profile.username}`);

  return { ok: true, url: publicUrl };
}

function extractObjectPath(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length);
}
