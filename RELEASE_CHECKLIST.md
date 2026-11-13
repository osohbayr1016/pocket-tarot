# Pocket Tarot — Release checklist

Updated: 2026-11-13 (second implementation wave). Target branch: `feat/offline-tarot-foundation`.

**Do not describe this release as “100% bug-free”, “100% accurate forecasts”, or “professionally verified astrology.”** These cannot be established by a CI run.

## Automated gates

- [x] 78 Rider–Waite–Smith images included and validated by CI (JPEG + WebP files)
- [x] Unique 78-card deck IDs and consistent spread positions
- [x] Fisher–Yates draw and reversal validation
- [x] Offline interpretation and conventional zodiac unit tests
- [x] Additional astronomical calculation reference fixtures
- [x] React UI smoke tests
- [x] TypeScript and production build checks
- [x] Linting checks
- [x] Chromium Playwright journeys including date, cards, history and offline reload on passing CI commits
- [ ] **LATEST HEAD** must pass security/unit/lint/build and Chromium/Firefox/WebKit checks after the last commit. Earlier green runs do not authorize a merge.

## P0 security and operations

- [x] Legacy API disabled at the application server level, with retired routes returning HTTP 410
- [x] Credential-bearing config removed from the active feature branch and ignored
- [ ] **OWNER ACTION REQUIRED:** Rotate any exposed credentials from Git history, provider dashboards, and deployed services; invalidate affected sessions
- [ ] Check legacy deployment is actually shut down and no old API endpoints remain reachable outside the new code
- [x] Vercel uses the same reproducible `npm ci --legacy-peer-deps` install policy as CI
- [ ] Confirm Vercel/production points to the expected build and branch; audit public runtime network requests
- [ ] Create rollback/redeploy plan and preserve a stable release tag

## P1 product QA

- [x] Five built-in spreads, 1–12-card custom spreads and saved custom templates
- [x] Rule-based contextual interpretation including card pairs, suit/rank patterns and reflection prompts
- [x] Offline reading preferences: upright-only, card back, reduced motion
- [x] Local journal history, favorites/search/statistics, deletion, JSON export/import, notes editing, corruption/overflow safeguards
- [x] User-supplied legacy JSON converter and opt-in import (device only); NO connection to old account database
- [ ] Owner must confirm authenticated legacy user export from live service and test user-specific data migration; see issue #5
- [x] PWA cache manifest, reproducibly versioned service worker, offline artwork manager and full Next static chunk precache
- [ ] Test worker upgrades, cache eviction, iOS PWA install, slow connection and all offline lazy-loaded routes in real devices
- [x] Local ephemeris, ascendant, aspects, Whole Sign houses, IANA timezone city presets and DST ambiguity/gap checks
- [ ] Manual iPhone Safari, Android Chrome and screen-reader checks (small screens, landscape, notch, safe areas); Playwright desktop Firefox/WebKit is not a substitute
- [ ] Keyboard accessibility audit including focus trap, Esc close, keyboard-only draw and screen reader announcements
- [ ] Real-world slow/offline test: clear/warm caches, update service worker, image fallback and optional compressed card bundle
- [ ] Verify historical timezone/DST correctness and astrology numerical outputs against independent professional ephemeris tools for multiple cities/dates
- [ ] 78-card Mongolian editorial review with qualified Tarot/domain reader
- [ ] Product privacy review: local notes storage may be visible to other users of shared device

## P2/P3 optional polish

- [x] Major Arcana teaching quiz
- [x] Daily single-card journal
- [x] Browser-side shareable PNG reading export
- [ ] Full English localization and review (not just translated navigation)
- [ ] Additional tarot spread layouts, detailed symbolism guide and tutorial walkthroughs
- [ ] Animation, touch feedback and theme controls with reduced-motion preference respected
- [ ] Extended dream dictionary editorial review and low-confidence notices
- [ ] Performance trace with real Core Web Vitals on budget Android devices

## Release decision

Merge and production rollout should wait until newest GitHub Actions result is green, credential rotation is addressed, and manual smoke tests have been documented. Algorithmic calculations can be tested; spiritual/predictive interpretations cannot be scientifically certified.
