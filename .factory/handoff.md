# Chore Receipt — polish 3 retry 1 handoff

## Released repair

- Reviewed base: `40424eacfd3da8b330ecdd9a7b10cc5301e67fc2`
- Review: `8f7a084002d131e7e15f1b685ad01f1cbae91446`
- Product repair: `b15327b603605a677c0310cc0f1965464bcc0246` and
  `4a7822ef0fb57b4279bf5894a8f764361aebcc7b`
- Verification evidence and live-test harness:
  `e6ac4fb0522ca8bf082fcec74f3abc079ac4ead3`
- Final static deployment: `3318e198-e913-4bee-88c1-0737808ef736`
- Live URL: <https://chore-receipt.sociobot.in>

The landing audit is now a real rendered-product inventory. It records 50 copy
units, including repeated text, the hero image description, and accessible
labels. The regression waits for the IndexedDB-rendered landing shell, rejects
untracked text, compares every committed row, checks word counts, and rejects
sentences over 22 words. The catalog description is a verb-first, 51-character
sentence.

All prior product repairs remain in place: direct `?demo=1` uses its separate
database and banner, the 404 cannot poison offline navigation, real data
persists, imports recover data, QR copies stay local and do not synchronize,
metadata and 404 pages are real routes, mobile exposes Household, and keyboard
route focus is announced. `.factory/polish-3.md` maps every finding to its
repair and current evidence.

## Verification

Clean clone `/tmp/chore-receipt-polish3-retry1-release.NpQTvm/repo` at
`e6ac4fb`:

1. `npm ci` passed with 0 vulnerabilities.
2. `npm test -- --grep @claim: --workers=1` passed **11/11** declared claims.
3. `npm test -- --workers=1` passed **27/27**. It covers all claims, recovery,
   edit/remove, route focus/history, mobile and 200% text, metadata, the
   designed 404, cache rules, exact rendered copy audit, offline reload,
   privacy request bodies, and Axe serious/critical checks.
4. `npm run build` passed and produced `dist/`. The initial JS is 53.96 kB raw
   / 18.74 kB gzip; CSS is 14.41 kB raw / 4.10 kB gzip; hero art is 93.11 kB.
5. Local `verify-url.sh` passed with no console errors. Evidence:
   `.factory/evidence/polish-3-retry1-local/verify.json`.
6. After final deployment, `verify-url.sh https://chore-receipt.sociobot.in/`
   passed cold with no console errors. The full live 27-test suite also passed
   with `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in`.
7. Live audit evidence in
   `.factory/evidence/polish-3-retry1-live/live-audit.json` confirms direct
   demo/reset, QR request privacy, 404 then offline navigation, route metadata,
   44px mobile Household navigation, and zero serious/critical Axe findings.
8. Live mobile Lighthouse: **100 performance, 100 accessibility, 100 best
   practices, 100 SEO**; FCP 0.9s, LCP 1.5s, TBT 0ms, CLS 0.014. Raw report:
   `.factory/evidence/polish-3-retry1-live/lighthouse-mobile.json`.
9. Live caching is correct: hashed JS is `max-age=31536000, immutable`; `sw.js`
   is `max-age=0, must-revalidate`.

## Run and verify locally

```sh
npm ci
npm test -- --workers=1
npm run build
npm run preview
```

Open `/demo` or `/?demo=1` for the isolated sample. **Reset demo** restores
the shipped sample. **Start for real** deletes the demo database and opens the
real board.

## Known gaps

None.
