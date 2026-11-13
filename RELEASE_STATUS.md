# Pocket Tarot v2 — integration and production status

Date: 2026-11-13

## Integrated into main

- Pull request: https://github.com/osohbayr1016/pocket-tarot/pull/1
- Merge commit: `2630a6366f8aaaa50b57f2d9b65abac46765ed80`
- Feature head: `8e8e77505798f8658dc8a97fd97930c710a579c0`
- Previous `main` (rollback reference only): `da72df580a9ab7481906f308fc30b7fb6cee30a7`

The v2 code is merged. It contains local/offline Tarot, 78 illustrations, journal and encrypted backups, astrology and learning, bilingual UI, PWA, privacy/terms pages and 7 waves of UX improvements.

## Automated evidence

- Feature-head frontend CI: https://github.com/osohbayr1016/pocket-tarot/actions/runs/43396326371
  - Unit tests, React UI tests, ESLint, TypeScript, production build and art asset verification: PASS
  - Browser Playwright: **101 passed, 8 browser-specific skipped**
- Feature-head credential and legacy API CI: https://github.com/osohbayr1016/pocket-tarot/actions/runs/43396326207 — PASS
- Main post-merge CI must also be checked, and any later code change must pass its own commit's checks.

## External blockers: NOT production-certified

1. **Credential incident:** Provider-side rotation of exposed historical DB/JWT/API/OAuth secrets and review of still-running old deployments. Source removal does not revoke secrets.
2. **Legacy user data:** Verify whether old account-backed readings exist; ensure owner-authorized export, count reconciliation and user migration before production switch. See issue #5.
3. **Human QA:** Physical iOS Safari and Android Chrome installation, low-storage/offline upgrade, screen-reader and assistive-tech tests. Emulators do not replace this.
4. **Content & licensing:** Independent astronomy/DST validation, editorial review and commercial rights sign-off for restored historical artwork.
5. **Deployment:** No approved preview/production host, real network smoke result, rollback rehearsal or live deployment SHA has been verified via repository-only CI.

## Production promotion process

1. Use GitHub Actions workflow **Pocket Tarot / production promotion gate** with an owner-approved HTTPS preview URL and truthful owner self-attestations.
2. Run read-only checks for app shell, privacy/terms, PWA, key artwork and retired API routes.
3. Record the approved deployment identifier and rollback plan. After promotion, verify the deployed SHA and manual device checks.
4. Keep issue #5 open until migration is evidenced; never delete old user data as part of a code rollback.

**Status: v2 integrated to `main`, automated candidate verification passed, commercial production approval pending external gates.** 
