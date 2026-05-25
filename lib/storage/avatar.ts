/**
 * Avatar upload helpers — Sprint 4 S4.7.
 *
 * Validación lado servidor del File entrante + utilidad para construir el
 * path canónico en el bucket. La subida real ocurre en el server action que
 * importa este módulo.
 *
 * Refs: spec:002 §Implementation, supabase/migrations/0004_avatars_storage.sql.
 */

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export type Validation = { ok: true } | { ok: false; error: string };

export function validateAvatarFile(file: File): Validation {
  if (file.size === 0) {
    return { ok: false, error: 'El archivo está vacío.' };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, error: 'Solo se admiten imágenes PNG, JPEG, WEBP o GIF.' };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: 'La imagen supera el límite de 2 MB.' };
  }
  return { ok: true };
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function avatarObjectPath(userId: string, mime: string, hash: string): string {
  const ext = EXT_BY_MIME[mime] ?? 'png';
  return `${userId}/avatar-${hash}.${ext}`;
}

/**
 * Hash corto y estable para el filename. No criptográfico — solo evita
 * colisiones de caché entre subidas sucesivas del mismo user.
 */
export function shortHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 8);
}
