import { test, expect } from 'playwright/test';

test('manifest and service worker', async ({ page, context }) => {
  await page.goto('/');
  const manifest = await page.$('link[rel="manifest"]');
  expect(manifest).not.toBeNull();
  await page.waitForTimeout(1000); // allow sw to register
  const workers = context.serviceWorkers();
  expect(workers.length).toBeGreaterThan(0);
});
