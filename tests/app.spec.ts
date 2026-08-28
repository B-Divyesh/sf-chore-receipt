import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import axe from 'axe-core';
import { readFileSync } from 'node:fs';

type Backup = {
  household: string;
  chores: Array<{ id: string; title: string; repeatDays: number; completedAt?: string; createdAt: string; updatedAt: string }>;
  receipts: Array<{ id: string; choreId: string; title: string; completedAt: string; dueAt: string; updatedAt: string }>;
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

test('@claim:demo-isolation One click opens a sampled board in its own database', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
  await expect(page.locator('.chore-list > li')).toHaveCount(4);
  expect(await databaseValue(page, 'chore-receipt-real-v1')).toBeUndefined();
  expect((await databaseValue(page, 'chore-receipt-demo-v1') as Backup).household).toBe('Maple Street home');
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo controls')).toContainText('sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Shared chore board' })).toBeVisible();
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
  const { buffer } = await downloadBuffer(sourcePage, 'Export data');
  const exported = JSON.parse(buffer.toString()) as Backup;
  await source.close();

  const target = await browser.newContext();
  const targetPage = await freshPage(target, '/settings');
  expect(await databaseValue(targetPage, 'chore-receipt-real-v1')).toBeUndefined();
  await targetPage.getByLabel('Choose JSON file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer });
  await expect(targetPage.getByText('Backup imported. Newer records were kept.')).toBeVisible();
  await targetPage.reload();
  await expect(targetPage.getByLabel('Household name')).toHaveValue('Maple Street home');
  const restored = await databaseValue(targetPage, 'chore-receipt-real-v1') as Backup;
  expect(restored.household).toBe(exported.household);
  expect(restored.chores).toEqual(exported.chores);
  expect(restored.receipts).toEqual(exported.receipts);
  await targetPage.getByRole('link', { name: 'Receipt log' }).click();
  await expect(targetPage.getByText(/Done .* · next/)).toHaveCount(4);
  await target.close();
});

test('@claim:local-only Household fields and packet never enter any request', async ({ browser }) => {
  const traffic: Array<{ url: string; method: string; body: string }> = [];
  const watch = (page: Page) => page.on('request', (request) => traffic.push({ url: request.url(), method: request.method(), body: request.postData() || '' }));
  const source = await browser.newContext(); const sourcePage = await source.newPage(); watch(sourcePage);
  await sourcePage.goto('/demo');
  await sourcePage.getByRole('link', { name: 'Household' }).click();
  await sourcePage.getByRole('button', { name: 'Create household QR' }).click();
  const href = await sourcePage.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  const packet = href!.split('#join=')[1];
  const recipient = await browser.newContext(); const recipientPage = await recipient.newPage(); watch(recipientPage);
  await recipientPage.goto(href!);
  await expect(recipientPage.getByText('Household copy added. Newer receipts were kept.')).toBeVisible();
  expect(traffic.length).toBeGreaterThan(0);
  for (const request of traffic) {
    expect(request.method).toBe('GET');
    expect(new URL(request.url).origin).toBe('http://127.0.0.1:4173');
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
  await expect(targetPage.getByText('Household copy added. Newer receipts were kept.')).toBeVisible();
  await expect(targetPage.locator('.chore-list > li')).toHaveCount(4);
  expect((await databaseValue(targetPage, 'chore-receipt-real-v1') as Backup).receipts).toHaveLength(4);
  await source.close(); await target.close();
});

test('@claim:copies-no-sync Household copies stay separate until someone imports again', async ({ browser }) => {
  const source = await browser.newContext(); const sourcePage = await freshPage(source, '/demo');
  await sourcePage.getByRole('link', { name: 'Household' }).click();
  await sourcePage.getByRole('button', { name: 'Create household QR' }).click();
  const href = await sourcePage.getByRole('link', { name: 'Open share link' }).getAttribute('href');
  const recipient = await browser.newContext(); const recipientPage = await freshPage(recipient, href!);
  await expect(recipientPage.getByText('Household copy added. Newer receipts were kept.')).toBeVisible();
  await sourcePage.getByRole('link', { name: 'Chore Receipt' }).click();
  await sourcePage.getByRole('button', { name: 'Add a chore' }).click();
  const add = sourcePage.getByRole('dialog', { name: 'Add a shared chore' });
  await add.getByLabel('Chore name').fill('Wipe the fridge shelf');
  await add.getByRole('button', { name: 'Add shared chore' }).click();
  await expect(sourcePage.getByRole('heading', { name: 'Wipe the fridge shelf' })).toBeVisible();
  await recipientPage.reload();
  await expect(recipientPage.getByRole('heading', { name: 'Wipe the fridge shelf' })).toHaveCount(0);
  await source.close(); await recipient.close();
});

test('@claim:receipt-next-date Completing a chore records a receipt and its exact interval', async ({ page }) => {
  await page.goto('/demo');
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
  const valid: Backup = { household: 'Recovered home', chores: [{ id: 'saved', title: 'Clean the porch', repeatDays: 7, createdAt: '2026-08-01T10:00:00.000Z', updatedAt: '2026-08-01T10:00:00.000Z' }], receipts: [] };
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
  await expect(page.getByRole('heading', { level: 1, name: 'This paper slip is missing.' })).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1); await expect(page.locator('header')).toHaveCount(1); await expect(page.locator('footer')).toHaveCount(1);
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
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as { routes: Array<{ route: string; headers?: Record<string, string> }> };
  expect(JSON.parse(readFileSync('dist/staticwebapp.config.json', 'utf8'))).toEqual(config);
  expect(config.routes.find((item) => item.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(config.routes.find((item) => item.route === '/sw.js')?.headers?.['Cache-Control']).toBe('public, max-age=0, must-revalidate');
});

test('the committed copy audit matches every current landing sentence', async ({ page }) => {
  await page.goto('/');
  const audited = readFileSync('.factory/copy-audit.md', 'utf8');
  const copy = await page.locator('.hero,.how,.privacy-note').locator('h1,h2,p,b,li > span,.button,.text-link,.facts > span,figcaption').allTextContents();
  for (const item of [...new Set(copy.map((text) => text.trim()).filter(Boolean))]) expect(audited, item).toContain(`| ${item.replaceAll('|', '\\|')} |`);
  for (const line of audited.split('\n').filter((line) => /^\| .+ \| \d+ \| pass \|$/i.test(line))) {
    const cells = line.split('|').map((cell) => cell.trim()); const words = cells[1].replaceAll('\\|', '|').split(/\s+/).filter(Boolean).length;
    expect(Number(cells[2]), cells[1]).toBe(words); expect(words, cells[1]).toBeLessThanOrEqual(22);
  }
  for (const banned of ['leverage', 'seamless', 'effortless', 'robust', 'powerful', 'intuitive', 'reimagine', 'supercharge', 'delightful', 'journey', 'ecosystem', 'AI-powered']) expect(audited.toLowerCase()).not.toContain(banned.toLowerCase());
});

test('all product routes and the 404 have no serious or critical axe findings', async ({ page }) => {
  for (const route of ['/', '/demo', '/log', '/settings', '/privacy', '/terms', '/404.html']) {
    await page.goto(route); await page.addScriptTag({ content: axe.source });
    const results = await page.evaluate(async () => (window as unknown as Window & { axe: typeof axe }).axe.run());
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), route).toEqual([]);
  }
});
