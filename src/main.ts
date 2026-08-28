import QRCode from "qrcode";
import "./style.css";

type Chore = {
  id: string;
  title: string;
  repeatDays: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
type Receipt = {
  id: string;
  choreId: string;
  title: string;
  completedAt: string;
  dueAt: string;
  updatedAt: string;
};
type RemovedChore = { id: string; removedAt: string };
type Store = {
  chores: Chore[];
  receipts: Receipt[];
  removedChores: RemovedChore[];
  household: string;
};

const root = document.querySelector<HTMLDivElement>("#app")!;
const day = 86_400_000;
const isDemoUrl = (url = location.href) => {
  const parsed = new URL(url, location.origin);
  return parsed.pathname === "/demo" || parsed.searchParams.get("demo") === "1";
};
const isDemo = isDemoUrl();
const dbName = `chore-receipt-${isDemo ? "demo" : "real"}-v1`;
const demoDbName = "chore-receipt-demo-v1";
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
let state: Store = {
  chores: [],
  receipts: [],
  removedChores: [],
  household: "Our home",
};
let lastReceipt: Receipt | undefined;
let recoveryMode = false;

function request<T>(item: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    item.onsuccess = () => resolve(item.result);
    item.onerror = () => reject(item.error);
  });
}
async function db() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const open = indexedDB.open(dbName, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("state");
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function load(): Promise<Store | undefined> {
  const database = await db();
  const tx = database.transaction("state", "readonly");
  const result = (await request(tx.objectStore("state").get("current"))) as
    | Store
    | undefined;
  database.close();
  return result;
}
async function save() {
  const database = await db();
  const tx = database.transaction("state", "readwrite");
  tx.objectStore("state").put(state, "current");
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  database.close();
}
function deleteDatabase(name: string) {
  return new Promise<void>((resolve, reject) => {
    const deletion = indexedDB.deleteDatabase(name);
    deletion.onsuccess = () => resolve();
    deletion.onerror = () => reject(deletion.error);
    deletion.onblocked = () =>
      reject(new Error(`Database ${name} is still open`));
  });
}
function sample(): Store {
  const anchor = new Date();
  anchor.setUTCHours(12, 0, 0, 0);
  const at = (daysAgo: number) =>
    new Date(anchor.getTime() - daysAgo * day).toISOString();
  const chores: Chore[] = [
    {
      id: "bath",
      title: "Clean the bathroom",
      repeatDays: 7,
      completedAt: at(8),
      createdAt: at(30),
      updatedAt: at(8),
    },
    {
      id: "bins",
      title: "Take out the bins",
      repeatDays: 7,
      completedAt: at(6),
      createdAt: at(30),
      updatedAt: at(6),
    },
    {
      id: "plants",
      title: "Water the plants",
      repeatDays: 5,
      completedAt: at(2),
      createdAt: at(30),
      updatedAt: at(2),
    },
    {
      id: "sheets",
      title: "Change the sheets",
      repeatDays: 14,
      completedAt: at(4),
      createdAt: at(30),
      updatedAt: at(4),
    },
  ];
  const receipts = chores.map((chore) => ({
    id: `r-${chore.id}`,
    choreId: chore.id,
    title: chore.title,
    completedAt: chore.completedAt!,
    dueAt: new Date(
      new Date(chore.completedAt!).getTime() + chore.repeatDays * day,
    ).toISOString(),
    updatedAt: chore.updatedAt,
  }));
  return {
    household: "Maple Street home",
    chores,
    receipts,
    removedChores: [],
  };
}
function validDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
function validChore(value: unknown): value is Chore {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Chore>;
  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    item.title.length <= 80 &&
    Number.isInteger(item.repeatDays) &&
    [1, 3, 5, 7, 14, 30].includes(item.repeatDays as number) &&
    validDate(item.createdAt) &&
    validDate(item.updatedAt) &&
    (item.completedAt === undefined || validDate(item.completedAt))
  );
}
function validReceipt(value: unknown): value is Receipt {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Receipt>;
  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.choreId === "string" &&
    item.choreId.length > 0 &&
    typeof item.title === "string" &&
    item.title.trim().length > 0 &&
    item.title.length <= 80 &&
    validDate(item.completedAt) &&
    validDate(item.dueAt) &&
    validDate(item.updatedAt)
  );
}
function validRemovedChore(value: unknown): value is RemovedChore {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RemovedChore>;
  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    validDate(item.removedAt)
  );
}
function validateStore(value: unknown): Store {
  if (!value || typeof value !== "object") throw new Error("not an object");
  const incoming = value as Partial<Store>;
  if (
    typeof incoming.household !== "string" ||
    incoming.household.trim().length === 0 ||
    incoming.household.length > 60 ||
    !Array.isArray(incoming.chores) ||
    !Array.isArray(incoming.receipts) ||
    !incoming.chores.every(validChore) ||
    !incoming.receipts.every(validReceipt) ||
    (incoming.removedChores !== undefined &&
      (!Array.isArray(incoming.removedChores) ||
        !incoming.removedChores.every(validRemovedChore)))
  )
    throw new Error("invalid record");
  if (
    new Set(incoming.chores.map((item) => item.id)).size !==
      incoming.chores.length ||
    new Set(incoming.receipts.map((item) => item.id)).size !==
      incoming.receipts.length ||
    new Set((incoming.removedChores || []).map((item) => item.id)).size !==
      (incoming.removedChores || []).length
  )
    throw new Error("duplicate record");
  return {
    household: incoming.household.trim(),
    chores: incoming.chores,
    receipts: incoming.receipts,
    removedChores: incoming.removedChores || [],
  };
}
function dueDate(chore: Chore) {
  return chore.completedAt
    ? new Date(new Date(chore.completedAt).getTime() + chore.repeatDays * day)
    : new Date();
}
function status(chore: Chore) {
  if (!chore.completedAt) return "Needs a first receipt";
  const milliseconds = dueDate(chore).getTime() - Date.now();
  if (milliseconds >= 0) {
    const days = Math.max(1, Math.ceil(milliseconds / day));
    return `Due in ${days} day${days === 1 ? "" : "s"}`;
  }
  const elapsedDays = Math.floor(Math.abs(milliseconds) / day);
  return elapsedDays === 0
    ? "Due today"
    : `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} overdue`;
}
function due(chore: Chore) {
  return dueDate(chore).getTime() <= Date.now();
}
function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
function date(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
function escape(value: string) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
function route() {
  return location.pathname === "/" &&
    new URL(location.href).searchParams.get("demo") === "1"
    ? "/demo"
    : location.pathname;
}
function encodePacket(store: Store) {
  return btoa(
    String.fromCharCode(...new TextEncoder().encode(JSON.stringify(store))),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function decodePacket(encoded: string) {
  const padded =
    encoded.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (encoded.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (character) =>
    character.charCodeAt(0),
  );
  return validateStore(JSON.parse(new TextDecoder().decode(bytes)));
}

async function init() {
  try {
    const stored = await load();
    state = stored ? validateStore(stored) : isDemo ? sample() : state;
    if (!stored && isDemo) await save();
    await importJoin();
    render();
  } catch (error) {
    recoveryMode = true;
    render();
  }
  navigator.serviceWorker
    ?.register("/sw.js")
    .then((registration) => {
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            showUpdate(worker);
        });
      });
    })
    .catch(() => undefined);
}
function showUpdate(worker: ServiceWorker) {
  if (document.querySelector(".update-toast")) return;
  const toast = document.createElement("aside");
  toast.className = "update-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `A new Chore Receipt is ready. <button>Refresh now</button>`;
  toast.querySelector("button")?.addEventListener("click", () => {
    worker.postMessage({ type: "SKIP_WAITING" });
    location.reload();
  });
  document.body.append(toast);
}
async function importJoin() {
  const joined = new URLSearchParams(location.hash.slice(1)).get("join");
  if (!joined) return;
  try {
    await merge(decodePacket(joined));
    history.replaceState({}, "", route());
    sessionStorage.removeItem("join-error");
    sessionStorage.setItem("joined", "1");
  } catch {
    sessionStorage.removeItem("joined");
    sessionStorage.setItem("join-error", "1");
    history.replaceState({}, "", route());
  }
}
function header() {
  return `<header><a class="wordmark" href="/" data-link data-copy-audit="header-wordmark"><span aria-hidden="true">▰</span> Chore Receipt</a><nav aria-label="Main navigation" data-copy-audit="header-navigation"><a href="/log" data-link data-copy-audit="header-receipt-log">Receipt log</a><a href="/settings" data-link data-copy-audit="header-household">Household</a><a href="/privacy" data-link data-copy-audit="header-privacy">Privacy</a></nav></header>`;
}
function footer() {
  return `<footer><p data-copy-audit="footer-description">A local record for recurring chores.</p><div><a href="/privacy" data-link data-copy-audit="footer-privacy">Privacy</a><a href="/terms" data-link data-copy-audit="footer-terms">Terms</a><a href="https://sociobot.in" rel="noopener" data-copy-audit="footer-factory">Built by Param Factory <span class="sr-only">(external)</span><span aria-hidden="true">↗</span></a><span data-copy-audit="footer-version">v1.3.0</span></div></footer>`;
}
function demoBanner() {
  return isDemo
    ? `<aside class="demo-banner" aria-label="Demo controls"><span><strong>Demo</strong> — sample data, nothing is saved.</span><button data-action="reset-demo">Reset demo</button><a class="button small" href="/" data-action="start-real">Start for real</a></aside>`
    : "";
}
function appShell(content: string) {
  return `${header()}${demoBanner()}<main id="main" tabindex="-1">${content}</main>${footer()}<div class="announcer" role="status" aria-live="polite" aria-atomic="true"></div>`;
}
function landing() {
  const hasData = state.chores.length > 0;
  return appShell(
    `<section class="hero"><div class="hero-copy"><p class="eyebrow" data-claim="no-scoring" data-copy-audit="hero-scope">A household record, not a scorecard</p><h1 tabindex="-1" data-copy-audit="hero-heading">Record chores when they get done</h1><p class="lede" data-copy-audit="hero-audience">For roommates and families who share the work and need to know what is due next.</p><div class="actions"><a class="button primary" href="/demo" data-claim="demo-isolation" data-copy-audit="hero-demo-action">Try it with sample data</a><span class="action-note" data-copy-audit="hero-demo-note">See a working shared chore board.</span></div><div class="facts"><span data-claim="offline-reload" data-copy-audit="hero-offline-fact">Works offline after setup</span><span data-claim="stored-device" data-copy-audit="hero-storage-fact">Stored on this device</span><span data-claim="free" data-copy-audit="hero-price-fact">Free to use</span></div>${hasData ? `<a class="text-link" href="/log" data-link data-copy-audit="hero-real-action">Open your chore board →</a>` : `<button class="text-link" data-action="open-add" data-copy-audit="hero-real-action">Add your first chore →</button>`}</div><figure class="hero-art"><img src="/kitchen-diorama.webp" width="1200" height="800" fetchpriority="high" decoding="async" data-copy-audit="hero-art-description" alt="A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt." /></figure></section>${samplePreview()}<section class="how"><div><p class="section-kicker" data-copy-audit="how-kicker">How it works</p><h2 data-copy-audit="how-heading">How chore receipts set the next due date</h2></div><ol><li><b data-copy-audit="how-step-one-title">Keep a shared list.</b><span data-copy-audit="how-step-one-detail">Add chores the household repeats.</span></li><li><b data-copy-audit="how-step-two-title">Tap “Mark done.”</b><span data-copy-audit="how-step-two-detail">The time becomes a receipt.</span></li><li><b data-copy-audit="how-step-three-title">Check what is due.</b><span data-claim="receipt-next-date" data-copy-audit="how-step-three-detail">Each chore repeats from completion.</span></li></ol></section><section class="privacy-note"><h2 data-copy-audit="privacy-heading">Keep your household record private</h2><p data-copy-audit="privacy-choice">Export or share a household copy only when you choose.</p><p data-claim="copies-no-sync" data-copy-audit="privacy-sync">Household copies do not stay in sync. Scan or import again to update another device.</p><a href="/privacy" data-link data-copy-audit="privacy-link">Read the privacy details</a></section>${addDialog()}`,
  );
}
function samplePreview() {
  return `<section class="sample-preview" aria-labelledby="sample-preview-heading"><div class="preview-intro"><p class="section-kicker" data-copy-audit="preview-kicker">Sample board preview</p><h2 id="sample-preview-heading" data-copy-audit="preview-heading">Sample chore board</h2><p data-copy-audit="preview-description">This is Maple Street home. It is a sample, not your data.</p><a class="text-link" href="/demo" data-claim="demo-isolation" data-copy-audit="preview-demo-action">Open the editable sample board →</a></div><div class="preview-board"><div class="preview-board-head"><div><p class="eyebrow" data-copy-audit="preview-household">Maple Street home</p><h3 data-copy-audit="preview-current-heading">Current chores</h3></div><span class="preview-count" data-copy-audit="preview-due-count">2 due now</span></div><ul class="preview-chores"><li><span class="preview-clip" aria-hidden="true"></span><div><b data-copy-audit="preview-bathroom-title">Clean the bathroom</b><p data-copy-audit="preview-bathroom-detail"><strong>1 day overdue</strong> · repeats every 7 days</p></div><span class="preview-done" data-copy-audit="preview-bathroom-done" aria-label="Sample chore marked done">✓</span></li><li><span class="preview-clip" aria-hidden="true"></span><div><b data-copy-audit="preview-plants-title">Water the plants</b><p data-copy-audit="preview-plants-detail">Due in 3 days · repeats every 5 days</p></div><span class="preview-done" data-copy-audit="preview-plants-done" aria-label="Sample chore marked done">✓</span></li></ul><div class="preview-receipt"><span class="stamp" aria-hidden="true">✓</span><div><b data-copy-audit="preview-receipt-title">Water the plants</b><span class="preview-receipt-copy" data-copy-audit="preview-receipt-detail">Done Aug 26 · next Aug 31</span></div></div></div></section>`;
}
function repeatOptions(selected = 7) {
  return [1, 3, 5, 7, 14, 30]
    .map(
      (days) =>
        `<option value="${days}"${days === selected ? " selected" : ""}>${days} day${days === 1 ? "" : "s"}</option>`,
    )
    .join("");
}
function addDialog() {
  return `<dialog id="add-dialog" aria-labelledby="add-heading"><form id="add-form"><button class="close" type="button" data-action="close-dialog" aria-label="Close add chore form">×</button><h2 id="add-heading">Add a shared chore</h2><p>Anyone in the household can mark it done.</p><label for="chore-title">Chore name</label><input id="chore-title" name="title" aria-describedby="add-message" autocomplete="off" required maxlength="80" placeholder="Clean the stovetop" /><label for="repeat-days">Repeat after</label><select id="repeat-days" name="days">${repeatOptions()}</select><button class="button primary" type="submit">Add shared chore</button><p id="add-message" class="form-message" aria-live="polite"></p></form></dialog>`;
}
function editDialog() {
  return `<dialog id="edit-dialog" aria-labelledby="edit-heading"><form id="edit-form"><button class="close" type="button" data-action="close-dialog" aria-label="Close edit chore form">×</button><h2 id="edit-heading">Edit chore</h2><p>Past receipts keep the name recorded when each chore was done.</p><input id="edit-id" name="id" type="hidden" /><label for="edit-title">Chore name</label><input id="edit-title" name="title" aria-describedby="edit-message" autocomplete="off" required maxlength="80" /><label for="edit-days">Repeat after</label><select id="edit-days" name="days">${repeatOptions()}</select><button class="button primary" type="submit">Save chore</button><p id="edit-message" class="form-message" aria-live="polite"></p></form></dialog>`;
}
function removeDialog() {
  return `<dialog id="remove-dialog" aria-labelledby="remove-heading"><form method="dialog"><h2 id="remove-heading">Remove this chore?</h2><p id="remove-description">The chore leaves the board. Its past receipts stay in the log.</p><input id="remove-id" type="hidden" /><div class="dialog-actions"><button class="button quiet" value="cancel">Keep chore</button><button class="button danger" type="button" data-action="confirm-remove">Remove chore</button></div></form></dialog>`;
}
function board() {
  const current = [...state.chores].sort(
    (a, b) =>
      Number(due(b)) - Number(due(a)) ||
      dueDate(a).getTime() - dueDate(b).getTime(),
  );
  const history = [...state.receipts].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
  return appShell(
    `<section class="board-head"><div><p class="eyebrow">${escape(state.household)}</p><h1 tabindex="-1">Shared chore board</h1><p>Mark a chore done. Its repeat interval sets the next due date.</p></div><div class="board-tools"><button class="button primary" data-action="open-add">Add a chore</button><button class="button quiet" data-action="export-json">Export JSON backup</button></div></section>${lastReceipt ? `<p class="notice" role="status">Receipt added for ${escape(lastReceipt.title)}. Next due ${date(lastReceipt.dueAt)}. <button data-action="undo-receipt">Undo receipt</button></p>` : ""}${sessionStorage.getItem("joined") ? `<p class="notice" role="status">Household copy updated. Chore changes and receipt history were imported.</p>` : ""}${sessionStorage.getItem("join-error") ? `<p class="notice error" role="status">That household code could not be read. Ask for a new one.</p>` : ""}<section aria-labelledby="queue-heading" class="queue"><div class="section-title"><h2 id="queue-heading">Current chores</h2><span>${current.filter(due).length} due now</span></div>${current.length ? `<ul class="chore-list">${current.map((chore) => `<li class="chore ${due(chore) ? "is-due" : ""}"><div class="chore-clip" aria-hidden="true"></div><div><h3>${escape(chore.title)}</h3><p>${status(chore)} · repeats every ${chore.repeatDays} day${chore.repeatDays === 1 ? "" : "s"}</p><div class="chore-actions"><button data-action="open-edit" data-id="${encodeURIComponent(chore.id)}">Edit chore</button><button data-action="open-remove" data-id="${encodeURIComponent(chore.id)}">Remove chore</button></div></div><button class="done" data-action="complete" data-id="${encodeURIComponent(chore.id)}" aria-label="Mark ${escape(chore.title)} done"><span aria-hidden="true">✓</span> Mark done</button></li>`).join("")}</ul>` : `<div class="empty"><h3>No chores yet</h3><p>Your shared chores will appear here. Add one to make its first receipt.</p><button class="button primary" data-action="open-add">Add a chore</button></div>`}</section><section class="history" aria-labelledby="history-heading"><div class="section-title"><h2 id="history-heading">Recent receipts</h2><a href="/log" data-link>View all receipts</a></div>${history.length ? `<ul>${history.slice(0, 4).map(receiptLine).join("")}</ul>` : `<p class="muted">A time-stamped receipt appears when someone marks a chore done.</p>`}</section>${addDialog()}${editDialog()}${removeDialog()}`,
  );
}
function receiptLine(item: Receipt) {
  return `<li><span class="stamp" aria-hidden="true">✓</span><div><b>${escape(item.title)}</b><p>Done ${dateTime(item.completedAt)} · next ${date(item.dueAt)}</p></div></li>`;
}
function log() {
  const receipts = [...state.receipts].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
  return appShell(
    `<section class="page-head"><p class="eyebrow">Neutral household record</p><h1 tabindex="-1">Every chore receipt</h1><p>Completion times are shown without names or points.</p><div class="board-tools"><button class="button quiet" data-action="export-csv">Export CSV</button><button class="button quiet" data-action="export-json">Export JSON backup</button></div></section><section class="history full"><h2>Receipt history</h2>${receipts.length ? `<ul>${receipts.map(receiptLine).join("")}</ul>` : `<div class="empty"><h3>No receipts yet</h3><p>Mark a shared chore done to place its receipt here.</p><a class="button primary" href="/" data-link>Go to the chore board</a></div>`}</section>`,
  );
}
function importPanel() {
  return `<section class="paper-form"><h2>Back up or import data</h2><p>Save a Chore Receipt JSON backup, or choose one to import.</p><button class="button quiet" data-action="export-json">Export JSON backup</button><label class="file-button" for="import-file">Choose JSON file</label><input id="import-file" type="file" accept="application/json" hidden /><p id="import-note" class="form-message" aria-live="polite"></p></section>`;
}
function settings() {
  return appShell(
    `<section class="page-head"><p class="eyebrow">Keep a household copy</p><h1 tabindex="-1">Household and data</h1><p>Share only when everyone agrees.</p></section><section class="settings-grid"><section class="paper-form"><h2>Name this household</h2><label for="household">Household name</label><input id="household" value="${escape(state.household)}" maxlength="60" aria-describedby="household-message"/><button class="button primary" data-action="save-household">Save household name</button><p id="household-message" class="form-message" aria-live="polite"></p></section><section class="paper-form"><h2>Share a household copy</h2><p>Create an opt-in QR code. Its data stays after the # sign.</p><p><strong>Copies do not stay in sync.</strong> Scan or import again to update another device.</p><button class="button quiet" data-action="make-qr">Create household QR</button><div id="qr-place" class="qr-place"></div></section>${importPanel()}</section>`,
  );
}
function privacy() {
  return appShell(
    `<article class="legal"><h1 tabindex="-1">Your household data stays here</h1><p>Chore Receipt stores chores, receipts, and your household name in this browser.</p><h2>What leaves this device</h2><p>Household data is not sent to the site. QR data stays after the # in the link, which browsers do not send to this site.</p><p>An export only leaves when you choose to download or share it.</p><h2>Household copies</h2><p>Copies do not stay in sync. Scan or import again to update another device.</p><h2>Demo data</h2><p>The demo keeps its sample separate from your household data. Resetting the demo restores the sample. Starting for real deletes the demo data.</p><h2>Children</h2><p>Do not add children’s names.</p></article>`,
  );
}
function terms() {
  return appShell(
    `<article class="legal"><h1 tabindex="-1">Terms for using Chore Receipt</h1><p>Use Chore Receipt to keep a household record. It is free to use.</p><h2>Your responsibility</h2><p>Check exports and shared copies before relying on them. This app does not replace safety or tenancy records.</p><h2>Your data</h2><p>You control the data saved in this browser and any copies you export or share.</p></article>`,
  );
}
function notFound() {
  return appShell(
    `<section class="error-state"><h1 tabindex="-1">This page is missing.</h1><p>The page you asked for is not in this household record.</p><a class="button primary" href="/" data-link>Return to the chore board</a></section>`,
  );
}
function recovery() {
  return appShell(
    `<section class="recovery page-head"><div><p class="eyebrow">Your saved record is unchanged</p><h1 tabindex="-1">Your chore record could not open</h1><p>An invalid saved record stopped the board. Import a valid backup or clear only this browser’s Chore Receipt data.</p></div></section><section class="settings-grid recovery-grid">${importPanel()}<section class="paper-form danger-zone"><h2>Start with an empty board</h2><p>This removes the invalid local record. This action cannot be undone without a backup.</p><button class="button danger" data-action="clear-corrupt">Clear local chore data</button><p id="clear-note" class="form-message" aria-live="polite"></p></section></section>`,
  );
}
const metadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Chore Receipt — record shared chores",
    description:
      "Record recurring household chores, keep completion receipts, and see what is due next.",
  },
  "/demo": {
    title: "Demo — Chore Receipt",
    description:
      "Try a separate Chore Receipt board with four realistic household chores.",
  },
  "/log": {
    title: "Receipt log — Chore Receipt",
    description: "Review and export time-stamped household chore receipts.",
  },
  "/settings": {
    title: "Household — Chore Receipt",
    description:
      "Name, back up, import, or copy your local household chore record.",
  },
  "/privacy": {
    title: "Privacy — Chore Receipt",
    description:
      "Learn what Chore Receipt saves on this device and what leaves it.",
  },
  "/terms": {
    title: "Terms — Chore Receipt",
    description: "Read the terms for keeping a local household chore record.",
  },
  "/404": {
    title: "Page not found — Chore Receipt",
    description: "This Chore Receipt page could not be found.",
  },
};
function setMeta(path: string) {
  const details = metadata[path] || metadata["/404"];
  const canonicalPath = metadata[path] ? path : "/404";
  const canonical = `https://chore-receipt.sociobot.in${canonicalPath === "/" ? "/" : canonicalPath}`;
  document.title = details.title;
  const set = (selector: string, value: string) =>
    document
      .querySelector<HTMLMetaElement>(selector)
      ?.setAttribute("content", value);
  set('meta[name="description"]', details.description);
  set('meta[property="og:title"]', details.title);
  set('meta[property="og:description"]', details.description);
  set('meta[property="og:url"]', canonical);
  set('meta[name="twitter:title"]', details.title);
  set('meta[name="twitter:description"]', details.description);
  document
    .querySelector<HTMLLinkElement>('link[rel="canonical"]')
    ?.setAttribute("href", canonical);
}
function render(focusRoute = false) {
  const path = route();
  setMeta(path);
  root.innerHTML = recoveryMode
    ? recovery()
    : path === "/"
      ? state.chores.length
        ? board()
        : landing()
      : path === "/demo"
        ? board()
        : path === "/log"
          ? log()
          : path === "/settings"
            ? settings()
            : path === "/privacy"
              ? privacy()
              : path === "/terms"
                ? terms()
                : notFound();
  bind();
  if (focusRoute) {
    const heading = document.querySelector<HTMLElement>("h1");
    heading?.focus();
    const announcement = document.querySelector<HTMLElement>(".announcer");
    if (announcement && heading)
      announcement.textContent = `${heading.textContent?.trim()} page`;
  }
}
function navigate(href: string) {
  const target = new URL(href, location.origin);
  if (isDemo && target.pathname !== "/demo")
    target.searchParams.set("demo", "1");
  if (isDemo !== isDemoUrl(target.href)) {
    location.assign(target.href);
    return;
  }
  history.pushState({}, "", target.pathname + target.search);
  render(true);
  window.scrollTo(0, 0);
}
function download(name: string, text: string, type: string) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(new Blob([text], { type }));
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}
async function merge(other: Store) {
  const validated = validateStore(other);
  const chores = new Map(state.chores.map((item) => [item.id, item]));
  validated.chores.forEach((item) => {
    if (!chores.get(item.id) || chores.get(item.id)!.updatedAt < item.updatedAt)
      chores.set(item.id, item);
  });
  const removedChores = new Map(
    state.removedChores.map((item) => [item.id, item]),
  );
  validated.removedChores.forEach((item) => {
    if (
      !removedChores.get(item.id) ||
      removedChores.get(item.id)!.removedAt < item.removedAt
    )
      removedChores.set(item.id, item);
  });
  removedChores.forEach((removed, choreId) => {
    const chore = chores.get(choreId);
    if (!chore || chore.updatedAt <= removed.removedAt) chores.delete(choreId);
    else removedChores.delete(choreId);
  });
  const receipts = new Map(state.receipts.map((item) => [item.id, item]));
  validated.receipts.forEach((item) => {
    if (
      !receipts.get(item.id) ||
      receipts.get(item.id)!.updatedAt < item.updatedAt
    )
      receipts.set(item.id, item);
  });
  state = {
    household: validated.household || state.household,
    chores: [...chores.values()],
    receipts: [...receipts.values()],
    removedChores: [...removedChores.values()],
  };
  await save();
}
function bind() {
  document
    .querySelectorAll<HTMLAnchorElement>("[data-link]")
    .forEach((anchor) =>
      anchor.addEventListener("click", (event) => {
        if (anchor.origin === location.origin) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search);
        }
      }),
    );
  document.querySelectorAll<HTMLElement>("[data-action]").forEach((element) =>
    element.addEventListener("click", async (event) => {
      const action = element.dataset.action;
      if (action === "open-add") {
        const dialog = document.querySelector<HTMLDialogElement>("#add-dialog");
        dialog?.showModal();
        dialog?.querySelector<HTMLInputElement>("input")?.focus();
      }
      if (action === "close-dialog") element.closest("dialog")?.close();
      if (action === "reset-demo") {
        lastReceipt = undefined;
        sessionStorage.removeItem("joined");
        sessionStorage.removeItem("join-error");
        await deleteDatabase(dbName);
        state = sample();
        await save();
        render();
        document
          .querySelector<HTMLButtonElement>('[data-action="reset-demo"]')
          ?.focus();
        document.querySelector<HTMLElement>(".announcer")!.textContent =
          "Demo reset to four sample chores and four receipts.";
      }
      if (action === "start-real") {
        event.preventDefault();
        await deleteDatabase(demoDbName);
        location.assign("/");
      }
      if (action === "complete") {
        const chore = state.chores.find(
          (item) => item.id === decodeURIComponent(element.dataset.id || ""),
        );
        if (!chore) return;
        const completedAt = now();
        chore.completedAt = completedAt;
        chore.updatedAt = completedAt;
        const receipt = {
          id: id(),
          choreId: chore.id,
          title: chore.title,
          completedAt,
          dueAt: new Date(
            new Date(completedAt).getTime() + chore.repeatDays * day,
          ).toISOString(),
          updatedAt: completedAt,
        };
        state.receipts.push(receipt);
        lastReceipt = receipt;
        await save();
        render();
        const note = document.querySelector(".announcer");
        if (note)
          note.textContent = `${chore.title} marked done. Receipt added.`;
      }
      if (action === "open-edit") {
        const chore = state.chores.find(
          (item) => item.id === decodeURIComponent(element.dataset.id || ""),
        );
        const dialog =
          document.querySelector<HTMLDialogElement>("#edit-dialog");
        if (!chore || !dialog) return;
        dialog.querySelector<HTMLInputElement>("#edit-id")!.value = chore.id;
        dialog.querySelector<HTMLInputElement>("#edit-title")!.value =
          chore.title;
        dialog.querySelector<HTMLSelectElement>("#edit-days")!.value = String(
          chore.repeatDays,
        );
        dialog.showModal();
        dialog.querySelector<HTMLInputElement>("#edit-title")?.focus();
      }
      if (action === "open-remove") {
        const chore = state.chores.find(
          (item) => item.id === decodeURIComponent(element.dataset.id || ""),
        );
        const dialog =
          document.querySelector<HTMLDialogElement>("#remove-dialog");
        if (!chore || !dialog) return;
        dialog.querySelector<HTMLInputElement>("#remove-id")!.value = chore.id;
        dialog.querySelector<HTMLElement>("#remove-description")!.textContent =
          `${chore.title} leaves the board. Its past receipts stay in the log.`;
        dialog.showModal();
        dialog
          .querySelector<HTMLButtonElement>('[data-action="confirm-remove"]')
          ?.focus();
      }
      if (action === "confirm-remove") {
        const dialog = element.closest<HTMLDialogElement>("dialog");
        const choreId =
          dialog?.querySelector<HTMLInputElement>("#remove-id")?.value;
        if (!choreId) return;
        const removedAt = now();
        state.chores = state.chores.filter((item) => item.id !== choreId);
        state.removedChores = state.removedChores.filter(
          (item) => item.id !== choreId,
        );
        state.removedChores.push({ id: choreId, removedAt });
        await save();
        dialog?.close();
        render();
        document.querySelector<HTMLElement>(".announcer")!.textContent =
          "Chore removed. Past receipts remain in the log.";
      }
      if (action === "undo-receipt" && lastReceipt) {
        const removed = lastReceipt;
        state.receipts = state.receipts.filter(
          (receipt) => receipt.id !== removed.id,
        );
        const chore = state.chores.find((item) => item.id === removed.choreId);
        const prior = state.receipts
          .filter((receipt) => receipt.choreId === removed.choreId)
          .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
        if (chore) {
          chore.completedAt = prior?.completedAt;
          chore.updatedAt = now();
        }
        lastReceipt = undefined;
        await save();
        render();
      }
      if (action === "export-json")
        download(
          "chore-receipt-backup.json",
          JSON.stringify(state, null, 2),
          "application/json",
        );
      if (action === "export-csv") {
        const lines = ["chore,completed_at,due_at"];
        [...state.receipts]
          .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
          .forEach((receipt) =>
            lines.push(
              `"${receipt.title.replaceAll('"', '""')}",${receipt.completedAt},${receipt.dueAt}`,
            ),
          );
        download("chore-receipts.csv", lines.join("\n"), "text/csv");
      }
      if (action === "save-household") {
        const input = document.querySelector<HTMLInputElement>("#household");
        const message =
          document.querySelector<HTMLElement>("#household-message");
        if (!input?.value.trim()) {
          if (message)
            message.textContent = "Enter a household name before saving.";
          input?.focus();
          return;
        }
        state.household = input.value.trim();
        await save();
        // Keep the field in place long enough to confirm the durable save.
        // This also prevents a quick reload from racing the IndexedDB write.
        if (message) message.textContent = "Household name saved on this device.";
      }
      if (action === "clear-corrupt") {
        const confirmed = window.confirm(
          "Clear the invalid local chore record? This cannot be undone without a backup.",
        );
        if (!confirmed) return;
        await deleteDatabase(dbName);
        state = {
          chores: [],
          receipts: [],
          removedChores: [],
          household: "Our home",
        };
        recoveryMode = false;
        location.assign("/");
      }
      if (action === "make-qr") {
        const place = document.querySelector<HTMLElement>("#qr-place");
        if (!place) return;
        const url = `${location.origin}/#join=${encodePacket(state)}`;
        try {
          const image = await QRCode.toDataURL(url, {
            width: 256,
            margin: 1,
            errorCorrectionLevel: "L",
            color: { dark: "#24302B", light: "#FFFDF8" },
          });
          place.innerHTML = `<img src="${image}" width="256" height="256" alt="QR code that imports a copy of this household record." /><a href="${url}">Open share link</a>`;
        } catch {
          place.textContent =
            "This household copy is too large for a QR code. Export a JSON backup instead.";
        }
      }
    }),
  );
  document
    .querySelector<HTMLFormElement>("#add-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget as HTMLFormElement);
      const title = String(form.get("title") || "").trim();
      const message = document.querySelector<HTMLElement>("#add-message");
      if (!title) {
        if (message)
          message.textContent = "Enter a chore name before adding it.";
        document.querySelector<HTMLInputElement>("#chore-title")?.focus();
        return;
      }
      const time = now();
      state.chores.push({
        id: id(),
        title,
        repeatDays: Number(form.get("days")),
        createdAt: time,
        updatedAt: time,
      });
      await save();
      document.querySelector<HTMLDialogElement>("#add-dialog")?.close();
      render();
    });
  document
    .querySelector<HTMLFormElement>("#edit-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget as HTMLFormElement);
      const choreId = String(form.get("id") || "");
      const title = String(form.get("title") || "").trim();
      const message = document.querySelector<HTMLElement>("#edit-message");
      if (!title) {
        if (message) message.textContent = "Enter a chore name before saving.";
        document.querySelector<HTMLInputElement>("#edit-title")?.focus();
        return;
      }
      const chore = state.chores.find((item) => item.id === choreId);
      if (!chore) return;
      chore.title = title;
      chore.repeatDays = Number(form.get("days"));
      chore.updatedAt = now();
      await save();
      document.querySelector<HTMLDialogElement>("#edit-dialog")?.close();
      render();
    });
  document
    .querySelector<HTMLInputElement>("#import-file")
    ?.addEventListener("change", async (event) => {
      const file = ((event.currentTarget as HTMLInputElement).files || [])[0];
      const note = document.querySelector<HTMLElement>("#import-note");
      if (!file || !note) return;
      try {
        const incoming = validateStore(JSON.parse(await file.text()));
        if (recoveryMode) {
          state = incoming;
          await save();
          recoveryMode = false;
          render();
          document.querySelector<HTMLElement>(".announcer")!.textContent =
            "Backup restored. Your chore board can open again.";
        } else {
          await merge(incoming);
          note.textContent =
            "Backup imported. Chore changes and receipt history were kept.";
        }
      } catch {
        note.textContent =
          "That file is not a valid Chore Receipt backup. Nothing was imported.";
      }
    });
}
window.addEventListener("popstate", () => render(true));
window.addEventListener("hashchange", async () => {
  if (!new URLSearchParams(location.hash.slice(1)).has("join")) return;
  await importJoin();
  render();
  const announcement = document.querySelector<HTMLElement>(".announcer");
  if (announcement)
    announcement.textContent = sessionStorage.getItem("joined")
      ? "Household copy updated. Chore changes and receipt history were imported."
      : "That household code could not be read. Ask for a new one.";
});
init();
