#!/usr/bin/env bash
set -euo pipefail
# The old deployment script previously generated outdated MongoDB/AI credentials
# and could re-enable unsafe account endpoints. Do not deploy it.
printf '%s\n' \
  'Pocket Tarot: legacy backend deployment is intentionally disabled.' \
  'The current app is offline-first; deploy front-end/ only.' \
  'If you still need migration, follow RELEASE_CHECKLIST.md and SECURITY.md.' >&2
exit 2
