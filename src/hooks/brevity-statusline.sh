#!/usr/bin/env bash
set -euo pipefail

state_dir="${BREVITY_STATE_DIR:-$HOME/.brevity}"
flag="${state_dir}/.claude-active"

if [ ! -f "$flag" ]; then
  exit 0
fi

mode="$(head -c 64 "$flag" 2>/dev/null | tr -d '\n\r' || true)"
if [ -z "$mode" ] || [ "$mode" = "auto" ]; then
  printf '\033[38;5;33m[BREVITY]\033[0m'
else
  upper="$(printf '%s' "$mode" | tr '[:lower:]' '[:upper:]')"
  printf '\033[38;5;33m[BREVITY:%s]\033[0m' "$upper"
fi
