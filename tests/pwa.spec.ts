import { test, expect } from '@playwright/test';

test('PWA manifest and service worker', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  const hasSW = await page.evaluate(() => 'serviceWorker' in navigator);
  expect(hasSW).toBe(true);
});
