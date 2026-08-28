import { test, expect } from '@playwright/test';
import axe from 'axe-core';

test('@claim:offline-reload Works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.getByRole('button', { name: /Mark .* done/ }).first().click();
  await expect(page.getByRole('status')).toContainText('Receipt added for');
});

test('@claim:csv-export Exports the log as CSV', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Receipt log' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('chore-receipts.csv');
  const stream = await file.createReadStream();
  let content = '';
  for await (const chunk of stream!) content += chunk.toString();
  expect(content).toContain('chore,completed_at,due_at');
});

test('@claim:local-only No data leaves this device', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await page.getByRole('button', { name: /Mark .* done/ }).first().click();
  await expect(page.getByRole('status')).toContainText('Receipt added for');
  expect(external).toEqual([]);
});

test('@claim:free Chore Receipt is free to use', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href*="payment"],a[href*="checkout"],button:has-text("Buy")')).toHaveCount(0);
});

test('a keyboard user can add a chore', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Add your first chore/ }).press('Enter');
  await page.getByLabel('Chore name').fill('Wipe the kitchen table');
  await page.getByRole('button', { name: 'Add shared chore' }).press('Enter');
  await expect(page.getByText('Wipe the kitchen table')).toBeVisible();
});

test('mobile landing reads clearly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Record chores when they get done' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
});

test('landing has no serious axe findings', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => (window as unknown as Window & { axe: typeof axe }).axe.run());
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});
