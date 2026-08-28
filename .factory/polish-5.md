# Polish 5 — zero-finding release closure

Reviewed candidate: `817013bcadecd05429c60370a89aaef993eb1f42`.
Adversarial review: `ac935ceb17094c4513e1dd290379ea5792da1c07`.
Repair commits: `9619421` and `a21aded`.
Final static deployment: `f856a2fc-5ccf-4064-9cad-d020af0cfc30` at
<https://chore-receipt.sociobot.in>.

Every `review-*.md` and `polish-*.md` was reread. The table maps every
cumulative finding to its shipped state. “Live” links were cold-checked after
the final deployment; screenshots are committed evidence from that check or
the still-applicable focused regression named in the row.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The worker overwrites its shell only with successful HTML, preserving a known-good shell after a 404. | `@claim:offline-reload`; [direct demo](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-1-2 | Household remains visible and touch-sized in the 390 px header. | `mobile navigation visibly reaches Household and controls keep their target size`; [demo at 390 px](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-1-3 | Corrupt-data recovery independently imports a valid backup or confirms clearing local data. | `corrupt data can be restored by import or removed after confirmation`; [recovery screen](evidence/polish-4-live/recovery-mobile.png); live <https://chore-receipt.sociobot.in/settings>. |
| F-1-4 | Route clicks, Back, and Forward focus and announce the new h1. | `route clicks, Back, and Forward focus and announce the new heading`; [receipt log](evidence/polish-4-live/receipt-log-mobile.png); live <https://chore-receipt.sociobot.in/log>. |
| F-1-5 | Chores can be edited and confirmed removed while receipts stay readable. | `chores can be edited and removed while their receipts remain`; [copy re-import](evidence/polish-4-live/copy-reimport-mobile.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-1-6 | Real household names and chores persist in the real IndexedDB namespace. | `@claim:stored-device`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-1-7 | JSON export/import restores household, chores, receipts, and removal history. | `@claim:json-backup`; [Household backup](evidence/polish-4-live/settings-mobile.png); live <https://chore-receipt.sociobot.in/settings>. |
| F-1-8 | QR privacy inspection rejects household data in request origins, methods, URLs, and bodies. | `@claim:local-only`; [Privacy](evidence/polish-4-live/privacy-mobile.png); live <https://chore-receipt.sociobot.in/privacy>. |
| F-1-9 | Landing, Household, and Privacy plainly say household copies do not sync. | `@claim:copies-no-sync`; [landing disclosure](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/privacy>. |
| F-1-10 | Every application route ships and updates its own title, description, canonical, Open Graph, and Twitter metadata. | `every real route ships and updates complete route-specific metadata`; [desktop landing](evidence/polish-5-live/landing-1440.png); live `/`, `/demo`, `/log`, `/settings`, `/privacy`, `/terms`. |
| F-1-11 | The real HTTP 404 has the standard skeleton, legal links, icons, and metadata. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; [404](evidence/polish-5-live/missing-390.png); live <https://chore-receipt.sociobot.in/missing-csp-check> (404). |
| F-1-12 | Blank household names announce a bound error and return focus to the input. | `blank household names explain the error and return focus to the input`; [Household](evidence/polish-4-live/settings-mobile.png); live <https://chore-receipt.sociobot.in/settings>. |
| F-1-13 | Public instructions consistently use “chore.” | `the committed copy audit matches every current landing copy unit and sentence`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-1-14 | README explains QR privacy in plain language. | `README and catalog use plain, bounded product wording`; [Household](evidence/polish-4-live/settings-mobile.png); live <https://chore-receipt.sociobot.in/settings>. |
| F-1-15 | Scoped claims are registered and each has exactly one tagged outcome test. | `every declared claim has exactly one tagged outcome test and every landing claim is registered`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-1-16 | The untestable public originality statement remains absent. | `the committed copy audit matches every current landing copy unit and sentence`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-1-17 | The Param Factory link has visible and screen-reader external cues. | `all product routes and the 404 have no serious or critical axe findings`; [landing footer](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-1-18 | The rendered-copy inventory is complete, sentence-split, counted, and regression-tested. | `the committed copy audit matches every current landing copy unit and sentence`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-2-1 | Landing includes a labelled Maple Street sample board before the explanation. | `the landing page shows a labelled sample board before explaining how it works`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-2-2 | **Export JSON backup** is explicit and appears beside JSON import. | `@claim:json-backup`; [Household backup](evidence/polish-4-live/settings-mobile.png); live <https://chore-receipt.sociobot.in/settings>. |
| F-3-1 | The hero slogan caption is absent. | `landing headings name the product sections without slogans`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-3-2 | The preview heading is **Sample chore board**. | `landing headings name the product sections without slogans`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-3-3 | Preview and application queues use **Current chores**. | `landing headings name the product sections without slogans`; [demo](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-3-4 | The explanatory heading is **How chore receipts set the next due date**. | `landing headings name the product sections without slogans`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/>. |
| F-4-1 | Reset clears transient receipt state, restores the exact seed, announces it, and restores focus. | `@claim:demo-reset`; [demo](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/?demo=1>. |
| F-4-2 | QR and JSON copies carry removal tombstones and re-import updates edits/removals without erasing destination-only chores. | `@claim:copies-no-sync`; [copy re-import](evidence/polish-4-live/copy-reimport-mobile.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-4-3 | The no-score promise is declared and verifies both UI and exported schema. | `@claim:no-scoring`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-4-4 | The editable demo promise is declared and verifies real/demo isolation. | `@claim:demo-isolation`; [direct demo](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/?demo=1>. |
| F-4-5 | The 404 title and h1 use direct page-not-found language. | `the designed 404 keeps navigation, legal links, metadata, and accessible structure`; [404](evidence/polish-5-live/missing-390.png); live <https://chore-receipt.sociobot.in/missing-csp-check>. |
| F-4-6 | Board instructions name the chore and repeat interval. | `board instructions and receipt actions name the chore and result`; [demo](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-4-7 | Actions read **View all receipts** and **Undo receipt**. | `board instructions and receipt actions name the chore and result`; [demo](evidence/polish-5-live/demo-query-390.png); live <https://chore-receipt.sociobot.in/demo>. |
| F-4-8 | README says the demo keeps its sample separate from household data. | `README and catalog use plain, bounded product wording`; [landing](evidence/polish-5-live/landing-390.png); live <https://chore-receipt.sociobot.in/?demo=1>. |
| F-5-1 | Added `frame-ancestors 'self'` to the Static Web Apps response CSP. The preview mirrors that header so the browser test fetches it locally and production checks fetch it live. | `normal and missing routes send a frame-ancestors response header`; [404](evidence/polish-5-live/missing-390.png); live `/` is 200 and `/missing-csp-check` is 404, both with the directive. |

## Final evidence

- Fresh remote clone: `/tmp/chore-receipt-polish5-clean.MoZZvO/repo` at
  `a21aded769df7206406f1166ed40ee44b6e60b35`; `npm ci` passed with zero
  vulnerabilities.
- Each exact claim command in `.factory/claims.json` passed separately:
  13/13 (`demo-isolation`, `demo-reset`, `demo-discard`, `no-scoring`,
  `stored-device`, `offline-reload`, `csv-export`, `json-backup`,
  `local-only`, `qr-share`, `copies-no-sync`, `receipt-next-date`, `free`).
- The clean clone passed `npm test -- --workers=1`: 33/33. This includes
  offline-after-404, QR request privacy, route focus/announcements, 390 px
  navigation, 200% text, route metadata, copy audit, and seven-route Axe.
- `npm run build` produced `dist/index.html`; initial application JS is
  55.67 kB raw / 18,835 B gzip and CSS is 14.44 kB raw / 4,130 B gzip.
- Post-deploy `PLAYWRIGHT_BASE_URL=https://chore-receipt.sociobot.in npm test
  -- --workers=1` passed 33/33. Cold direct-browser checks found one h1 and
  main, `lang=en`, the right titles, no application console errors on landing
  or demo, and the direct `?demo=1` banner.

No finding remains unresolved.
