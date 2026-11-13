# Pocket Tarot — release and rollback runbook

**Scope:** Pocket Tarot v2 PR #1 was merged into `main` at commit `2630a6366f8aaaa50b57f2d9b65abac46765ed80` by explicit owner request. **Code merge is not proof that a hosted deployment is live or approved**. Follow this runbook before promoting any Vercel/other production deployment. The former main commit is `da72df580a9ab7481906f308fc30b7fb6cee30a7`.

## Stage 1 — credential incident (owner only)

1. Audit and rotate all real credentials that were ever tracked, including database passwords, JWT signing secrets, Gemini keys and OAuth secrets. Revocation/rotation must happen at the provider; deleting files or rewriting commits is insufficient.
2. Check provider audit logs, DB network access, stale sessions and old Render deployments.
3. Confirm remote back-end retired endpoints no longer expose credentials or user data; smoke checks of a replacement frontend cannot establish shutdown of an old Render URL.
4. Preserve incident notes securely outside the public repository; do not paste old values into an issue or PR.
5. Mark this as closed only once the owner verifies rotation and old services.

## Stage 2 — data migration rehearsal

1. Ask affected users to export **their own** existing records via authenticated, owner-controlled legacy service. Do not scrape/impersonate an account.
2. Save a protected offline backup from the old frontend and count/spot-check user-owned records before changing anything.
3. Import into a clean browser profile; verify count, dates, favorites, symbols, notes and 78-card IDs; compare a sample manually.
4. Export new encrypted v4 backup; ensure the passphrase is available to the owner. Round-trip to another empty browser profile.
5. Reconcile missing/corrupt items and verify journal preservation when a browser closes, reloads, and reopens.
6. Only after the above, seek explicit authorization to decommission the old database.

## Stage 3 — technical release gate

- Check that the **latest PR SHA** passes `Pocket Tarot / offline frontend` and `Pocket Tarot / credential & legacy API safety` (including Chromium, Firefox and WebKit smoke). Older green runs don't count.
- Run independent astro fixtures and verify historical timezone cases; don't claim high-precision professional astrology without independent review.
- Review original RWS art/scan rights for each intended market: [ARTWORK_PROVENANCE.md](ARTWORK_PROVENANCE.md).
- Have a qualified editor review all 78 Mongolian upright/reversed meanings, the new English texts, and the Latin-Mongolian dream aliases.
- Manually test a physical iPhone/Safari and Android/Chrome with keyboard, screen reader, Safari PWA install, offline first-load, full cache, cache eviction, slow connections, midnight rollover and phone low storage.
- Test AES-encrypted v4 export, wrong password, missing password, archive of >100 records, and local data migration in an incognito/empty profile.
- Create an authorized preview deployment from the candidate SHA, not from an unrelated branch.
- Execute `node scripts/smoke-public-release.mjs https://approved-preview-host.example` to check app shell, assets and retired API routes.
- Preserve a screenshot of the preview, build SHA, device QA notes and any owner approvals in the release record.

## Stage 4 — promotion (owner-controlled)

1. Agree on a maintenance window and notify existing users to export their notes.
2. Tag last known-good main commit and record deployment identifier + rollback URL.
3. The reviewed PR is already merged. Before promoting a hosting release, verify the exact current `main` SHA passes CI and all owner-controlled security, migration, legal and device gates. Never infer that merge completed those gates.
4. Deploy/approve the merge in the target host, explicitly verify the deployment's commit SHA and smoke check its URL.
5. Test live on desktop/mobile and verify no calls to Render/AI providers or account APIs occur during readings.
6. Monitor client-side functional errors and failed load incidents, without collecting private journal text, questions or birth dates.

## Rollback

If data migration, routing, card assets, PWA upgrade, encryption, or service availability fails:

1. Disable promotion. On Vercel, restore the recorded previous deployment through the platform's supported rollback mechanism.
2. Do **not** delete local user data, reset indexedDB, revoke access to exported backups or revert a migration without an explicit data-recovery plan.
3. Preserve failed PWA worker/cache details, build SHA and anonymized error evidence.
4. Apply a fix on a new branch; repeat all gates and verify the hotfix on staging before re-promoting.

## Remaining external sign-offs

Credential provider rotation, real production account export, actual preview/production deployment, physical-device testing, editor sign-off, historical timezone accuracy and rights review **cannot be completed solely by repository commits**.

**Owner production sign-off:** pending. **Commercial rollout:** not approved until gates are checked. Run the manual GitHub Actions workflow `Pocket Tarot / production promotion gate` with an authorized preview URL and truthful owner self-attestations; it verifies but does not deploy.
