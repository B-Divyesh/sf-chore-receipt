# Chore Receipt — polish 5 handoff

## Outcome

Round 5 closes every cumulative finding. `frame-ancestors 'self'` is now a
response-level CSP directive on normal and true-404 responses, with a browser
regression that fetches both. The catalog description is now the verb-first,
47-character sentence: “Record shared chores and see what is due next.”

Repair commits are `9619421` (`fix: protect pages from framing`) and
`a21aded` (`test: wait for demo seed before assertion`), both pushed to
`main`. Final static deployment: `f856a2fc-5ccf-4064-9cad-d020af0cfc30` at
<https://chore-receipt.sociobot.in>.

## Verification

- Fresh remote clone `/tmp/chore-receipt-polish5-clean.MoZZvO/repo` at
  `a21aded769df7206406f1166ed40ee44b6e60b35`: `npm ci` passed with zero
  vulnerabilities; every exact claim command in `.factory/claims.json` passed
  individually (13/13); `npm test -- --workers=1` passed 33/33; and
  `npm run build` produced `dist/index.html`.
- The build is within the static budget: app JS 55.67 kB raw / 18,835 B gzip;
  CSS 14.44 kB raw / 4,130 B gzip.
- The full deployed suite passed with
  `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in npm test -- --workers=1`
  (33/33): declared claims, offline-after-404, request privacy, demo reset,
  mobile/200% layout, route focus/announcements, metadata, copy audit, and
  seven-route Axe coverage.
- Cold live checks: landing is 200; `/missing-csp-check` is 404; both return
  the CSP including `frame-ancestors 'self'`. Landing and direct `?demo=1`
  have `lang=en`, one h1, one main, correct titles, and no application console
  errors. Screenshots: `evidence/polish-5-live/landing-390.png`,
  `demo-query-390.png`, `landing-1440.png`, and `missing-390.png`.

## Run locally

```sh
npm ci
npm test -- --workers=1
npm run build
```

## Known gaps

None.
