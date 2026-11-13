# Security notice

During the 2026-11-13 repository audit, a tracked file at \`back-end/config.production.env\` contained database/API configuration fields with non-empty values.

The file was removed from the feature branch and added to \`.gitignore\`, but **the values remain recoverable from older Git commits**. Do not treat deletion as credential revocation.

If any production credentials were real:

1. Rotate / revoke the database connection password, \`GEMINI_API_KEY\`, \`JWT_SECRET\` and any other exposed secrets immediately on their respective providers.
2. Move values to your deployment platform secret store. Never include them in frontend bundles or Git.
3. Review provider access logs for unauthorized access, lock down DB network access, and invalidate impacted sessions after JWT rotation.
4. Consider coordinated history rewriting only with backup and a plan for collaborators; **rotation is required regardless of any Git history rewrite**.
5. Treat the legacy backend as optional and review it independently before redeploying. The new frontend does not require backend secrets.

No secret values are reproduced in this document.
