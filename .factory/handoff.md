# Verification handoff — FAIL

Independent verification of `1136552cd34862965573cd090de62b3cd0eea25e` on
2026-08-28 UTC is **FAIL**. The live URL
<https://chore-receipt.sociobot.in> byte-matches the candidate for the
application shell, assets, worker, manifest, fallbacks, and hero image.

## What passed

```sh
npm ci
npm test                 # 13/13 Playwright tests passed
npm run build            # TypeScript + Vite build passed; dist/ exists
```

All nine commands declared in `.factory/claims.json` were also run separately
and passed. Cold first-read, one-click seeded demo, normal chore completion,
CSV/JSON ownership paths, fragment-only QR import, invalid input recovery,
offline document reload, service-worker update toast, keyboard, 390 px mobile,
axe serious/critical, headers/CSP, and Lighthouse (99/100/100/100) passed.

## Release blockers

1. **HIGH:** Demo edits persist in `chore-receipt-demo-v1` after **Start for
   real**. Re-entering `/demo` restores the changed sample, contrary to the
   required demo teardown/explicit transfer rule and the “nothing is saved”
   banner.
2. **MEDIUM:** Live content-hashed JS/CSS and `sw.js` are served with
   `cache-control: public, must-revalidate, max-age=30`, not long-lived
   immutable caching required for hashed PWA assets.

See `.factory/verification-2.md` for exact commands, fresh evidence, scope,
and remediations.

## How to verify after repair

```sh
npm ci
node -e "for (const c of require('./.factory/claims.json')) console.log(c.test)"
npm test
npm run build
```

Then verify live that leaving demo removes its data (or offers a one-time
keep-as-real choice) and that `/assets/*` uses immutable cache headers while
`sw.js` remains revalidated.
