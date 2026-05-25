/**
 * Centralized env var validation.
 *
 * Required Supabase vars are validated lazily — `requireSupabaseEnv()` throws
 * a clear error only when a Supabase client is actually requested. This keeps
 * `pnpm dev` (during Sprint 3a prep, before creds exist), `pnpm test` and
 * `pnpm typecheck` working without credentials in `.env.local`.
 *
 * In production builds (`pnpm build` + `pnpm start`) the env is validated
 * eagerly via `assertProductionEnv()` called from server entry points.
 *
 * Refs: spec:001 (auth) §Env vars, adr:0002 (auth & session strategy)
 */
import { z } from 'zod';

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL (e.g. https://xxx.supabase.co)'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short to be a real anon key'),
});

const serviceRoleSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY looks too short to be a real service-role key'),
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;
export type ServiceRoleEnv = z.infer<typeof serviceRoleSchema>;

function readSupabaseEnv(): SupabaseEnv | { error: string } {
  const parsed = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return { error: message };
  }
  return parsed.data;
}

/**
 * Returns Supabase public env vars or throws a developer-friendly error.
 * Call this from inside Supabase client factories — NOT at module top level.
 */
export function requireSupabaseEnv(): SupabaseEnv {
  const result = readSupabaseEnv();
  if ('error' in result) {
    throw new Error(
      `[folio:env] Supabase env vars missing or invalid (${result.error}). ` +
        'Copy .env.example to .env.local and fill in the values from your Supabase project settings.',
    );
  }
  return result;
}

/**
 * Returns the service-role key, or throws.
 * Server-only. NEVER call this from a Client Component or route reachable by the browser.
 */
export function requireServiceRoleKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[folio:env] requireServiceRoleKey() called in the browser. This is a server-only secret.',
    );
  }
  const parsed = serviceRoleSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `[folio:env] SUPABASE_SERVICE_ROLE_KEY missing or invalid: ${parsed.error.issues
        .map((i) => i.message)
        .join('; ')}`,
    );
  }
  return parsed.data.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * True when Supabase public env vars are valid. Use this to gate code paths
 * that would otherwise throw — e.g. fall back to the mock profile store while
 * credentials haven't been provisioned yet.
 */
export function hasSupabaseEnv(): boolean {
  const result = readSupabaseEnv();
  return !('error' in result);
}

/**
 * Eager validation for production builds. Call from a server entry point
 * (e.g. middleware.ts) so a misconfigured deploy fails fast on boot rather
 * than on the first request to a Supabase-backed route.
 */
export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;
  requireSupabaseEnv();
}
