/**
 * Middleware Supabase client.
 *
 * Invoked from `middleware.ts` (root) on every matched request. Refreshes
 * the auth session by reading cookies from the incoming request and writing
 * any updated ones back onto the outgoing response.
 *
 * If Supabase env vars aren't configured yet, this is a no-op — so the app
 * keeps serving public pages during Sprint 3a preparation (before creds
 * are provisioned).
 *
 * Refs: adr:0002 §1 (three-client pattern), §3 (session)
 */
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { hasSupabaseEnv, requireSupabaseEnv } from '@/lib/env';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  if (!hasSupabaseEnv()) {
    return response;
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = requireSupabaseEnv();

  const supabase = createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the auth session so the @supabase/ssr cookie helpers refresh tokens
  // close to expiry. Result discarded — authorization decisions happen in
  // page/route handlers, not here.
  await supabase.auth.getUser();

  return response;
}
