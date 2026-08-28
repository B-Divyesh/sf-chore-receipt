import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";

function previewSecurityHeaders(): Plugin {
  const config = JSON.parse(
    readFileSync("public/staticwebapp.config.json", "utf8"),
  ) as { globalHeaders: Record<string, string> };
  const contentSecurityPolicy = config.globalHeaders["Content-Security-Policy"];

  return {
    name: "preview-security-headers",
    configurePreviewServer(server) {
      server.middlewares.use((_request, response, next) => {
        response.setHeader("Content-Security-Policy", contentSecurityPolicy);
        next();
      });
    },
  };
}

function versionedServiceWorker(): Plugin {
  return {
    name: "versioned-service-worker",
    apply: "build",
    closeBundle() {
      const output = join(process.cwd(), "dist");
      const routeMetadata = {
        demo: [
          "Demo — Chore Receipt",
          "Try a separate Chore Receipt board with four realistic household chores.",
        ],
        log: [
          "Receipt log — Chore Receipt",
          "Review and export time-stamped household chore receipts.",
        ],
        settings: [
          "Household — Chore Receipt",
          "Name, back up, import, or copy your local household chore record.",
        ],
        privacy: [
          "Privacy — Chore Receipt",
          "Learn what Chore Receipt saves on this device and what leaves it.",
        ],
        terms: [
          "Terms — Chore Receipt",
          "Read the terms for keeping a local household chore record.",
        ],
      } as const;
      const rootHtml = readFileSync(join(output, "index.html"), "utf8");
      for (const [route, [title, description]] of Object.entries(
        routeMetadata,
      )) {
        const canonical = `https://chore-receipt.sociobot.in/${route}`;
        const html = rootHtml
          .replace(/<title>[^<]+<\/title>/, `<title>${title}</title>`)
          .replace(
            /<meta\s+name="description"\s+content="[^"]+"\s*\/>/,
            `<meta name="description" content="${description}" />`,
          )
          .replace(
            /<link rel="canonical" href="[^"]+" \/>/,
            `<link rel="canonical" href="${canonical}" />`,
          )
          .replace(
            /<meta\s+property="og:title"\s+content="[^"]+"\s*\/>/,
            `<meta property="og:title" content="${title}" />`,
          )
          .replace(
            /<meta\s+property="og:description"\s+content="[^"]+"\s*\/>/,
            `<meta property="og:description" content="${description}" />`,
          )
          .replace(
            /<meta\s+property="og:url"\s+content="[^"]+"\s*\/>/,
            `<meta property="og:url" content="${canonical}" />`,
          )
          .replace(
            /<meta\s+name="twitter:title"\s+content="[^"]+"\s*\/>/,
            `<meta name="twitter:title" content="${title}" />`,
          )
          .replace(
            /<meta\s+name="twitter:description"\s+content="[^"]+"\s*\/>/,
            `<meta name="twitter:description" content="${description}" />`,
          );
        mkdirSync(join(output, route), { recursive: true });
        writeFileSync(join(output, route, "index.html"), html);
      }
      const assets = readdirSync(join(output, "assets"))
        .map((name) => `/assets/${name}`)
        .sort();
      const shell = [
        "/",
        "/demo",
        "/offline.html",
        "/fallback.css",
        "/manifest.webmanifest",
        "/favicon.svg",
        "/kitchen-diorama.webp",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        ...assets,
      ];
      const cache = `chore-receipt-${createHash("sha256").update(shell.join("|")).digest("hex").slice(0, 12)}`;
      const worker = `const CACHE=${JSON.stringify(cache)};\nconst SHELL=${JSON.stringify(shell)};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',event=>event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(name=>name!==CACHE).map(name=>caches.delete(name)))).then(()=>self.clients.claim())));\nself.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});\nself.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const type=response.headers.get('content-type')||'';if(response.ok&&type.includes('text/html')){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('/',copy)))}return response}).catch(async()=>await caches.match('/')||await caches.match('/offline.html')));return}event.respondWith(caches.match(url.pathname).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(url.pathname,copy)))}return response}))) });\n`;
      writeFileSync(join(output, "sw.js"), worker);
    },
  };
}

export default defineConfig({
  plugins: [previewSecurityHeaders(), versionedServiceWorker()],
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  server: { host: "0.0.0.0" },
});
