# Polish 4 — zero-finding release closure

Reviewed candidate: `28290e0aa2797abdd03810e35e2e9159112dc074`.
Review commit: `ee02f9f636f6ec162292ddb420b254eec669d5ab`.
Product repair commits: `76a040c`, `a86da60`, and `6dd0fa3`.
Final deployment: `bcabe938-7437-4ee4-b1fd-f6e67a8a029c` at
<https://chore-receipt.sociobot.in>.

Every earlier review and polish record was read before repair. The table maps
every cumulative finding ID to its current implementation and evidence. The
live screenshots are cold 390×844 Chromium captures from the final deployment.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The service worker replaces the shell only with successful HTML, so a 404 cannot poison offline navigation. | `@claim:offline-reload`; 32-test suite; [`demo-reset-mobile.png`](evidence/polish-4-live/demo-reset-mobile.png); live `/demo` and offline `/log`. |
| F-1-2 | Household stays visible in the phone header and all controls retain 44px targets. | `mobile navigation visibly reaches Household and controls keep their target size`; [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png); live `/settings` at 390px. |
| F-1-3 | Corrupt-state recovery independently offers valid JSON import and confirmed local clearing. | `corrupt data can be restored by import or removed after confirmation`; [`recovery-mobile.png`](evidence/polish-4-live/recovery-mobile.png); cold live `/` with an injected invalid record. |
| F-1-4 | Link navigation, Back, and Forward focus and announce the destination h1. | `route clicks, Back, and Forward focus and announce the new heading`; [`receipt-log-mobile.png`](evidence/polish-4-live/receipt-log-mobile.png); live `/log`. |
| F-1-5 | Chores can be edited and confirmed removed while historical receipts remain. Removal now writes a portable tombstone. | `chores can be edited and removed while their receipts remain`; `@claim:copies-no-sync`; [`copy-reimport-mobile.png`](evidence/polish-4-live/copy-reimport-mobile.png); live `/demo`. |
| F-1-6 | Real household names and chores persist after reload in the real IndexedDB namespace. | `@claim:stored-device`; [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png); live `/settings`. |
| F-1-7 | JSON import restores exact household, chores, receipts, and removal history into a fresh store. | `@claim:json-backup`; [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png); live `/settings`. |
| F-1-8 | QR privacy checks inspect method, origin, URL, and request body across sender and recipient. | `@claim:local-only`; [`privacy-mobile.png`](evidence/polish-4-live/privacy-mobile.png); live `/privacy`. |
| F-1-9 | Landing, Household, and Privacy state that copies do not sync and require another import. | `@claim:copies-no-sync`; [`privacy-mobile.png`](evidence/polish-4-live/privacy-mobile.png); live `/privacy`. |
| F-1-10 | All six real routes ship and update distinct titles, descriptions, canonicals, Open Graph, and Twitter metadata. | `every real route ships and updates complete route-specific metadata`; [`live-audit.json`](evidence/polish-4-live/live-audit.json); live `/`, `/demo`, `/log`, `/settings`, `/privacy`, `/terms`. |
| F-1-11 | The styled 404 retains the skip link, header, footer, legal links, icons, and complete metadata. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; [`404-mobile.png`](evidence/polish-4-live/404-mobile.png); live `/cold-missing-round-four` returned 404. |
| F-1-12 | Blank household names show a bound error and return focus to the field. | `blank household names explain the error and return focus to the input`; [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png); live `/settings`. |
| F-1-13 | All landing instructions use *chore*, not *task*. | `the committed copy audit matches every current landing copy unit and sentence`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |
| F-1-14 | README explains QR-link privacy without “fragment” or “host” jargon. | `README and catalog use plain, bounded product wording`; `@claim:local-only`; [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png); live `/settings`. |
| F-1-15 | Removed the broad “every public claim” assertion. The registry now has 13 scoped claims, each with exactly one tagged outcome test. | `every declared claim has exactly one tagged outcome test and every landing claim is registered`; 13/13 clean-clone claim commands; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |
| F-1-16 | The untestable public generated-art originality statement remains absent. | Rendered copy-inventory test; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |
| F-1-17 | The Param Factory footer link keeps visible and screen-reader external cues. | Seven-route Axe coverage; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live footer on `/`. |
| F-1-18 | The copy audit is generated from 50 rendered copy units, preserves duplicates, checks counts, and rejects untracked or banned wording. | `the committed copy audit matches every current landing copy unit and sentence`; `.factory/copy-audit.md`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png). |
| F-2-1 | A labelled Maple Street sample board remains between the first screen and “How it works.” | `the landing page shows a labelled sample board before explaining how it works`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |
| F-2-2 | **Export JSON backup** is explicit and sits beside JSON import on Household. The native file input is now truly hidden behind its labelled control. | `@claim:json-backup`; [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png); live `/settings`. |
| F-3-1 | The hero slogan remains removed. | `landing headings name the product sections without slogans`; copy-inventory test; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png). |
| F-3-2 | The preview h2 is **Sample chore board**. | `landing headings name the product sections without slogans`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |
| F-3-3 | Preview and app queues use **Current chores**. | `landing headings name the product sections without slogans`; [`demo-reset-mobile.png`](evidence/polish-4-live/demo-reset-mobile.png); live `/demo`. |
| F-3-4 | The explanation h2 is **How chore receipts set the next due date**. | `landing headings name the product sections without slogans`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |
| F-4-1 | Reset clears `lastReceipt` and session notices, restores the deterministic four-chore/four-receipt seed, announces completion, and returns focus to **Reset demo**. Real data is untouched. | `@claim:demo-reset`; [`demo-reset-mobile.png`](evidence/polish-4-live/demo-reset-mobile.png); live `/?demo=1`; exact result in [`live-audit.json`](evidence/polish-4-live/live-audit.json). |
| F-4-2 | Removal tombstones now travel in QR and JSON copies. Re-import applies later edits/removals, keeps receipt history and destination-only chores, and works when only the current tab’s `#join` changes. | `@claim:copies-no-sync`; `@claim:json-backup`; [`copy-reimport-mobile.png`](evidence/polish-4-live/copy-reimport-mobile.png); cold live same-tab re-import at `/`. |
| F-4-3 | Added the `no-scoring` claim and a test that completes a chore and inspects both board copy and exported schema. | `@claim:no-scoring`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/` and `/demo`. |
| F-4-4 | Broadened `demo-isolation` to cover actual editing in the demo namespace while the real namespace stays empty. | `@claim:demo-isolation`; [`demo-reset-mobile.png`](evidence/polish-4-live/demo-reset-mobile.png); live `/?demo=1`. |
| F-4-5 | Replaced the receipt metaphor with title **Page not found — Chore Receipt** and h1 **This page is missing.** | 404 structure test; [`404-mobile.png`](evidence/polish-4-live/404-mobile.png); live `/cold-missing-round-four`. |
| F-4-6 | Rewrote the board introduction to “Mark a chore done. Its repeat interval sets the next due date.” | `board instructions and receipt actions name the chore and result`; [`demo-reset-mobile.png`](evidence/polish-4-live/demo-reset-mobile.png); live `/demo`. |
| F-4-7 | Renamed actions to **View all receipts** and **Undo receipt**. | `board instructions and receipt actions name the chore and result`; `@claim:demo-reset`; [`demo-reset-mobile.png`](evidence/polish-4-live/demo-reset-mobile.png); live `/demo`. |
| F-4-8 | Replaced “browser database” with “keeps its sample separate from your household data.” | `README and catalog use plain, bounded product wording`; [`landing-mobile.png`](evidence/polish-4-live/landing-mobile.png); live `/`. |

## Additional cold-audit repairs

- The required post-deploy recheck exposed same-tab fragment navigation as a
  real re-import edge. A `hashchange` handler now imports the new packet and
  announces its result; the declared `copies-no-sync` test no longer navigates
  through `about:blank` before the second link.
- Visual inspection exposed the native JSON file input beneath the styled
  label on phones. A global `[hidden]` rule and `json-backup` assertion close
  that defect; the final [`settings-mobile.png`](evidence/polish-4-live/settings-mobile.png)
  shows one chooser only.

## Verification summary

- Final clean remote clone: `/tmp/chore-receipt-polish4-handoff.qNTZTO/repo`
  at `0be43f852f73dc40d9d591f03f4e276e3b05c9e8`.
- `npm ci`: 0 vulnerabilities.
- Every exact command in `.factory/claims.json`: 13/13 passed individually.
- Full final clean-clone suite: 32/32.
- `npm run build`: passed; `dist/index.html` present; initial JS 55.67 kB raw /
  19.12 kB gzip and CSS 14.44 kB raw / 4.12 kB gzip.
- Final live product suite: 32/32. This includes seven-route Axe, offline
  404 recovery, privacy request inspection, mobile 200% text, route focus,
  complete metadata, and all declared claims.
- Final live URL verifier: no console errors; `lang=en`; one h1; one main;
  complete alt text; labelled buttons. See [`verify.json`](evidence/polish-4-live/verify.json).
- Final live Lighthouse: 100 performance / 100 accessibility / 100 best
  practices / 100 SEO; FCP 955 ms, LCP 1,555 ms, TBT 0 ms, CLS 0.014. Raw
  report: [`lighthouse-mobile.json`](evidence/polish-4-live/lighthouse-mobile.json).
- Final deployed assets: `assets/index-80aJnVXw.js` and
  `assets/index-DblZxFzx.css`; hashed assets are immutable and `sw.js`
  revalidates.

No review finding or cold-audit defect remains open.
