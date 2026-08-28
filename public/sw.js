const CACHE = 'chore-receipt-v1';
const SHELL = ['/', '/demo', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/kitchen-diorama.webp', '/icons/icon-192.png', '/icons/icon-512.png', '/assets/app.js', '/assets/app.css'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)))).then(() => self.clients.claim())));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put('/', copy)); return response; }).catch(() => caches.match('/') || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; })));
});
