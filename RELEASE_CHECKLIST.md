# Pocket Tarot — Release checklist

Updated: 2026-11-13 (bilingual frontend, IndexedDB migration reliability and complete backup v4). Target branch: `main` (Pocket Tarot v2 PR #1 merged at `2630a6366f8aaaa50b57f2d9b65abac46765ed80`; code changes continue under CI).

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
- [x] Playwright Chromium/Firefox/WebKit projects including desktop journeys, local-time astrology, study progress, journal backup, lunar calendar and offline reload on passing commits
- [x] PR #1 source HEAD (`8e8e775`) passed security/unit/lint/build and 101 browser E2E checks (8 skipped).
- [ ] **CURRENT DEPLOYABLE CODE SHA** must pass security/unit/lint/build and Chromium/Firefox/WebKit tests. Merging code does not complete production authorization.

## P0 security and operations

- [x] Legacy API disabled at the application server level, with retired routes returning HTTP 410
- [x] Credential-bearing config and historical database URI removed from active documentation; obsolete Render deploy helper disabled
- [x] GitHub security workflow scans tracked files for likely credentials without printing token values
- [x] Public HTTPS read-only smoke check included at `scripts/smoke-public-release.mjs` (owner must supply approved URL)
- [ ] **OWNER ACTION REQUIRED:** Check a real preview/production URL with the smoke script and retain the result
- [ ] **OWNER ACTION REQUIRED:** Revoke old leaked keys and audit hosted endpoints — code cleanup is not rotation
- [ ] **OWNER ACTION REQUIRED:** Rotate any exposed credentials from Git history, provider dashboards, and deployed services; invalidate affected sessions
- [ ] Check legacy deployment is actually shut down and no old API endpoints remain reachable outside the new code
- [x] Vercel uses the same reproducible `npm ci --legacy-peer-deps` install policy as CI
- [ ] Confirm Vercel/production points to the expected build and branch; audit public runtime network requests
- [x] Write staged release, migration and rollback instructions in `RELEASE_RUNBOOK.md`
- [ ] **OWNER ACTION REQUIRED:** Execute rollback rehearsal and record stable tag/deployment ID

## P1 product QA

- [x] Five built-in spreads, 1–12-card custom spreads and saved custom templates
- [x] Rule-based contextual interpretation including card pairs, suit/rank patterns and reflection prompts
- [x] Offline reading preferences: upright-only, card back, reduced motion
- [x] IndexedDB journal with idempotent legacy localStorage migration, 20-record pagination, up to 5000 records, tags/moods/favorites/search/statistics and deletion
- [x] Encrypted portable complete backup v4 (AES-GCM + PBKDF2), including validated unsaved drafts and locale, backward-compatible v1–v3 import and rollback
- [x] Date-keyed autosaved notes for daily and single-card readings, plus unsaved-note confirmation in traditional spread flow
- [x] User-supplied legacy JSON converter and opt-in import (device only); NO connection to old account database
- [ ] Owner must confirm authenticated legacy user export from live service and test user-specific data migration; see issue #5
- [x] PWA cache manifest, reproducibly versioned service worker, offline artwork manager and full Next static chunk precache
- [ ] Test worker upgrades, cache eviction, iOS PWA install, slow connection and all offline lazy-loaded routes in real devices
- [x] Local ephemeris, ascendant, natal/transit aspects and retrograde positions, Whole Sign houses, IANA timezone city presets and DST ambiguity/gap checks
- [x] Computed exact astronomical new/full Moon moments with UTC/local clock displays (independent verification still required)
- [ ] Manual iPhone Safari, Android Chrome and screen-reader checks (small screens, landscape, notch, safe areas); Playwright desktop Firefox/WebKit is not a substitute
- [x] Automated keyboard skip-link, Escape, modal focus restoration and basic desktop/mobile browser journeys
- [ ] Manual assistive-technology screen-reader audit, focus trap and announcements on physical devices
- [x] User-initiated PWA update check, optional persistent storage request and compressed artwork caching
- [ ] Real-world slow/offline test: clear/warm caches, update service worker, image fallback and storage eviction
- [ ] Verify historical timezone/DST correctness and astrology numerical outputs against independent professional ephemeris tools for multiple cities/dates
- [ ] 78-card Mongolian editorial review with qualified Tarot/domain reader
- [ ] Product privacy review: local notes storage may be visible to other users of shared device

## P2/P3 optional polish

- [x] Seven-stage Tarot curriculum with 78-card spaced repetition, review schedule, answer stats and hidden printed labels; included in backup v4
- [x] Offline astronomical month-by-month Moon phase calendar and phase/illumination fixtures
- [x] Suit/element/keyword filters and expanded traditional card library metadata
- [x] Major Arcana teaching quiz
- [x] Daily single-card journal
- [x] Browser-side shareable PNG reading export
- [x] Add exact astronomical new/full Moon event timestamps separately from daily noon calendar; verify 2024 eclipse timing fixtures
- [ ] Broader independent ephemeris/timezone review and editorial checks for moon phase labels
- [x] Add Pixel 7 and iPhone WebKit emulated touch journeys for installation help, mobile navigation and saved drafts
- [ ] Run physical mobile screen-reader and assisted-testing review for study progress, v4 backup and modal
- [x] Add opt-in MN/EN menu, all 78 English upright/reversed Tarot descriptions, core card and reading text
- [x] Translate primary journal, backup/settings, natal/transit, moon, dream, daily, Celtic Cross, custom spread and Academy UI to English
- [ ] Audit every secondary error/help string for complete English coverage and obtain independent native-language editorial review
- [x] Spatial Celtic Cross and accessible 10-card position list; seven Tarot lessons and progress bars
- [ ] Additional niche spread layouts and deep symbolism tutorials
- [x] Reduced-motion card reveal animation, three premium dark themes, opt-in synthetic UI sounds and vibration
- [x] Latin Mongolian dream keyword aliases and low-confidence messages
- [ ] Domain editor check of dream meanings, missing tokens and cultural nuance
- [x] Privacy-first square/Story image exports with questions and notes omitted by default
- [x] PWA install guide and user-triggered browser install prompt
- [x] Document original RWS artist/scan sources in `ARTWORK_PROVENANCE.md`, with user-visible footer credits
- [ ] **OWNER ACTION REQUIRED:** Commercial image licensing sign-off for intended markets
- [ ] Performance trace with real Core Web Vitals on budget Android devices

## Release decision

Pocket Tarot v2 code is merged into `main` by explicit owner request. **Production rollout still must wait** until current-code CI is green, credentials are rotated, old-user migration is verified, commercial artwork rights and physical-device QA are approved, and an approved preview has passed smoke/rollback tests. GitHub Actions workflow `Pocket Tarot / production promotion gate` records these owner self-attestations without deploying. Algorithmic calculations can be tested; spiritual/predictive interpretations cannot be scientifically certified.
