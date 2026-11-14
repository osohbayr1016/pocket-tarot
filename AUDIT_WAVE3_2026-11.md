# Pocket Tarot — third-wave architecture and reliability audit

Reviewed against `main` at `4264367cd0fa5d27f31155fbf82c41a9e360b00b`, 2026-11-14. This document distinguishes verified code defects from feature opportunities, external requirements and unverified risks. Successful CI does not certify a production release.

## Code findings and changes in this wave

| Priority | Defect or gap | Code evidence | Resolution | Verification |
| --- | --- | --- | --- | --- |
| P1 | A complete backup may have up to 20MB of plaintext JSON but its AES-GCM/base64 envelope can exceed the UI's old 20MB import limit | `PreferencesPanel.tsx` file-size gate vs `encryptedBackup.ts` ciphertext envelope | Centralized limits: 20MB **UTF-8 plaintext** / 28MB encrypted file; both directions agree | New unit boundary tests, existing encrypted round-trip tests |
| P1 | Export paths measured UTF-16 code units, not UTF-8 bytes; Mongolian and other multibyte content could produce a file larger than accepted by restore | `offlineBackup.ts` and `encryptedBackup.ts` used `.length` | Validate UTF-8 byte count for complete backup creation, parse and encryption | Unicode boundary tests |
| P1 | Complete backup files with repeated reading IDs would silently collapse to fewer records during IndexedDB replacement | Backup parsing checked count and shape but not unique IDs | Validate unique journal IDs before destructive restore | v2/v4 duplicate-ID regression tests |
| P1 | Running backup export/import concurrently could create duplicate downloads or allow overlapping restores | `PreferencesPanel.tsx` had no in-flight lock | Synchronous in-flight ref and disabled/busy UI | Same-tick browser double-click test |
| P2 | Reading history stayed stale if a different tab saved/imported entries while the first tab remained on the journal screen | History loaded only on mount | Publish metadata-only revision tokens after committed changes; refetch on cross-tab storage events and tab focus, handling unmount safely | Two-tab IndexedDB browser test; original focus-only attempt failed in Chromium CI |
| P2 | No spreadsheet-friendly export from the local journal | JSON only | Local, filtered CSV summary with UTF-8 BOM and cards/dates/counts/favorites/mood; deliberately omit user questions, readings, notes, tags and free-form spread labels | Privacy-focused unit and browser tests |

**Important:** default CSV is a convenience summary, not a backup. For restoration use encrypted complete JSON. CSV reflects the currently visible filter; it never includes free-text personal reflections. Import is still intentional and journal edits still preserve local entries on duplicate IDs.

## Architecture assessment

Current browser-first design is appropriate: pure Tarot domain logic, IndexedDB journal, bounded localStorage fallback, local-only data portability, service-worker shell caching, and no live account or AI backend.

Recommended technical evolution:

1. **Repository/data boundary:** consolidate storage adapters behind a journal repository with explicit `insert`, `replace`, `merge`, and `exportSnapshot` semantics. Test multi-tab conflicts and version upgrades in real Safari/Firefox. Avoid pretending that localStorage and IndexedDB are a single atomic transaction.
2. **Backup protocol:** use a stable versioned envelope with explicit byte limits and migration tests. Add an integrity manifest/checksum for unencrypted backups only for accidental corruption detection (AES-GCM already authenticates encrypted backups); do not present checksums as security or encryption.
3. **Large archive performance:** as journal history grows, replace `getAll()` pagination with IndexedDB cursor/keyset pagination plus small aggregate indexes. At the current 5,000-entry cap, the simpler implementation remains acceptable.
4. **Cross-tab edits:** prefer an opt-in BroadcastChannel-based invalidation/event model once live multiple-tab editing is a real workflow. Current focus + storage revision invalidation is a low-complexity baseline but cannot prevent deliberate overwrite of an older draft without field-level revision checks.
5. **PWA reliability:** test interrupted service-worker upgrades, cache eviction, browser quota denial and offline retries on physical mobile devices. Do not claim offline cache content survives user-directed browser-data deletion.
6. **UI:** preserve 1-card and 3-card quick paths. Put exports and advanced analysis behind short labels and clear privacy warnings; test screen readers and 320px layout.

## Product comparison and nice-to-have backlog

The Labyrinthos published app history describes physical-card journaling, optional exports, date-filtered logs, quizzes, lessons, image sharing, reminders and multiple decks. Golden Thread historically emphasized guided card education and a journal-mirror experience. Pocket Tarot should differentiate through **local-first ownership**, clear Mongolian-language learning, and no forced accounts.

Candidates in priority order:

- **P2:** optional revisiting of an earlier saved reflection with its outcome, without aggressive notifications or deterministic prediction claims
- **P2:** card meaning text editorial review for all 78 Mongolian/English entries and clearer language parity
- **P2:** accessible visual previews and stronger keyboard navigation for manual physical-card input
- **P2:** optional summarized CSV insights and chart visualization from device-local history (only on demand)
- **P3:** favorite spread shortcuts, one-page onboarding, printable card glossary, deterministic sample readings
- **P3:** opt-in export batches for journals near the 5,000-record or 20MB backup limit
- **P3:** browser-only search indexes for large journals if testing shows a performance need

Do not introduce user accounts, cloud-sync secrets, paid AI, or long-term engagement nudges simply for feature parity.

## Outstanding, not implemented or certified

- Provider-side rotation and revocation of **historically exposed credentials**, audit of old access logs and sessions
- Owner-authorized migration of legacy account data and record-count reconciliation before service retirement
- Independent astrology ephemeris/old time-zone validation, plus full date/time accuracy fixtures
- Commercial artwork rights and human Tarot text/licensing review
- Real-device iOS Safari/Android Chrome checks, accessibility audit, low-storage interruption testing
- Production rollback rehearsal and release-owner approval. **No production deployment in this wave.**

## Verification

```bash
cd front-end
npm ci --legacy-peer-deps
npm test
npm run test:legacy
npm run lint
npm run typecheck
npm run build
npx playwright test
```

The PR merge gate requires all GitHub Actions checks on the latest head to pass. A post-merge `main` run must be reviewed separately.
