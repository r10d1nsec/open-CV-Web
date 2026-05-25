/**
 * E2E for /onboarding gate.
 *
 * Logged-in tests are deferred to Sprint 8 Harden (T12 of spec:001).
 * This file covers what's verifiable anonymously.
 */
import { test, expect } from '@playwright/test';

test.describe('/onboarding — auth gate', () => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, 'Requiere Supabase (auth/DB)');
  test('unauthenticated visit redirects to /login?next=/onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/onboarding');
  });
});
