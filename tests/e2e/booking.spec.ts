import { test, expect } from '@playwright/test';

test.describe('/maya/booking — reserva pública', () => {
  test.skip(!process.env.NEXT_PUBLIC_SUPABASE_URL, 'Requiere Supabase (auth/DB)');
  test('renders the booking page heading', async ({ page }) => {
    const res = await page.goto('/maya/booking');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Reservar con');
  });

  test('unknown username 404s', async ({ page }) => {
    const res = await page.goto('/no-such-user/booking');
    expect(res?.status()).toBe(404);
  });
});
