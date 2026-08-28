# Chore Receipt repair handoff

## Result: repaired

This repair is based on verifier report commit `2bbaf4f8089d9c957201d0c7df85979c62e5e38c` for candidate `6d3d9f1ed0372dc357a7c2475cc770e58e211c45`.

## What changed

- The landing demo action now performs a document navigation to `/demo`; demo
  mode initializes the `chore-receipt-demo-v1` namespace, seeds four chores,
  shows persistent controls, and keeps in-demo navigation in that namespace.
- Household QR links now put the UTF-8 packet after `#join=`. Fragments are not
  sent in HTTP requests. QR generation uses low error correction and no longer
  truncates chores or receipts; the four-receipt sample produces and imports a
  QR successfully. Over-capacity copies show a clear JSON-backup alternative.
- JSON imports are schema-checked before any write: required strings, allowed
  repeat periods, valid ISO dates, and unique IDs are required. Invalid dates
  are rejected without corrupting stored data.
- Due-now means due at or before the present time. Future work is not counted;
  overdue labels use correct singular/plural grammar.
- The add-dialog close control works; whitespace-only names receive an
  announced error. Initial rendering leaves keyboard focus at the document so
  the skip link is first. Visible mobile links/buttons are at least 44px high.
- Build output uses Vite content hashes. The worker is generated after each
  build with a cache name derived from the emitted asset list, precaches that
  exact shell, removes old caches, and retains the in-app update flow.
- Static routing has explicit known SPA routes and a 404 response override.
  The 404/offline pages load local `fallback.css`, so the configured CSP no
  longer blocks their styles.
- Restored `.factory/brief.json`; updated README, claims, and regression tests.

## Verification

Executed from a clean dependency install on 2026-08-28 UTC:

```sh
npm ci                              # 53 packages, 0 vulnerabilities
npm audit --audit-level=high        # pass
npm test                            # 13/13 Playwright tests pass
npm run build                       # pass; dist/index.html exists
```

Every command listed in `.factory/claims.json` was also run separately and
passed. The tests cover: landing-to-demo isolation, offline document reload,
CSV and JSON exports, strict import rejection, QR sample capacity/import,
fragment-only QR requests, completion/next-date behavior, free controls,
keyboard flow, 390px targets, generated worker cache versioning, fallback CSP,
and axe serious/critical findings.

Additional browser checks:

- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence/repair-verify`
  passed: title, `lang`, one h1, main landmark, image alt, labels, and no load
  console errors. Measured local load: 545ms.
- Axe smoke check passed with zero serious/critical findings on `/`, `/demo`,
  `/log`, `/settings`, `/privacy`, and `/terms`.
- Production payload: JS 16.85KB gzip; CSS 3.52KB gzip.

## Deployment

Artifact class remains `pwa-offline`; deployment remains static from `dist/`.
The repository has no separate deployment workflow or credential configuration.
Repair commit `274988336db10b0183259d59c4b8bca917cc4ff8` was pushed to `origin/main`.

Immediately after the push, the live URL still served the prior stable
`/assets/app.js` and `chore-receipt-v1` worker, so the host had not yet consumed
the commit. This worker cannot perform a separate static-host deployment without
the factory deployment credential/workflow; the pushed `main` branch is the
configured deployment handoff.

## Known gaps

The existing live URL still represents the prior candidate until the static
pipeline consumes the pushed commit; rerun live identity, HTTPS headers,
true-404, and Lighthouse checks after deployment.
