#!/usr/bin/env bash
# One-command local launcher: dependencies, local ClickHouse, least-privilege users, build, server.
#   ./run.sh    replay mode: synthetic fixtures through the real pipeline and local ClickHouse 25.8
# Deliberately does NOT read .env: the provisioning steps are pinned to the local Docker ClickHouse so they can
# never touch ClickHouse Cloud or sponsor accounts. The operator secret comes from SCOPEWATCH_OPERATOR_SECRET,
# else is generated once into runtime/operator-secret (gitignored).
set -euo pipefail
cd "$(dirname "$0")"

die() { echo "run.sh: $*" >&2; exit 1; }

command -v node >/dev/null || die "Node >= 24 is required"
node_major=$(node -p 'process.versions.node.split(".")[0]')
[ "$node_major" -ge 24 ] || die "Node >= 24 is required (found $(node -v))"
command -v docker >/dev/null || die "Docker is required for local ClickHouse"
docker info >/dev/null 2>&1 || die "Docker is installed but not running; start Docker and retry"

# Local-only ClickHouse admin lane; never inherit Cloud settings from the caller's shell.
local_ch() {
  env -u SCOPEWATCH_CH_ADMIN_USER -u SCOPEWATCH_CH_ADMIN_PASSWORD CLICKHOUSE_URL=http://127.0.0.1:18123 "$@"
}

if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "==> Installing dependencies"
  npm ci
fi

echo "==> Starting local ClickHouse"
local_ch npm run --silent ch:up

echo "==> Provisioning local databases and least-privilege users (idempotent)"
local_ch npm run --silent ch:setup

echo "==> Building"
npm run --silent build >/dev/null

mkdir -p runtime
if [ -z "${SCOPEWATCH_OPERATOR_SECRET:-}" ]; then
  if [ ! -s runtime/operator-secret ]; then
    (umask 077; node -e 'process.stdout.write(require("node:crypto").randomBytes(18).toString("base64url"))' > runtime/operator-secret)
  fi
  SCOPEWATCH_OPERATOR_SECRET=$(cat runtime/operator-secret)
  export SCOPEWATCH_OPERATOR_SECRET
  echo "==> Operator secret (local only, stored in runtime/operator-secret): $SCOPEWATCH_OPERATOR_SECRET"
fi

port="${SCOPEWATCH_PORT:-4317}"
for pid in $(lsof -t -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null); do
  # Replace an earlier ScopeWatch server started from this checkout; refuse to touch anything else.
  if ps -o command= -p "$pid" | grep -q 'dist/server/server/main.js' &&
     [ "$(lsof -a -d cwd -p "$pid" -Fn 2>/dev/null | sed -n 's/^n//p')" = "$PWD" ]; then
    echo "==> Stopping previous ScopeWatch server on port $port (pid $pid)"
    kill "$pid"
    for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.25; done
  else
    die "port $port is in use by another process: $(ps -o pid=,command= -p "$pid"). Stop it or set SCOPEWATCH_PORT."
  fi
done

export SCOPEWATCH_MODE=replay
echo "==> Starting ScopeWatch (replay mode) on http://127.0.0.1:${SCOPEWATCH_PORT:-4317}"
exec npm start
