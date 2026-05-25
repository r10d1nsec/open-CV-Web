/**
 * Server-side session helpers.
 *
 * `getCurrentUser()` returns the authenticated user re-validated against
 * Supabase (uses `auth.getUser()` — NEVER `getSession()`, which trusts the
 * locally cached JWT without verifying).
 *
 * `requireUser()` is the authorisation gate: returns the user, or throws
 * NEXT_REDIRECT to /login (with a `?next` carrying the intended destination
 * so the user lands where they wanted after signing in).
 *
 * Both helpers are async because `createClient()` resolves the cookies()
 * promise internally; callers should await them from Server Components,
 * Server Actions or Route Handlers.
 *
 * Refs: spec:001 T9, adr:0002 §3 (session)
 */
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

/**
 * Returns the current user or redirects to `/login`. The `next` arg lets the
 * caller pre-fill the `?next` param so the login page can bounce the user
 * back after authenticating.
 *
 * Pass an absolute-path string (e.g. `/dashboard`) — anything else is
 * silently ignored to keep the redirect from being weaponised.
 */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (user) return user;

  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  const target = safeNext
    ? (`/login?next=${encodeURIComponent(safeNext)}` as Route)
    : ('/login' as Route);
  redirect(target);
}
