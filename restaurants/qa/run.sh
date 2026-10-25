#!/usr/bin/env bash
# Starts the fake Supabase and the dev server, runs the QA scripts, and stops both.
#   npm run qa                 smoke + admin
#   npm run qa -- gallery-flow run one script (smoke, admin, gallery-flow, or any qa/*.js)
# Needs: Playwright (preinstalled in the cloud workspace) and `npm install` done in restaurants/.
set -u
cd "$(dirname "$0")/.."
PORT=${QA_PORT:-3111}
export SUPABASE_URL=http://localhost:54321 SUPABASE_ANON_KEY=sb_publishable_fake SUPABASE_SCHEMA=trattoria_demo QA_BASE=http://localhost:$PORT
export NODE_PATH="${NODE_PATH:-}:$(dirname "$(node -e "console.log(require.resolve('playwright'))" 2>/dev/null)")/.."
node qa/fake-supabase.js > /tmp/qa-fake.log 2>&1 & FAKE=$!
npx next dev -p "$PORT" > /tmp/qa-dev.log 2>&1 & DEV=$!
trap 'kill $FAKE $DEV 2>/dev/null; wait 2>/dev/null' EXIT
for i in $(seq 1 40); do curl -s -o /dev/null "http://localhost:$PORT/menu" && break; sleep 3; done
status=0
for s in ${@:-smoke admin}; do echo "── $s"; node "qa/$s.js" || status=1; done
echo "fake Supabase log: /tmp/qa-fake.log (PATCH / INSERT / UPLOAD lines show what the admin wrote)"
exit $status
