/**
 * Username validator — Sprint 5 S5.2.
 *
 * Tres capas:
 *   1. Formato (`UsernameSchema`) — regex 2-30 chars, lowercase + dígitos + guion,
 *      no empieza/termina en guion, sin guiones consecutivos.
 *   2. Reservado — colisiona con una ruta top-level (`/login`, `/dashboard`, ...).
 *   3. Placeholder — el patrón `user-<8-char>` que sirve `handle_new_user` no
 *      cuenta como reclamado, así que se rechaza también.
 *
 * Unique check (DB) NO va aquí — eso es responsabilidad del server action.
 *
 * Refs: spec:002 §Non-functional, spec:011 §Non-functional.
 */
import { z } from 'zod';
import { isReservedSlug } from '@/lib/validation/reserved-slugs';

// 2-30 chars, lowercase + digits + hyphens, can't start/end with hyphen,
// no consecutive hyphens (negative lookahead).
const USERNAME_REGEX = /^[a-z0-9]([a-z0-9]|-(?!-))*[a-z0-9]$|^[a-z0-9]$/;

export const UsernameSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres.')
  .max(30, 'Máximo 30 caracteres.')
  .regex(USERNAME_REGEX, 'Solo minúsculas, dígitos y guiones; sin guiones al inicio/final ni dobles.');

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

const PLACEHOLDER_USERNAME = /^user-[0-9a-f]{8}$/;

export type UsernameValidation =
  | { ok: true; value: string }
  | { ok: false; code: 'format' | 'reserved'; error: string };

export function validateUsername(input: string): UsernameValidation {
  const normalized = normalizeUsername(input);
  const parsed = UsernameSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'format',
      error: parsed.error.issues[0]?.message ?? 'Formato inválido.',
    };
  }
  if (isReservedSlug(parsed.data)) {
    return { ok: false, code: 'reserved', error: 'Ese username está reservado.' };
  }
  if (PLACEHOLDER_USERNAME.test(parsed.data)) {
    return {
      ok: false,
      code: 'reserved',
      error: 'Ese username es provisional — elige uno propio.',
    };
  }
  return { ok: true, value: parsed.data };
}
