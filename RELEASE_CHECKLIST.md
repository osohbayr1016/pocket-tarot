# Pocket Tarot — Release checklist

Updated: 2026-11-13. Target branch: `feat/offline-tarot-foundation`.

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
- [ ] Latest HEAD must pass **all** jobs after the last change; do not infer from an older green run

## P0 security and operations

- [x] Legacy API disabled at the application server level, with retired routes returning HTTP 410
- [x] Credential-bearing config removed from the active feature branch and ignored
- [ ] **OWNER ACTION REQUIRED:** Rotate any exposed credentials from Git history, provider dashboards, and deployed services; invalidate affected sessions
- [ ] Check legacy deployment is actually shut down and no old API endpoints remain reachable outside the new code
- [ ] Confirm Vercel/production points to the expected build and branch; audit public runtime network requests
- [ ] Create rollback/redeploy plan and preserve a stable release tag

## P1 product QA

- [x] Five built-in spreads and custom spread UI
- [x] Rule-based multi-card contextual interpretation and daily reflection
- [x] Local journal history, deletion, JSON export/import and notes editing
- [x] PWA cache manifest and on-device install support
- [x] Local astronomical ephemeris, ascendant, aspects and Whole Sign house UI
- [ ] Manual iPhone Safari, Android Chrome, desktop Safari/Firefox checks (small screens, landscape, notch, safe areas)
- [ ] Keyboard accessibility audit including focus trap, Esc close, keyboard-only draw and screen reader announcements
- [ ] Real-world slow/offline test: clear caches, warm caches, upgrade service worker, refresh, image fallback and 22MB card bundle
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
