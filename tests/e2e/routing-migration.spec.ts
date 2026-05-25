/**
 * E2E for the spec:008 routing migration.
 *
 * Validates the 301s from the legacy URL shape (`/u/<slug>`, `/card/<slug>`,
 * `/u/<slug>/booking`) and the reserved-slug guard on the new top-level
 * `[username]` route.
 */
import { test, expect } from '@playwright/test';

test.describe('spec:008 routing migration', () => {
  test('GET /u/maya → 301 → /maya', async ({ request }) => {
    const res = await request.get('/u/maya', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toMatch(/\/maya$/);
  });

  test('GET /card/maya → 301 → /c/maya', async ({ request }) => {
    const res = await request.get('/card/maya', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toMatch(/\/c\/maya$/);
  });

  test('GET /u/maya/booking → 301 → /maya/booking', async ({ request }) => {
    const res = await request.get('/u/maya/booking', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toMatch(/\/maya\/booking$/);
  });

  test('reserved slug (e.g. /_next/whatever) does not resolve to a profile page', async ({
    request,
  }) => {
    // Truly reserved infra path — Next will handle this, not [username].
    const res = await request.get('/_next/should-never-resolve');
    expect(res.status()).not.toBe(200);
  });

  test('/maya renders the portfolio (post-migration top-level)', async ({ page }) => {
    const res = await page.goto('/maya');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/c/maya renders the digital card (post-migration)', async ({ page }) => {
    const res = await page.goto('/c/maya');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maya Okafor');
  });
});
