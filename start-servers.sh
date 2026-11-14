#!/usr/bin/env bash
set -euo pipefail
# Safe local development: do not launch retired APIs or kill other processes.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
if ! command -v npm >/dev/null 2>&1; then
  printf '%s\n' 'Node.js/npm must be installed first.' >&2
  exit 1
fi
printf '%s\n' 'Starting only the Pocket Tarot frontend (development mode).' \
  'Stop with Ctrl+C; no external processes or ports are terminated.'
exec npm --prefix front-end run dev
