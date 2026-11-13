# Pocket Tarot — Offline-first Tarot & Astrology

A bilingual (Mongolian/English), browser-side Tarot reading and reflection application. The v2 code has been merged into `main`; production promotion still requires the owner-controlled checks in [RELEASE_STATUS.md](RELEASE_STATUS.md). Its core reading and astronomical computations do not require Gemini, OpenAI, or paid APIs. Tarot and astrology are cultural traditions, **not scientifically validated prediction systems**.

## Implemented in main (Pocket Tarot v2)

- **78 Rider–Waite–Smith cards** — 22 Major Arcana and 56 Minor Arcana, with upright and reversed Mongolian and English interpretations and locally stored historical artwork (JPEG and optimized WebP).
- **Tarot spreads** — traditional 1/3/5/6/10-card spreads, plus a user-configurable **1–12-card custom spread** with labeled positions.
- **Secure local draws** — unbiased Fisher–Yates shuffle using Web Crypto, without card duplication, with independent reversal choice.
- **Contextual, auditable reading engine** — transparent topic detection (general, love, career, growth), card-position interpretation, broad patterns across multiple cards and reflection prompts. It does **not** infer facts about a person's future or use a language model.
- **Zodiac overview** — conventional tropical sun-sign dates with Gregorian date validation.
- **Natal chart calculator** — browser-local ephemeris via Astronomy Engine: geocentric tropical positions of 10 bodies, ascendant, Whole Sign houses, moon phase, and simple aspects. Accurate **historical UTC offset, birth time and location must be supplied**; no time-zone guesswork. See accuracy limits below.
- **Daily tarot, symbolic daily reflection, dream dictionary and guided journaling** — local rules and deterministic date-dependent prompts, not professional advice or AI diagnoses.
- **Reading journal** — IndexedDB archive with idempotent localStorage migration, pagination, private autosaved drafts, tags, moods, favorites/search, JSON and user-owned legacy imports, print/PDF and privacy-first shareable Story/Square PNG. Encrypted portable **backup v4** includes all journal records, drafts, language, custom spreads, preferences and 78-card study progress; v1–v3 imports remain supported.
- **Learn Tarot** — offline spaced-repetition quiz across all 78 cards with daily due reviews, per-card progress, answer tracking and a masked card title to prevent giving away the answer. Training progress is backed up locally.
- **Lunar calendar** — astronomy-based eight phases and illumination at local noon in the selected city/time zone, plus exact new/full Moon UTC and local events; no external API.
- **Advanced card library** — search Mongolian/English names and keywords, filter by suit, arcana and element, and inspect traditional correspondences.
- **PWA** — install metadata, versioned service worker, built JavaScript chunk precache (including lazy natal/lunar screens) and an optional 78-image offline pack. Incomplete cache/first visits still require connectivity.
- **Privacy** — main application does not transmit questions, birth data or reading records to a backend. Downloaded backups can be AES-256-GCM passphrase encrypted, but browser storage itself is not encrypted at rest.

## Run

Requirements: Node.js 22+, npm.

```bash
cd front-end
npm ci --legacy-peer-deps
npm run dev
```

Build and validate:

```bash
npm test
npm run test:legacy
npm run lint
npm run typecheck
npm run build
npx playwright test
```

The Playwright runner and Chromium must be installed separately; GitHub Actions provides the browser setup. Tests verify local engine logic, React interactions, 78 artwork files, selected browser journeys and offline PWA reload. CI passing does **not** prove every device/browser or reading outcome is correct.

## Offline implementation

Artwork is kept in `front-end/public/tarot/rws/`. Runtime requests stay same-origin, with no generative-model API calls. The service worker caches the website shell and card assets on demand. A user-controlled persistent-storage request and update check are available where browsers support them. If you clear browser data or never open a particular image while online, that image may be unavailable while offline. Browser storage may be deleted by the user or browser; export important notes as JSON.

## Historical artwork

The Rider–Waite–Smith deck (1909) is illustrated by Pamela Colman Smith. Source of digitized historical JPEG artwork: [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/720px). Review local and destination-country copyright rules for each distribution channel.

## Mathematical/interpretive boundaries

- The tropical natal chart reports **calculated astronomical coordinates**, not verified life outcomes. Accuracy depends on UTC offset, birth coordinates and a supported ephemeris interval.
- Whole Sign house method only. It is **not** Placidus, Koch, sidereal, Indian/Jyotish or a comprehensive professional natal chart package.
- Ascendant and house boundaries are particularly sensitive to birth-time accuracy; calculations and historical-date reference fixtures need additional expert review before precision claims.
- Card meanings are authored Mongolian interpretive text; a qualified domain reviewer has not approved all cards.
- Astrology and Tarot do not have demonstrated scientific predictive reliability.
- Dream interpretation is rule/keyword based. Neither the app nor its content is medical, legal, mental-health or financial advice.
- Private data is not encrypted at rest in IndexedDB/localStorage. Avoid entering secrets; use encrypted v4 export, and note imported JSON has strict limits and schema checks.

## Security / deprecated backend

The old `back-end/` routes are intentionally **not required by the frontend**; compatibility service only serves health/status and returns HTTP 410 for retired APIs. The old production config was removed from the active feature branch, but **previous Git commits are still recoverable**. Rotate exposed database passwords, JWT secrets, AI API keys and OAuth credentials via providers. See [SECURITY.md](SECURITY.md).

## Production checklist

See [RELEASE_RUNBOOK.md](RELEASE_RUNBOOK.md) for release/rollback steps, [ARTWORK_PROVENANCE.md](ARTWORK_PROVENANCE.md) for image rights checks, and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for tests and owner sign-offs required before production promotion.

## Project map

- `front-end/src/app/lib/offlineEngine.ts` — random draw, sun signs and local reflection helpers
- `front-end/src/app/lib/readingIntelligence.ts` — contextual rule-based Tarot interpretation
- `front-end/src/app/lib/astroChart.ts` — offline ephemeris and natal chart calculations
- `front-end/src/app/lib/lunarCalendar.ts` — astronomical lunar phases by day
- `front-end/src/app/lib/studyProgress.ts` — spaced-repetition learning engine and local progress
- `front-end/src/app/lib/offlineBackup.ts` — portable validated complete backup v4 (v1–v3 imports)
- `front-end/src/app/lib/journalDb.ts` — transactional IndexedDB private journal, migration, pagination and JSON archive
- `front-end/src/app/lib/readingHistory.ts` — validation and legacy localStorage journal compatibility
- `front-end/src/app/lib/customSpread.ts` — bounded custom spreads
- `front-end/src/app/components/` — UI experiences
- `front-end/public/sw.js` — service worker
- `front-end/tests/` and `front-end/e2e/` — unit and browser tests
