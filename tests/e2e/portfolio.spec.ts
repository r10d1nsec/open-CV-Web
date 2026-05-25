import { test, expect } from '@playwright/test';

test.describe('/maya — public portfolio', () => {
  test('renders hero with name and books a screenshot', async ({ page }) => {
    await page.goto('/maya');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Design engineer');
    await expect(page.getByText('Maya Okafor').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Contactar/i }).first()).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/__screenshots__/portfolio-desktop.png',
      fullPage: true,
    });
  });

  test('mobile viewport collapses layout', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Mobile project covers WebKit separately');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/maya');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const horizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalScroll).toBeLessThanOrEqual(1);
    await page.screenshot({
      path: 'tests/e2e/__screenshots__/portfolio-mobile.png',
      fullPage: true,
    });
  });

  test('unknown username returns 404', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
