/**
 * Shared helpers for auth Server Actions.
 *
 * - `parseForm` runs a zod schema against FormData and returns either the
 *   parsed value or a typed ActionResult error pointing at the first failing
 *   field (so the form can highlight a single input).
 * - `originFromHeaders` reads the request origin so we can build absolute
 *   `emailRedirectTo` / `redirectTo` URLs for Supabase Auth emails. Falls
 *   back to NEXT_PUBLIC_SITE_URL when the header is missing (e.g. during
 *   build-time prerender of a static page that imports an action).
 */
import { headers } from 'next/headers';
import type { z, ZodError } from 'zod';

import type { ActionResult } from '@/lib/auth/schema';

type Field = NonNullable<Extract<ActionResult, { ok: false }>['field']>;

const FIELDS = new Set<Field>(['email', 'password', 'confirmPassword', 'form']);

export function parseForm<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData,
): { ok: true; value: z.infer<T> } | { ok: false; result: ActionResult } {
  const entries = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(entries);
  if (parsed.success) return { ok: true, value: parsed.data };

  const firstIssue = (parsed.error as ZodError).issues[0];
  const path = firstIssue?.path[0];
  const field: Field = typeof path === 'string' && FIELDS.has(path as Field) ? (path as Field) : 'form';
  return {
    ok: false,
    result: {
      ok: false,
      error: firstIssue?.message ?? 'Datos no válidos',
      field,
    },
  };
}

export async function originFromHeaders(): Promise<string> {
  const h = await headers();
  const origin = h.get('origin') ?? h.get('x-forwarded-host');
  if (origin) {
    return origin.startsWith('http') ? origin : `https://${origin}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  return h.get('x-real-ip') ?? 'unknown';
}

/** SHA-256 (16 hex) de la IP del cliente — para namespacing de rate-limit sin guardar la IP cruda. */
export async function clientIpHash(): Promise<string> {
  const ip = await clientIp();
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}
