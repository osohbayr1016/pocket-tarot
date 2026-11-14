#!/usr/bin/env bash
set -euo pipefail
# Production deployment is deliberately never triggered by a local script.
printf '%s\n' \
  'Pocket Tarot: automatic production deployment from this script is disabled.' \
  'The v2 frontend needs no account backend or API URL.' \
  'Follow RELEASE_RUNBOOK.md and explicit owner release sign-off.' >&2
exit 2
