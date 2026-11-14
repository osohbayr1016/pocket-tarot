#!/usr/bin/env bash
set -euo pipefail
# No broad pkill/kill -9: ports and process names may belong to other projects.
printf '%s\n' \
  'Pocket Tarot: stop the frontend in the terminal running start-servers.sh using Ctrl+C.' \
  'This safety script does not terminate unrelated processes.'
