#!/bin/sh
# Remove duplicate LiteSpeed Node (lsnode) workers for gazatna-frontend.
# Compatible with /bin/sh (no bash arrays or mapfile needed).
#
# Usage: sh scripts/kill-stale-lsnode.sh
# Cron (every 10 min):
#   */10 * * * * sh $HOME/ghazatna/ghazatna-frontend/scripts/kill-stale-lsnode.sh >/dev/null 2>&1

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
PATTERN="lsnode:${APP_DIR}"

PIDS=$(pgrep -f "$PATTERN" 2>/dev/null | sort -n | tr '\n' ' ')
COUNT=$(echo "$PIDS" | wc -w)

if [ "$COUNT" -le 1 ]; then
  exit 0
fi

NEWEST=$(echo "$PIDS" | tr ' ' '\n' | tail -1)

for pid in $PIDS; do
  if [ "$pid" = "$NEWEST" ]; then
    continue
  fi
  kill "$pid" 2>/dev/null || true
done

sleep 2

for pid in $PIDS; do
  if [ "$pid" = "$NEWEST" ]; then
    continue
  fi
  kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true
done

echo "Removed $((COUNT - 1)) stale lsnode process(es) for ${APP_DIR} (kept PID ${NEWEST})"
