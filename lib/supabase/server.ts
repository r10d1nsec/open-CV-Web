/**
 * Server-side Supabase client.
 *
 * Use inside Server Components, Server Actions and Route Handlers.
 * Reads/writes auth cookies via `next/headers`.
 *
 * For authorization decisions ALWAYS call `supabase.auth.getUser()` — it
 * re-validates the JWT against Supabase. Never trust `getSession()` for
 * auth checks (it returns the locally-cached session unverified).
 *
 * Refs: adr:0002 §1 (three-client pattern), §3 (session)
 */
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { requireServiceRoleKey, requireSupabaseEnv } from '@/lib/env';

export async function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `set` throws when called from a Server Component (read-only).
          // The middleware refreshes the session on every request, so this
          // is safe to swallow here.
        }
      },
    },
  });
}

/**
 * Admin client using the service-role key. Bypasses RLS.
 * Server-only. NEVER reachable from the browser.
 *
 * Use exclusively for:
 *   - migrations / seeding scripts
 *   - background jobs that need cross-user access
 *   - admin tooling
 */
export async function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = requireSupabaseEnv();
  const serviceRoleKey = requireServiceRoleKey();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // no-op: admin client never writes auth cookies
      },
    },
  });
}
