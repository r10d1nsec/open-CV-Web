import { test, expect } from '@playwright/test';

test.describe('auth pages — render + client validation', () => {
  test('GET /login renders email + password form', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenido');
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Crear cuenta/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Olvidaste/i })).toBeVisible();
  });

  test('GET /login?reset=ok shows the success banner', async ({ page }) => {
    await page.goto('/login?reset=ok');
    await expect(page.getByRole('status')).toContainText(/contraseña se actualizó/i);
  });

  test('GET /signup renders three fields', async ({ page }) => {
    const response = await page.goto('/signup');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crear cuenta');
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Contraseña', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Repite la contraseña', { exact: true })).toBeVisible();
  });

  test('signup mismatched passwords surfaces a confirmPassword error', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Email', { exact: true }).fill('mismatch+test@example.com');
    await page.getByLabel('Contraseña', { exact: true }).fill('correcthorse');
    await page.getByLabel('Repite la contraseña', { exact: true }).fill('different!');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    const alert = page.getByRole('alert').first();
    await expect(alert).toContainText(/no coinciden/i);
    await expect(page.getByLabel('Repite la contraseña', { exact: true })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('password toggle reveals the typed value', async ({ page }) => {
    await page.goto('/signup');
    const pw = page.getByLabel('Contraseña', { exact: true });
    await pw.fill('correcthorse');
    await expect(pw).toHaveAttribute('type', 'password');

    // Two password rows → two toggles. The first one belongs to "Contraseña".
    const toggle = page.getByRole('button', { name: 'Mostrar contraseña' }).first();
    await toggle.click();
    await expect(pw).toHaveAttribute('type', 'text');
  });

  test('GET /forgot-password renders email field', async ({ page }) => {
    const response = await page.goto('/forgot-password');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Olvidaste/);
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar enlace' })).toBeVisible();
  });

  test('GET /reset-password renders two password fields', async ({ page }) => {
    const response = await page.goto('/reset-password');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Crea una nueva/i);
    await expect(page.getByLabel('Nueva contraseña', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Repite la contraseña', { exact: true })).toBeVisible();
  });

  test('GET /signup/check-email shows the provided email', async ({ page }) => {
    const response = await page.goto('/signup/check-email?email=hello%40example.com');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Revisa tu email/i);
    await expect(page.getByText('hello@example.com')).toBeVisible();
  });

  test('public routes still respond 200 without a session (regression)', async ({ page }) => {
    const targets = ['/', '/maya', '/c/maya', '/maya/contact'];
    for (const url of targets) {
      const res = await page.goto(url);
      expect(res?.status(), `expected 200 for ${url}`).toBe(200);
    }
  });
});
