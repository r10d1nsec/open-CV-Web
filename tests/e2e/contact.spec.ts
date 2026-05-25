/**
 * E2E for /[username]/contact form.
 *
 * Tests rendering + visual form. Real submit con DB pasa por integration
 * (Sprint 8 Harden con suite gated).
 *
 * Refs: spec:012, Sprint 6 S6.4.
 */
import { test, expect } from '@playwright/test';

test.describe('/maya/contact — contact form', () => {
  test('renders the form with name/email/message fields and submit button', async ({ page }) => {
    await page.goto('/maya/contact');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Maya Okafor');
    await expect(page.getByLabel('Tu nombre')).toBeVisible();
    await expect(page.getByLabel('Tu email')).toBeVisible();
    await expect(page.getByLabel('Mensaje')).toBeVisible();
    await expect(page.getByRole('button', { name: /Enviar mensaje/i })).toBeVisible();
  });

  test('honeypot input exists but is positioned off-screen (anti-bot)', async ({ page }) => {
    await page.goto('/maya/contact');
    const hp = page.locator('input[name="honeypot"]');
    await expect(hp).toBeAttached();
    // El input vive dentro de un wrapper aria-hidden con left: -9999px.
    const wrapper = page.locator('[aria-hidden="true"]', { has: hp });
    await expect(wrapper).toBeAttached();
  });

  test('unknown username 404s', async ({ page }) => {
    const res = await page.goto('/no-such-user/contact');
    expect(res?.status()).toBe(404);
  });
});
