#!/usr/bin/env bash
set -euo pipefail
# Process names and ports may belong to other projects, so this script is non-destructive.
printf '%s\n' \
  'Pocket Tarot: stop the frontend in the terminal running start-servers.sh using Ctrl+C.' \
  'This safety script does not terminate unrelated processes.'
