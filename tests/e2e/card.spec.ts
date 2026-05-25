import { test, expect } from '@playwright/test';

test.describe('/c/maya — digital card', () => {
  test('renders identity and primary actions, mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/c/maya');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maya Okafor');
    await expect(page.getByText('Design engineer', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Guardar contacto/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Déjame tus datos/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Portfolio/ }).first()).toBeVisible();
    await expect(page.getByAltText(/Código QR/)).toBeVisible();

    const horizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalScroll).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: 'tests/e2e/__screenshots__/card-mobile.png',
      fullPage: true,
    });
  });

  test('renders OK on desktop viewport too', async ({ page }) => {
    await page.goto('/c/maya');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Maya Okafor');
    await page.screenshot({
      path: 'tests/e2e/__screenshots__/card-desktop.png',
      fullPage: true,
    });
  });

  test('vCard endpoint returns text/vcard with attachment', async ({ request }) => {
    const res = await request.get('/api/card/maya/vcard');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/text\/vcard/);
    expect(res.headers()['content-disposition']).toMatch(/attachment; filename="maya-okafor.vcf"/);
    const body = await res.text();
    expect(body).toContain('BEGIN:VCARD');
    expect(body).toContain('FN:Maya Okafor');
    expect(body).toContain('END:VCARD');
  });

  test('QR PNG endpoint returns image/png', async ({ request }) => {
    const res = await request.get('/api/card/maya/qr');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
    expect(res.headers()['cache-control']).toMatch(/max-age=\d+/);
    const buf = await res.body();
    expect(buf.byteLength).toBeGreaterThan(500);
    // PNG magic number
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
  });

  test('QR SVG endpoint returns valid SVG', async ({ request }) => {
    const res = await request.get('/api/card/maya/qr?format=svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/image\/svg\+xml/);
    const body = await res.text();
    expect(body).toMatch(/^<\?xml|^<svg/);
    expect(body).toContain('</svg>');
  });

  test('unknown username returns 404', async ({ page }) => {
    const response = await page.goto('/card/no-such-user');
    expect(response?.status()).toBe(404);
  });

  test('unknown username vCard endpoint returns 404 JSON', async ({ request }) => {
    const res = await request.get('/api/card/no-such-user/vcard');
    expect(res.status()).toBe(404);
  });
});
