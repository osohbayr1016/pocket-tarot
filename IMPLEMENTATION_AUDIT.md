# Pocket Tarot implementation audit (2026-11-13)

Branch: `feat/offline-tarot-foundation`; PR [#1](https://github.com/osohbayr1016/pocket-tarot/pull/1), pending review/merge.

## Audit progression

| Priority | Original gap | Current implementation |
| --- | --- | --- |
| P0 | Tracked production secrets | Sensitive env file removed from branch and ignored. **Rotate real leaked credentials; old history/main still contain them until proper remediation.** |
| P0 | Legacy AI/auth backend exposed API key hints, insecure auth patterns | Compatibility backend now returns 410 on deprecated routes; no AI/auth backend necessary for front-end |
| P0 | Build/deployment confidence | GitHub Actions: Node/Jest/TypeScript/ESLint/production build, 78 JPG+WebP assets, Chromium E2E |
| P1 | Unfair shuffling and AI dependency | Web Crypto Fisher-Yates, no duplicates, reversible draws and local contextual tarot interpretation |
| P1 | 78 missing real images | Original 78 JPG + 78 compressed local WebP and validators |
| P1 | Limited reading options | Five traditional spreads, custom bounded positions 1–12, 1-card and daily card |
| P1 | Nonfunctional astrology beyond static zodiac | Local MIT Astronomy Engine ephemeris, ten bodies, tropical zodiac, numeric ascendant, aspects, Whole Sign houses |
| P1 | No comprehensive journal | Saved readings/notes, deletion, validated JSON export/import, Canvas PNG, print/PDF |
| P1 | Limited offline UX | PWA service worker and manifest, responsive nav, focus managed card library |
| P2 | Simplistic dream guidance | Enlarged transparent rule-based symbol dictionary (not psychological diagnosis) |
| P2 | No educational content | Major Arcana quiz and card reference |
| P3 | Shareable output | Local PNG and print/PDF functionality |

## Engineering precision and truthfulness

- “Offline” means calculation requires no runtime inference API/backend. First PWA install and app updates still require network.
- Astronomical coordinates are computed, but astrology's interpretive predictions have no scientific guarantee; only **Whole Sign** houses, not Placidus, and the user must validate historical timezone offset.
- Some Tarot attribution choices vary by tradition. Editorial review is outstanding.
- Journal uses browser localStorage, not encrypted cloud backup; user should export before clearing site data.
- Traditional metadata and meaning translations need expert scrutiny for cultural nuances.
- Historic credential exposure cannot be fixed merely by removing it from HEAD; rotation remains mandatory.
- Old deployment scripts/documentation may reference the retired backend and must not be followed for the new frontend.

## Required manual release checks

- Audit and rotate any exposed production keys; inspect old deployments.
- Review/approve PR #1, verify preview and production deployment and ensure rollback.
- Test Safari/iOS, Android Chrome, keyboard and screen reader, offline after warm PWA cache, low storage and private browsing.
- Domain expert content check for all 78 cards; independent planetary fixture comparisons across tricky historical DST and high latitudes.
