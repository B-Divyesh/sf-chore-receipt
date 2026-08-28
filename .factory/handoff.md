# Chore Receipt — review 2 handoff

## What was done

Performed the requested non-modifying adversarial review of
<https://chore-receipt.sociobot.in> and committed the report in
`.factory/review-2.md`. Product source was not changed.

## How verified

- Fresh Chromium contexts at 390×844 and 1440×900 confirmed the cold first
  read and one-click live demo.
- A clean clone at `/tmp/chore-receipt-review2-clean` completed `npm ci`, every
  exact `.factory/claims.json` command (11/11), `npm test -- --workers=1`
  (25/25), and `npm run build`.
- Live Playwright checks covered demo reset/isolation, QR request privacy,
  offline navigation after a true 404, metadata/routes, focus/Back behaviour,
  mobile target sizes, and a crawl of all discovered internal links.
- Read the prior review, polish record, and handoff; each F-1-1 through F-1-18
  was confirmed fixed in the current site/source/tests.

## Remaining work

The review verdict is **FAIL** with two findings:

1. Add an actual sample product preview to the landing page.
2. Rename and colocate the JSON backup export action with import.

See `.factory/review-2.md` for exact locations, impact, and fixes.
