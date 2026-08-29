# Polish 6 — zero-finding release closure

Reviewed candidate: `32ced3f05a3ffba551902fce6ce86624e994e5c8`.
Adversarial review: `0bfd0672c7e0d8c4fddf1247ad31051ea4f2f3a2`.
Repair commit: `19f3633b03cce5e6aa568a0da4bb8b101a15d045`.
Static deployment: `85fe0d7b-3129-44b5-8554-c5f15f2fcffe` at
<https://chore-receipt.sociobot.in>.

Every `review-*.md` and `polish-*.md` was reread. The table maps every
cumulative finding to its shipped repair and fresh round-6 evidence. The
linked screenshots are cold 390×844 production captures unless labelled
desktop.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The service worker replaces its shell only with successful HTML, so a 404 cannot poison offline routes. | `@claim:offline-reload`; [direct demo](evidence/polish-6-live/demo-query-390.png); live `/demo`, true 404, then offline `/log` in the 33-test live suite. |
| F-1-2 | Household remains visible and every control retains a 44px target at 390px. | `mobile navigation visibly reaches Household and controls keep their target size`; [demo](evidence/polish-6-live/demo-query-390.png); live [/settings](https://chore-receipt.sociobot.in/settings). |
| F-1-3 | Corrupt-state recovery independently imports valid JSON or confirms clearing local data. | `corrupt data can be restored by import or removed after confirmation`; [Household](evidence/polish-6-live/settings-390.png); live [/settings](https://chore-receipt.sociobot.in/settings). |
| F-1-4 | Click, Back, and Forward navigation focus and announce the destination h1. | `route clicks, Back, and Forward focus and announce the new heading`; [live audit](evidence/polish-6-live/live-audit.json); live [/demo](https://chore-receipt.sociobot.in/demo) → `/log` → Back → Forward. |
| F-1-5 | Chores can be edited and confirmed removed while historical receipts remain. | `chores can be edited and removed while their receipts remain`; [demo](evidence/polish-6-live/demo-query-390.png); live [/demo](https://chore-receipt.sociobot.in/demo). |
| F-1-6 | Exact real household names and chores survive reload in the real IndexedDB namespace. | `@claim:stored-device`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-1-7 | JSON import restores household, chores, receipts, and removal history into a fresh namespace. | `@claim:json-backup`; [Household](evidence/polish-6-live/settings-390.png); live [/settings](https://chore-receipt.sociobot.in/settings). |
| F-1-8 | The QR privacy test inspects origin, method, URL, and body for the packet and known household fields. | `@claim:local-only`; [Privacy](evidence/polish-6-live/privacy-390.png); live [/privacy](https://chore-receipt.sociobot.in/privacy); cold audit recorded seven same-origin GETs with empty bodies. |
| F-1-9 | Landing, Household, and Privacy plainly state that copies do not sync and require another import. | `@claim:copies-no-sync`; [Privacy](evidence/polish-6-live/privacy-390.png); live [/privacy](https://chore-receipt.sociobot.in/privacy). |
| F-1-10 | All six application routes have distinct static and runtime titles, descriptions, canonicals, Open Graph, and Twitter metadata. | `every real route ships and updates complete route-specific metadata`; [live audit](evidence/polish-6-live/live-audit.json); live `/`, `/demo`, `/log`, `/settings`, `/privacy`, and `/terms` all returned 200 with the expected titles. |
| F-1-11 | The true HTTP 404 keeps the skip link, header, footer, legal links, icons, metadata, and paper-cut identity. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; [404](evidence/polish-6-live/missing-390.png); live [/missing-polish-6](https://chore-receipt.sociobot.in/missing-polish-6) returned 404. |
| F-1-12 | Blank household names show a bound error and return focus to the input. | `blank household names explain the error and return focus to the input`; [Household](evidence/polish-6-live/settings-390.png); live [/settings](https://chore-receipt.sociobot.in/settings). |
| F-1-13 | Landing instructions consistently use “chore.” | `the committed copy audit matches every current landing copy unit and sentence`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-1-14 | README explains QR privacy with the `#` behavior in plain words. | `README and catalog use plain, bounded product wording`; [Household](evidence/polish-6-live/settings-390.png); live [/settings](https://chore-receipt.sociobot.in/settings). |
| F-1-15 | The broad coverage assertion remains removed; 13 scoped claims each have one tagged outcome test. | `every declared claim has exactly one tagged outcome test and every landing claim is registered`; [landing](evidence/polish-6-live/landing-390.png); all 13 exact claim commands passed in the clean clone. |
| F-1-16 | The untestable public generated-art originality statement remains absent. | `the committed copy audit matches every current landing copy unit and sentence`; [landing](evidence/polish-6-live/landing-390.png); cold live [/](https://chore-receipt.sociobot.in/) copy check. |
| F-1-17 | The Param Factory footer link has visible and screen-reader external cues. | `all product routes and the 404 have no serious or critical axe findings`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-1-18 | The generated 50-unit landing inventory preserves duplicate occurrences and verifies exact word counts. | `the committed copy audit matches every current landing copy unit and sentence`; [desktop landing](evidence/polish-6-live/landing-1440.png); live [/](https://chore-receipt.sociobot.in/). |
| F-2-1 | A labelled Maple Street sample board appears between the first screen and the explanation. | `the landing page shows a labelled sample board before explaining how it works`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-2-2 | **Export JSON backup** is explicit and appears beside JSON import. | `@claim:json-backup`; [Household](evidence/polish-6-live/settings-390.png); live [/settings](https://chore-receipt.sociobot.in/settings). |
| F-3-1 | The hero slogan remains removed. | `landing headings name the product sections without slogans`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-3-2 | The preview heading is **Sample chore board**. | `landing headings name the product sections without slogans`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-3-3 | Preview and application queues use **Current chores**. | `landing headings name the product sections without slogans`; [demo](evidence/polish-6-live/demo-query-390.png); live [/demo](https://chore-receipt.sociobot.in/demo). |
| F-3-4 | The explanatory heading is **How chore receipts set the next due date**. | `landing headings name the product sections without slogans`; [landing](evidence/polish-6-live/landing-390.png); live [/](https://chore-receipt.sociobot.in/). |
| F-4-1 | Reset clears transient results, restores the exact seed, announces completion, restores focus, and leaves real data unchanged. | `@claim:demo-reset`; [direct demo](evidence/polish-6-live/demo-query-390.png); cold live [/?demo=1](https://chore-receipt.sociobot.in/?demo=1) recorded four chores, four receipts, no Undo control, and Reset focus. |
| F-4-2 | QR and JSON copies carry removal tombstones; re-import applies edits/removals while retaining destination-only chores and receipt history. | `@claim:copies-no-sync` and `@claim:json-backup`; [shared-copy result](evidence/polish-6-live/shared-copy-390.png); live [/demo](https://chore-receipt.sociobot.in/demo) sender/recipient flow. |
| F-4-3 | The no-score promise is registered and verifies both rendered copy and exported schema. | `@claim:no-scoring`; [landing](evidence/polish-6-live/landing-390.png); live [/demo](https://chore-receipt.sociobot.in/demo). |
| F-4-4 | The demo claim proves the sample is editable and isolated from real storage. | `@claim:demo-isolation`; [direct demo](evidence/polish-6-live/demo-query-390.png); live [/?demo=1](https://chore-receipt.sociobot.in/?demo=1). |
| F-4-5 | The 404 title and h1 use direct page-not-found language. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; [404](evidence/polish-6-live/missing-390.png); live [/missing-polish-6](https://chore-receipt.sociobot.in/missing-polish-6). |
| F-4-6 | Board instructions name the chore and repeat interval. | `board instructions and receipt actions name the chore and result`; [demo](evidence/polish-6-live/demo-query-390.png); live [/demo](https://chore-receipt.sociobot.in/demo). |
| F-4-7 | Actions read **View all receipts** and **Undo receipt**. | `board instructions and receipt actions name the chore and result`; [demo](evidence/polish-6-live/demo-query-390.png); live [/demo](https://chore-receipt.sociobot.in/demo). |
| F-4-8 | README says the demo keeps its sample separate from household data. | `README and catalog use plain, bounded product wording`; [direct demo](evidence/polish-6-live/demo-query-390.png); live [/?demo=1](https://chore-receipt.sociobot.in/?demo=1). |
| F-5-1 | Normal and missing routes send `frame-ancestors 'self'` in the response CSP. | `normal and missing routes send a frame-ancestors response header`; [404](evidence/polish-6-live/missing-390.png); live `/` returned 200 and `/missing-polish-6` returned 404 with the directive. |
| F-6-1 | The visible shared-copy notice no longer has live-region semantics. The dedicated announcer is the single `role=status` owner, and the claim scopes visual feedback separately from one announcement. | `@claim:copies-no-sync` (10 repeated local passes, one clean-clone pass, and one live-suite pass); [shared-copy result](evidence/polish-6-live/shared-copy-390.png); [live audit](evidence/polish-6-live/live-audit.json) records `statusRegionCount: 1` at live [/](https://chore-receipt.sociobot.in/). |

## Verification

- Clean remote clone: `/tmp/chore-receipt-polish6-clean.LpNooG/repo` at
  `19f3633b03cce5e6aa568a0da4bb8b101a15d045`; `npm ci` reported zero
  vulnerabilities.
- Every exact command in `.factory/claims.json` passed separately: 13/13.
- `@claim:copies-no-sync` also passed 10 consecutive local repetitions after
  the repair; the unpatched candidate reproduced the reported failure in one
  of three repetitions.
- The clean-clone full suite passed 33/33. The work-order build gate passed
  33/33 again, and the deployed production suite passed 33/33.
- `npm run build` produced `dist/index.html`. Initial JavaScript is 55,660
  bytes raw / 18,832 bytes gzip; CSS is 14,443 bytes raw / 4,130 bytes gzip.
- [`verify.json`](evidence/polish-6-live/verify.json) records no landing-page
  console errors, `lang=en`, one h1, one main, complete image alt text, and no
  unlabelled buttons.
- [`live-audit.json`](evidence/polish-6-live/live-audit.json) records six 200
  routes, the designed 404, correct metadata, no serious/critical Axe findings,
  demo reset/isolation, route focus, same-origin GET-only demo traffic, and one
  shared-copy status region.
- [Live mobile Lighthouse](evidence/polish-6-live/lighthouse-mobile.json): 99
  performance, 100 accessibility, 100 best practices, and 100 SEO; FCP 1.0s,
  LCP 1.7s, TBT 130ms, CLS 0.014.

No review finding or cold-audit defect remains open.
