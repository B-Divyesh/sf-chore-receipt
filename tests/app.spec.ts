import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';

type Backup = {
  household: string;
  chores: Array<{ id: string; title: string; repeatDays: number; completedAt?: string; createdAt: string; updatedAt: string }>;
  receipts: Array<{ id: string; choreId: string; title: string; completedAt: string; dueAt: string; updatedAt: string }>;
  removedChores: Array<{ id: string; removedAt: string }>;
};

async function databaseValue(page: Page, name: string) {
  return page.evaluate(async (databaseName) => {
    const existing = await indexedDB.databases();
    if (!existing.some((database) => database.name === databaseName)) return undefined;
    const open = indexedDB.open(databaseName);
    return await new Promise<unknown>((resolve, reject) => {
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        if (!open.result.objectStoreNames.contains('state')) {
          open.result.close();
          resolve(undefined);
          return;
        }
        const get = open.result.transaction('state', 'readonly').objectStore('state').get('current');
        get.onerror = () => reject(get.error);
        get.onsuccess = () => { open.result.close(); resolve(get.result); };
      };
    });
  }, name);
}

async function putDatabaseValue(page: Page, name: string, value: unknown) {
  await page.evaluate(async ({ databaseName, record }) => {
    const open = indexedDB.open(databaseName, 1);
    await new Promise<void>((resolve, reject) => {
      open.onerror = () => reject(open.error);
      open.onupgradeneeded = () => open.result.createObjectStore('state');
      open.onsuccess = () => {
        const transaction = open.result.transaction('state', 'readwrite');
        transaction.objectStore('state').put(record, 'current');
        transaction.oncomplete = () => { open.result.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, { databaseName: name, record: value });
}

async function downloadBuffer(page: Page, buttonName: string) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName }).click();
  const download = await pending;
  const stream = await download.createReadStream();
  const pieces: Buffer[] = [];
  for await (const piece of stream!) pieces.push(Buffer.from(piece));
  return { download, buffer: Buffer.concat(pieces) };
}

async function freshPage(context: BrowserContext, path = '/') {
  const page = await context.newPage();
  await page.goto(path);
  return page;
}

test('@claim:demo-isolation One click opens an editable sample board in its own database', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await expect(page.locator('.chore-list > li')).toHaveCount(4);
  expect(await databaseValue(page, 'chore-receipt-real-v1')).toBeUndefined();
  expect((await databaseValue(page, 'chore-receipt-demo-v1') as Backup).household).toBe('Maple Street home');
  const chore = page.locator('.chore').filter({ hasText: 'Water the plants' });
  await chore.getByRole('button', { name: 'Edit chore' }).click();
  await page.getByRole('dialog', { name: 'Edit chore' }).getByLabel('Chore name').fill('Water the balcony plants');
  await page.getByRole('dialog', { name: 'Edit chore' }).getByRole('button', { name: 'Save chore' }).click();
  await expect(page.getByRole('heading', { name: 'Water the balcony plants' })).toBeVisible();
  expect((await databaseValue(page, 'chore-receipt-demo-v1') as Backup).chores.find((item) => item.id === 'plants')?.title).toBe('Water the balcony plants');
  expect(await databaseValue(page, 'chore-receipt-real-v1')).toBeUndefined();
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
});

test('@claim:demo-reset Reset restores the exact sample, clears stale results, and keeps real data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Add your first chore/ }).click();
  await page.getByLabel('Chore name').fill('Private real chore');
  await page.getByRole('button', { name: 'Add shared chore' }).click();
  const realBefore = await databaseValue(page, 'chore-receipt-real-v1');

  await page.goto('/demo');
  const seed = await databaseValue(page, 'chore-receipt-demo-v1');
  const chore = page.locator('.chore').filter({ hasText: 'Water the plants' });
  await chore.getByRole('button', { name: 'Edit chore' }).click();
  await page.getByRole('dialog', { name: 'Edit chore' }).getByLabel('Chore name').fill('Water every plant');
  await page.getByRole('dialog', { name: 'Edit chore' }).getByRole('button', { name: 'Save chore' }).click();
  await page.getByRole('button', { name: /Mark Water every plant done/ }).click();
  await expect(page.getByRole('button', { name: 'Undo receipt' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeFocused();
  await expect(page.locator('.announcer')).toHaveText('Demo reset to four sample chores and four receipts.');
  await expect(page.locator('.chore-list > li')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Water the plants' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Water every plant' })).toHaveCount(0);
  await expect(page.getByText('Receipt added for')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Undo receipt' })).toHaveCount(0);
  expect(await databaseValue(page, 'chore-receipt-demo-v1')).toEqual(seed);
  expect(await databaseValue(page, 'chore-receipt-real-v1')).toEqual(realBefore);
});

test('@claim:demo-discard Starting for real discards changed demo data and keeps real data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Add your first chore/ }).click();
  await page.getByLabel('Chore name').fill('Private real chore');
  await page.getByRole('button', { name: 'Add shared chore' }).click();
  await expect(page.getByRole('heading', { name: 'Private real chore' })).toBeVisible();
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mark Water the plants done/ }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Private real chore' })).toBeVisible();
  const names = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(names).not.toContain('chore-receipt-demo-v1');
  expect((await databaseValue(page, 'chore-receipt-real-v1') as Backup).chores[0].title).toBe('Private real chore');
  await page.goto('/demo');
  expect((await databaseValue(page, 'chore-receipt-demo-v1') as Backup).receipts).toHaveLength(4);
});

test('@claim:no-scoring Completed chores create records without people, points, ranks, or leaderboards', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Mark Water the plants done/ }).click();
  const boardText = (await page.locator('main').innerText()).toLowerCase();
  expect(boardText).not.toMatch(/\b(person|people|assignee|points?|score|rank|leaderboard)\b/);
  const { buffer } = await downloadBuffer(page, 'Export JSON backup');
  const exported = JSON.parse(buffer.toString()) as Backup;
  const keys: string[] = [];
  const collectKeys = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) { keys.push(key.toLowerCase()); collectKeys(child); }
  };
  collectKeys(exported);
  expect(keys.filter((key) => ['person', 'people', 'assignee', 'point', 'points', 'score', 'rank', 'leaderboard'].includes(key))).toEqual([]);
});

test('@claim:stored-device Real household data survives reload in the real namespace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Add your first chore/ }).click();
  await page.getByLabel('Chore name').fill('Vacuum the stairs');
  await page.getByLabel('Repeat after').selectOption('14');
  await page.getByRole('button', { name: 'Add shared chore' }).click();
  await page.getByRole('link', { name: 'Household' }).click();
  await page.getByLabel('Household name').fill('Oak Street flat');
  await page.getByRole('button', { name: 'Save household name' }).click();
  await expect(page.getByText('Household name saved on this device.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Household name')).toHaveValue('Oak Street flat');
  await page.getByRole('link', { name: /Chore Receipt/ }).click();
  await expect(page.getByRole('heading', { name: 'Vacuum the stairs' })).toBeVisible();
  await expect(page.getByText('repeats every 14 days')).toBeVisible();
  expect((await databaseValue(page, 'chore-receipt-real-v1') as Backup).household).toBe('Oak Street flat');
  expect(await databaseValue(page, 'chore-receipt-demo-v1')).toBeUndefined();
});

test('@claim:offline-reload A true 404 cannot poison later offline routes', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.route('**/missing-poison', (route) => route.fulfill({ status: 404, contentType: 'text/html', body: '<!doctype html><title>Missing</title><h1>Missing</h1>' }));
  const missing = await page.goto('/missing-poison');
  expect(missing?.status()).toBe(404);
  const cachedStatus = await page.evaluate(async () => (await caches.match('/'))?.status);
  expect(cachedStatus).toBe(200);
  await context.setOffline(true);
  await page.goto('/log?offline-check=1');
  await expect(page.getByRole('heading', { name: 'Every chore receipt' })).toBeVisible();
  await page.goto('/demo?offline-check=1');
  await expect(page.getByText('Maple Street home')).toBeVisible();
});

test('@claim:csv-export CSV export contains one row for every demo receipt', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Receipt log' }).click();
  const { download, buffer } = await downloadBuffer(page, 'Export CSV');
  expect(download.suggestedFilename()).toBe('chore-receipts.csv');
  const content = buffer.toString();
  expect(content.split('\n')).toHaveLength(5);
  expect(content).toContain('chore,completed_at,due_at');
  expect(content).toContain('"Clean the bathroom"');
});

test('@claim:json-backup JSON import restores household, chores, and receipts into a fresh store', async ({ browser }) => {
  const source = await browser.newContext();
  const sourcePage = await freshPage(source, '/demo');
  const bathroom = sourcePage.locator('.chore').filter({ hasText: 'Clean the bathroom' });
  await bathroom.getByRole('button', { name: 'Edit chore' }).click();
  await sourcePage.getByRole('dialog', { name: 'Edit chore' }).getByLabel('Chore name').fill('Clean the washroom');
  await sourcePage.getByRole('dialog', { name: 'Edit chore' }).getByRole('button', { name: 'Save chore' }).click();
  const plants = sourcePage.locator('.chore').filter({ hasText: 'Water the plants' });
  await plants.getByRole('button', { name: 'Remove chore' }).click();
  await sourcePage.getByRole('dialog', { name: 'Remove this chore?' }).getByRole('button', { name: 'Remove chore' }).click();
  const { buffer } = await downloadBuffer(sourcePage, 'Export JSON backup');
  const exported = JSON.parse(buffer.toString()) as Backup;
  expect(exported.chores.map((item) => item.title)).toContain('Clean the washroom');
  expect(exported.chores.map((item) => item.id)).not.toContain('plants');
  expect(exported.removedChores).toContainEqual(expect.objectContaining({ id: 'plants' }));
  await source.close();

  const target = await browser.newContext();
  const targetPage = await freshPage(target, '/settings');
  expect(await databaseValue(targetPage, 'chore-receipt-real-v1')).toBeUndefined();
  await expect(targetPage.getByRole('button', { name: 'Export JSON backup' })).toBeVisible();
  await expect(targetPage.locator('#import-file')).toBeHidden();
  await expect(targetPage.locator('label[for="import-file"]')).toBeVisible();
  await targetPage.getByLabel('Choose JSON file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer });
  await expect(targetPage.getByText('Backup imported. Chore changes and receipt history were kept.')).toBeVisible();
  await targetPage.reload();
  await expect(targetPage.getByLabel('Household name')).toHaveValue('Maple Street home');
  const restored = await databaseValue(targetPage, 'chore-receipt-real-v1') as Backup;
  expect(restored.household).toBe(exported.household);
  expect(restored.chores).toEqual(exported.chores);
  expect(restored.receipts).toEqual(exported.receipts);
  expect(restored.removedChores).toEqual(exported.removedChores);
  await targetPage.getByRole('link', { name: 'Receipt log' }).click();
  await expect(targetPage.getByText(/Done .* · next/)).toHaveCount(4);
  await target.close();
});

test('@claim:local-only Household fields and packet never enter any request', async ({ browser }) => {
  const traffic: Array<{ url: string; method: string; body: string }> = [];
  const watch = (page: Page) => page.on('request', (request) => traffic.push({ url: request.url(), method: request.method(), body: request.postData() || '' }));
  const source = await browser.newContext(); const sourcePage = await source.newPage(); watch(sourcePage);
  await sourcePage.goto('/demo');
  const productOrigin = new URL(sourcePage.url()).origin;
  await sourcePage.getByRole('link', { name: 'Household' }).click();
  await sourcePage.getByRole('button', { name: 'Create household QR' }).click();
  const href = await sourcePage.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  const packet = href!.split('#join=')[1];
  const recipient = await browser.newContext(); const recipientPage = await recipient.newPage(); watch(recipientPage);
  await recipientPage.goto(href!);
  await expect(recipientPage.getByText('Household copy updated. Chore changes and receipt history were imported.')).toBeVisible();
  expect(traffic.length).toBeGreaterThan(0);
  for (const request of traffic) {
    expect(request.method).toBe('GET');
    expect(new URL(request.url).origin).toBe(productOrigin);
    const sent = `${request.url}\n${request.body}`;
    for (const secret of [packet, encodeURIComponent(packet), 'Maple Street home', 'Water the plants']) expect(sent).not.toContain(secret);
  }
  await source.close(); await recipient.close();
});

test('@claim:qr-share The sample QR imports all four chores and receipts', async ({ browser }) => {
  const source = await browser.newContext(); const page = await freshPage(source, '/demo');
  await page.getByRole('link', { name: 'Household' }).click();
  await page.getByRole('button', { name: 'Create household QR' }).click();
  await expect(page.getByRole('img', { name: 'QR code that imports a copy of this household record.' })).toBeVisible();
  const href = await page.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  const target = await browser.newContext(); const targetPage = await freshPage(target, href!);
  await expect(targetPage.getByText('Household copy updated. Chore changes and receipt history were imported.')).toBeVisible();
  await expect(targetPage.locator('.chore-list > li')).toHaveCount(4);
  expect((await databaseValue(targetPage, 'chore-receipt-real-v1') as Backup).receipts).toHaveLength(4);
  await source.close(); await target.close();
});

test('@claim:copies-no-sync Re-import applies edits and removals but keeps destination-only data', async ({ browser }) => {
  const source = await browser.newContext(); const sourcePage = await freshPage(source, '/demo');
  await sourcePage.getByRole('link', { name: 'Household' }).click();
  await sourcePage.getByRole('button', { name: 'Create household QR' }).click();
  const href = await sourcePage.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  const recipient = await browser.newContext(); const recipientPage = await freshPage(recipient, href!);
  await expect(recipientPage.getByText('Household copy updated. Chore changes and receipt history were imported.')).toBeVisible();

  await recipientPage.getByRole('button', { name: 'Add a chore' }).click();
  await recipientPage.getByRole('dialog', { name: 'Add a shared chore' }).getByLabel('Chore name').fill('Polish the hallway mirror');
  await recipientPage.getByRole('dialog', { name: 'Add a shared chore' }).getByRole('button', { name: 'Add shared chore' }).click();
  await expect(recipientPage.getByRole('heading', { name: 'Polish the hallway mirror' })).toBeVisible();

  await sourcePage.getByRole('link', { name: 'Chore Receipt' }).click();
  const bins = sourcePage.locator('.chore').filter({ hasText: 'Take out the bins' });
  await bins.getByRole('button', { name: 'Edit chore' }).click();
  await sourcePage.getByRole('dialog', { name: 'Edit chore' }).getByLabel('Chore name').fill('Take recycling out');
  await sourcePage.getByRole('dialog', { name: 'Edit chore' }).getByRole('button', { name: 'Save chore' }).click();
  const plants = sourcePage.locator('.chore').filter({ hasText: 'Water the plants' });
  await plants.getByRole('button', { name: 'Remove chore' }).click();
  await sourcePage.getByRole('dialog', { name: 'Remove this chore?' }).getByRole('button', { name: 'Remove chore' }).click();

  await recipientPage.reload();
  await expect(recipientPage.getByRole('heading', { name: 'Take out the bins' })).toBeVisible();
  await expect(recipientPage.getByRole('heading', { name: 'Take recycling out' })).toHaveCount(0);
  await expect(recipientPage.getByRole('heading', { name: 'Water the plants' })).toBeVisible();

  await sourcePage.getByRole('link', { name: 'Household' }).click();
  await sourcePage.getByRole('button', { name: 'Create household QR' }).click();
  const updatedHref = await sourcePage.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  await recipientPage.goto(updatedHref!);
  await expect(recipientPage.getByText('Household copy updated. Chore changes and receipt history were imported.')).toBeVisible();
  await expect(recipientPage.getByRole('heading', { name: 'Take recycling out' })).toBeVisible();
  await expect(recipientPage.getByRole('heading', { name: 'Take out the bins' })).toHaveCount(0);
  await expect(recipientPage.getByRole('heading', { name: 'Water the plants' })).toHaveCount(0);
  await expect(recipientPage.getByRole('heading', { name: 'Polish the hallway mirror' })).toBeVisible();
  const imported = await databaseValue(recipientPage, 'chore-receipt-real-v1') as Backup;
  expect(imported.chores.map((item) => item.id)).toContain('bins');
  expect(imported.chores.map((item) => item.id)).not.toContain('plants');
  expect(imported.removedChores).toContainEqual(expect.objectContaining({ id: 'plants' }));
  expect(imported.receipts).toHaveLength(4);
  await source.close(); await recipient.close();
});

test('@claim:receipt-next-date Completing a chore records a receipt and its exact interval', async ({ page }) => {
  await page.goto('/demo');
  await expect.poll(() => databaseValue(page, 'chore-receipt-demo-v1')).not.toBeUndefined();
  const before = (await databaseValue(page, 'chore-receipt-demo-v1') as Backup).receipts.length;
  await page.getByRole('button', { name: /Mark Water the plants done/ }).click();
  await expect(page.locator('.notice')).toContainText('Receipt added for Water the plants');
  await expect(page.getByText(/Due in 5 days/)).toBeVisible();
  const store = await databaseValue(page, 'chore-receipt-demo-v1') as Backup;
  expect(store.receipts).toHaveLength(before + 1);
  const receipt = store.receipts.at(-1)!;
  expect(new Date(receipt.dueAt).getTime() - new Date(receipt.completedAt).getTime()).toBe(5 * 86_400_000);
});

test('@claim:free No purchase or payment path exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Free to use')).toBeVisible();
  await expect(page.locator('a[href*="payment"],a[href*="checkout"],button:has-text("Buy")')).toHaveCount(0);
});

test('corrupt data can be restored by import or removed after confirmation', async ({ browser }) => {
  const valid: Backup = { household: 'Recovered home', chores: [{ id: 'saved', title: 'Clean the porch', repeatDays: 7, createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z' }], receipts: [], removedChores: [] };
  const importContext = await browser.newContext(); const importPage = await freshPage(importContext);
  await putDatabaseValue(importPage, 'chore-receipt-real-v1', { broken: true }); await importPage.reload();
  await expect(importPage.getByRole('heading', { name: 'Your chore record could not open' })).toBeVisible();
  await importPage.getByLabel('Choose JSON file').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(valid)) });
  await expect(importPage.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await expect(importPage.getByRole('heading', { name: 'Clean the porch' })).toBeVisible();
  await importContext.close();

  const clearContext = await browser.newContext(); const clearPage = await freshPage(clearContext);
  await putDatabaseValue(clearPage, 'chore-receipt-real-v1', { broken: true }); await clearPage.reload();
  clearPage.once('dialog', (dialog) => dialog.accept());
  await clearPage.getByRole('button', { name: 'Clear local chore data' }).click();
  await expect(clearPage.getByRole('heading', { name: 'Record chores when they get done' })).toBeVisible();
  expect(await databaseValue(clearPage, 'chore-receipt-real-v1')).toBeUndefined();
  await clearContext.close();
});

test('route clicks, Back, and Forward focus and announce the new heading', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Receipt log' }).click();
  await expect(page.getByRole('heading', { name: 'Every chore receipt' })).toBeFocused();
  await expect(page.locator('.announcer')).toHaveText('Every chore receipt page');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeFocused();
  await expect(page.locator('.announcer')).toHaveText('Shared chore board page');
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Every chore receipt' })).toBeFocused();
});

test('chores can be edited and removed while their receipts remain', async ({ page }) => {
  await page.goto('/demo');
  const chore = page.locator('.chore').filter({ hasText: 'Water the plants' });
  await chore.getByRole('button', { name: 'Edit chore' }).click();
  const edit = page.getByRole('dialog', { name: 'Edit chore' });
  await edit.getByLabel('Chore name').fill('Water the balcony plants');
  await edit.getByLabel('Repeat after').selectOption('14');
  await edit.getByRole('button', { name: 'Save chore' }).click();
  const edited = page.locator('.chore').filter({ hasText: 'Water the balcony plants' });
  await expect(edited).toContainText('repeats every 14 days');
  await edited.getByRole('button', { name: 'Remove chore' }).click();
  await expect(page.getByRole('dialog')).toContainText('Water the balcony plants leaves the board');
  await page.getByRole('dialog', { name: 'Remove this chore?' }).getByRole('button', { name: 'Remove chore' }).click();
  await expect(page.getByRole('heading', { name: 'Water the balcony plants' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Receipt log' }).click();
  await expect(page.getByText('Water the plants', { exact: true })).toBeVisible();
});

test('blank household names explain the error and return focus to the input', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Household name').fill('   ');
  await page.getByRole('button', { name: 'Save household name' }).click();
  await expect(page.getByText('Enter a household name before saving.')).toBeVisible();
  await expect(page.getByLabel('Household name')).toBeFocused();
  await expect(page.getByLabel('Household name')).toHaveAttribute('aria-describedby', 'household-message');
});

test('mobile navigation visibly reaches Household and controls keep their target size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.getByRole('link', { name: 'Household' })).toBeVisible();
  await page.getByRole('link', { name: 'Household' }).click();
  await expect(page.getByRole('heading', { name: 'Household and data' })).toBeFocused();
  for (const route of ['/', '/demo', '/settings']) {
    await page.goto(route);
    const undersized = await page.locator('a,button,input,select').evaluateAll((items) => items
      .filter((item) => { const box = item.getBoundingClientRect(); return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44); })
      .map((item) => (item as HTMLElement).innerText || item.getAttribute('aria-label')));
    expect(undersized, route).toEqual([]);
  }
});

test('the landing page shows a labelled sample board before explaining how it works', async ({ page }) => {
  await page.goto('/');
  const preview = page.locator('.sample-preview');
  await expect(preview).toBeVisible();
  await expect(preview.getByText('Maple Street home', { exact: true })).toBeVisible();
  await expect(preview.getByText('Clean the bathroom')).toBeVisible();
  await expect(preview.getByText('1 day overdue')).toBeVisible();
  await expect(preview.getByText('Done Aug 26 · next Aug 31')).toBeVisible();
  const order = await page.locator('.hero,.sample-preview,.how').evaluateAll((items) => items.map((item) => item.className));
  expect(order).toEqual(['hero', 'sample-preview', 'how']);
  await preview.getByRole('link', { name: 'Open the editable sample board' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved');
});

test('the 390px demo has no overflow or clipped controls at 200% text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => ({
    overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    clippedControls: [...document.querySelectorAll('a,button')].filter((item) => item.scrollWidth > item.clientWidth + 1 || item.scrollHeight > item.clientHeight + 1).map((item) => item.textContent?.trim())
  }))).toEqual({ overflows: false, clippedControls: [] });
});

test('every real route ships and updates complete route-specific metadata', async ({ page, request }) => {
  const routes = [
    ['/', 'Chore Receipt — record shared chores'], ['/demo', 'Demo — Chore Receipt'], ['/log', 'Receipt log — Chore Receipt'],
    ['/settings', 'Household — Chore Receipt'], ['/privacy', 'Privacy — Chore Receipt'], ['/terms', 'Terms — Chore Receipt']
  ] as const;
  for (const [route, title] of routes) {
    const staticPath = route === '/' ? '/' : `${route}/index.html`;
    const response = await request.get(staticPath); const html = await response.text();
    expect(response.status(), route).toBe(200); expect(html, route).toContain(`<title>${title}</title>`);
    expect(html, route).toContain(`rel="canonical" href="https://chore-receipt.sociobot.in${route}"`);
    for (const field of ['og:title', 'og:description', 'og:url', 'og:image', 'twitter:title', 'twitter:description', 'twitter:image']) expect(html, `${route} ${field}`).toContain(field);
    await page.goto(route); await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://chore-receipt.sociobot.in${route}`);
  }
});

test('the designed 404 keeps navigation, legal links, metadata, and accessible structure', async ({ page, request }) => {
  const response = await request.get('/404.html'); const html = await response.text();
  for (const text of ['Skip to content', 'Household', 'Privacy', 'Terms', 'twitter:image', 'canonical', 'favicon.svg']) expect(html).toContain(text);
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Chore Receipt');
  await expect(page.getByRole('heading', { level: 1, name: 'This page is missing.' })).toBeVisible();
  await expect(page.getByText('Misfiled receipt')).toHaveCount(0);
  await expect(page.locator('main')).toHaveCount(1); await expect(page.locator('header')).toHaveCount(1); await expect(page.locator('footer')).toHaveCount(1);
  await page.goto('/a-page-that-does-not-exist');
  await expect(page).toHaveTitle('Page not found — Chore Receipt');
  await expect(page.getByRole('heading', { level: 1, name: 'This page is missing.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Privacy' }).last()).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
});

test('invalid imported dates are rejected before they are saved', async ({ page }) => {
  await page.goto('/settings');
  const broken = { household: 'Home', chores: [], receipts: [{ id: 'bad', choreId: 'x', title: 'Broken', completedAt: 'not-a-date', dueAt: 'also-not-a-date', updatedAt: 'not-a-date' }] };
  await page.getByLabel('Choose JSON file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(broken)) });
  await expect(page.getByText('That file is not a valid Chore Receipt backup. Nothing was imported.')).toBeVisible();
  await page.reload(); await expect(page.getByRole('heading', { name: 'Household and data' })).toBeVisible();
});

test('the add dialog closes, explains blank names, and keyboard starts at the skip link', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.getByRole('button', { name: /Add your first chore/ }).click(); await page.getByRole('button', { name: 'Close add chore form' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button', { name: /Add your first chore/ }).click(); await page.getByLabel('Chore name').fill('   '); await page.getByRole('button', { name: 'Add shared chore' }).click();
  await expect(page.getByText('Enter a chore name before adding it.')).toBeVisible(); await expect(page.getByLabel('Chore name')).toBeFocused();
});

test('the service worker versions assets and caches only successful responses', async ({ request }) => {
  const worker = await (await request.get('/sw.js')).text();
  expect(worker).toMatch(/chore-receipt-[a-f0-9]{12}/); expect(worker).toMatch(/assets\/(?:app|index)-[a-zA-Z0-9_-]+\.js/);
  expect(worker).toContain("response.ok&&type.includes('text/html')");
  expect(worker).toContain('if(response.ok)');
  for (const route of ['/404.html', '/offline.html']) { const html = await (await request.get(route)).text(); expect(html).not.toContain('<style>'); expect(html).toContain('fallback.css'); }
});

test('hashed assets are immutable and the service worker always revalidates', async () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
    routes: Array<{ route: string; headers?: Record<string, string> }>;
    globalHeaders: Record<string, string>;
  };
  expect(JSON.parse(readFileSync('dist/staticwebapp.config.json', 'utf8'))).toEqual(config);
  expect(config.routes.find((item) => item.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(config.routes.find((item) => item.route === '/sw.js')?.headers?.['Cache-Control']).toBe('public, max-age=0, must-revalidate');
});

test('normal and missing routes send a frame-ancestors response header', async ({ request }) => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
  };
  const expected = config.globalHeaders['Content-Security-Policy'];
  expect(expected).toContain("frame-ancestors 'self'");
  for (const route of ['/', '/missing-csp-check']) {
    const response = await request.get(route);
    expect(response.headers()['content-security-policy'], route).toContain("frame-ancestors 'self'");
    expect(response.headers()['content-security-policy'], route).toBe(expected);
    if (process.env.PLAYWRIGHT_BASE_URL && route !== '/') expect(response.status()).toBe(404);
  }
});

test('landing headings name the product sections without slogans', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sample chore board' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Current chores' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How chore receipts set the next due date' })).toBeVisible();
  await expect(page.getByText('Keep the outcome. Skip the blame.')).toHaveCount(0);
  await expect(page.getByText('See a chore receipt at work')).toHaveCount(0);
  await expect(page.getByText('Ready for anyone')).toHaveCount(0);
  await expect(page.getByText('One receipt, then a clear next date')).toHaveCount(0);
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Current chores' })).toBeVisible();
});

test('board instructions and receipt actions name the chore and result', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Mark a chore done. Its repeat interval sets the next due date.')).toBeVisible();
  await expect(page.getByText('Mark the outcome.')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View all receipts' })).toBeVisible();
  await page.getByRole('button', { name: /Mark Water the plants done/ }).click();
  await expect(page.getByRole('button', { name: 'Undo receipt' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toHaveCount(0);
});

test('README and catalog use plain, bounded product wording', () => {
  const readme = readFileSync('README.md', 'utf8').replace(/\s+/g, ' ');
  expect(readme).toContain('The copy stays after the # in the link, which browsers do not send to this site.');
  expect(readme).toContain('The demo keeps its sample separate from your household data.');
  expect(readme).not.toContain('browser database');
  expect(readme).not.toContain('Each public claim');
  const catalog = readFileSync('.factory/catalog-description.txt', 'utf8').trim();
  expect(catalog).toBe('Record shared chores and see what is due next.');
  expect(catalog.length).toBeLessThanOrEqual(120);
});

test('the committed copy audit matches every current landing copy unit and sentence', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-copy-audit="header-wordmark"]')).toBeVisible();
  const audited = readFileSync('.factory/copy-audit.md', 'utf8');
  const rendered = await page.evaluate(() => {
    const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
    const copyFor = (element: HTMLElement) => {
      const label = element.getAttribute('aria-label');
      if (label) return clean(label);
      if (element instanceof HTMLImageElement) return clean(element.alt);
      const clone = element.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('[aria-hidden="true"]').forEach((item) => item.remove());
      return clean(clone.innerText || clone.textContent || '');
    };
    const units = [...document.querySelectorAll<HTMLElement>('[data-copy-audit]')]
      .flatMap((element) => copyFor(element)
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
        .map((copy, index) => ({
          location: `${element.dataset.copyAudit}${index ? `-${index + 1}` : ''}`,
          copy,
        })));
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const untracked: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      const text = clean(node.textContent || '');
      if (!parent || !text || parent.closest('script, style, [aria-hidden="true"], dialog:not([open])')) continue;
      if (!parent.closest('[data-copy-audit]')) untracked.push(text);
    }
    return { units, untracked };
  });
  const rows = audited.split('\n')
    .map((line) => line.match(/^\| ([^|]+) \| (.+?) \| (\d+) \| pass \|$/i))
    .filter((match): match is RegExpMatchArray => Boolean(match));
  const auditedUnits = rows.map((match) => ({
    location: match[1],
    copy: match[2].replaceAll('\\|', '|'),
  }));
  expect(rendered.untracked).toEqual([]);
  expect(auditedUnits).toEqual(rendered.units);
  for (const match of rows) {
    const words = match[2].replaceAll('\\|', '|').split(/\s+/).filter(Boolean).length;
    expect(Number(match[3]), match[2]).toBe(words); expect(words, match[2]).toBeLessThanOrEqual(22);
  }
  for (const banned of ['leverage', 'seamless', 'effortless', 'robust', 'powerful', 'intuitive', 'reimagine', 'supercharge', 'delightful', 'journey', 'ecosystem', 'AI-powered']) expect(audited.toLowerCase()).not.toContain(banned.toLowerCase());
});

test('every declared claim has exactly one tagged outcome test and every landing claim is registered', async ({ page }) => {
  const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
  const ids = claims.map((claim) => claim.id);
  expect(new Set(ids).size).toBe(ids.length);
  const source = readFileSync('tests/app.spec.ts', 'utf8');
  for (const claim of claims) {
    expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    expect(source.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g')) || [], claim.id).toHaveLength(1);
  }
  await page.goto('/');
  const landingClaims = await page.locator('[data-claim]').evaluateAll((items) => [...new Set(items.flatMap((item) => (item.getAttribute('data-claim') || '').split(/\s+/)).filter(Boolean))]);
  for (const id of landingClaims) expect(ids).toContain(id);
  expect(ids).toEqual([
    'demo-isolation', 'demo-reset', 'demo-discard', 'no-scoring', 'stored-device', 'offline-reload',
    'csv-export', 'json-backup', 'local-only', 'qr-share', 'copies-no-sync', 'receipt-next-date', 'free'
  ]);
});

test('all product routes and the 404 have no serious or critical axe findings', async ({ page }) => {
  for (const route of ['/', '/demo', '/log', '/settings', '/privacy', '/terms', '/404.html']) {
    await page.goto(route); await page.addScriptTag({ content: axe.source });
    const results = await page.evaluate(async () => (window as unknown as Window & { axe: typeof axe }).axe.run());
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), route).toEqual([]);
  }
});
