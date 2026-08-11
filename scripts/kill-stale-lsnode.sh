#!/bin/bash
# Remove duplicate LiteSpeed Node (lsnode) workers for gazatna-frontend.
# CloudLinux counts each thread as NPROC — two lsnode copies (~43 threads each)
# alone can exhaust a 100-process limit.
#
# Usage (SSH):
#   bash scripts/kill-stale-lsnode.sh
# Optional cron (every 10 min):
#   */10 * * * * bash $HOME/ghazatna/ghazatna-frontend/scripts/kill-stale-lsnode.sh >/dev/null 2>&1

set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
PATTERN="lsnode:${APP_DIR}"

mapfile -t PIDS < <(pgrep -f "$PATTERN" 2>/dev/null | sort -n -u || true)
COUNT=${#PIDS[@]}

if [ "$COUNT" -le 1 ]; then
  exit 0
fi

# Keep the newest worker (highest PID); terminate older duplicates.
STALE=("${PIDS[@]:0:$((COUNT - 1))}")

for pid in "${STALE[@]}"; do
  kill "$pid" 2>/dev/null || true
done

sleep 2

for pid in "${STALE[@]}"; do
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi
done

echo "Removed ${#STALE[@]} stale lsnode process(es) for ${APP_DIR} (kept PID ${PIDS[$((COUNT - 1))]})"
