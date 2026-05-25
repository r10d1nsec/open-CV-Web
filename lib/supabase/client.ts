/**
 * Browser-side Supabase client.
 *
 * Use inside Client Components that need `onAuthStateChange` or other
 * reactive APIs. For data reads in Server Components / Server Actions,
 * import from `./server` instead.
 *
 * Refs: adr:0002 §1 (three-client pattern)
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { requireSupabaseEnv } from '@/lib/env';

export function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = requireSupabaseEnv();
  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
