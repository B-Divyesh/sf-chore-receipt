# Polish 3 retry 1 — release closure

Reviewed base: `40424eacfd3da8b330ecdd9a7b10cc5301e67fc2`. Review:
`8f7a084002d131e7e15f1b685ad01f1cbae91446`. This retry corrects the
previously incomplete closure of F-1-18. Product repair commits are
`b15327b603605a677c0310cc0f1965464bcc0246` and
`4a7822ef0fb57b4279bf5894a8f764361aebcc7b`. Evidence and live-test harness:
`e6ac4fb0522ca8bf082fcec74f3abc079ac4ead3`. Final deployment:
`3318e198-e913-4bee-88c1-0737808ef736` to
<https://chore-receipt.sociobot.in>.

Every earlier review, polish, and verification record was re-read. The table
maps every finding to the repair and current evidence. `live-audit.json` is a
cold production-browser check of routes, metadata, direct demo, reset, mobile
navigation, QR privacy, 404-before-offline behavior, and Axe.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The worker replaces its shell only with successful HTML. | `@claim:offline-reload`; live `offline` result in `evidence/polish-3-retry1-live/live-audit.json`. |
| F-1-2 | Household remains visible with a 44px target at 390px. | `mobile navigation visibly reaches Household and controls keep their target size`; live mobile audit and `demo-query-mobile.png`. |
| F-1-3 | Recovery offers valid-backup import and confirmed local clear independently of corrupt data. | `corrupt data can be restored by import or removed after confirmation`; live `/settings` route check. |
| F-1-4 | Push, Back, and Forward focus and announce the destination heading. | `route clicks, Back, and Forward focus and announce the new heading`; live full Playwright suite. |
| F-1-5 | Chores have edit and confirmed removal while receipts remain. | `chores can be edited and removed while their receipts remain`; clean full suite. |
| F-1-6 | Real household data persists in the real IndexedDB namespace. | `@claim:stored-device`; clean claim suite. |
| F-1-7 | JSON import restores household, chores, and receipts into a fresh real store. | `@claim:json-backup`; live `/settings` check and `household-desktop.png`. |
| F-1-8 | QR privacy checks request origin, method, URL, and body without hard-coding localhost. | `@claim:local-only`; full live suite and live `privacy` audit. |
| F-1-9 | Landing, Household, and Privacy state that household copies do not synchronize. | `@claim:copies-no-sync`; live landing and Household audit. |
| F-1-10 | Each real route has its own static and runtime title, description, canonical, OG, and Twitter metadata. | `every real route ships and updates complete route-specific metadata`; six live routes in `live-audit.json`. |
| F-1-11 | The HTTP 404 keeps the paper-slip identity, skeleton, legal links, icons, and metadata. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; live 404/Axe audit. |
| F-1-12 | Blank household names return focus and an announced error. | `blank household names explain the error and return focus to the input`; clean full suite. |
| F-1-13 | Landing terminology consistently uses *chore*. | Rendered copy-inventory regression; live `screenshot-mobile.png`. |
| F-1-14 | README explains the QR fragment in plain language. | README review and `@claim:local-only`. |
| F-1-15 | README describes claim checks plainly; all 11 declared claims are exercised. | Clean claim suite: 11/11 passed. |
| F-1-16 | The untestable public generated-art originality statement remains absent. | Rendered copy audit and cold live landing check. |
| F-1-17 | Footer visibly and accessibly marks the external Param Factory link. | Live Axe audit and `screenshot-mobile.png`. |
| F-1-18 | Rebuilt the audit from 50 rendered copy units, preserving duplicate occurrences, image alt text, and screen-reader labels. The test rejects untracked text, stale rows, wrong counts, and rows over 22 words. | `the committed copy audit matches every current landing copy unit and sentence`; `.factory/copy-audit.md`; live landing screenshot. |
| F-2-1 | Landing includes a labelled Maple Street sample board before the explanatory steps. | `the landing page shows a labelled sample board before explaining how it works`; `screenshot-mobile.png`. |
| F-2-2 | JSON backup export is named explicitly and offered beside import. | `@claim:json-backup`; `household-desktop.png`. |
| F-3-1 | Removed the hero slogan caption. | `landing headings name the product sections without slogans`; rendered copy audit. |
| F-3-2 | Preview heading is **Sample chore board**. | `landing headings name the product sections without slogans`; `screenshot-mobile.png`. |
| F-3-3 | Board and preview queues use **Current chores**. | `landing headings name the product sections without slogans`; `demo-query-mobile.png`. |
| F-3-4 | The explanatory heading is **How chore receipts set the next due date**. | `landing headings name the product sections without slogans`; `screenshot-mobile.png`. |
| Controller copy-audit finding | The exact audit test now waits for IndexedDB rendering before comparing the complete rendered inventory. | Exact audit test, clean 27-test suite, and full 27-test live suite. |
| Verification HIGH-1 | Leaving demo deletes the demo database; re-entry restores only shipped sample data. | `@claim:demo-discard`; direct `?demo=1` reset audit. |
| Verification MEDIUM-1 | Hashed assets are immutable; `sw.js` revalidates. | `hashed assets are immutable and the service worker always revalidates`; live response headers. |

## Final evidence

- Clean clone at `/tmp/chore-receipt-polish3-retry1-release.NpQTvm/repo`
  checked `e6ac4fb`: `npm ci` passed with 0 vulnerabilities; the 11 claim
  tests and full 27-test suite passed; `npm run build` produced `dist/`.
- Local `verify-url.sh` produced
  `evidence/polish-3-retry1-local/verify.json`: title, language, one h1, main,
  image alt text, labelled buttons, and no console errors.
- The production browser suite passed all 27 tests using
  `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in` after final
  deployment `3318e198-e913-4bee-88c1-0737808ef736`.
- Live `verify-url.sh` produced
  `evidence/polish-3-retry1-live/verify.json`; `live-audit.json` records zero
  serious or critical Axe findings on seven routes and the direct demo, privacy,
  offline, metadata, mobile, and 404 checks.
- Live mobile Lighthouse is 100 performance / 100 accessibility / 100 best
  practices / 100 SEO; FCP 0.9s, LCP 1.5s, TBT 0ms, and CLS 0.014. Its raw
  report is `evidence/polish-3-retry1-live/lighthouse-mobile.json`.

No finding remains unresolved.
