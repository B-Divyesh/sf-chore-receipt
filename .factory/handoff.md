# Chore Receipt — polish 3 handoff

## Released repair

- Repair code: `f49bfed11fc355a4ef1f3e049cba12c8700f3edb`
- Base reviewed: `40424eacfd3da8b330ecdd9a7b10cc5301e67fc2`
- Review report: `8f7a084002d131e7e15f1b685ad01f1cbae91446`
- Deployment: `6a8ee596-c0be-4576-8ef7-6ace607817f1`
- Live URL: <https://chore-receipt.sociobot.in>

The release now has a complete, mechanically checked landing-copy audit and
removes every review-3 copy defect. The hero no longer has a slogan caption;
the sample preview is **Sample chore board**; all chore queues are **Current
chores**; and the explanatory section is **How chore receipts set the next
due date**. The no-sync claim regression now also proves that a new copy makes
a source-only chore available only after a recipient imports it again.

`.factory/polish-3.md` maps every finding from all review rounds, prior polish
records, controller feedback, and verification reports to its repair and live
evidence.

## Verification

Clean clone: `/tmp/chore-receipt-polish3-clean.8qGOu0/repo` at repair commit
`f49bfed`.

1. `npm ci` passed: 52 packages installed; 0 vulnerabilities reported.
2. Every declared claim command was run separately and passed (11/11):
   `demo-isolation`, `demo-discard`, `stored-device`, `offline-reload`,
   `csv-export`, `json-backup`, `local-only`, `qr-share`, `copies-no-sync`,
   `receipt-next-date`, and `free`.
3. `npm test -- --workers=1` passed **27/27**. This includes all claim tests,
   demo isolation/discard/reset, corrupt-data recovery, edit/remove, metadata,
   focus/announcement history navigation, phone layout/200% text, true-404
   offline recovery, privacy request bodies, cache policy, exact copy audit,
   and Axe serious/critical checks for every product route and the 404.
4. `npm run build` passed and produced `dist/`. Initial bundle sizes: JS
   52.25 kB raw / 18.43 kB gzip; CSS 14.41 kB raw / 4.10 kB gzip; hero WebP
   93.11 kB.
5. Local `verify-url.sh` passed with no console errors; evidence is in
   `.factory/evidence/polish-3-local/verify.json` and its screenshots. Local
   mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100,
   SEO 100; FCP 1,054 ms, LCP 1,956 ms, TBT 0 ms, CLS 0.014.
6. After deployment, `verify-url.sh https://chore-receipt.sociobot.in/`
   passed cold with no console errors. `live-audit.json` records successful
   200 route metadata/landmark checks, direct `?demo=1` banner/sample/reset,
   QR request privacy, true 404 then offline receipt log, and an accessible
   true 404. It found zero serious or critical Axe issues on `/`, `/demo`,
   `/log`, `/settings`, `/privacy`, `/terms`, and `/not-a-page`.
7. Live cache checks confirmed `assets/index-DGB9tstE.js` has
   `Cache-Control: public, max-age=31536000, immutable`; `sw.js` has
   `public, max-age=0, must-revalidate`.
8. Live mobile Lighthouse: **Performance 100, Accessibility 100, Best
   Practices 100, SEO 100**; FCP 908 ms, LCP 1,508 ms, TBT 17 ms, CLS 0.014.
   Evidence is `.factory/evidence/polish-3-live/lighthouse-mobile.json`.

## Run and verify locally

```sh
npm ci
npm test -- --workers=1
npm run build
npm run preview
```

Open `/demo` or `/?demo=1` for the isolated sample. The demo banner offers
**Reset demo** and **Start for real**; starting for real removes the demo
database before returning to the real board.

## Known gaps

None.
