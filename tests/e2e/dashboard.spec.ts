/**
 * E2E for /dashboard auth gate.
 *
 * Logged-in tests are deferred to Sprint 11 Harden (T12 of spec:001) — they
 * need admin API + CI secret management. This file covers what's verifiable
 * anonymously: that the guard redirects to /login with the right `?next`.
 */
import { test, expect } from '@playwright/test';

test.describe('/dashboard — auth gate', () => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, 'Requiere Supabase (auth/DB)');
  test('unauthenticated visit redirects to /login?next=/dashboard', async ({ page }) => {
    const res = await page.goto('/dashboard');
    expect(res?.status()).toBe(200);
    // After redirect chain, we should be at /login with the right `next`.
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/dashboard');
  });

  test('/dashboard/edit also gates anonymous visitors', async ({ page }) => {
    await page.goto('/dashboard/edit');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/dashboard/edit');
  });

  test('/dashboard/leads gates anonymous visitors', async ({ page }) => {
    await page.goto('/dashboard/leads');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/dashboard/leads');
  });

  test('/dashboard/settings gates anonymous visitors', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/dashboard/settings');
  });

  test('/dashboard/booking gates anonymous visitors', async ({ page }) => {
    await page.goto('/dashboard/booking');
    const url = new URL(page.url());
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('next')).toBe('/dashboard/booking');
  });
});
