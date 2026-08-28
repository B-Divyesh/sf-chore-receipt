# Adversarial first-read review 5 — Chore Receipt

**Verdict: FAIL.** The cold first read, editable isolated demo, product
behaviour, claims, prior repairs, and visual identity verify. One minor
structure/security finding remains. A PASS requires zero findings.

- Reviewed: 2026-08-28 UTC
- Live site: <https://chore-receipt.sociobot.in>
- Repository reviewed: `817013bcadecd05429c60370a89aaef993eb1f42`
- Contexts: fresh Chromium at 390x844 and 1440x900; fresh clean clone at
  `/tmp/chore-receipt-review5.GbH45h/repo`

## Finding

### Minor

#### F-5-1 — The site does not send a frame-ancestors protection header

- **Exact location:** live `GET /` and `GET /not-found-review5` responses.
  Their `Content-Security-Policy` is:
  `default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; base-uri 'self'; form-action 'self'`.
  `public/staticwebapp.config.json` has the same directive list.
- **Why this is a finding:** the required site structure requires
  `frame-ancestors` to be sent as a response header. This deployment sends a
  response CSP, but it does not say which sites may embed the app. The omission
  affects the landing page and the designed 404 alike.
- **Concrete fix:** add `frame-ancestors 'self'` (or the intentionally chosen
  embedding policy) to `globalHeaders.Content-Security-Policy` in
  `public/staticwebapp.config.json`; keep it as a response header, not a meta
  tag. Add a test that fetches `/` and a missing route and asserts the response
  CSP contains that directive.

## Cold first screen, before scrolling

| Viewport | What it does, in my words | For whom | What I would click first |
| --- | --- | --- | --- |
| 390x844 | It records completed household chores and shows when each is due again. | Roommates and families sharing recurring work. | **Try it with sample data**. |
| 1440x900 | The same shared chore record with completion receipts and next dates. | Roommates and families sharing recurring work. | **Try it with sample data**. |

This is not a blocking first-read failure. The first screen explicitly says
“Record chores when they get done,” “For roommates and families who share the
work and need to know what is due next,” and “Try it with sample data,” with
the immediate result “See a working shared chore board.”

## Copy audit

Word counts treat paths, hyphenated terms, and quoted labels as one word. The
landing inventory below includes visible copy units, labels, headings, image
description, and repeated text. No item exceeds 22 words; no jargon, banned
marketing adjective, inconsistent product term, contextless heading, or
non-result-naming action was found. The only finding in this review is F-5-1.

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
| Try it with sample data | 5 | Pass — demo action |
| See a working shared chore board. | 6 | Pass |
| Works offline after setup | 4 | Pass — `offline-reload` |
| Stored on this device | 4 | Pass — `stored-device` |
| Free to use | 3 | Pass — `free` |
| Add your first chore → | 5 | Pass — result-naming action |
| A paper-cut kitchen with a sink, cleaning cloth, plant, and blank receipt. | 12 | Pass — image description |
| Sample board preview | 3 | Pass |
| Sample chore board | 3 | Pass |
| This is Maple Street home. | 5 | Pass |
| It is a sample, not your data. | 7 | Pass — `demo-isolation` |
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
| Export or share a household copy only when you choose. | 10 | Pass — export/share/privacy claims |
| Household copies do not stay in sync. | 7 | Pass — `copies-no-sync` |
| Scan or import again to update another device. | 8 | Pass — `copies-no-sync` |
| Read the privacy details | 4 | Pass — result-naming link |
| A local record for recurring chores. | 6 | Pass — `stored-device` scope |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory (external) | 5 | Pass — external cue |
| v1.3.0 | 1 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Chore Receipt | 2 | Pass — title |
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
| Requires Node 20 or newer. | 5 | Pass — setup fact |
| `npm ci` | 2 | Pass — command |
| `npm test` | 2 | Pass — command |
| `npm run build` | 3 | Pass — command |
| `npm run build` creates the static deploy output in `dist/`, with `index.html` at its root. | 15 | Pass — verified setup fact |
| Product claims and their Playwright checks are listed in `.factory/claims.json`. | 10 | Pass — verified documentation fact |
| Deploy | 1 | Pass |
| Deploy `dist/` to the configured static host. | 7 | Pass — setup instruction |
| `staticwebapp.config.json` provides the application routes, true 404 override, and security headers. | 11 | Pass — setup fact; F-5-1 is the remaining header omission |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

## Demo, claims, and privacy

- One click from the cold landing opened `/demo` with Maple Street home, four
  realistic chores, dated receipts, due states, and completion controls already
  visible. The persistent banner says “Demo — sample data, nothing is saved”
  and provides **Reset demo** and **Start for real**.
- Fresh direct `/demo` and `/?demo=1` contexts created only
  `chore-receipt-demo-v1`. The declared reset test edits and completes a demo
  chore, resets the exact four-chore/four-receipt sample, clears the stale
  receipt result and Undo control, preserves real data, announces the result,
  and returns focus to Reset.
- The direct-demo request log contained only same-origin GET requests with no
  body. The declared QR privacy test also checks sender and recipient request
  origins, methods, URLs, and bodies for the household packet and sample
  fields. There are no analytics, remote fonts, third-party runtime requests,
  provider keys, accounts, payment controls, or decorative AI feature.
- From the fresh clean clone, `npm ci` passed; each exact command in
  `.factory/claims.json` passed separately; `npm test -- --workers=1` passed
  32/32; and `npm run build` produced `dist/`. The initial application
  JavaScript was 55.67 kB raw / 19.12 kB gzip.

| Claim id | Result |
| --- | --- |
| demo-isolation | PASS |
| demo-reset | PASS |
| demo-discard | PASS |
| no-scoring | PASS |
| stored-device | PASS |
| offline-reload | PASS |
| csv-export | PASS |
| json-backup | PASS |
| local-only | PASS |
| qr-share | PASS |
| copies-no-sync | PASS |
| receipt-next-date | PASS |
| free | PASS |

## Earlier finding verification

Every earlier review, polish record, and handoff was read. The checks below
were repeated against the live site and current source/tests; none is merely
marked fixed.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | A true 404 does not replace the successful cached shell; offline demo and log are covered by `offline-reload`. |
| F-1-2 | Household is visible and usable at 390 px. |
| F-1-3 | Corrupt-data recovery independently imports a valid backup or confirms clearing local data. |
| F-1-4 | Link, Back, and Forward navigation focus and announce the new h1. |
| F-1-5 | Chores can be edited and removed while receipts remain. |
| F-1-6 | Real household names and chores survive reload in the real namespace. |
| F-1-7 | JSON import restores household, chores, receipts, and removal history into a fresh real store. |
| F-1-8 | QR request checks inspect origin, method, URL, and body. |
| F-1-9 | Landing, Household, and Privacy disclose that household copies do not sync. |
| F-1-10 | All six application routes have distinct static/runtime metadata. |
| F-1-11 | The HTTP 404 retains skip link, header, footer, legal links, metadata, and icons. |
| F-1-12 | A blank household name announces an error and returns focus to its input. |
| F-1-13 | Landing instructions consistently use “chore.” |
| F-1-14 | README explains the QR copy as staying after `#`, without browser jargon. |
| F-1-15 | The README has no broad unproved claim-test assertion; all 13 scoped claim tests passed. |
| F-1-16 | The untestable originality claim remains absent. |
| F-1-17 | The footer visibly and accessibly marks its external link. |
| F-1-18 | The committed copy inventory matches the current rendered landing units and counts. |
| F-2-1 | The labelled sample board precedes How it works and shows chores, a due state, receipt, and next date. |
| F-2-2 | Export JSON backup is explicit and available beside JSON import. |
| F-3-1 | The slogan caption is absent. |
| F-3-2 | The preview heading is “Sample chore board.” |
| F-3-3 | Preview and board queues use “Current chores.” |
| F-3-4 | The explanatory heading names how receipts set the next due date. |
| F-4-1 | Reset clears stale result state and restores the exact sample without touching real data. |
| F-4-2 | QR/JSON copies carry removal tombstones and later imports apply removals. |
| F-4-3 | The no-score promise is declared and outcome-tested. |
| F-4-4 | The editable-sample promise is declared and outcome-tested. |
| F-4-5 | The 404 title and h1 use “Page not found” / “This page is missing.” |
| F-4-6 | Board instructions name a chore and its repeat interval. |
| F-4-7 | Actions read “View all receipts” and “Undo receipt.” |
| F-4-8 | README describes separation in plain language. |

## Structure and missed leverage

All discovered internal links (`/`, `/demo`, `/log`, `/settings`, `/privacy`,
and `/terms`) and the explicitly cued external footer link returned 200. The
missing route returned the intended HTTP 404. Each application route has one
h1 and one main, a route-specific title, description, canonical, Open Graph,
Twitter, favicon, and consistent header/footer. The paper-cut household board
is distinct from a generic SaaS template and matches the documented visual
thesis. F-5-1 is the sole structure exception.

The brief does not imply a missing AI action: reliable local-first chore
records do not need AI. CSV/JSON backup and a deliberate no-sync QR household
copy provide the expected export/import value without a backend or provider
key.

## What would make this perfect

Send and test a `frame-ancestors` CSP directive for normal and 404 responses.
Then repeat the cold mobile/desktop read, direct demo isolation, all claim
commands from a clean clone, route crawl, and response-header check. With that
single result verified, this review can be PASS.
