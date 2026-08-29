# Adversarial first-read review 7 — Chore Receipt

**Verdict: PASS.** No blocking, major, minor, copy, claim, demo, privacy,
structure, accessibility, or missed-leverage finding remains. Every declared
claim was tested independently from a clean clone, and no public claim was
left untested.

- Reviewed: 2026-08-29 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository commit: `07572f4b903b1a48d5a4a6463abce65a0065c79b`
- Clean clone: `/tmp/chore-receipt-review7-clean.jqwLNw/repo`
- Viewports: fresh Chromium contexts at 390×844 and 1440×900

## Findings

None.

## Cold first screen, before scrolling

| Viewport | What it does, in my words | For whom | What I would click first |
| --- | --- | --- | --- |
| 390×844 | Records completed household chores and shows what is due next. | Roommates and families who share household work. | **Try it with sample data**. |
| 1440×900 | The same shared chore record with completion receipts and next dates. | Roommates and families who share household work. | **Try it with sample data**. |

All three answers are explicit on both first screens. The exact text is
“Record chores when they get done,” “For roommates and families who share the
work and need to know what is due next,” and “Try it with sample data.” The
adjacent sentence, “See a working shared chore board,” names the result of the
first action. The three facts — “Works offline after setup,” “Stored on this
device,” and “Free to use” — are also visible without scrolling at 390 px.

## Copy audit

Counts use space-separated words; punctuation and hyphenated terms stay with
their word. Headings, actions, labels, image descriptions, repeated copy, and
developer instructions are included so contextless or vague wording cannot
hide outside prose. No item exceeds 22 words. No banned adjective, jargon in
visitor copy, inconsistent product term, metaphor heading, empty slogan, or
non-result-naming action was found.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Chore Receipt | 2 | Pass |
| Main navigation | 2 | Pass |
| Receipt log | 2 | Pass |
| Household | 1 | Pass |
| Privacy | 1 | Pass |
| A household record, not a scorecard | 6 | Pass — `no-scoring` |
| Record chores when they get done | 6 | Pass |
| For roommates and families who share the work and need to know what is due next. | 16 | Pass |
| Try it with sample data | 5 | Pass — required demo action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | Pass — `offline-reload` |
| Stored on this device | 4 | Pass — `stored-device` |
| Free to use | 3 | Pass — `free` |
| Add your first chore → | 5 | Pass |
| A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt. | 12 | Pass |
| Sample board preview | 3 | Pass |
| Sample chore board | 3 | Pass |
| This is Maple Street home. | 5 | Pass |
| It is a sample, not your data. | 7 | Pass — demo isolation |
| Open the editable sample board → | 6 | Pass — `demo-isolation` |
| Maple Street home | 3 | Pass |
| Current chores | 2 | Pass |
| 2 due now | 3 | Pass |
| Clean the bathroom | 3 | Pass |
| 1 day overdue · repeats every 7 days | 8 | Pass |
| Sample chore marked done | 4 | Pass |
| Water the plants | 3 | Pass |
| Due in 3 days · repeats every 5 days | 9 | Pass |
| Sample chore marked done | 4 | Pass |
| Water the plants | 3 | Pass |
| Done Aug 26 · next Aug 31 | 7 | Pass |
| How it works | 3 | Pass |
| How chore receipts set the next due date | 8 | Pass |
| Keep a shared list. | 4 | Pass |
| Add chores the household repeats. | 5 | Pass |
| Tap “Mark done.” | 3 | Pass |
| The time becomes a receipt. | 5 | Pass |
| Check what is due. | 4 | Pass |
| Each chore repeats from completion. | 5 | Pass — `receipt-next-date` |
| Keep your household record private | 5 | Pass |
| Export or share a household copy only when you choose. | 10 | Pass |
| Household copies do not stay in sync. | 7 | Pass — `copies-no-sync` |
| Scan or import again to update another device. | 8 | Pass — `copies-no-sync` |
| Read the privacy details | 4 | Pass |
| A local record for recurring chores. | 6 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory (external) | 5 | Pass |
| v1.3.0 | 1 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass |
| Record shared chores when they get done. | 7 | Pass |
| Chore Receipt is for roommates and families who share recurring work. | 11 | Pass |
| Try the sample at `/demo`; it opens a separate board with four household chores. | 14 | Pass — `demo-isolation` |
| Demo changes are deleted when you select **Start for real**. | 10 | Pass — `demo-discard` |
| What it does | 3 | Pass |
| Records a completion as a time-stamped receipt and calculates the next date. | 12 | Pass — `receipt-next-date` |
| Exports receipts as CSV and exports or imports a JSON backup from Household. | 13 | Pass — export claims |
| Shares an opt-in household copy with a QR code. | 9 | Pass — `qr-share` |
| The copy stays after the # in the link, which browsers do not send to this site. | 17 | Pass — `local-only` |
| Works offline after setup. | 4 | Pass — `offline-reload` |
| It is free to use. | 5 | Pass — `free` |
| Privacy | 1 | Pass |
| Chores, receipts, and the household name are stored in this browser. | 11 | Pass — `stored-device` |
| The demo keeps its sample separate from your household data. | 10 | Pass — demo claims |
| See `/privacy` and `/terms` in the app. | 7 | Pass |
| Develop and verify | 3 | Pass |
| Requires Node 20 or newer. | 5 | Pass |
| `npm ci` | 2 | Pass |
| `npm test` | 2 | Pass |
| `npm run build` | 3 | Pass |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 15 | Pass |
| Product claims and their Playwright checks are listed in `.factory/claims.json`. | 10 | Pass |
| Deploy | 1 | Pass |
| Deploy `dist/` to the configured static host. | 7 | Pass |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

The visitor-facing terminology remains consistent: *chore*, *receipt*,
*household*, *demo*, and *household copy*. CSV, JSON, QR, Node, Playwright,
and deployment terms occur only where they name a format, tool, or developer
instruction.

## Demo and sandbox

- One click from the cold landing opened `/demo`. The first screen showed
  “Shared chore board,” Maple Street home, four chores, four dated receipts,
  due states, and completion controls.
- The persistent banner reads “Demo — sample data, nothing is saved” and
  provides **Reset demo** and **Start for real**.
- A fresh direct `/demo` context created only `chore-receipt-demo-v1`.
  Completing Water the plants and resetting restored exactly four chores and
  four receipts, removed **Undo receipt**, announced the reset, and returned
  focus to **Reset demo**.
- The one-click isolation regression confirms the real record remains absent.
  The reset regression creates real data first and confirms it is unchanged.
  The discard regression confirms **Start for real** deletes the demo database
  while preserving real data.
- The cold live demo request log contained three same-origin GET requests, no
  request bodies, and no third-party requests. The production `local-only`
  test repeated request logging across the QR sender and recipient flow.
- The production `offline-reload` test loaded the demo, visited a true 404,
  disabled the network, and still opened `/log` and `/demo` from the valid
  cached shell.

The demo is realistic, one-click, editable, isolated, resettable, and usable
offline after setup.

## Claims

I cloned `origin/main` into the clean directory above, confirmed commit
`07572f4b903b1a48d5a4a6463abce65a0065c79b`, ran `npm ci`, and ran every
exact `test` command from `.factory/claims.json` separately.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `demo-reset` | `npm test -- --grep @claim:demo-reset` | PASS |
| `demo-discard` | `npm test -- --grep @claim:demo-discard` | PASS |
| `no-scoring` | `npm test -- --grep @claim:no-scoring` | PASS |
| `stored-device` | `npm test -- --grep @claim:stored-device` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS |
| `json-backup` | `npm test -- --grep @claim:json-backup` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `qr-share` | `npm test -- --grep @claim:qr-share` | PASS |
| `copies-no-sync` | `npm test -- --grep @claim:copies-no-sync` | PASS |
| `receipt-next-date` | `npm test -- --grep @claim:receipt-next-date` | PASS |
| `free` | `npm test -- --grep @claim:free` | PASS |

The clean full suite passed 33/33. The same 33 tests passed against production.
`npm run build` produced `dist/`; initial JavaScript is 55.66 kB raw / 19.12
kB gzip and CSS is 14.44 kB raw / 4.12 kB gzip.

Every claim-like landing and README sentence maps to the registry: demo
opening/editing/separation to `demo-isolation`; demo deletion to
`demo-discard`; the neutral record to `no-scoring`; device storage to
`stored-device`; offline use to `offline-reload`; CSV and JSON behavior to
`csv-export` and `json-backup`; QR and hash privacy to `qr-share` and
`local-only`; copy updates to `copies-no-sync`; receipt/next-date behavior to
`receipt-next-date`; and price to `free`. No unlisted or untested claim was
found.

## Earlier finding verification

Every prior `review-*.md`, `polish-*.md`, and handoff was read. Each finding
was then checked against production and its current implementation or
regression; none is accepted merely because a polish record says it is fixed.

| Earlier finding | Fresh live and code confirmation |
| --- | --- |
| F-1-1 | Live true-404-then-offline navigation passed; the worker/test retain only successful HTML as the shell. |
| F-1-2 | Household is visible and touch-sized at 390 px; the mobile navigation regression passed live. |
| F-1-3 | Recovery still offers independent valid-JSON import and confirmed local clearing; both code paths passed live. |
| F-1-4 | Click, Back, and Forward focus and announce the destination h1; the production history regression passed. |
| F-1-5 | Live demo controls expose edit and confirmed removal; the regression confirms receipts remain. |
| F-1-6 | The exact real household and chore survive reload in `chore-receipt-real-v1`; the production claim passed. |
| F-1-7 | JSON import restores household, chores, receipts, and removal history into a fresh namespace; the production claim passed. |
| F-1-8 | The QR test inspects method, origin, URL, and body; the production request log passed with no household payload sent. |
| F-1-9 | Landing, Household, and Privacy state that copies do not sync; the re-import claim passed live. |
| F-1-10 | Six live routes returned distinct complete static/runtime metadata; the metadata regression passed. |
| F-1-11 | The live HTTP 404 keeps the skip link, header, footer, legal links, icons, metadata, and return action. |
| F-1-12 | Blank household names still produce a bound error and refocus the input; the live regression passed. |
| F-1-13 | Current landing instructions use *chore* consistently; rendered-copy verification passed. |
| F-1-14 | README still explains the `#` behavior in plain words; the related live QR privacy outcome passed. |
| F-1-15 | The broad coverage assertion remains absent; all 13 scoped claim commands passed independently. |
| F-1-16 | The untestable generated-art originality sentence remains absent from live and source copy. |
| F-1-17 | The live footer marks Param Factory as external visually and for assistive technology. |
| F-1-18 | The 50-location copy inventory matches rendered landing text, preserves duplicates, and checks exact counts. |
| F-2-1 | A labelled Maple Street sample board appears before the explanation and shows chores, due state, receipt, and next date. |
| F-2-2 | **Export JSON backup** is explicit on the board and beside import on Household; its claim passed live. |
| F-3-1 | The hero slogan remains absent in production and source. |
| F-3-2 | The live preview h2 is **Sample chore board**; the heading regression passed. |
| F-3-3 | Preview and app queues use **Current chores**; the heading regression passed live. |
| F-3-4 | The live h2 is **How chore receipts set the next due date**; the heading regression passed. |
| F-4-1 | Reset restores the exact seed, clears stale UI, announces once, focuses Reset, and preserves real data; the claim passed live. |
| F-4-2 | Tombstones remain in QR/JSON data; live re-import applied edits/removals and retained destination-only data. |
| F-4-3 | `no-scoring` remains registered and checks both rendered copy and exported fields; the claim passed live. |
| F-4-4 | `demo-isolation` edits the demo while confirming no real record; the claim passed live. |
| F-4-5 | The live 404 uses “Page not found” and “This page is missing,” with no receipt metaphor. |
| F-4-6 | The live board says “Mark a chore done. Its repeat interval sets the next due date.” |
| F-4-7 | Live actions remain **View all receipts** and **Undo receipt**; their regression passed. |
| F-4-8 | README still says the demo keeps its sample separate from household data. |
| F-5-1 | Normal and 404 production responses both send `frame-ancestors 'self'`; the response-header regression passed. |
| F-6-1 | Shared-copy feedback has one visible notice and one dedicated status owner; the exact claim passed independently and in both full suites. |

## Structure, accessibility, links, and identity

| Route | HTTP | Title | h1 |
| --- | ---: | --- | --- |
| `/` | 200 | Chore Receipt — record shared chores | Record chores when they get done |
| `/demo` | 200 | Demo — Chore Receipt | Shared chore board |
| `/log` | 200 | Receipt log — Chore Receipt | Every chore receipt |
| `/settings` | 200 | Household — Chore Receipt | Household and data |
| `/privacy` | 200 | Privacy — Chore Receipt | Your household data stays here |
| `/terms` | 200 | Terms — Chore Receipt | Terms for using Chore Receipt |
| `/review-7-missing` | 404 | Page not found — Chore Receipt | This page is missing. |

Each route has `lang="en"`, one h1, one main, a header, footer, description,
canonical, Open Graph/Twitter metadata, and favicon. Route changes, Back, and
Forward restore the expected URL, move focus to the new h1, and update the
polite announcer. All discovered navigation links resolved with 200 responses;
the 404's same-document skip link correctly remains on the 404 response.
`robots.txt`, `sitemap.xml`, the manifest, and the 1200×630 social card all
returned 200.

The production suite's seven-route Axe check found no serious or critical
violations. It also verifies the skip link, keyboard dialog behavior, visible
focus, 44 px controls, 390 px layout, and 200% text. Cold landing and demo
loads produced no console errors. The expected browser network error for the
deliberate HTTP 404 is not an application error.

The warm paper palette, clipped receipt shapes, serif/sans typography,
domestic paper-cut diorama, offset shadows, and restrained receipt motion form
a distinct household-record identity. It does not resemble the centered
gradient-and-feature-card SaaS template rejected by the site-structure rules.

## Missed leverage

No obvious brief-implied feature is missing. The product already provides CSV
export, JSON backup/import, and opt-in QR transfer, while plainly explaining
that copies do not sync. AI would add cost and data disclosure to a
deterministic local chore record without improving its core job. No decorative
AI, embedded provider key, analytics, remote font, payment path, or third-party
runtime script was found.

## What would make this perfect

Nothing remains to change for the reviewed scope. Preserve the current clean
claim commands, production route/accessibility suite, request-log checks, and
cold 390 px review for future releases.
