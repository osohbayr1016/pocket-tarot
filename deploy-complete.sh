#!/usr/bin/env bash
set -euo pipefail
# Retired in Pocket Tarot v2. Intentionally no deployments or secret files.
printf '%s\n' \
  'Pocket Tarot: the old full-stack deployment workflow is retired.' \
  'It must not regenerate backend secrets or deploy the legacy service.' \
  'The offline-first frontend has an owner-controlled production promotion gate.' \
  'See RELEASE_RUNBOOK.md, RELEASE_STATUS.md and SECURITY.md.' >&2
exit 2
