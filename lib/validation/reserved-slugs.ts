/**
 * Reserved slugs registry.
 *
 * Any string in this set is forbidden as a profile `username` because it
 * collides with a real top-level route on your site (after the
 * routing migration in spec:008) or with infrastructure / framework paths
 * that must never resolve to user content.
 *
 * Two categories live here:
 *  1. Live application routes (`/login`, `/dashboard`, `/c/<slug>`, ...).
 *  2. Conventional / framework paths (`/_next`, `/favicon`, `/sitemap`, ...).
 *
 * Adding a new top-level route REQUIRES adding the leading path segment here
 * AND a regression test in `tests/unit/reserved-slugs.test.ts`.
 *
 * Refs: spec:002 §Non-functional, spec:008 routing migration, adr:0004.
 */

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // ---- live top-level routes ----
  'api',
  'auth',
  'login',
  'signup',
  'logout',
  'forgot-password',
  'reset-password',
  'dashboard',
  'onboarding',
  'legal',
  'contact',
  'pricing',
  'about',
  'support',
  'help',
  'docs',
  'blog',
  'changelog',
  // ---- legacy routes still served via 301 ----
  'u', // legacy `/u/<username>`
  'card', // legacy `/card/<username>`
  // ---- new card path ----
  'c',
  // ---- account/billing surface (post-v1) ----
  'admin',
  'settings',
  'profile',
  'account',
  'billing',
  'terms',
  'privacy',
  // ---- framework / convention ----
  '_next',
  'static',
  'assets',
  'public',
  'well-known',
  'robots',
  'sitemap',
  'favicon',
  'home',
  'index',
]);

export function isReservedSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (normalized.length === 0) return true;
  return RESERVED_SLUGS.has(normalized);
}
