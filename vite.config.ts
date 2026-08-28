import { createHash } from 'node:crypto';
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function versionedServiceWorker(): Plugin {
  return {
    name: 'versioned-service-worker',
    apply: 'build',
    closeBundle() {
      const output = join(process.cwd(), 'dist');
      const assets = readdirSync(join(output, 'assets')).map((name) => `/assets/${name}`).sort();
      const shell = ['/', '/demo', '/offline.html', '/fallback.css', '/manifest.webmanifest', '/favicon.svg', '/kitchen-diorama.webp', '/icons/icon-192.png', '/icons/icon-512.png', ...assets];
      const cache = `chore-receipt-${createHash('sha256').update(shell.join('|')).digest('hex').slice(0, 12)}`;
      const worker = `const CACHE=${JSON.stringify(cache)};\nconst SHELL=${JSON.stringify(shell)};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',event=>event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(name=>name!==CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim())));\nself.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});\nself.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('/',copy));return response}).catch(()=>caches.match('/')||caches.match('/offline.html')));return}event.respondWith(caches.match(url.pathname).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(url.pathname,copy));return response}))) });\n`;
      writeFileSync(join(output, 'sw.js'), worker);
    }
  };
}

export default defineConfig({
  plugins: [versionedServiceWorker()],
  build: {
    target: 'es2022', sourcemap: false,
    rollupOptions: { output: {
      entryFileNames: 'assets/[name]-[hash].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    } }
  },
  server: { host: '0.0.0.0' }
});
