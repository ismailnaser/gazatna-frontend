#!/bin/bash
# cPanel Node.js startup wrapper — use as "Application startup file" instead of server.js
# if your panel allows .sh, OR run manually before Restart:
#   bash scripts/start-cpanel.sh
#
# 1) kills duplicate lsnode workers
# 2) starts Next with conservative thread/memory limits for shared hosting

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash "$ROOT/scripts/kill-stale-lsnode.sh" || true

export NODE_ENV="${NODE_ENV:-production}"
export UV_THREADPOOL_SIZE="${UV_THREADPOOL_SIZE:-4}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

exec node server.js
