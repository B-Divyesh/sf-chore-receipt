import QRCode from 'qrcode';
import './style.css';

type Chore = { id: string; title: string; repeatDays: number; completedAt?: string; createdAt: string; updatedAt: string };
type Receipt = { id: string; choreId: string; title: string; completedAt: string; dueAt: string; updatedAt: string };
type Store = { chores: Chore[]; receipts: Receipt[]; household: string };

const root = document.querySelector<HTMLDivElement>('#app')!;
const isDemo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
const dbName = `chore-receipt-${isDemo ? 'demo' : 'real'}-v1`;
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const day = 86_400_000;
let state: Store = { chores: [], receipts: [], household: 'Our home' };
let lastReceipt: Receipt | undefined;

function request<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
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
  const receipts: Receipt[] = chores.map((chore) => ({ id: `r-${chore.id}`, choreId: chore.id, title: chore.title, completedAt: chore.completedAt!, dueAt: new Date(new Date(chore.completedAt!).getTime() + chore.repeatDays * day).toISOString(), updatedAt: chore.updatedAt }));
  return { household: 'Maple Street home', chores, receipts };
}
function dueDate(chore: Chore) { return chore.completedAt ? new Date(new Date(chore.completedAt).getTime() + chore.repeatDays * day) : new Date(); }
function status(chore: Chore) {
  if (!chore.completedAt) return 'Needs a first receipt';
  const diff = Math.ceil((dueDate(chore).getTime() - Date.now()) / day);
  return diff <= 0 ? `${Math.abs(diff)} days overdue`.replace('0 days', 'Due today') : `Due in ${diff} day${diff === 1 ? '' : 's'}`;
}
function due(chore: Chore) { return dueDate(chore).getTime() <= Date.now() + day; }
function dateTime(value: string) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function date(value: string) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value)); }
function escape(value: string) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function route() { return location.pathname === '/demo' ? '/demo' : location.pathname; }

async function init() {
  try {
    const stored = await load();
    state = stored ?? (isDemo ? sample() : state);
    if (!stored && isDemo) await save();
    await importJoin();
    render();
  } catch (error) { root.innerHTML = `<main class="error-state"><h1>Your chore record could not open</h1><p>Browser storage is unavailable. Enable site data, then reload.</p><button onclick="location.reload()">Reload Chore Receipt</button></main>`; }
  navigator.serviceWorker?.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker); });
    });
  }).catch(() => undefined);
}
function showUpdate(worker: ServiceWorker) {
  const toast = document.createElement('aside'); toast.className = 'update-toast'; toast.setAttribute('role', 'status');
  toast.innerHTML = `A new Chore Receipt is ready. <button>Refresh now</button>`;
  toast.querySelector('button')?.addEventListener('click', () => { worker.postMessage({ type: 'SKIP_WAITING' }); location.reload(); }); document.body.append(toast);
}
async function importJoin() {
  const joined = new URLSearchParams(location.search).get('join');
  if (!joined) return;
  try {
    const packet = JSON.parse(decodeURIComponent(atob(joined.replace(/-/g, '+').replace(/_/g, '/')))) as Store;
    const existing = new Map(state.chores.map((item) => [item.id, item]));
    packet.chores.forEach((item) => { const old = existing.get(item.id); if (!old || old.updatedAt < item.updatedAt) existing.set(item.id, item); });
    const receipts = new Map(state.receipts.map((item) => [item.id, item]));
    packet.receipts.forEach((item) => { const old = receipts.get(item.id); if (!old || old.updatedAt < item.updatedAt) receipts.set(item.id, item); });
    state = { household: packet.household || state.household, chores: [...existing.values()], receipts: [...receipts.values()] };
    await save();
    history.replaceState({}, '', route());
    sessionStorage.setItem('joined', '1');
  } catch { sessionStorage.setItem('join-error', '1'); history.replaceState({}, '', route()); }
}
function header() {
  return `<a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="/" data-link><span aria-hidden="true">▰</span> Chore Receipt</a><nav aria-label="Main navigation"><a href="/log" data-link>Receipt log</a><a href="/settings" data-link>Household</a><a href="/privacy" data-link>Privacy</a></nav></header>`;
}
function footer() { return `<footer><p>A shared record for recurring chores. Generated art is original to this product.</p><div><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="noopener">Built by Param Factory</a><span>v1.0.0</span></div></footer>`; }
function demoBanner() { return isDemo ? `<aside class="demo-banner" aria-label="Demo controls"><span><strong>Demo</strong> — sample data, nothing is saved.</span><button data-action="reset-demo">Reset demo</button><a class="button small" href="/">Start for real</a></aside>` : ''; }
function appShell(content: string) { return `${header()}${demoBanner()}<main id="main" tabindex="-1">${content}</main>${footer()}<div class="announcer" aria-live="polite"></div>`; }
function landing() {
  const hasData = state.chores.length > 0;
  return appShell(`<section class="hero"><div class="hero-copy"><p class="eyebrow">A household record, not a scorecard</p><h1>Record chores when they get done</h1><p class="lede">For roommates and families who share the work and need to know what is due next.</p><div class="actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span class="action-note">See a working shared chore board.</span></div><div class="facts"><span>Works offline after setup</span><span>Stored on this device</span><span>Free to use</span></div>${hasData ? `<a class="text-link" href="/log" data-link>Open your chore board →</a>` : `<button class="text-link" data-action="open-add">Add your first chore →</button>`}</div><figure class="hero-art"><img src="/kitchen-diorama.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt." /><figcaption>Keep the outcome. Skip the blame.</figcaption></figure></section><section class="how"><div><p class="section-kicker">How it works</p><h2>One receipt, then a clear next date</h2></div><ol><li><b>Keep a shared list.</b><span>Anyone can take the next task.</span></li><li><b>Tap “Mark done.”</b><span>The time becomes a receipt.</span></li><li><b>Check what is due.</b><span>Each task repeats from completion.</span></li></ol></section><section class="privacy-note"><h2>No accounts. No scores. No snooping.</h2><p>Your chores stay in your browser unless you choose to export or share a household copy.</p><a href="/privacy" data-link>Read the privacy details</a></section>${addDialog()}`);
}
function addDialog() { return `<dialog id="add-dialog"><form method="dialog" id="add-form"><button class="close" value="cancel" aria-label="Close add chore form">×</button><h2>Add a shared chore</h2><p>Anyone in the household can mark it done.</p><label for="chore-title">Chore name</label><input id="chore-title" name="title" autocomplete="off" required maxlength="80" placeholder="Clean the stovetop" /><label for="repeat-days">Repeat after</label><select id="repeat-days" name="days"><option value="1">1 day</option><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option><option value="30">30 days</option></select><button class="button primary" value="default">Add shared chore</button><p class="form-message" aria-live="polite"></p></form></dialog>`; }
function board() {
  const current = [...state.chores].sort((a,b) => Number(due(b)) - Number(due(a)) || dueDate(a).getTime() - dueDate(b).getTime());
  const history = [...state.receipts].sort((a,b) => b.completedAt.localeCompare(a.completedAt));
  return appShell(`<section class="board-head"><div><p class="eyebrow">${escape(state.household)}</p><h1>Shared chore board</h1><p>Mark the outcome. The next due date follows completion.</p></div><div class="board-tools"><button class="button primary" data-action="open-add">Add a chore</button><button class="button quiet" data-action="export-json">Export data</button></div></section>${lastReceipt ? `<p class="notice" role="status">Receipt added for ${escape(lastReceipt.title)}. Next due ${date(lastReceipt.dueAt)}. <button data-action="undo-receipt">Undo</button></p>` : ''}${sessionStorage.getItem('joined') ? `<p class="notice" role="status">Household copy added. Newer receipts were kept.</p>` : ''}${sessionStorage.getItem('join-error') ? `<p class="notice error" role="status">That household code could not be read. Ask for a new one.</p>` : ''}<section aria-labelledby="queue-heading" class="queue"><div class="section-title"><h2 id="queue-heading">Ready for anyone</h2><span>${current.filter(due).length} due now</span></div>${current.length ? `<ul class="chore-list">${current.map((chore) => `<li class="chore ${due(chore) ? 'is-due' : ''}"><div class="chore-clip" aria-hidden="true"></div><div><h3>${escape(chore.title)}</h3><p>${status(chore)} · repeats every ${chore.repeatDays} day${chore.repeatDays === 1 ? '' : 's'}</p></div><button class="done" data-action="complete" data-id="${chore.id}" aria-label="Mark ${escape(chore.title)} done"><span aria-hidden="true">✓</span> Mark done</button></li>`).join('')}</ul>` : `<div class="empty"><h3>No chores yet</h3><p>Your shared chores will appear here. Add one to make its first receipt.</p><button class="button primary" data-action="open-add">Add a chore</button></div>`}</section><section class="history" aria-labelledby="history-heading"><div class="section-title"><h2 id="history-heading">Recent receipts</h2><a href="/log" data-link>View all</a></div>${history.length ? `<ul>${history.slice(0, 4).map(receiptLine).join('')}</ul>` : `<p class="muted">A time-stamped receipt appears when someone marks a chore done.</p>`}</section>${addDialog()}`);
}
function receiptLine(item: Receipt) { return `<li><span class="stamp" aria-hidden="true">✓</span><div><b>${escape(item.title)}</b><p>Done ${dateTime(item.completedAt)} · next ${date(item.dueAt)}</p></div></li>`; }
function log() { const receipts = [...state.receipts].sort((a,b) => b.completedAt.localeCompare(a.completedAt)); return appShell(`<section class="page-head"><p class="eyebrow">Neutral household record</p><h1>Every chore receipt</h1><p>Completion times are shown without names or points.</p><div class="board-tools"><button class="button quiet" data-action="export-csv">Export CSV</button><button class="button quiet" data-action="export-json">Export JSON</button></div></section><section class="history full"><h2>Receipt history</h2>${receipts.length ? `<ul>${receipts.map(receiptLine).join('')}</ul>` : `<div class="empty"><h3>No receipts yet</h3><p>Mark a shared chore done to place its receipt here.</p><a class="button primary" href="/" data-link>Go to the chore board</a></div>`}</section>`); }
function settings() { return appShell(`<section class="page-head"><p class="eyebrow">Keep a household copy</p><h1>Household and data</h1><p>Share only when everyone agrees. This tool never syncs in the background.</p></section><section class="settings-grid"><section class="paper-form"><h2>Name this household</h2><label for="household">Household name</label><input id="household" value="${escape(state.household)}" maxlength="60"/><button class="button primary" data-action="save-household">Save household name</button></section><section class="paper-form"><h2>Share a household copy</h2><p>Create an opt-in QR code. Scanning it imports this device’s current chores and receipts into another browser.</p><button class="button quiet" data-action="make-qr">Create household QR</button><div id="qr-place" class="qr-place"></div><p class="muted">Copies merge by the latest saved receipt. Use Export JSON for a full backup.</p></section><section class="paper-form"><h2>Import a backup</h2><p>Choose a Chore Receipt JSON export. Newer records are kept.</p><label class="file-button" for="import-file">Choose JSON file</label><input id="import-file" type="file" accept="application/json" hidden /><p id="import-note" aria-live="polite"></p></section></section>`); }
function privacy() { return appShell(`<article class="legal"><h1>Your household data stays here</h1><p>Chore Receipt stores chores, receipts, and your household name in this browser’s IndexedDB.</p><h2>What leaves this device</h2><p>Nothing is sent to us. A household QR or export only leaves when you choose to create one.</p><h2>Demo data</h2><p>Demo data uses a separate browser database. Resetting the demo deletes that database only.</p><h2>Children</h2><p>Do not add children’s names. The product does not collect child data.</p></article>`); }
function terms() { return appShell(`<article class="legal"><h1>Terms for using Chore Receipt</h1><p>Chore Receipt is a free local tool. Use it to keep a household record.</p><h2>Your responsibility</h2><p>Check exports and shared copies before relying on them. This app does not replace safety or tenancy records.</p><h2>No account service</h2><p>There is no account, cloud backup, payment, or guaranteed device sync.</p></article>`); }
function notFound() { return appShell(`<section class="error-state"><p class="eyebrow">Misfiled receipt</p><h1>This paper slip is missing</h1><p>The page you asked for is not in this household record.</p><a class="button primary" href="/" data-link>Return to the chore board</a></section>`); }
function render() {
  const path = route();
  document.title = path === '/privacy' ? 'Privacy — Chore Receipt' : path === '/terms' ? 'Terms — Chore Receipt' : isDemo ? 'Demo — Chore Receipt' : path === '/log' ? 'Receipt log — Chore Receipt' : path === '/settings' ? 'Household — Chore Receipt' : 'Chore Receipt — log shared chores';
  root.innerHTML = path === '/' ? (state.chores.length ? board() : landing()) : path === '/demo' ? board() : path === '/log' ? log() : path === '/settings' ? settings() : path === '/privacy' ? privacy() : path === '/terms' ? terms() : notFound();
  bind();
  const heading = document.querySelector<HTMLElement>('h1'); if (heading) heading.tabIndex = -1; if (heading && document.activeElement === document.body) heading.focus({ preventScroll: true });
}
function navigate(href: string) { history.pushState({}, '', href); render(); window.scrollTo(0, 0); document.querySelector<HTMLElement>('h1')?.focus(); }
function download(name: string, text: string, type: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function packet() { return btoa(encodeURIComponent(JSON.stringify({ household: state.household, chores: state.chores.slice(0, 10), receipts: state.receipts.slice(-25) }))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function merge(other: Store) { const chores = new Map(state.chores.map(x => [x.id,x])); other.chores.forEach(x => { if (!chores.get(x.id) || chores.get(x.id)!.updatedAt < x.updatedAt) chores.set(x.id,x); }); const receipts = new Map(state.receipts.map(x => [x.id,x])); other.receipts.forEach(x => { if (!receipts.get(x.id) || receipts.get(x.id)!.updatedAt < x.updatedAt) receipts.set(x.id,x); }); state = { household: other.household || state.household, chores: [...chores.values()], receipts: [...receipts.values()] }; await save(); }
function bind() {
  document.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach((a) => a.addEventListener('click', (e) => { if (a.origin === location.origin) { e.preventDefault(); navigate(a.pathname + a.search); } }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', async () => {
    const action = element.dataset.action;
    if (action === 'open-add') { const dialog = document.querySelector<HTMLDialogElement>('#add-dialog'); dialog?.showModal(); dialog?.querySelector<HTMLInputElement>('input')?.focus(); }
    if (action === 'reset-demo') { indexedDB.deleteDatabase(dbName); state = sample(); await save(); render(); }
    if (action === 'complete') { const chore = state.chores.find(x => x.id === element.dataset.id); if (!chore) return; const completedAt = now(); chore.completedAt = completedAt; chore.updatedAt = completedAt; const receipt = { id: id(), choreId: chore.id, title: chore.title, completedAt, dueAt: new Date(Date.now() + chore.repeatDays * day).toISOString(), updatedAt: completedAt }; state.receipts.push(receipt); lastReceipt = receipt; await save(); render(); const note = document.querySelector('.announcer'); if (note) note.textContent = `${chore.title} marked done. Receipt added.`; }
    if (action === 'undo-receipt' && lastReceipt) { const removed = lastReceipt; state.receipts = state.receipts.filter((receipt) => receipt.id !== removed.id); const chore = state.chores.find((item) => item.id === removed.choreId); const prior = state.receipts.filter((receipt) => receipt.choreId === removed.choreId).sort((a,b) => b.completedAt.localeCompare(a.completedAt))[0]; if (chore) { chore.completedAt = prior?.completedAt; chore.updatedAt = now(); } lastReceipt = undefined; await save(); render(); }
    if (action === 'export-json') download('chore-receipt-backup.json', JSON.stringify(state, null, 2), 'application/json');
    if (action === 'export-csv') { const lines = ['chore,completed_at,due_at']; state.receipts.sort((a,b) => b.completedAt.localeCompare(a.completedAt)).forEach(r => lines.push(`"${r.title.replaceAll('"','""')}",${r.completedAt},${r.dueAt}`)); download('chore-receipts.csv', lines.join('\n'), 'text/csv'); }
    if (action === 'save-household') { const input = document.querySelector<HTMLInputElement>('#household'); if (input?.value.trim()) { state.household = input.value.trim(); await save(); render(); } }
    if (action === 'make-qr') { const place = document.querySelector<HTMLElement>('#qr-place'); if (!place) return; const url = `${location.origin}/?join=${packet()}`; try { const image = await QRCode.toDataURL(url, { width: 256, margin: 1, color: { dark: '#24302B', light: '#FFFDF8' } }); place.innerHTML = `<img src="${image}" width="256" height="256" alt="QR code that imports a copy of this household record." /><a href="${url}">Open share link</a>`; } catch { place.textContent = 'The household QR could not be made. Export a JSON backup instead.'; } }
  }));
  document.querySelector<HTMLFormElement>('#add-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const title = String(form.get('title') || '').trim(); if (!title) return; const time = now(); state.chores.push({ id: id(), title, repeatDays: Number(form.get('days')), createdAt: time, updatedAt: time }); await save(); document.querySelector<HTMLDialogElement>('#add-dialog')?.close(); render(); });
  document.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', async (event) => { const file = ((event.currentTarget as HTMLInputElement).files || [])[0]; const note = document.querySelector('#import-note'); if (!file || !note) return; try { const incoming = JSON.parse(await file.text()) as Store; if (!Array.isArray(incoming.chores) || !Array.isArray(incoming.receipts)) throw new Error(); await merge(incoming); note.textContent = 'Backup imported. Newer records were kept.'; } catch { note.textContent = 'That file is not a Chore Receipt backup. Choose a JSON export.'; } });
}
window.addEventListener('popstate', render);
init();
