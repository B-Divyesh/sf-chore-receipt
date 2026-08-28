# Adversarial first-read review 4 — Chore Receipt

**Verdict: FAIL.** The first screen is clear, the core demo is realistic, and
all 11 declared claim commands pass. The release still has two blocking
findings: Reset leaves a false completion result on screen, and the README's
repeated assertion that every public claim is covered remains false. A shared
copy also cannot carry a chore removal despite telling people to scan again to
update another device.

- Reviewed: 2026-08-28 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository commit reviewed: `28290e0aa2797abdd03810e35e2e9159112dc074`
- Contexts: fresh Chromium at 390×844 and 1440×900; clean clone at
  `/tmp/chore-receipt-review4.6b62HE/repo`

## Findings

### Blocking

#### F-4-1 — Reset restores the records but leaves a false receipt result and stale Undo action

- **Exact quote/location:** After marking Water the plants done and selecting
  **Reset demo**, the live board still says “Receipt added for Water the
  plants. Next due Sep 2. Undo.” The reset handler is at `src/main.ts:536-541`;
  the stale `lastReceipt` state is rendered at `src/main.ts:351`.
- **Evidence:** The demo database changed from five receipts back to the four
  seeded receipts, but the notice and **Undo** button remained. Focus also fell
  back to the document because Reset replaces the controls without restoring
  focus or announcing completion. Neither `@claim:demo-isolation` nor
  `@claim:demo-discard` selects Reset.
- **Why this blocks:** Reset is mandatory demo behavior. A fresh sample that
  immediately reports a completion that no longer exists is a weak demo and
  gives contradictory evidence about what was reset.
- **Concrete fix:** Clear `lastReceipt` and demo-only session notices before
  rendering the seed, announce “Demo reset to four sample chores and four
  receipts,” and return focus to **Reset demo**. Add a declared
  `@claim:demo-reset` test that changes a chore, adds a receipt, resets, checks
  the exact seed in IndexedDB and the UI, confirms no stale notice or Undo
  remains, and confirms real data is unchanged.

#### F-1-15 — The README again overstates public-claim test coverage

- **Exact quote/location:** README lines 33–34: “Each public claim has a
  Playwright test that checks the promised result.”
- **Evidence:** `claims.json` has no entry for **Reset demo**, “A household
  record, not a scorecard,” or “Open the editable sample board.” The Reset
  behavior fails manually while all 11 declared claim commands pass. The
  re-import instruction discussed in F-4-2 is also absent as an observable
  claim. The existing copy-audit test checks wording and word counts, not those
  outcomes.
- **Why this blocks:** This is the same coverage-overstatement defect reported
  in review 1. It was marked fixed, but current public behavior again sits
  outside the claim registry and the untested Reset path is broken.
- **Concrete fix:** Fix F-4-1 and F-4-2, list each retained public claim in
  `claims.json`, give each exactly one outcome-level tagged test, and then keep
  this README sentence. Otherwise delete the sentence.

### High

#### F-4-2 — Scanning again does not propagate removed chores

- **Exact quote/location:** Landing, Household, and Privacy say “Scan or import
  again to update another device.” `merge()` starts with every destination
  chore and only adds or replaces incoming IDs (`src/main.ts:494-513`).
- **Evidence:** I imported the four-chore demo into a fresh recipient, removed
  Water the plants at the source, generated a new QR, and opened it on the
  recipient. The source had three chores; the recipient still had four and
  still showed Water the plants. The success notice said “Household copy
  added. Newer receipts were kept.” The `@claim:copies-no-sync` test checks that
  a new chore arrives on re-import, but never checks a removal.
- **Why this matters:** A household can keep acting on a retired chore and
  create receipts after being told that another scan updates the device. JSON
  “restore” uses the same merge path, so records absent from a backup also
  remain.
- **Concrete fix:** Either make re-import a confirmed replacement that mirrors
  current chores while preserving receipt history, or add deletion tombstones.
  If merge-only behavior is intentional, replace the instruction with “Scan
  again to add newer chores and receipts. Remove retired chores on each
  device,” and label backup import **Merge JSON backup**, not “restore.” Extend
  the declared tests with edit, removal, and destination-only-record cases.

### Minor

#### F-4-3 — “Not a scorecard” is an unlisted product claim

- **Exact quote/location:** Landing hero: “A household record, not a
  scorecard.”
- **Why this is a finding:** The absence of points, ranks, or person scoring is
  a meaningful promise from the brief. No `claims.json` entry or tagged test
  establishes it.
- **Concrete fix:** Add a `no-scoring` claim and a demo test that completes
  chores and verifies that the board and exported records contain no person,
  point, rank, or leaderboard fields. Keep the line after that test exists.

#### F-4-4 — “Editable sample board” is an unlisted claim

- **Exact quote/location:** Landing preview action: “Open the editable sample
  board →”.
- **Why this is a finding:** `demo-isolation` checks that the board opens and
  contains four chores, not that the sample can be edited. An untagged
  edit/remove regression exists, but the public claim has no claim entry with
  exactly one tagged test.
- **Concrete fix:** Broaden the declared demo claim to “opens a separate,
  editable sample board” and have its tagged test edit a chore and observe the
  result, or add a dedicated claim and tagged test.

#### F-4-5 — The 404 title and heading use a receipt metaphor

- **Exact quote/location:** `public/404.html`: title “Missing receipt — Chore
  Receipt,” eyebrow “Misfiled receipt,” and h1 “This paper slip is missing.”
- **Why this is a finding:** The route is visually designed and usable, but a
  page is missing, not a receipt. These labels violate the plain-words rule
  that headings and titles name the page without metaphor.
- **Concrete rewrite:** Use title **Page not found — Chore Receipt**, h1 **This
  page is missing**, and delete the eyebrow. Keep the paper treatment in the
  visual design.

#### F-4-6 — The board introduction changes “chore” to the vague “outcome”

- **Exact quote/location:** Board first screen: “Mark the outcome. The next due
  date follows completion.”
- **Why this is a finding:** “Outcome” does not name the action or object and
  breaks the otherwise consistent chore terminology.
- **Concrete rewrite:** “Mark a chore done. Its repeat interval sets the next
  due date.”

#### F-4-7 — Two action labels do not name their result

- **Exact quote/location:** Board link “View all” and post-completion button
  “Undo.”
- **Why this is a finding:** In a link or button list, neither label says what
  will open or be undone.
- **Concrete rewrite:** Use **View all receipts** and **Undo receipt**.

#### F-4-8 — The README explains isolation with implementation jargon

- **Exact quote/location:** README: “The demo uses its own browser database.”
- **Why this is a finding:** “Browser database” names an implementation detail,
  not the privacy result a visitor needs.
- **Concrete rewrite:** “The demo keeps its sample separate from your household
  data.”

## Cold first screen, before scrolling

| Viewport | What it does, in my words | For whom | What I would click first |
| --- | --- | --- | --- |
| 390×844 | Records completed shared chores and shows when each is due again. | Roommates and families who share recurring household work. | **Try it with sample data**. |
| 1440×900 | The same local chore board with completion receipts and next due dates. | Roommates and families sharing work. | **Try it with sample data**. |

All three answers are explicit before scrolling. The decisive text is “Record
chores when they get done,” “For roommates and families who share the work and
need to know what is due next,” and “Try it with sample data,” followed by “See
a working shared chore board.” This part passes.

## Copy audit

Counts treat a hyphenated term as one word and do not count a decorative arrow
as a word. Headings, action labels, accessible labels, and image descriptions
are included so contextless wording is visible. No sentence exceeds 22 words
and no banned marketing adjective appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Chore Receipt | 2 | Pass |
| Main navigation | 2 | Pass |
| Receipt log | 2 | Pass |
| Household | 1 | Pass |
| Privacy | 1 | Pass |
| A household record, not a scorecard | 6 | **F-4-3: unlisted claim** |
| Record chores when they get done | 6 | Pass |
| For roommates and families who share the work and need to know what is due next. | 16 | Pass |
| Try it with sample data | 5 | Pass — required demo action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | Pass — `offline-reload` |
| Stored on this device | 4 | Pass — `stored-device` |
| Free to use | 3 | Pass — `free` |
| Add your first chore | 4 | Pass |
| A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt. | 12 | Pass |
| Sample board preview | 3 | Pass |
| Sample chore board | 3 | Pass |
| This is Maple Street home. | 5 | Pass |
| It is a sample, not your data. | 7 | Pass — `demo-isolation` |
| Open the editable sample board | 5 | **F-4-4: unlisted claim** |
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
| Export or share a household copy only when you choose. | 10 | Pass — declared export/share/privacy claims |
| Household copies do not stay in sync. | 7 | Pass — `copies-no-sync` |
| Scan or import again to update another device. | 8 | **F-4-2: removal does not update** |
| Read the privacy details | 4 | Pass |
| A local record for recurring chores. | 6 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory (external) | 5 | Pass |
| v1.2.0 | 1 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass — document title |
| Record shared chores when they get done. | 7 | Pass |
| Chore Receipt is for roommates and families who share recurring work. | 11 | Pass |
| Try the sample at `/demo`; it opens a separate board with four household chores. | 14 | Pass — `demo-isolation` |
| Demo changes are deleted when you select Start for real. | 10 | Pass — `demo-discard` |
| What it does | 3 | Pass |
| Records a completion as a time-stamped receipt and calculates the next date. | 12 | Pass — `receipt-next-date` |
| Exports receipts as CSV and exports or imports a JSON backup from Household. | 13 | Pass — declared export claims |
| Shares an opt-in household copy with a QR code. | 9 | Pass — `qr-share` |
| The copy stays after the # in the link, which browsers do not send to this site. | 17 | Pass — `local-only` |
| Works offline after setup. | 4 | Pass — `offline-reload` |
| It is free to use. | 5 | Pass — `free` |
| Privacy | 1 | Pass |
| Chores, receipts, and the household name are stored in this browser. | 11 | Pass — `stored-device` |
| The demo uses its own browser database. | 7 | **F-4-8: jargon** |
| See `/privacy` and `/terms` in the app. | 7 | Pass |
| Develop and verify | 3 | Pass |
| Requires Node 20 or newer. | 5 | Pass — developer prerequisite |
| `npm ci` | 2 | Pass — command |
| `npm test` | 2 | Pass — command |
| `npm run build` | 3 | Pass — command |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 15 | Pass — verified build instruction |
| Each public claim has a Playwright test that checks the promised result. | 12 | **F-1-15: false coverage statement** |
| Deploy | 1 | Pass |
| Deploy `dist/` to the configured static host. | 7 | Pass — developer instruction |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass — verified developer description |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

The developer-only Node, build, deployment, and license statements were
verified against the clean clone and committed files; they are setup facts,
not visitor-facing product promises.

## Demo and sandbox

- One click from a clean landing opened `/demo` and immediately showed Maple
  Street home, four realistic chores, four dated receipts, due states, and
  completion controls.
- The persistent banner says “Demo — sample data, nothing is saved” and exposes
  **Reset demo** and **Start for real**.
- The demo used `chore-receipt-demo-v1`; a fresh context had no real database.
  In a second context I created “Private real chore,” changed the demo, then
  selected Start for real. The demo database was deleted and the real record
  remained exact.
- First-load and demo request logs contained only same-origin GET requests.
  The live `@claim:local-only` QR sender/recipient flow also passed with URL and
  request-body checks.
- After a true HTTP 404, offline `/log?demo=1` returned the cached app with
  status 200, title “Receipt log — Chore Receipt,” and h1 “Every chore receipt.”
- F-4-1 is the blocking Reset failure. Storage is reset, but the rendered state
  is not.

## Declared claims

I cloned the committed repository, ran `npm ci`, and ran every exact `test`
command from `.factory/claims.json` separately. All exited zero.

| Claim id | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `demo-discard` | PASS |
| `stored-device` | PASS |
| `offline-reload` | PASS |
| `csv-export` | PASS |
| `json-backup` | PASS |
| `local-only` | PASS |
| `qr-share` | PASS |
| `copies-no-sync` | PASS, incomplete removal coverage in F-4-2 |
| `receipt-next-date` | PASS |
| `free` | PASS |

The clean full suite passed 27/27 and `npm run build` produced `dist/`. The
initial JavaScript is 53.96 kB raw / 18.74 kB gzip. After building the local
artifact required by one repository-only cache assertion, the full live suite
also passed 27/27. The passing suite does not negate F-4-1, F-4-2, or the
unlisted claims because those outcomes are not asserted.

## Earlier finding verification

I read all three earlier reviews, all three polish records, and the current
handoff. Each earlier review finding was checked against the live site and
source/tests.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Fixed: a true 404 did not replace the cached shell; offline `/log` rendered. |
| F-1-2 | Fixed: Household is visible and at least 44 px high at 390 px. |
| F-1-3 | Fixed: corrupt-state recovery independently offers import and confirmed clearing. |
| F-1-4 | Fixed: click, Back, and Forward focus and announce the route h1. |
| F-1-5 | Fixed: chores can be edited and removed while receipts remain. |
| F-1-6 | Fixed: exact real household data survives reload in the real namespace. |
| F-1-7 | Fixed for the requested fresh-target case: JSON import restores exact exported data into an empty store. F-4-2 covers existing-store merge semantics. |
| F-1-8 | Fixed: QR request checks cover method, origin, URL, and body; live flow passed. |
| F-1-9 | Fixed: no-sync disclosure appears on Landing, Household, and Privacy. F-4-2 is the separate inaccurate update instruction. |
| F-1-10 | Fixed: all six live routes have distinct titles, descriptions, canonicals, and OG/Twitter fields. |
| F-1-11 | Fixed structurally: live 404 has the full skeleton and metadata. F-4-5 is a new plain-copy defect. |
| F-1-12 | Fixed: a blank household name explains the error and refocuses the input. |
| F-1-13 | Fixed: landing terminology consistently uses chore. |
| F-1-14 | Fixed: README explains the `#` behavior without “URL fragment” or “host.” |
| F-1-15 | **Repeated, BLOCKING:** the coverage assertion is again false; see F-1-15 above. |
| F-1-16 | Fixed: the untestable generated-art originality statement remains absent. |
| F-1-17 | Fixed: the external footer link has visible and accessible external cues. |
| F-1-18 | Fixed: the 50-unit rendered landing audit now includes duplicate occurrences and exact sentence counts, and its live regression passed. |
| F-2-1 | Fixed: a labelled sample chore board appears before the explanation. |
| F-2-2 | Fixed: **Export JSON backup** is explicit and appears beside import. |
| F-3-1 | Fixed: “Keep the outcome. Skip the blame.” is gone. |
| F-3-2 | Fixed: the preview h2 is “Sample chore board.” |
| F-3-3 | Fixed: preview and board queues use “Current chores.” |
| F-3-4 | Fixed: the explanatory h2 names how receipts set the next due date. |

The additional polish-record checks also pass: first Tab reaches the visible
skip link, the demo database is deleted by Start for real, 200% text at 390 px
does not overflow, the copy audit waits for rendered content, hashed assets are
immutable, and `sw.js` revalidates.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/log`, `/settings`, `/privacy`, and `/terms` returned 200.
  A random missing path returned the designed 404.
- Every real route has one h1, one main, a header, footer, route-specific title,
  description, canonical, OG/Twitter data, SVG favicon, and apple-touch icon.
  The social image is 1200×630. `robots.txt` and `sitemap.xml` list the routes.
- Internal links and assets returned 200; the external Param Factory link
  resolved to 200 and is identified as external.
- Route clicks, Back, and Forward restore the correct URL, focus the new h1,
  and update the polite live region.
- The factory URL verifier reported `lang="en"`, one h1, one main, alt text,
  labelled buttons, and no console errors. The live Axe route suite reported no
  serious or critical violations. Focus styles, 44 px targets, and reduced
  motion are present.
- The warm paper, clipped receipts, domestic diorama, serif/sans pairing, and
  moss/clay palette match `.factory/design.md` and are visually distinct from
  a generic SaaS template.
- F-4-5, F-4-6, and F-4-7 are the remaining structural/plain-copy defects.

## Missed leverage

No AI feature is warranted. The job is deterministic, local, and privacy
sensitive; adding a model would add cost and disclosure without improving the
core record. CSV export, JSON backup/import, and opt-in QR transfer cover the
obvious ownership and transfer needs. The missed leverage is not another
feature: it is making existing re-import semantics honest and complete, as in
F-4-2. No provider key, analytics, remote font, payment path, or third-party
runtime script was found.

## What would make this perfect

Make Reset clear every transient demo result, restore focus, announce the
reset, and cover the whole outcome with a declared claim test. Decide whether
QR/JSON re-import replaces or merges, then make removal behavior, copy, and
tests agree. Register the no-score and editable-demo promises, remove the 404
metaphor, replace “outcome,” name the receipt actions, and simplify the README
privacy sentence. Re-run every declared claim command, the full clean and live
suites, the removal propagation path, mobile cold read, request log, offline
404 sequence, route crawl, and copy audit. Only then is there nothing left to
do.
