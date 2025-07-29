import { test, expect } from '@playwright/test';

test('manifest link exists', async ({ page }) => {
  await page.goto('/');
  const manifest = page.locator('link[rel="manifest"]');
  await expect(manifest).toHaveAttribute('href', '/manifest.json');
});

test('service worker active', async ({ context, page }) => {
  await page.goto('/');
  const registrations = await context.serviceWorkers();
  expect(registrations.length).toBeGreaterThan(0);
});
