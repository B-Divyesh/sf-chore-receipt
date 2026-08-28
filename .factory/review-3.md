# Adversarial first-read review 3 — Chore Receipt

**Verdict: FAIL.** The real job is clear and the product is functional, but
the release has one repeated blocking proof defect and four copy defects. A
PASS requires zero findings.

- Reviewed: 2026-08-28 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository commit reviewed: `40424eacfd3da8b330ecdd9a7b10cc5301e67fc2`
- Contexts: fresh Chromium at 390×844 and 1440×900; fresh local clone at
  `/tmp/chore-receipt-review3.b26nhh/repo`

## Findings

### Blocking

#### F-1-18 — The committed landing copy audit is again incomplete and does not count each sentence

- **Exact location:** `.factory/copy-audit.md:17` combines “Keep the
  outcome. Skip the blame.” into one six-word row; line 20 combines “This is
  Maple Street home. It is a sample, not your data.” into one twelve-word row;
  lines 8–40 omit current rendered copy including “Read the privacy details”
  and the footer line “A local record for recurring chores.” The file claims
  at lines 3–4 that it matches rendered text and that each count is accurate.
- **Why this remains blocking:** The plain-words contract requires every
  landing sentence with its own word count. This evidence artifact cannot
  establish that: two distinct sentences have a combined count and several
  rendered strings are absent. It is therefore the same half-fixed finding as
  review 1, not a new documentation preference.
- **Concrete fix:** Generate the audit from the rendered landing page. Give
  every sentence or visible copy unit its own row, including header/footer and
  action labels; split the two rows above into `3 + 3` and `5 + 7`; and make
  the existing regression test compare that complete record with the page.

### Minor

#### F-3-1 — The hero caption is a slogan rather than product information

- **Exact quote/location:** “Keep the outcome. Skip the blame.” in the hero
  figure caption (`src/main.ts:318`; live landing).
- **Why this fails:** It does not say what a visitor can do, what will happen,
  or what the illustration shows. On a first phone read it consumes the only
  explanatory caption with a mood statement.
- **Concrete fix:** Delete it. The image alt text already describes the art;
  if a caption is needed, use “A shared kitchen chore record.”

#### F-3-2 — The sample-board heading does not name the section

- **Exact quote/location:** “See a chore receipt at work” is the sample
  preview `<h2>` (`src/main.ts:322`; live landing).
- **Why this fails:** A screen-reader heading list gives no section name or
  outcome. The nearby kicker says “Sample board preview,” but a heading must
  work without relying on a preceding decorative label.
- **Concrete fix:** Replace the heading with “Sample chore board” or “Sample
  chores and receipts.”

#### F-3-3 — “Ready for anyone” is a contextless status heading

- **Exact quote/location:** “Ready for anyone” is the preview `<h3>`
  (`src/main.ts:322`) and the board queue heading (`src/main.ts:351`).
- **Why this fails:** It does not tell a first-time visitor whether these are
  current chores, due chores, or tasks available to complete. The adjacent
  “2 due now” does not repair the heading when headings are read alone.
- **Concrete fix:** Replace it everywhere with “Current chores” (or “Chores
  due now” if the list intentionally contains only due chores).

#### F-3-4 — The how-it-works heading is a slogan-like phrase, not a section name

- **Exact quote/location:** “One receipt, then a clear next date” in the
  landing how-it-works `<h2>` (`src/main.ts:318`; live landing).
- **Why this fails:** “One receipt” is not a named action or section and
  “clear” is an unsupported adjective. A visitor can infer the intent only by
  reading the three items below it.
- **Concrete fix:** Replace it with “How chore receipts set the next due
  date.” Keep the three concrete steps below it.

## Cold first screen, before scrolling

| Viewport | What it does in my words | For whom | What I would click first |
| --- | --- | --- | --- |
| 390×844 | Records completed shared chores and shows when each is due again. | Roommates and families sharing recurring household work. | “Try it with sample data.” |
| 1440×900 | The same local shared chore record with receipts and next due dates. | Roommates and families. | “Try it with sample data.” |

This is **not** a first-read blocking failure. The first screen explicitly
states “Record chores when they get done,” names the audience, and places the
one-click demo action next to “See a working shared chore board.”

## Copy audit

Counts treat hyphenated terms, paths, and labels as one word. Headings and
action labels are included because they are heard/read as copy. No item below
exceeds 22 words. `F-3-1` through `F-3-4` are the only plain-words flags; the
README has no additional plain-language finding.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Chore Receipt | 2 | Pass |
| Receipt log | 2 | Pass |
| Household | 1 | Pass |
| Privacy | 1 | Pass |
| A household record, not a scorecard | 6 | Pass — useful scope distinction |
| Record chores when they get done | 6 | Pass |
| For roommates and families who share the work and need to know what is due next. | 16 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | Pass — declared claim |
| Stored on this device | 4 | Pass — declared claim |
| Free to use | 3 | Pass — declared claim |
| Add your first chore | 4 | Pass — result-naming action |
| Keep the outcome. | 3 | F-3-1 |
| Skip the blame. | 3 | F-3-1 |
| Sample board preview | 3 | Pass |
| See a chore receipt at work | 6 | F-3-2 |
| This is Maple Street home. | 5 | Pass |
| It is a sample, not your data. | 7 | Pass |
| Open the editable sample board | 5 | Pass — result-naming action |
| Maple Street home | 3 | Pass |
| Ready for anyone | 3 | F-3-3 |
| 2 due now | 3 | Pass — sample status |
| Clean the bathroom | 3 | Pass |
| 1 day overdue · repeats every 7 days | 8 | Pass — sample status |
| Water the plants | 3 | Pass |
| Due in 3 days · repeats every 5 days | 9 | Pass — sample status |
| Done Aug 26 · next Aug 31 | 7 | Pass — sample receipt |
| How it works | 3 | Pass |
| One receipt, then a clear next date | 7 | F-3-4 |
| Keep a shared list. | 4 | Pass |
| Add chores the household repeats. | 5 | Pass |
| Tap “Mark done.” | 3 | Pass |
| The time becomes a receipt. | 5 | Pass |
| Check what is due. | 4 | Pass |
| Each chore repeats from completion. | 5 | Pass — declared claim |
| Keep your household record private | 5 | Pass |
| Export or share a household copy only when you choose. | 10 | Pass — declared claims |
| Household copies do not stay in sync. | 7 | Pass — declared claim |
| Scan or import again to update another device. | 8 | Pass — declared claim |
| Read the privacy details | 4 | Pass — result-naming action |
| A local record for recurring chores. | 6 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass — marked external in accessible text |
| external | 1 | Pass — external cue |
| v1.2.0 | 1 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass |
| Record shared chores when they get done. | 7 | Pass |
| Chore Receipt is for roommates and families who share recurring work. | 11 | Pass |
| Try the sample at `/demo`; it opens a separate board with four household chores. | 14 | Pass — declared claim |
| Demo changes are deleted when you select Start for real. | 10 | Pass — declared claim |
| What it does | 3 | Pass |
| Records a completion as a time-stamped receipt and calculates the next date. | 12 | Pass — declared claim |
| Exports receipts as CSV and exports or imports a JSON backup from Household. | 13 | Pass — declared claims |
| Shares an opt-in household copy with a QR code. | 9 | Pass — declared claim |
| The copy stays after the # in the link, which browsers do not send to this site. | 17 | Pass — declared claim |
| Works offline after setup. | 4 | Pass — declared claim |
| It is free to use. | 5 | Pass — declared claim |
| Privacy | 1 | Pass |
| Chores, receipts, and the household name are stored in this browser. | 11 | Pass — declared claim |
| The demo uses its own browser database. | 7 | Pass — declared claim |
| See `/privacy` and `/terms` in the app. | 7 | Pass |
| Develop and verify | 3 | Pass |
| Requires Node 20 or newer. | 5 | Pass |
| npm ci | 2 | Pass |
| npm test | 2 | Pass |
| npm run build | 3 | Pass |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 16 | Pass |
| Each public claim has a Playwright test that checks the promised result. | 12 | Pass |
| Deploy | 1 | Pass |
| Deploy `dist/` to the configured static host. | 7 | Pass |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

All visitor-facing product claims on the landing and README map to
`.factory/claims.json`; no unlisted claim was found. The product consistently
uses *chore*, *receipt*, *household*, *demo*, and *household copy*.

## Demo, claims, privacy, and sandbox

- The cold landing action opened `/demo` in one click. The first demo screen
  already showed “Maple Street home,” four realistic chores, four dated
  receipts, due status, and completion controls.
- The persistent banner said “Demo — sample data, nothing is saved” and
  exposed **Reset demo** and **Start for real**. Completing Water the plants,
  resetting, and then starting for real restored four demo receipts and opened
  an empty real board without the banner.
- Fresh live request logging during landing-to-demo recorded only same-origin
  GETs for the document, JS, CSS, and art. The declared QR-flow test also
  asserts URL and body privacy. No analytics, remote assets, accounts,
  payments, product API, AI feature, or embedded provider key was found.
- A fresh live `/demo` visit obtained service-worker control. After a true
  404, the cached shell remained HTTP 200; with the context offline, `/log`
  rendered “Every chore receipt.” The deliberate 404 produced the expected
  browser failed-resource console message and no other error.
- From the clean clone I ran `npm ci`, each exact command listed in
  `.factory/claims.json`, the complete single-worker suite, and `npm run
  build`. The declared claim commands passed (11/11), the suite passed
  (26/26), and the build produced `dist/`.

| Claim id | Result |
| --- | --- |
| demo-isolation | PASS |
| demo-discard | PASS |
| stored-device | PASS |
| offline-reload | PASS |
| csv-export | PASS |
| json-backup | PASS |
| local-only | PASS |
| qr-share | PASS |
| copies-no-sync | PASS |
| receipt-next-date | PASS |
| free | PASS |

## Earlier findings and structure

I read every earlier review, polish record, verification record, and handoff.
All prior functional and structural findings verify as fixed on the live site
and in source/tests: mobile Household navigation, recovery, edit/remove,
real-store persistence, JSON restore, QR request-body privacy, no-sync
disclosure, route-specific metadata, the full 404 skeleton, blank-name errors,
external-link cue, landing preview, and explicit JSON backup controls. The
exception is the repeated `F-1-18` above.

`/`, `/demo`, `/log`, `/settings`, `/privacy`, and `/terms` returned 200;
`/not-a-page` returned the intended 404. The app has a route-specific title,
description, canonical, OG/Twitter metadata, favicon, one `h1`, and one
`main`; `robots.txt`, `sitemap.xml`, Privacy, Terms, back/forward focus, and
the designed paper-receipt 404 were present. The warm paper-cut board is a
distinct product identity, not a generic SaaS template. The brief does not
imply a missing AI feature: this local record already has the relevant CSV,
JSON, and opt-in QR transfer functions.

## What would make this perfect

Repair the audit so it is complete and mechanically verified, remove the hero
slogan, and rename the three contextless headings as specified above. Then
repeat the clean-clone claim commands, full tests/build, mobile cold read,
demo isolation/reset, offline/privacy request checks, route crawl, and copy
audit. With zero remaining findings, this can pass.
