/**
 * OAuth / email-confirmation callback.
 *
 * Supabase Auth redirects here after the user clicks the link in a
 * confirmation or password-reset email. We exchange `?code=...` for a
 * session (cookies get written by the server-side Supabase client) and
 * forward to the originally intended destination (`?next=...`) or `/`.
 *
 * Failure modes:
 *   - missing `code`           → /login?error=callback_missing_code
 *   - exchange returns error   → /login?error=callback_failed
 *
 * `?next` is sanitised: only same-origin paths starting with `/` are honoured
 * to prevent open-redirect abuse. Anything else falls back to `/`.
 *
 * Refs: spec:001 T7, adr:0002 §2
 */
import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = sanitiseNext(url.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=callback_missing_code', url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/login?error=callback_failed', url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

function sanitiseNext(raw: string | null): string {
  // Default: `/dashboard`. El dashboard a su vez redirige a `/onboarding` si
  // `profiles.onboarded_at IS NULL`, así que cualquier signup nuevo aterriza
  // de forma natural en el wizard (spec:011).
  if (!raw) return '/dashboard';
  // Same-origin, must start with a single slash and not be a protocol-relative
  // URL like `//evil.com`.
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
}
