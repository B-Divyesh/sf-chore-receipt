# Adversarial first-read review 1 — Chore Receipt

**Verdict: FAIL.** Two blocking defects remain, along with high, medium, and
minor findings. The product is clear on first read and its normal demo path is
useful, but it is not complete on a phone and its offline claim fails after a
handled 404.

- Reviewed: 2026-08-28 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository base: `61751991bc9835d2260c04bee33289f07637cc88`
- Viewports: 390×844 and 1440×900, fresh Chromium contexts

## Findings

### Blocking

#### F-1-1 — A 404 poisons the offline app shell

- **Exact claim/location:** “Works offline after setup” on the landing page and
  README; generated service-worker fetch handler in `vite.config.ts:15`.
- **Evidence:** In a fresh live context I opened `/demo`, waited for service
  worker control, then opened `/missing-poison`. The worker cached that HTTP
  404 response under `/`. After network interception set the context offline,
  a fresh `/log?nonce=…` navigation returned status 404 with title “Missing
  receipt — Chore Receipt” and h1 “This paper slip is missing.” The cached `/`
  response itself had status 404. The worker currently caches every navigation
  response as `/` without checking `response.ok`.
- **Why this fails a visitor:** One mistyped or stale link can replace the
  offline shell. A later offline visit then contradicts the prominent offline
  claim.
- **Concrete fix:** Cache a navigation response as `/` only when it is an OK
  app-shell response (and preferably only when its content is the app entry
  document). Keep the last known-good shell on 404/5xx. Add an
  `@claim:offline-reload` case that visits a true 404 before disabling the
  network, then verifies `/demo` and `/log` still render the app.

#### F-1-2 — The phone layout hides the only Household route

- **Exact location:** `src/style.css:10` contains
  `nav a:nth-child(2) { display:none }`; the second header link from
  `src/main.ts:133` is “Household.” On the live 390 px landing and demo, the
  visible header contains only “Receipt log” and “Privacy.”
- **Why this fails a visitor:** On the target phone viewport there is no
  visible path to household naming, QR sharing, or JSON import. Those are core
  brief features, not optional administration.
- **Concrete fix:** Keep Household visible at 390 px, or provide an equally
  clear compact menu that exposes every route by keyboard and touch. Add a
  mobile test that navigates to `/settings` through visible UI rather than
  opening the URL directly.

### High

#### F-1-3 — The advertised corrupt-data recovery route cannot open

- **Exact quote/location:** The error state in `src/main.ts:108` says “Import a
  valid backup from Household” and offers “Open Household.”
- **Evidence:** I placed an invalid `current` record in the live real IndexedDB
  store and reloaded. The error appeared. Selecting “Open Household” changed
  the URL to `/settings`, but initialization read the same invalid record and
  rendered the same error again. There was no import control, header, footer,
  or clear-data action.
- **Why this fails a visitor:** The only offered recovery action loops back to
  the failure and cannot perform the recovery it names.
- **Concrete fix:** Make the recovery screen independent of the invalid store.
  Provide a working backup import and an explicit, confirmed “Clear local
  chore data” action there. Preserve the invalid database until the visitor
  chooses. Add a regression that corrupts the store and completes both
  recovery paths.

#### F-1-4 — SPA route changes neither move focus nor announce the page

- **Exact location:** `src/main.ts:160-166` calls `h1.focus()` on a heading
  without `tabindex`; `src/main.ts:198` handles Back with `render()` only. The
  live `.announcer` stays empty.
- **Evidence:** After selecting “Receipt log” in the live demo, and again after
  Back, `document.activeElement` was `<body>`, not the new h1. URLs and visual
  content changed correctly.
- **Why this fails a visitor:** Keyboard and screen-reader users receive no
  reliable indication that navigation completed or what page opened.
- **Concrete fix:** Give the route h1 `tabindex="-1"` (or focus `main`), move
  focus after pushState and popstate renders, update the polite live region,
  and test click, Back, and Forward focus/announcement behavior.

#### F-1-5 — Chores cannot be corrected or removed

- **Exact location:** The board in `src/main.ts:143` provides “Mark done” but no
  edit or remove action; the Household page does not manage chores either.
- **Why this fails a visitor:** A typo, changed recurrence, moved-out roommate,
  or retired chore remains on the recurring board forever. A usable recurring
  list must support ordinary corrections.
- **Concrete fix:** Add per-chore “Edit chore” and “Remove chore” actions. Let
  visitors change the title and repeat interval; confirm removal while keeping
  historical receipts readable. Cover both actions in the real and demo stores.

### Medium

#### F-1-6 — `stored-device` does not test the promised real-data outcome

- **Exact claim/test:** “Stored on this device”; `tests/app.spec.ts:5-17`.
- **Why this is untested:** The shared test sees four demo rows and confirms a
  newly opened real store has no `current` value. It never asserts that a
  visitor-created real chore, receipt, or household name survives reload in
  the real namespace.
- **Concrete fix:** Create and rename real data, reload in the same fresh
  context, and assert the exact values remain. Keep the existing namespace
  isolation assertion as a separate demo check.

#### F-1-7 — `json-backup` does not prove that import restores data

- **Exact claim/test:** “Export and import a JSON backup”;
  `tests/app.spec.ts:68-76`.
- **Why this is untested:** The test exports the seeded demo, imports the same
  file into the unchanged demo, and asserts only the success message. A no-op
  importer could pass.
- **Concrete fix:** Export known data, clear or change the destination, import
  into a fresh namespace, and assert the household, chores, and receipts are
  restored with their values and dates.

#### F-1-8 — `local-only` does not inspect request bodies

- **Exact claim/test:** “Household data is not sent to the host”;
  `tests/app.spec.ts:78-96`.
- **Why this is under-tested:** It checks same-origin requests and rejects
  `join=` in request URLs, but never checks method or request body. Same-origin
  requests are requests to the host, so the assertion would miss a POST of the
  household payload. My live manual flow happened to contain only GETs and no
  bodies, but the regression would not protect that property.
- **Concrete fix:** Intercept the whole sender and recipient flow; assert no
  request URL or body contains the encoded packet or known sample fields, and
  assert the expected request methods/origins.

#### F-1-9 — “Shared” never states that copies do not stay in sync

- **Exact locations:** “A shared record for recurring chores” in the footer and
  “Share a household copy” on `/settings`.
- **Why this can mislead:** The product copies a household through a QR link;
  later changes on either device do not synchronize. “Copy” hints at this, but
  the landing page’s required “what it does not do” section never says it.
- **Concrete fix:** Add: “Household copies do not stay in sync. Scan or import
  again to update another device.” Repeat that beside the QR action.

#### F-1-10 — Route metadata stays attached to the landing page

- **Exact evidence:** Live `/demo`, `/log`, `/settings`, `/privacy`, and
  `/terms` all retain canonical `/`, OG title “Chore Receipt — log shared
  chores,” and the landing description. `index.html:13` supplies only
  `twitter:card`; `twitter:title`, `twitter:description`, and `twitter:image`
  are absent.
- **Why this matters:** Shared or indexed deep links identify themselves as the
  landing page instead of the actual route.
- **Concrete fix:** Update canonical, description, OG, and complete Twitter
  metadata per route, ideally in route-specific HTML that crawlers receive.
  Add metadata assertions for every sitemap route.

#### F-1-11 — The designed 404 drops the standard site skeleton and metadata

- **Exact location:** `public/404.html`.
- **Evidence:** `/not-a-page` correctly returns 404 and has a styled paper-slip
  recovery link, but it has no header, footer, skip link, description,
  canonical, OG, favicon, or theme color.
- **Why this matters:** It looks related to the product but loses the consistent
  navigation, legal links, provenance, and metadata required on every route.
- **Concrete fix:** Keep the current paper-slip treatment, add the standard
  header/footer/skip link, and add route-appropriate metadata and icons.

#### F-1-12 — A blank household name fails silently

- **Exact location:** “Save household name” on `/settings`;
  `src/main.ts:185` ignores blank input.
- **Evidence:** Entering spaces and selecting Save leaves the spaces in the
  field, keeps focus on the button, and produces no status or error text.
- **Why this fails a visitor:** There is no explanation of what happened or how
  to recover.
- **Concrete fix:** Focus the input and announce “Enter a household name before
  saving.” Bind the message with `aria-describedby` and add a keyboard test.

### Minor

#### F-1-13 — Landing terminology changes from “chore” to “task”

- **Exact quote:** “Each task repeats from completion.”
- **Why this is a copy defect:** Every other product surface names the record a
  “chore.”
- **Concrete rewrite:** “Each chore repeats from completion.”

#### F-1-14 — The README explains privacy with browser jargon

- **Exact quote:** “Its data stays in the URL fragment and is not sent to the
  host.”
- **Why this is a copy defect:** “URL fragment” and “host” require web knowledge.
- **Concrete rewrite:** “The QR copy stays after the # in the link, which
  browsers do not send to this site.”

#### F-1-15 — The README uses jargon and overstates claim-test coverage

- **Exact quote:** “Each public product claim is listed in
  `.factory/claims.json` and has an outcome-level Playwright regression test.”
- **Why this is a copy/claims defect:** “Outcome-level regression” is jargon,
  and F-1-6 through F-1-8 show that three tests do not yet establish their full
  promised outcomes. The assertion is also absent from `claims.json`.
- **Concrete rewrite after fixing the tests:** “Each public claim has a
  Playwright test that checks the promised result.” Otherwise remove the
  sentence.

#### F-1-16 — The landing page has an unlisted originality claim

- **Exact quote:** “Generated art is original to this product.”
- **Why this is a finding:** It is a provenance statement a visitor can rely
  on, but it has no `claims.json` entry. The source prompt and provenance are
  documented in `.factory/design.md`, but no declared test covers the public
  sentence.
- **Concrete fix:** Remove the public claim and keep provenance in the design
  record, or add a narrowly testable provenance claim tied to the committed
  source asset and generation record. Do not claim originality if it cannot be
  tested.

#### F-1-17 — The external footer link is not identified as external

- **Exact location:** “Built by Param Factory” links to
  `https://sociobot.in/` in `src/main.ts:135`.
- **Why this matters:** Every other crawled link is same-origin; the label gives
  no notice that this one leaves the product.
- **Concrete fix:** Use “Built by Param Factory (external)” or add an accessible
  external-link cue. Keep the current `rel="noopener"`.

#### F-1-18 — The committed copy audit is stale and miscounted

- **Exact location:** `.factory/copy-audit.md` lists removed sentences such as
  “No accounts,” omits current sentences such as “Add chores the household
  repeats,” and counts “Stored on this device” as five words instead of four.
- **Why this matters:** The proof artifact no longer describes the live copy,
  so future checks can pass against the wrong text.
- **Concrete fix:** Regenerate the audit from current rendered copy and add a
  small test or script that fails when audited text diverges.

## Cold first screen, before scrolling

| Viewport | What it does, in my words | For whom | What I would click first |
| --- | --- | --- | --- |
| 390×844 | Records completed household chores and shows what is due next. | Roommates and families sharing recurring household work. | “Try it with sample data.” |
| 1440×900 | The same: a neutral chore completion record with next due dates. | Roommates and families. | “Try it with sample data.” |

All three answers are available without inference from these exact first-screen
lines: “Record chores when they get done,” “For roommates and families who
share the work and need to know what is due next,” and “Try it with sample
data,” followed by “See a working shared chore board.” This part is not
blocking. The 390 px first screen also shows all three short facts and “Add
your first chore.”

## Copy audit

Counts treat hyphenated terms and paths as one word. Navigation labels,
version text, and code blocks are not sentences; action labels and headings are
included so their clarity is explicit. No sentence exceeds 22 words. No banned
marketing adjective appears. Landing action labels name a result or use the
required sample-data wording.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| A household record, not a scorecard | 6 | Pass |
| Record chores when they get done | 6 | Pass |
| For roommates and families who share the work and need to know what is due next. | 16 | Pass |
| Try it with sample data | 5 | Pass — required sample action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | **F-1-1: claim fails after 404 poisoning** |
| Stored on this device | 4 | **F-1-6: claim test is incomplete** |
| Free to use | 3 | Pass |
| Add your first chore | 4 | Pass — result-naming action |
| Keep the outcome. | 3 | Pass |
| Skip the blame. | 3 | Pass |
| How it works | 3 | Pass |
| One receipt, then a clear next date | 7 | Pass |
| Keep a shared list. | 4 | Pass |
| Add chores the household repeats. | 5 | Pass |
| Tap “Mark done.” | 3 | Pass |
| The time becomes a receipt. | 5 | Pass |
| Check what is due. | 4 | Pass |
| Each task repeats from completion. | 5 | **F-1-13: inconsistent term** |
| Keep your household record private | 5 | Pass |
| Export or share a household copy only when you choose. | 10 | Pass |
| Read the privacy details | 4 | Pass — result-naming link |
| A shared record for recurring chores. | 6 | **F-1-9: no no-sync disclosure** |
| Generated art is original to this product. | 7 | **F-1-16: unlisted claim** |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass — document title |
| Record shared chores when they get done. | 7 | Pass |
| Chore Receipt is for roommates and families who share recurring work. | 11 | Pass |
| Try the sample at `/demo`; it opens a separate board with four household chores. | 14 | Pass |
| Demo changes are deleted when you select **Start for real**. | 10 | Pass |
| What it does | 3 | Pass |
| Records a completion as a time-stamped receipt and calculates the next date. | 12 | Pass |
| Exports receipts as CSV and exports or imports a JSON backup. | 11 | **F-1-7: import outcome not proved** |
| Shares an opt-in household copy with a QR code. | 9 | Pass |
| Its data stays in the URL fragment and is not sent to the host. | 14 | **F-1-8 and F-1-14** |
| Works offline after setup. | 4 | **F-1-1** |
| It is free to use. | 5 | Pass |
| Privacy | 1 | Pass — heading |
| Chores, receipts, and the household name are stored in this browser. | 11 | **F-1-6** |
| The demo uses its own browser database. | 7 | Pass |
| See `/privacy` and `/terms` in the app. | 7 | Pass |
| Develop and verify | 3 | Pass — heading |
| Requires Node 20 or newer. | 5 | Pass — developer prerequisite |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 15 | Pass — developer instruction |
| Each public product claim is listed in `.factory/claims.json` and has an outcome-level Playwright regression test. | 15 | **F-1-15** |
| Deploy | 1 | Pass — heading |
| Deploy `dist/` to the configured static host. | 7 | Pass — developer instruction |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass — developer instruction |
| License | 1 | Pass — heading |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

The README’s CSV, JSON, QR, Node, Playwright, and deployment terms are retained
where they name concrete formats or developer tools. The two phrases flagged
as jargon can be replaced without losing precision. There are no nonsensical
headings and no non-result-naming landing buttons.

## Demo and sandbox

The normal demo path passes:

- One click from the cold landing opens `/demo`.
- The first demo screen already shows “Shared chore board,” Maple Street home,
  four realistic chores, due states, completion controls, and four receipts.
- The persistent banner says “Demo — sample data, nothing is saved” and exposes
  Reset demo and Start for real.
- Marking Water the plants done raised the demo receipt count from four to
  five. Reset returned it to four.
- I first created “Private real chore” in the real store. After changing and
  resetting the demo, Start for real removed `chore-receipt-demo-v1` and the
  real chore remained unchanged in `chore-receipt-real-v1`.
- The QR sender/recipient flow made only same-origin GET requests. No request
  URL or body contained the household packet. The link used `#join=`.
- A normal controlled `/demo` reload worked offline. F-1-1 records the separate
  failed-navigation poisoning case.

The demo is therefore present and genuinely tryable; there is no demo-specific
blocking finding.

## Claims

I cloned the repository to a fresh temporary directory, ran `npm ci`, then ran
every exact command declared in `.factory/claims.json`. All exited zero:

| Claim id | Declared command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `demo-discard` | `npm test -- --grep @claim:demo-discard` | PASS |
| `stored-device` | `npm test -- --grep @claim:stored-device` | PASS, coverage gap F-1-6 |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, live adversarial failure F-1-1 |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS |
| `json-backup` | `npm test -- --grep @claim:json-backup` | PASS, coverage gap F-1-7 |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, coverage gap F-1-8 |
| `qr-share` | `npm test -- --grep @claim:qr-share` | PASS |
| `receipt-next-date` | `npm test -- --grep @claim:receipt-next-date` | PASS |
| `free` | `npm test -- --grep @claim:free` | PASS |

The full clean-clone suite passed 16/16, and `npm run build` produced `dist/`.
The JavaScript bundle was 45.07 kB raw / 16.95 kB gzip. “Generated art is
original to this product” is the one live/landing product claim with no
`claims.json` entry (F-1-16). The README’s broad claim-test assertion is also
unlisted and currently overstated (F-1-15). No declared command itself failed;
F-1-1 was found by exercising the claim beyond its too-narrow regression.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The earlier handoff names three repaired findings; each was checked live and in
source:

| Earlier item | Result and evidence |
| --- | --- |
| Demo teardown | Confirmed fixed: real data survived, Reset restored four receipts, Start for real removed the demo database. |
| Response cache policy | Confirmed fixed: live hashed JS is `max-age=31536000, immutable`; `/sw.js` is `max-age=0, must-revalidate`. F-1-1 is a different runtime cache-content defect. |
| 390 px text and targets | Confirmed fixed: `/` and `/demo` had no target below 44×44 px, no horizontal overflow, and no clipped action at 200% text. F-1-2 concerns a deliberately hidden route, not target size. |

No earlier finding is being repeated under its prior identity.

## Structure, links, accessibility, and identity

What passed:

- `/`, `/demo`, `/log`, `/settings`, `/privacy`, and `/terms` deep links return
  200 and render their correct route h1 and title after initialization.
- `/not-a-page` returns a real HTTP 404 with a styled paper-slip recovery page.
- Every crawled link returned 200, apart from the intentional 404 test; no dead
  product links were found.
- Normal routes have one h1, one main, `lang=en`, a skip link, header, footer,
  complete image alt text, visible focus styling, and no load-time console
  error.
- `/opt/fleet/lib/verify-url.sh` passed the live root (670 ms; no errors).
  Axe 4.13 found zero violations on all six product routes and the 404.
- Reduced-motion CSS exists. Live 390 px target and 200% text checks passed.
- The 1200×630 social card, SVG favicon, 180×180 apple icon, robots file,
  sitemap, manifest, CSP, HSTS, referrer policy, and `nosniff` header are present.
- The paper-cut diorama, warm paper palette, clipped receipts, serif/sans
  pairing, and restrained press motion are distinct to this product. It does
  not read as a generic gradient SaaS template. Asset provenance is recorded
  in `.factory/design.md`.

Failures are F-1-2, F-1-4, F-1-10, F-1-11, and F-1-17 above.

## Missed leverage

F-1-5 is the obvious missing product capability: edit or remove a recurring
chore while preserving its receipts. The brief already includes CSV/JSON
ownership export and a QR copy, and both exist. Automatic sync would conflict
with the stated static, local-first, no-account scope; the honest improvement
is the no-sync disclosure in F-1-9, not a hidden backend. An AI step would add
cost and data movement to a simple household record without improving its core
job, so no AI feature is recommended. No provider or gateway keys are embedded.

## What would make this perfect

Resolve every finding above: protect the cached app shell from failed
navigations; expose Household on phones; make corrupt-data recovery real; make
SPA navigation focus and announce correctly; support edit/remove; strengthen
the three claim tests; state the no-sync boundary; complete per-route metadata
and the 404 skeleton; report blank-name errors; apply the three copy rewrites;
remove or register the originality statement; identify the external footer
link; and regenerate the committed copy audit. Then rerun every claim command,
the full suite/build, the live 404-poison offline scenario, mobile navigation,
route focus/Back/Forward, link crawl, verify-url, and axe. A PASS requires all
of those checks to finish with zero findings.
