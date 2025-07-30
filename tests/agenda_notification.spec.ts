import { test, expect } from 'playwright/test';

// schedule an event in one minute and ensure a notification fires

test('agenda notification', async ({ page, context }) => {
  await page.goto('/agenda');
  const now = new Date(Date.now() + 60000);
  await page.fill('#title', 'Notif');
  await page.fill('#date', now.toISOString().slice(0, 10));
  await page.fill('#time', now.toTimeString().slice(0, 5));
  await page.click('text=Ajouter');
  const notification = await context.waitForEvent('notification', {
    timeout: 70000,
  });
  expect(notification.title).toContain('Rappel');
});
