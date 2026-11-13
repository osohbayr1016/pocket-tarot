# Pocket Tarot — Deprecated Backend

**Current architecture:** The Pocket Tarot web application runs in the browser. No account service, database, remote AI provider, or Express API is needed for Tarot readings, local journal, study, or astrology.

The compatibility server in `server.js` only exposes `GET /api/health`. All other `/api/*` endpoints return **HTTP 410 Gone**. Do not deploy the old authentication, AI, or database routes.

## Local verification

```bash
cd back-end
npm ci
npm test
npm start
```

Expected responses:
- `GET /api/health`: 200, `backend: deprecated`
- `POST /api/auth/login`: 410
- `GET /api/readings`: 410
- `GET /api/ai/test`: 410

These old endpoints must not be re-enabled as written.

## Security incident / migration

**Historical repository documentation and configuration contained credentials.** All exposed values must be considered compromised, even after deletion from the current branch. Rotate or revoke them through the relevant service providers, audit access logs, invalidate old sessions, and use a platform secret store for any future server. Editing Git history alone is not credential rotation.

**DO NOT copy old configuration snippets from Git history.** For non-sensitive sample configuration use `.env.example` only. Avoid deploying any backend until its remaining dependencies and routes are independently reviewed.

To migrate users, export account-owned data from a secure authenticated legacy service under the user's authorization. The new offline app can import the user's own JSON export locally. Confirm counts and ownership before retiring the old database. Refer to [../RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md) and [../SECURITY.md](../SECURITY.md).

## Why the old code remains

Old models and routes are retained temporarily for a reviewed, *offline* migration mapping. They are not mounted in `server.js`. Delete them once data migration has been signed off. Avoid reviving the old login/database code without a separate security design and tests.
