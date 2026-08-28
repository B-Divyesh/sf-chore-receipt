import QRCode from 'qrcode';
import './style.css';

type Chore = { id: string; title: string; repeatDays: number; completedAt?: string; createdAt: string; updatedAt: string };
type Receipt = { id: string; choreId: string; title: string; completedAt: string; dueAt: string; updatedAt: string };
type Store = { chores: Chore[]; receipts: Receipt[]; household: string };

const root = document.querySelector<HTMLDivElement>('#app')!;
const day = 86_400_000;
const isDemoUrl = (url = location.href) => {
  const parsed = new URL(url, location.origin);
  return parsed.pathname === '/demo' || parsed.searchParams.get('demo') === '1';
};
const isDemo = isDemoUrl();
const dbName = `chore-receipt-${isDemo ? 'demo' : 'real'}-v1`;
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
let state: Store = { chores: [], receipts: [], household: 'Our home' };
let lastReceipt: Receipt | undefined;

function request<T>(item: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { item.onsuccess = () => resolve(item.result); item.onerror = () => reject(item.error); });
}
async function db() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const open = indexedDB.open(dbName, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('state');
    open.onsuccess = () => resolve(open.result); open.onerror = () => reject(open.error);
  });
}
async function load(): Promise<Store | undefined> {
  const database = await db(); const tx = database.transaction('state', 'readonly');
  const result = await request(tx.objectStore('state').get('current')) as Store | undefined;
  database.close(); return result;
}
async function save() {
  const database = await db(); const tx = database.transaction('state', 'readwrite');
  tx.objectStore('state').put(state, 'current');
  await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); database.close();
}
function sample(): Store {
  const at = (daysAgo: number, hour = 9) => new Date(Date.now() - daysAgo * day - hour * 3_600_000).toISOString();
  const chores: Chore[] = [
    { id: 'bath', title: 'Clean the bathroom', repeatDays: 7, completedAt: at(8), createdAt: at(30), updatedAt: at(8) },
    { id: 'bins', title: 'Take out the bins', repeatDays: 7, completedAt: at(6), createdAt: at(30), updatedAt: at(6) },
    { id: 'plants', title: 'Water the plants', repeatDays: 5, completedAt: at(2), createdAt: at(30), updatedAt: at(2) },
    { id: 'sheets', title: 'Change the sheets', repeatDays: 14, completedAt: at(4), createdAt: at(30), updatedAt: at(4) }
  ];
  const receipts = chores.map((chore) => ({ id: `r-${chore.id}`, choreId: chore.id, title: chore.title, completedAt: chore.completedAt!, dueAt: new Date(new Date(chore.completedAt!).getTime() + chore.repeatDays * day).toISOString(), updatedAt: chore.updatedAt }));
  return { household: 'Maple Street home', chores, receipts };
}
function validDate(value: unknown): value is string { return typeof value === 'string' && !Number.isNaN(Date.parse(value)); }
function validChore(value: unknown): value is Chore {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Chore>;
  return typeof item.id === 'string' && item.id.length > 0 && typeof item.title === 'string' && item.title.trim().length > 0 && item.title.length <= 80 && Number.isInteger(item.repeatDays) && [1, 3, 5, 7, 14, 30].includes(item.repeatDays as number) && validDate(item.createdAt) && validDate(item.updatedAt) && (item.completedAt === undefined || validDate(item.completedAt));
}
function validReceipt(value: unknown): value is Receipt {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Receipt>;
  return typeof item.id === 'string' && item.id.length > 0 && typeof item.choreId === 'string' && item.choreId.length > 0 && typeof item.title === 'string' && item.title.trim().length > 0 && item.title.length <= 80 && validDate(item.completedAt) && validDate(item.dueAt) && validDate(item.updatedAt);
}
function validateStore(value: unknown): Store {
  if (!value || typeof value !== 'object') throw new Error('not an object');
  const incoming = value as Partial<Store>;
  if (typeof incoming.household !== 'string' || incoming.household.trim().length === 0 || incoming.household.length > 60 || !Array.isArray(incoming.chores) || !Array.isArray(incoming.receipts) || !incoming.chores.every(validChore) || !incoming.receipts.every(validReceipt)) throw new Error('invalid record');
  if (new Set(incoming.chores.map((item) => item.id)).size !== incoming.chores.length || new Set(incoming.receipts.map((item) => item.id)).size !== incoming.receipts.length) throw new Error('duplicate record');
  return { household: incoming.household.trim(), chores: incoming.chores, receipts: incoming.receipts };
}
function dueDate(chore: Chore) { return chore.completedAt ? new Date(new Date(chore.completedAt).getTime() + chore.repeatDays * day) : new Date(); }
function status(chore: Chore) {
  if (!chore.completedAt) return 'Needs a first receipt';
  const milliseconds = dueDate(chore).getTime() - Date.now();
  if (milliseconds >= 0) { const days = Math.max(1, Math.ceil(milliseconds / day)); return `Due in ${days} day${days === 1 ? '' : 's'}`; }
  const elapsedDays = Math.floor(Math.abs(milliseconds) / day);
  return elapsedDays === 0 ? 'Due today' : `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} overdue`;
}
function due(chore: Chore) { return dueDate(chore).getTime() <= Date.now(); }
function dateTime(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function date(value: string) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value)); }
function escape(value: string) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function route() { return location.pathname === '/' && new URL(location.href).searchParams.get('demo') === '1' ? '/demo' : location.pathname; }
function encodePacket(store: Store) { return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(store)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function decodePacket(encoded: string) {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - encoded.length % 4) % 4);
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  return validateStore(JSON.parse(new TextDecoder().decode(bytes)));
}

async function init() {
  try {
    const stored = await load();
    state = stored ? validateStore(stored) : (isDemo ? sample() : state);
    if (!stored && isDemo) await save();
    await importJoin();
    render();
  } catch (error) {
    console.error('Chore data could not open', error);
    root.innerHTML = `<main class="error-state"><h1>Your chore record could not open</h1><p>Your saved data has an invalid record. Import a valid backup from Household, or clear this browser’s Chore Receipt data and start again.</p><a class="button primary" href="/settings">Open Household</a></main>`;
  }
  navigator.serviceWorker?.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker); });
    });
  }).catch(() => undefined);
}
function showUpdate(worker: ServiceWorker) {
  if (document.querySelector('.update-toast')) return;
  const toast = document.createElement('aside'); toast.className = 'update-toast'; toast.setAttribute('role', 'status');
  toast.innerHTML = `A new Chore Receipt is ready. <button>Refresh now</button>`;
  toast.querySelector('button')?.addEventListener('click', () => { worker.postMessage({ type: 'SKIP_WAITING' }); location.reload(); }); document.body.append(toast);
}
async function importJoin() {
  const joined = new URLSearchParams(location.hash.slice(1)).get('join');
  if (!joined) return;
  try {
    await merge(decodePacket(joined));
    history.replaceState({}, '', route());
    sessionStorage.setItem('joined', '1');
  } catch { sessionStorage.setItem('join-error', '1'); history.replaceState({}, '', route()); }
}
function header() {
  return `<a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="/" data-link><span aria-hidden="true">▰</span> Chore Receipt</a><nav aria-label="Main navigation"><a href="/log" data-link>Receipt log</a><a href="/settings" data-link>Household</a><a href="/privacy" data-link>Privacy</a></nav></header>`;
}
function footer() { return `<footer><p>A shared record for recurring chores. Generated art is original to this product.</p><div><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="noopener">Built by Param Factory</a><span>v1.1.0</span></div></footer>`; }
function demoBanner() { return isDemo ? `<aside class="demo-banner" aria-label="Demo controls"><span><strong>Demo</strong> — sample data, nothing is saved.</span><button data-action="reset-demo">Reset demo</button><a class="button small" href="/">Start for real</a></aside>` : ''; }
function appShell(content: string) { return `${header()}${demoBanner()}<main id="main" tabindex="-1">${content}</main>${footer()}<div class="announcer" aria-live="polite"></div>`; }
function landing() {
  const hasData = state.chores.length > 0;
  return appShell(`<section class="hero"><div class="hero-copy"><p class="eyebrow">A household record, not a scorecard</p><h1>Record chores when they get done</h1><p class="lede">For roommates and families who share the work and need to know what is due next.</p><div class="actions"><a class="button primary" href="/demo">Try it with sample data</a><span class="action-note">See a working shared chore board.</span></div><div class="facts"><span>Works offline after setup</span><span>Stored on this device</span><span>Free to use</span></div>${hasData ? `<a class="text-link" href="/log" data-link>Open your chore board →</a>` : `<button class="text-link" data-action="open-add">Add your first chore →</button>`}</div><figure class="hero-art"><img src="/kitchen-diorama.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt." /><figcaption>Keep the outcome. Skip the blame.</figcaption></figure></section><section class="how"><div><p class="section-kicker">How it works</p><h2>One receipt, then a clear next date</h2></div><ol><li><b>Keep a shared list.</b><span>Add chores the household repeats.</span></li><li><b>Tap “Mark done.”</b><span>The time becomes a receipt.</span></li><li><b>Check what is due.</b><span>Each task repeats from completion.</span></li></ol></section><section class="privacy-note"><h2>Keep your household record private</h2><p>Export or share a household copy only when you choose.</p><a href="/privacy" data-link>Read the privacy details</a></section>${addDialog()}`);
}
function addDialog() { return `<dialog id="add-dialog"><form id="add-form"><button class="close" type="button" data-action="close-add" aria-label="Close add chore form">×</button><h2>Add a shared chore</h2><p>Anyone in the household can mark it done.</p><label for="chore-title">Chore name</label><input id="chore-title" name="title" aria-describedby="add-message" autocomplete="off" required maxlength="80" placeholder="Clean the stovetop" /><label for="repeat-days">Repeat after</label><select id="repeat-days" name="days"><option value="1">1 day</option><option value="3">3 days</option><option value="5">5 days</option><option value="7" selected>7 days</option><option value="14">14 days</option><option value="30">30 days</option></select><button class="button primary" type="submit">Add shared chore</button><p id="add-message" class="form-message" aria-live="polite"></p></form></dialog>`; }
function board() {
  const current = [...state.chores].sort((a, b) => Number(due(b)) - Number(due(a)) || dueDate(a).getTime() - dueDate(b).getTime());
  const history = [...state.receipts].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return appShell(`<section class="board-head"><div><p class="eyebrow">${escape(state.household)}</p><h1>Shared chore board</h1><p>Mark the outcome. The next due date follows completion.</p></div><div class="board-tools"><button class="button primary" data-action="open-add">Add a chore</button><button class="button quiet" data-action="export-json">Export data</button></div></section>${lastReceipt ? `<p class="notice" role="status">Receipt added for ${escape(lastReceipt.title)}. Next due ${date(lastReceipt.dueAt)}. <button data-action="undo-receipt">Undo</button></p>` : ''}${sessionStorage.getItem('joined') ? `<p class="notice" role="status">Household copy added. Newer receipts were kept.</p>` : ''}${sessionStorage.getItem('join-error') ? `<p class="notice error" role="status">That household code could not be read. Ask for a new one.</p>` : ''}<section aria-labelledby="queue-heading" class="queue"><div class="section-title"><h2 id="queue-heading">Ready for anyone</h2><span>${current.filter(due).length} due now</span></div>${current.length ? `<ul class="chore-list">${current.map((chore) => `<li class="chore ${due(chore) ? 'is-due' : ''}"><div class="chore-clip" aria-hidden="true"></div><div><h3>${escape(chore.title)}</h3><p>${status(chore)} · repeats every ${chore.repeatDays} day${chore.repeatDays === 1 ? '' : 's'}</p></div><button class="done" data-action="complete" data-id="${chore.id}" aria-label="Mark ${escape(chore.title)} done"><span aria-hidden="true">✓</span> Mark done</button></li>`).join('')}</ul>` : `<div class="empty"><h3>No chores yet</h3><p>Your shared chores will appear here. Add one to make its first receipt.</p><button class="button primary" data-action="open-add">Add a chore</button></div>`}</section><section class="history" aria-labelledby="history-heading"><div class="section-title"><h2 id="history-heading">Recent receipts</h2><a href="/log" data-link>View all</a></div>${history.length ? `<ul>${history.slice(0, 4).map(receiptLine).join('')}</ul>` : `<p class="muted">A time-stamped receipt appears when someone marks a chore done.</p>`}</section>${addDialog()}`);
}
function receiptLine(item: Receipt) { return `<li><span class="stamp" aria-hidden="true">✓</span><div><b>${escape(item.title)}</b><p>Done ${dateTime(item.completedAt)} · next ${date(item.dueAt)}</p></div></li>`; }
function log() { const receipts = [...state.receipts].sort((a, b) => b.completedAt.localeCompare(a.completedAt)); return appShell(`<section class="page-head"><p class="eyebrow">Neutral household record</p><h1>Every chore receipt</h1><p>Completion times are shown without names or points.</p><div class="board-tools"><button class="button quiet" data-action="export-csv">Export CSV</button><button class="button quiet" data-action="export-json">Export JSON</button></div></section><section class="history full"><h2>Receipt history</h2>${receipts.length ? `<ul>${receipts.map(receiptLine).join('')}</ul>` : `<div class="empty"><h3>No receipts yet</h3><p>Mark a shared chore done to place its receipt here.</p><a class="button primary" href="/" data-link>Go to the chore board</a></div>`}</section>`); }
function settings() { return appShell(`<section class="page-head"><p class="eyebrow">Keep a household copy</p><h1>Household and data</h1><p>Share only when everyone agrees.</p></section><section class="settings-grid"><section class="paper-form"><h2>Name this household</h2><label for="household">Household name</label><input id="household" value="${escape(state.household)}" maxlength="60"/><button class="button primary" data-action="save-household">Save household name</button></section><section class="paper-form"><h2>Share a household copy</h2><p>Create an opt-in QR code. Its data stays after the # sign.</p><button class="button quiet" data-action="make-qr">Create household QR</button><div id="qr-place" class="qr-place"></div><p class="muted">Use Export JSON for a full backup.</p></section><section class="paper-form"><h2>Import a backup</h2><p>Choose a Chore Receipt JSON export.</p><label class="file-button" for="import-file">Choose JSON file</label><input id="import-file" type="file" accept="application/json" hidden /><p id="import-note" aria-live="polite"></p></section></section>`); }
function privacy() { return appShell(`<article class="legal"><h1>Your household data stays here</h1><p>Chore Receipt stores chores, receipts, and your household name in this browser.</p><h2>What leaves this device</h2><p>Household data is not sent to the host. QR data is kept in the URL fragment, which browsers do not send in requests. An export only leaves when you choose to download or share it.</p><h2>Demo data</h2><p>Demo data uses a separate browser database. Resetting the demo deletes that database only.</p><h2>Children</h2><p>Do not add children’s names.</p></article>`); }
function terms() { return appShell(`<article class="legal"><h1>Terms for using Chore Receipt</h1><p>Use Chore Receipt to keep a household record.</p><h2>Your responsibility</h2><p>Check exports and shared copies before relying on them. This app does not replace safety or tenancy records.</p></article>`); }
function notFound() { return appShell(`<section class="error-state"><p class="eyebrow">Misfiled receipt</p><h1>This paper slip is missing</h1><p>The page you asked for is not in this household record.</p><a class="button primary" href="/" data-link>Return to the chore board</a></section>`); }
function render() {
  const path = route();
  document.title = path === '/privacy' ? 'Privacy — Chore Receipt' : path === '/terms' ? 'Terms — Chore Receipt' : path === '/demo' ? 'Demo — Chore Receipt' : path === '/log' ? 'Receipt log — Chore Receipt' : path === '/settings' ? 'Household — Chore Receipt' : 'Chore Receipt — log shared chores';
  root.innerHTML = path === '/' ? (state.chores.length ? board() : landing()) : path === '/demo' ? board() : path === '/log' ? log() : path === '/settings' ? settings() : path === '/privacy' ? privacy() : path === '/terms' ? terms() : notFound();
  bind();
}
function navigate(href: string) {
  const target = new URL(href, location.origin);
  if (isDemo && target.pathname !== '/demo') target.searchParams.set('demo', '1');
  if (isDemo !== isDemoUrl(target.href)) { location.assign(target.href); return; }
  history.pushState({}, '', target.pathname + target.search); render(); window.scrollTo(0, 0); document.querySelector<HTMLElement>('h1')?.focus();
}
function download(name: string, text: string, type: string) { const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([text], { type })); anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(anchor.href), 1000); }
async function merge(other: Store) {
  const validated = validateStore(other);
  const chores = new Map(state.chores.map((item) => [item.id, item])); validated.chores.forEach((item) => { if (!chores.get(item.id) || chores.get(item.id)!.updatedAt < item.updatedAt) chores.set(item.id, item); });
  const receipts = new Map(state.receipts.map((item) => [item.id, item])); validated.receipts.forEach((item) => { if (!receipts.get(item.id) || receipts.get(item.id)!.updatedAt < item.updatedAt) receipts.set(item.id, item); });
  state = { household: validated.household || state.household, chores: [...chores.values()], receipts: [...receipts.values()] }; await save();
}
function bind() {
  document.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach((anchor) => anchor.addEventListener('click', (event) => { if (anchor.origin === location.origin) { event.preventDefault(); navigate(anchor.pathname + anchor.search); } }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', async () => {
    const action = element.dataset.action;
    if (action === 'open-add') { const dialog = document.querySelector<HTMLDialogElement>('#add-dialog'); dialog?.showModal(); dialog?.querySelector<HTMLInputElement>('input')?.focus(); }
    if (action === 'close-add') document.querySelector<HTMLDialogElement>('#add-dialog')?.close();
    if (action === 'reset-demo') { indexedDB.deleteDatabase(dbName); state = sample(); await save(); render(); }
    if (action === 'complete') { const chore = state.chores.find((item) => item.id === element.dataset.id); if (!chore) return; const completedAt = now(); chore.completedAt = completedAt; chore.updatedAt = completedAt; const receipt = { id: id(), choreId: chore.id, title: chore.title, completedAt, dueAt: new Date(Date.now() + chore.repeatDays * day).toISOString(), updatedAt: completedAt }; state.receipts.push(receipt); lastReceipt = receipt; await save(); render(); const note = document.querySelector('.announcer'); if (note) note.textContent = `${chore.title} marked done. Receipt added.`; }
    if (action === 'undo-receipt' && lastReceipt) { const removed = lastReceipt; state.receipts = state.receipts.filter((receipt) => receipt.id !== removed.id); const chore = state.chores.find((item) => item.id === removed.choreId); const prior = state.receipts.filter((receipt) => receipt.choreId === removed.choreId).sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0]; if (chore) { chore.completedAt = prior?.completedAt; chore.updatedAt = now(); } lastReceipt = undefined; await save(); render(); }
    if (action === 'export-json') download('chore-receipt-backup.json', JSON.stringify(state, null, 2), 'application/json');
    if (action === 'export-csv') { const lines = ['chore,completed_at,due_at']; [...state.receipts].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).forEach((receipt) => lines.push(`"${receipt.title.replaceAll('"', '""')}",${receipt.completedAt},${receipt.dueAt}`)); download('chore-receipts.csv', lines.join('\n'), 'text/csv'); }
    if (action === 'save-household') { const input = document.querySelector<HTMLInputElement>('#household'); if (input?.value.trim()) { state.household = input.value.trim(); await save(); render(); } }
    if (action === 'make-qr') { const place = document.querySelector<HTMLElement>('#qr-place'); if (!place) return; const url = `${location.origin}/#join=${encodePacket(state)}`; try { const image = await QRCode.toDataURL(url, { width: 256, margin: 1, errorCorrectionLevel: 'L', color: { dark: '#24302B', light: '#FFFDF8' } }); place.innerHTML = `<img src="${image}" width="256" height="256" alt="QR code that imports a copy of this household record." /><a href="${url}">Open share link</a>`; } catch { place.textContent = 'This household copy is too large for a QR code. Export a JSON backup instead.'; } }
  }));
  document.querySelector<HTMLFormElement>('#add-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const title = String(form.get('title') || '').trim(); const message = document.querySelector<HTMLElement>('#add-message');
    if (!title) { if (message) message.textContent = 'Enter a chore name before adding it.'; document.querySelector<HTMLInputElement>('#chore-title')?.focus(); return; }
    const time = now(); state.chores.push({ id: id(), title, repeatDays: Number(form.get('days')), createdAt: time, updatedAt: time }); await save(); document.querySelector<HTMLDialogElement>('#add-dialog')?.close(); render();
  });
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', async (event) => {
    const file = ((event.currentTarget as HTMLInputElement).files || [])[0]; const note = document.querySelector<HTMLElement>('#import-note'); if (!file || !note) return;
    try { const incoming = validateStore(JSON.parse(await file.text())); await merge(incoming); note.textContent = 'Backup imported. Newer records were kept.'; } catch { note.textContent = 'That file is not a valid Chore Receipt backup. Nothing was imported.'; }
  });
}
window.addEventListener('popstate', render);
init();
