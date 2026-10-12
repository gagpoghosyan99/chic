#!/usr/bin/env bash
# Deploys the admin panel test site to the server (in /root/chic-staging).
# Production containers and data are only read (database dump, uploads copy), never changed.
#   bash infra/staging/deploy.sh            update code, keep test data
#   bash infra/staging/deploy.sh --refresh  also re-copy production data into the test database
set -euo pipefail

HOST="${CHIC_SSH_HOST:-chic-prod}"
DIR=/root/chic-staging
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CREDS="$ROOT/.dev/staging-credentials.txt"
REFRESH="${1:-}"

echo "[staging] Uploading code..."
ssh "$HOST" "mkdir -p $DIR/admin $DIR/strapi && chmod 700 $DIR"
rsync -az --delete --exclude node_modules --exclude .next --exclude .next-build --exclude '.env*' "$ROOT/admin/" "$HOST:$DIR/admin/"
for d in config src types; do rsync -az --delete "$ROOT/strapi/$d/" "$HOST:$DIR/strapi/$d/"; done
rsync -az "$ROOT/infra/staging/docker-compose.yml" "$HOST:$DIR/"

if ! ssh "$HOST" "test -f $DIR/.env.admin"; then
  echo "[staging] First deploy: creating secrets and an admin password..."
  PASSWORD="$(node -e 'console.log(require("crypto").randomBytes(9).toString("base64url"))')"
  HASH="$(node -e 'const c=require("crypto");const s=c.randomBytes(16);console.log(`scrypt.${s.toString("base64url")}.${c.scryptSync(process.argv[1],s,64).toString("base64url")}`)' "$PASSWORD")"
  mkdir -p "$ROOT/.dev" && umask 077
  printf 'Admin panel test site\n  password: %s\n' "$PASSWORD" > "$CREDS"
  ssh "$HOST" "HASH='$HASH' bash -s" <<'EOF'
set -euo pipefail
cd /root/chic-staging
umask 077
r() { openssl rand -base64 "${1:-24}" | tr -d '\n'; }
DBPW="$(openssl rand -hex 24)"
printf 'STAGING_DB_PASSWORD=%s\n' "$DBPW" > .env
cat > .env.strapi <<ENV
HOST=0.0.0.0
PORT=1337
APP_KEYS=$(r),$(r),$(r),$(r)
API_TOKEN_SALT=$(r)
ADMIN_JWT_SECRET=$(r)
TRANSFER_TOKEN_SALT=$(r)
ENCRYPTION_KEY=$(r)
JWT_SECRET=$(r)
DATABASE_CLIENT=postgres
DATABASE_HOST=staging-db
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=$DBPW
DATABASE_SSL=false
STRAPI_TELEMETRY_DISABLED=true
ENV
cat > .env.admin <<ENV
STRAPI_URL=http://staging-strapi:1337
STRAPI_PUBLIC_URL=
SITE_URL=https://chic.ngo
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_PASSWORD_HASH=$HASH
STRAPI_TOKEN=
ENV
EOF
  REFRESH=--refresh
fi

ssh "$HOST" "REFRESH='$REFRESH' bash -s" <<'EOF'
set -euo pipefail
cd /root/chic-staging
if [ "$REFRESH" = "--refresh" ]; then
  echo "[staging] Copying production data (read-only) into the test database..."
  docker compose stop staging-strapi staging-admin >/dev/null 2>&1 || true
  docker compose up -d staging-db
  until docker exec chic-staging-db pg_isready -U strapi -d strapi >/dev/null 2>&1; do sleep 1; done
  docker exec chic-staging-db psql -q -U strapi -d postgres -c 'DROP DATABASE IF EXISTS strapi WITH (FORCE)' -c 'CREATE DATABASE strapi'
  docker exec strapi-db pg_dump -U strapi -d strapi --no-owner --no-privileges | docker exec -i chic-staging-db psql -q -U strapi -d strapi >/dev/null
  mkdir -p strapi/public && rsync -a --delete /root/chic-strapi/chic/public/ strapi/public/
fi

echo "[staging] Building and starting containers..."
docker compose up -d --build staging-db staging-strapi
until curl -fs -o /dev/null http://127.0.0.1:1338/_health; do sleep 3; done

TOKEN="$(sed -n 's/^STRAPI_TOKEN=//p' .env.admin)"
if [ -z "$TOKEN" ] || [ "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" http://127.0.0.1:1338/api/panel/social/entries)" != 200 ]; then
  echo "[staging] Creating the admin panel's Strapi API token..."
  EMAIL=panel@chic.local
  PW="Panel-$(openssl rand -hex 12)A1"
  docker exec chic-staging-strapi npx strapi admin:create-user --firstname=Admin --lastname=Panel --email=$EMAIL --password="$PW" >/dev/null 2>&1 \
    || docker exec chic-staging-strapi npx strapi admin:reset-user-password --email=$EMAIL --password="$PW" >/dev/null
  JWT="$(curl -fs -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}" http://127.0.0.1:1338/admin/login | sed -E 's/.*"token":"([^"]+)".*/\1/')"
  TOKEN="$(curl -fs -H 'Content-Type: application/json' -H "Authorization: Bearer $JWT" \
    -d "{\"name\":\"admin-panel-$(date +%s)\",\"type\":\"full-access\",\"lifespan\":null,\"description\":\"Admin panel test site\"}" \
    http://127.0.0.1:1338/admin/api-tokens | sed -E 's/.*"accessKey":"([^"]+)".*/\1/')"
  sed -i "s/^STRAPI_TOKEN=.*/STRAPI_TOKEN=$TOKEN/" .env.admin
fi

docker compose up -d --build --force-recreate staging-admin
docker compose up -d staging-tunnel
until curl -fs -o /dev/null http://127.0.0.1:3101/login; do sleep 2; done
for i in $(seq 1 30); do
  URL="$(docker logs chic-staging-tunnel 2>&1 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1 || true)"
  [ -n "$URL" ] && break; sleep 2
done
echo "[staging] Ready."
echo "  Temporary public link: ${URL:-not ready yet, run: docker logs chic-staging-tunnel}"
echo "  admin.chic.ngo works once its DNS record exists and nginx has infra/nginx/admin.chic.ngo.conf"
EOF
echo "[staging] Password is in .dev/staging-credentials.txt"
