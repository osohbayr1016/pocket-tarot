# Pocket Tarot — engineering audit and next-wave roadmap

Snapshot reviewed: `main` at `7890e786b482bedb292b72da536939f989420e97` (2026-11-14).
This document distinguishes **confirmed behavior**, **implemented changes**, **unverified risks**, and **product ideas**. Passing tests is not proof of production readiness.

## Confirmed architecture

- Next.js App Router / React / TypeScript, browser-first reading UI; 78 historical RWS cards and local JPG/WebP assets.
- `offlineEngine.ts`: secure random draw and local, transparent reflection; no generative-model dependency.
- `journalDb.ts`: IndexedDB journal with legacy import and encrypted, passphrase-protected export via `offlineBackup.ts` and `encryptedBackup.ts`. Browser storage is **not** encrypted at rest.
- `astroChart.ts`, `astroTimeZone.ts`, `lunarCalendar.ts`: local astronomy, limited to stated methods/accuracy assumptions.
- `sw.js`: app-shell and static build-asset precache; optional deck download and offline fallbacks.
- `back-end/server.js`: retired compatibility service; old AI/auth modules remain in the repository but must not be re-enabled or deployed.

## Confirmed product gaps addressed in this change

| Priority | Finding | Resolution | Verification |
| --- | --- | --- | --- |
| P1 | No way to journal spreads dealt with a real physical Tarot deck | Physical-card picker attached to each selected spread, with card order, reversals and duplicate rejection | Unit and browser regression tests |
| P2 | Browser history can change the selected section while the navigation menu still previews a different category | Preview is scoped to its opening section | Browser regression test |
| P3 | Footer licensing link points to a historical feature branch | Link to maintained `main` document | Source review |

## Outstanding work (not claimed fixed)

| Priority | Workstream | Acceptance criteria |
| --- | --- | --- |
| P0 — Owner | **Rotate previously exposed real credentials** at all providers, assess historic use and old deployment status | Owner-produced rotation log; confirmed old credentials revoked; incident review completed |
| P0 — Owner | **Legacy data migration** before retiring any account-backed services | Authorized export, record-count reconciliation, validated import, customer communication and rollback |
| P1 — QA | iOS Safari / Android Chrome, low-storage, offline PWA upgrade, keyboard and screen reader | Physical device QA matrix with reproduction steps, pass/fail and recorded fixes |
| P1 — Accuracy | Historic time zones, birth charts, moon data independently compared | Documented reference fixtures, precision tolerances and specialist sign-off |
| P1 — Security | Validate production CSP, cache/asset headers, dependency provenance, third-party artwork licensing | Evidence from final hosting configuration and license clearance; no false claims from source-only scans |
| P1 — Data durability | Failed IndexedDB, quota exhaustion and interrupted backup/restore | Fault-injection tests that preserve journal content and provide recovery guidance |
| P2 — UX | Interview new users to reduce first-session friction, assess 1/3 card defaults, manual-entry comprehension | Usability observations and targeted mobile iterations |
| P2 — Learning | Expand guided lessons and optional onboarding; add progress insight without pressure mechanics | Offline lessons, opt-in controls, accessibility and tests |
| P2 — Cards | Human editorial review of all Mongolian/English Tarot meanings, accessibility alt text and common terminology | Approved text with card-by-card checklist |
| P3 — Content | Add optional curated situation-specific spreads and licensed alternative decks, if requested | Editorial sign-off, licensing and an uncluttered selection UI |
| P3 — Insights | Extend private journal reflection trends and revisit prompts without extracting personal data | Opt-in, privacy-preserving summaries with export compatibility |

## Comparison with similar systems

- [Labyrinthos](https://app.labyrinthos.co/) offers digital readings, custom spreads, journaling and card study.
- [Labyrinthos Google Play listing](https://play.google.com/store/apps/details?id=com.labyrinthos.app) describes physical-card logging, many curated spreads, multiple decks and journal statistics.
- [Golden Thread Tarot](https://golden-thread-tarot.appstor.io/) describes guided physical/digital readings and a reflection journal.

**Product choice:** preserve Pocket Tarot's local-first privacy and bilingual strength instead of automatically copying cloud accounts, paid AI or large deck catalogs. Physical deck entry addresses a clear gap without requiring an API, payments or sensitive data transfer.

## Recommended architecture

1. **Domain (pure modules):** draw validation, spread definitions, symbolic interpretation, astronomical calculations. Prefer pure functions with fixture tests.
2. **Persistence (browser boundary):** IndexedDB journal, local drafts, migration and backup schema versions. Keep validation and rollback here, independent of rendering.
3. **Application UI:** focused one-/three-card quick start, optional expanded spreads, physical input and accessible results. No hidden backend coupling.
4. **PWA (cache boundary):** versioned immutable assets and safe offline fallback. Never cache authentication endpoints or personal exports.
5. **Release assurance:** mandatory PR gates for tests/typecheck/lint/build/browser tests plus owner-reviewed device, security and content checklists.

## Verification protocol

- `cd front-end && npm ci --legacy-peer-deps && npm test && npm run test:legacy && npm run lint && npm run typecheck && npm run build`
- `npx playwright test` with browser dependencies installed.
- Verify resulting PR head and merged `main` SHA in GitHub Actions. **Do not deploy** without the independent external release gates documented in `RELEASE_STATUS.md`.
