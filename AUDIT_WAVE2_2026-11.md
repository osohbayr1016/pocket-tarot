# Pocket Tarot — second-wave audit and implementation

Audit date: 2026-11-14. Based on merged `main` at `8f59d641d23a17a307587af0455fd7ffb17e8aaa` and the first-wave PR #6. This is a code and workflow audit, **not** a commercial production certification.

## Scope and evidence

Reviewed the browser-first Tarot reading flow, manual physical-deck entry, IndexedDB and localStorage fallbacks, journal imports, daily-card saves, legacy migration, frontend tests, React navigation, build assets and retired operational scripts. Compared current features with published Labyrinthos and Galaxy Tarot product descriptions.

### Confirmed bugs and corrections implemented in this PR

| Priority | Before | Change | Test/verification |
| --- | --- | --- | --- |
| P1 — Data integrity | A JSON import with the same reading ID silently overwrote newer on-device notes | Import merges without replacing existing IDs; only explicit backup restore can replace journal data | Unit merge test + browser re-import test |
| P1 — Data integrity | A no-IndexedDB import could save some rows and fail at the 100-row cap | Validate and merge the entire batch, then write localStorage once | Fault/overflow regression test |
| P1 — Data integrity | Unchecked imports and new saves could push the IndexedDB journal beyond the 5,000-entry limit needed for complete backup | Enforce bounds atomically in readwrite transactions | Code review and standard CI; additional 5k boundary stress fixture still recommended |
| P1 — Notes | Saving the daily card again with the same ID replaced earlier notes | Transactionally append daily notes, reject overflow | Unit and browser same-day repeat-save regression |
| P1 — Correctness | Manually marked reversed cards were forced upright when random-draw reversals were disabled | Physical deck orientation always honors the user's actual selection | Unit and browser test |
| P1 — Notes | Re-saving the same drawn spread could create new records and duplicate clicks could double-save | In-flight save guard, stable per-reading ID, append follow-up notes | Browser repeated-save test |
| P1 — Operational safety | Outdated deployment scripts still asked for the backend, could invoke production deployment or terminate unrelated processes | Retire unsafe deploy helpers, run only the local frontend, and make stop instructions non-destructive | Script safety tests |
| P2 — Offline reliability | Build/dev scripts could silently download missing third-party illustrations | Require exactly 78 committed JPEG/WebP artwork pairs; downloads remain explicit only | Local artwork verifier in normal test/build |
| P2 — UX | Manual cards were one 78-item list without visual confirmation | Group choices by suit/arcana and preview selected card/orientation | Browser coverage and UI review |
| P2 — Data trust | Invalid legacy timestamps could cause generic RangeError | Validate before ISO conversion | Unit regression test |
| P2 — Insights | Journal showed only total/favorites/unique/top card | Private reversal percentage and most common suit | Pure-function tests |

Import semantics deliberately preserve old local edits; users wanting to **replace** data must use the separate, explicitly confirmed complete-backup restore. An import count now reflects newly added records, not records skipped due to duplicates.

## Architecture assessment

**Keep:** Next.js browser-first frontend; pure deterministic domain modules; strict schema validation; local astronomy with stated accuracy limits; IndexedDB for archival records; opt-in encrypted export; no automatic paid-model API dependence.

**Strengthen next:**

1. Extract journal transaction operations into a small persistence adapter with strict atomicity, one tested migration boundary, and explicit conflict policies.
2. Add browser fault injection for storage quotas, Safari private-mode/IndexedDB denial, database version upgrades, and multiple-tab writes.
3. Separate reading sessions from saved entries and persist saved record IDs if cross-reload edit-in-place becomes a requirement.
4. Add low-storage and service-worker update rollback testing (not merely first-install offline reload).
5. Move archived Gemini-era docs to a clearly marked historical folder only after confirming they are unnecessary for authorized migration work.
6. Keep operational release gates explicit; passing CI does not revoke leaked credentials, clear rights, or perform physical mobile QA.

## Comparative product findings and useful next features

- [Labyrinthos](https://play.google.com/store/apps/details?id=com.labyrinthos.app) advertises 50+ spreads, multiple decks, journaling of physical cards, short quizzes, and aggregated journal statistics. These are useful **feature references**, not justification to copy every category.
- [Galaxy Tarot](https://galaxytarot.com/) emphasizes a simple four-step reading journey, card meanings and symbol exploration. This supports keeping quick-start uncluttered.
- [Labyrinthos release history](https://labyrinthos.co/pages/app) describes date-filtered journal logs and private reflection follow-ups as differentiating features.

**Prioritized nice-to-have candidates:** date-range filtering for the local journal; zoomable card symbolism hotspots; an optional 7-day reflection revisit (no compulsory streaks); a private exportable CSV summary; better keyboard shortcuts for physical deck entry; human-reviewed card explanations with consistent Mongolian terminology; curated spreads tied to concrete reflection topics; user-controlled color/contrast preferences. Avoid autoplay or coercive engagement loops.

## Outstanding external blockers

- **P0 security:** Owner must rotate/revoke every historically exposed DB, JWT, Gemini and OAuth credential, review access logs and invalidate sessions. Code changes alone cannot do this.
- **P0 migration:** Owner-authorized extraction/reconciliation of legacy account-backed readings must precede closing legacy services.
- **P1 device/quality:** Real iOS Safari and Android Chrome testing, keyboard/screen reader, low-storage/offline upgrades, and independent astronomy fixtures.
- **P1 rights:** Commercial image licensing and final bilingual Tarot editorial approval.
- **P1 release:** Preview host/rollback rehearsal and owner-approved promotion gate; no deployment is part of this PR.

## Expected CI

`cd front-end && npm ci --legacy-peer-deps && npm test && npm run test:legacy && npm run lint && npm run typecheck && npm run build && npx playwright test`

The browser suite requires installed Playwright browser dependencies. Validate the PR head and merged `main` SHA in GitHub Actions before declaring any changes integrated.
