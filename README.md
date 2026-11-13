# Pocket Tarot

**Монгол хэл дээрх AI/API шаардлагагүй, offline-first Tarot ба Astrology платформ.**

> Tarot ба astrology бол соёлын бэлгэдэл, эргэцүүллийн уламжлал. Картын тайлал ирээдүйг шинжлэх ухааны үндэслэлээр баттай таамаглахгүй. Эрүүл мэнд, хууль, санхүүгийн шийдвэрийг түүнд дангаар тулгуурлан бүү гарга.

## Features (2026-11-13 branch)

- **78 genuine Rider–Waite–Smith tarot cards** — 22 Major / 56 Minor; all 78 local original JPG (~20.9 MiB) and compressed WebP (~8.1 MiB).
- **Five traditional spreads + custom spreads (1–12 cards)**, independently reversed cards, unbiased Web Crypto Fisher–Yates shuffling.
- **Offline contextual interpretation** — question topic (love/career/growth/general), cross-card patterns, reversals, element balance; transparent deterministic rules, not LLM.
- **Advanced astrology** — geocentric tropical Sun/Moon/planets, ascendant, aspects and Whole Sign houses calculated locally with Astronomy Engine 2.1.19 (MIT). Requires user-provided birth time, historical UTC offset and coordinates. Not Placidus and not a scientific prediction.
- **12-sign conventional zodiac**, date validation, stable date-dependent daily symbolic prompts.
- **Private journal** — local saved readings, individual deletion and notes, JSON export/import, PNG sharing, print/PDF.
- **Daily Tarot Card**, beginner Major Arcana recognition quiz, card catalog and transparent rule-based dream symbols.
- **Installable offline PWA** — locally cached Next app shell and on-demand images, browser service worker. Offline reload requires prior successful visit and installation; device-specific validation is still needed.
- **Responsive UI and accessibility** — keyboard-first card modal and focus management, reduced-motion preference.
- **Security** — legacy AI/auth APIs retired on branch with fail-closed HTTP 410, old OAuth token callback removed, secret-bearing config removed from branch. **Previously exposed production credentials MUST be rotated; Git history still contains them.**

## Run / verify

Requires Node 22+, npm.

```bash
cd front-end
npm ci --legacy-peer-deps
npm run dev
# separate terminal:
npm test
npm run test:legacy
npm run lint
npm run typecheck
npm run build
```

Production built site: `npm run start`. Chromium E2E tests in CI use Playwright. To run them locally install `@playwright/test` and Chromium or follow `.github/workflows/offline-frontend.yml`.

**No AI, inference API or backend requests are required for any main frontend feature.** All user-input calculations happen inside the browser. First visit or service-worker update naturally requires delivery of the application files over a network.

## Asset provenance

Cards illustrated by **Pamela Colman Smith** for Rider–Waite–Smith (1909). Locally downloaded from [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/720px). Verify country-specific distribution rights. The one-time sync script does not run at reading time.

## Technical structure

- `front-end/src/app/data/` — 78 card metadata and spread definitions
- `front-end/src/app/lib/offlineEngine.ts` — tarot shuffle, zodiac, daily and dream engine
- `front-end/src/app/lib/readingIntelligence.ts` — deterministic topic and multi-card synthesis
- `front-end/src/app/lib/astroChart.ts` — local natal chart ephemeris/ascendant/houses
- `front-end/src/app/lib/readingHistory.ts` — validated private journal import/export
- `front-end/src/app/lib/exportReadingPng.ts` — private Canvas PNG export
- `front-end/src/app/components/` — feature UI
- `front-end/public/sw.js` — installable browser PWA offline shell
- `front-end/tests/` and `front-end/e2e/` — unit and browser regressions
- `back-end/` — deprecated compatibility health server; it no longer offers auth/AI routes

## Release gates not covered by automated tests

1. Rotate compromised database/JWT/API keys; revoke old secrets from deployment platforms and review access logs.
2. Expert review of all 78 historical card interpretations, Mongolian terminology, Celtic Cross positions, and variant traditions.
3. Real device QA for iOS Safari/Android Chrome, offline reload/storage eviction, screen-reader and browser accessibility checks.
4. Independently cross-check astronomical fixtures and exact historical timezone/cusp behaviour; the current app accepts manual UTC offsets.
5. Review live deployment configuration, rollback and privacy disclosures. `main` is **not changed until this PR is merged**.

No software can be guaranteed 100% bug-free. CI success indicates only the tested scope.
