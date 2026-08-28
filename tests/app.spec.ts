import { test, expect } from '@playwright/test';
import axe from 'axe-core';

test('@claim:demo-isolation @claim:stored-device The one-click demo is sampled and isolated', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await expect(page.locator('.chore-list > li')).toHaveCount(4);
  const realBefore = await page.evaluate(async () => {
    const open = indexedDB.open('chore-receipt-real-v1');
    return await new Promise<unknown>((resolve) => { open.onsuccess = () => { const transaction = open.result.transaction('state', 'readonly'); const get = transaction.objectStore('state').get('current'); get.onsuccess = () => resolve(get.result); }; });
  });
  expect(realBefore).toBeUndefined();
});

test('@claim:offline-reload Works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await expect(page.getByText('Maple Street home')).toBeVisible();
});

test('@claim:csv-export Exports the log as CSV', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Receipt log' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('chore-receipts.csv');
  expect((await file.createReadStream())!.readable).toBeTruthy();
  const content = await file.createReadStream().then(async (stream) => { let value = ''; for await (const chunk of stream!) value += chunk.toString(); return value; });
  expect(content.split('\n')).toHaveLength(5);
  expect(content).toContain('chore,completed_at,due_at');
});

test('@claim:json-backup Exports a backup and imports valid records', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export data' }).click();
  const file = await download;
  await page.getByRole('link', { name: 'Household' }).click();
  await page.getByLabel('Choose JSON file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: await file.createReadStream().then(async (stream) => { const pieces: Buffer[] = []; for await (const piece of stream!) pieces.push(Buffer.from(piece)); return Buffer.concat(pieces); }) });
  await expect(page.getByText('Backup imported. Newer records were kept.')).toBeVisible();
});

test('@claim:local-only Household data never enters a request URL', async ({ browser }) => {
  const source = await browser.newContext();
  const sourcePage = await source.newPage();
  await sourcePage.goto('/demo');
  await sourcePage.getByRole('link', { name: 'Household' }).click();
  await sourcePage.getByRole('button', { name: 'Create household QR' }).click();
  const href = await sourcePage.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  expect(href).toMatch(/#join=/);
  expect(href).not.toMatch(/\?join=/);
  const requests: string[] = [];
  const recipient = await browser.newContext();
  const recipientPage = await recipient.newPage();
  recipientPage.on('request', (request) => requests.push(request.url()));
  await recipientPage.goto(href!);
  await expect(recipientPage.getByRole('status')).toContainText('Household copy added');
  expect(requests.some((url) => url.includes('join='))).toBe(false);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await source.close(); await recipient.close();
});

test('@claim:qr-share The four-receipt sample creates and imports a household QR', async ({ browser }) => {
  const source = await browser.newContext(); const page = await source.newPage();
  await page.goto('/demo'); await page.getByRole('link', { name: 'Household' }).click();
  await page.getByRole('button', { name: 'Create household QR' }).click();
  await expect(page.getByRole('img', { name: 'QR code that imports a copy of this household record.' })).toBeVisible();
  const href = await page.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  const target = await browser.newContext(); const targetPage = await target.newPage();
  await targetPage.goto(href!);
  await expect(targetPage.getByRole('status')).toContainText('Household copy added');
  await expect(targetPage.getByRole('heading', { name: 'Clean the bathroom' })).toBeVisible();
  await source.close(); await target.close();
});

test('@claim:free Chore Receipt is free to use', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href*="payment"],a[href*="checkout"],button:has-text("Buy")')).toHaveCount(0);
});

test('@claim:receipt-next-date Completing a chore makes one receipt and calculates its next date', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mark Water the plants done/ }).click();
  await expect(page.getByRole('status')).toContainText('Receipt added for Water the plants');
  await expect(page.getByText(/Due in 5 days/)).toBeVisible();
});

test('invalid imported dates are rejected before they are saved', async ({ page }) => {
  await page.goto('/settings');
  const broken = { household: 'Home', chores: [], receipts: [{ id: 'bad', choreId: 'x', title: 'Broken', completedAt: 'not-a-date', dueAt: 'also-not-a-date', updatedAt: 'not-a-date' }] };
  await page.getByLabel('Choose JSON file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(broken)) });
  await expect(page.getByText('That file is not a valid Chore Receipt backup. Nothing was imported.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Household and data' })).toBeVisible();
});

test('the dialog closes, explains blank names, and keyboard starts at the skip link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Record chores when they get done' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: /Add your first chore/ }).click();
  await page.getByRole('button', { name: 'Close add chore form' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: /Add your first chore/ }).click();
  await page.getByLabel('Chore name').fill('   ');
  await page.getByRole('button', { name: 'Add shared chore' }).click();
  await expect(page.getByText('Enter a chore name before adding it.')).toBeVisible();
});

test('mobile controls meet the 44px target', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const undersized = await page.locator('a,button,input,select').evaluateAll((items) => items
    .filter((item) => { const box = item.getBoundingClientRect(); return box.width > 0 && box.height > 0 && box.height < 44; })
    .map((item) => (item as HTMLElement).innerText || item.getAttribute('aria-label')));
  expect(undersized).toEqual([]);
});

test('the generated worker versions hashed build assets and fallback pages avoid inline CSP styles', async ({ page, request }) => {
  const worker = await (await request.get('/sw.js')).text();
  expect(worker).toMatch(/chore-receipt-[a-f0-9]{12}/);
  expect(worker).toMatch(/assets\/(?:app|index)-[a-zA-Z0-9_-]+\.js/);
  for (const route of ['/404.html', '/offline.html']) {
    const response = await request.get(route); const html = await response.text();
    expect(html).not.toContain('<style>'); expect(html).toContain('fallback.css');
  }
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
});

test('landing has no serious axe findings', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => (window as unknown as Window & { axe: typeof axe }).axe.run());
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});
