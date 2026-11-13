# Pocket Tarot — offline Tarot, astronomy and reflective journaling

The current frontend is an **offline-first Next.js 16 + React 19** application. Main Tarot calculations, learning, reading history and astronomical calculations run on the user's device; no backend, login, generative AI, paid API or cloud account is needed.

## Experiences

- **78-card historical deck**: 22 Major + 56 Minor RWS illustrations, upright/reversed Mongolian symbolic readings and local English interpretive texts.
- **Tarot spreads**: classic 1, 3, 5, 6 and 10-card spreads, visual Celtic Cross, custom 1–12 card spreads, question topics and local reading synthesis.
- **Tarot Academy**: seven self-paced modules, all 78 cards, spaced repetition, review reminders and saved progress.
- **Private journal**: IndexedDB archival storage, legacy localStorage migration, 20-record pages, search, tags, moods, favorites, full export/import, print/PDF, PNG, privacy-first Instagram story/square exports.
- **Offline astronomy**: 10-body tropical natal chart, Whole Sign houses, simple aspects, transit comparisons, IANA city time zones and calendar with computed new/full Moon instants.
- **Reflection**: optional daily card, deterministic daily themes, dream-symbol keywords (Mongolian + selected Latin Mongolian), reflection prompts.
- **Privacy and personalization**: encrypted portable JSON backups (AES-256-GCM; passphrase not stored), optional feedback sounds/haptics, reduced-motion support, themes, partial EN localization and PWA installation guidance.

Tarot and astrology **do not scientifically predict events**. Astro coordinate calculations are astronomical geometry, not an assurance about a person's life.

## Start

Requirements: Node.js 22+, npm and internet for the *first* artwork sync.

```bash
npm ci --legacy-peer-deps
npm run dev
```

Then open `http://localhost:3000`. To build and test:

```bash
npm test
npm run test:legacy
npm run lint
npm run typecheck
npm run build
npx playwright test
```

The GitHub Actions workflows also validate legacy API lockdown and scan tracked source/doc files for obvious plaintext credentials. Playwright's browsers must be installed separately for local E2E.

## Private data

User reading history is primarily saved in IndexedDB; old localStorage journal records are copied on initial migration without deleting originals. Learning progress and preferences remain in localStorage. These stores are **not encrypted at rest**. Export encrypted portable backups and keep the passphrase safe. Browser cleanup or storage eviction can destroy local data, so export regularly.

An encrypted backup cannot be restored without its passphrase. Plaintext JSON export is still optionally available for older workflows. Neither backup workflow uses a server.

## Historical artwork

The 78 RWS images came from [mixvlad/TarotCards](https://github.com/mixvlad/TarotCards/tree/main/tarot/rider-waite/720px), sourced from original 1909 Pamela Colman Smith illustrations, via restored scans credited to Steve P. Distribution rights and third-party scan/restoration terms still require commercial review for the target jurisdiction. See [../ARTWORK_PROVENANCE.md](../ARTWORK_PROVENANCE.md).

## Current limitations

- Mongolian-to-English UI translation is **partial**; Tarot card meanings have independent English texts but some astronomy, journal and help sections remain in Mongolian.
- Ephemeris and historical local time must be independently checked, especially unusual DST histories. Only Whole Sign houses are implemented.
- RWS art/licensing, translations, and spiritual interpretations have not received full external domain/legal review.
- Automated Chromium/Firefox/WebKit runs do not replace real iPhone/Android Safari/Chrome, screen reader, low-memory, service worker upgrade or offline eviction QA.
- Main-to-production rollout and credential rotation are owner-controlled and must not be assumed completed.

See [../RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md), [../SECURITY.md](../SECURITY.md) and [../README.md](../README.md).
