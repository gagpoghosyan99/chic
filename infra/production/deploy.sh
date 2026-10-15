#!/usr/bin/env bash
# Deploys the admin panel to production (https://chic.ngo/admin) and the Strapi code it needs.
#   bash infra/production/deploy.sh
# Every run first backs up the production database and Strapi code to /root/backups on the server.
set -euo pipefail

HOST="${CHIC_SSH_HOST:-chic-prod}"
DIR=/root/chic-admin
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CREDS="$ROOT/.dev/production-credentials.txt"

echo "[prod] Backing up the database and Strapi code..."
ssh "$HOST" bash -s <<'EOF'
set -euo pipefail
mkdir -p /root/backups && chmod 700 /root/backups
TS="$(date +%Y%m%d-%H%M%S)"
docker exec strapi-db pg_dump -U strapi -d strapi | gzip > "/root/backups/strapi-db-$TS.sql.gz"
tar czf "/root/backups/strapi-code-$TS.tgz" -C /root/chic-strapi chic/src chic/config chic/types docker-compose.yml -C /etc/nginx sites-enabled
chmod 600 /root/backups/*
[ "$(zcat "/root/backups/strapi-db-$TS.sql.gz" | grep -c '^COPY ')" -gt 10 ] || { echo "Database backup looks empty"; exit 1; }
echo "  /root/backups/strapi-db-$TS.sql.gz ($(du -h "/root/backups/strapi-db-$TS.sql.gz" | cut -f1))"
EOF

echo "[prod] Updating Strapi code..."
CHANGED="$(rsync -rlptz --checksum --itemize-changes "$ROOT/strapi/src/" "$HOST:/root/chic-strapi/chic/src/" | grep -v '^\.d' || true)"
if [ -n "$CHANGED" ]; then
  echo "$CHANGED" | sed 's/^/  /'
  ssh "$HOST" 'chown -R 1000:1000 /root/chic-strapi/chic/src'
  echo "[prod] Restarting Strapi (the website's content API is briefly unavailable)..."
  ssh "$HOST" bash -s <<'EOF'
docker restart strapi >/dev/null
for i in $(seq 1 120); do [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:1337/_health)" = 204 ] && exit 0; sleep 3; done
echo "Strapi did not come back"; exit 1
EOF
fi

echo "[prod] Uploading the admin panel..."
ssh "$HOST" "mkdir -p $DIR/admin; chmod 700 $DIR"
rsync -az --delete --exclude node_modules --exclude .next --exclude .next-build --exclude '.env*' "$ROOT/admin/" "$HOST:$DIR/admin/"
rsync -az "$ROOT/infra/production/docker-compose.yml" "$ROOT/infra/production/create-api-token.js" "$HOST:$DIR/"
rsync -az "$ROOT/infra/nginx/chic.ngo.conf" "$HOST:$DIR/nginx.conf"

if ! ssh "$HOST" "test -f $DIR/.env"; then
  echo "[prod] First deploy: creating the admin password and secrets..."
  PASSWORD="$(node -e 'console.log(require("crypto").randomBytes(9).toString("base64url"))')"
  HASH="$(node -e 'const c=require("crypto");const s=c.randomBytes(16);console.log(`scrypt.${s.toString("base64url")}.${c.scryptSync(process.argv[1],s,64).toString("base64url")}`)' "$PASSWORD")"
  mkdir -p "$ROOT/.dev" && (umask 077 && printf 'CHIC admin panel (https://chic.ngo/admin)\n  password: %s\n' "$PASSWORD" > "$CREDS")
  ssh "$HOST" "HASH='$HASH' bash -s" <<'EOF'
set -euo pipefail
umask 077
cat > /root/chic-admin/.env <<ENV
STRAPI_URL=http://strapi:1337
STRAPI_PUBLIC_URL=https://strapi.chic.ngo
SITE_URL=https://chic.ngo
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_PASSWORD_HASH=$HASH
STRAPI_TOKEN=
ENV
EOF
fi

ssh "$HOST" bash -s <<'EOF'
set -euo pipefail
cd /root/chic-admin
TOKEN="$(sed -n 's/^STRAPI_TOKEN=//p' .env)"
if [ -z "$TOKEN" ] || [ "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" http://127.0.0.1:1337/api/panel/social/entries)" != 200 ]; then
  echo "[prod] Creating the admin panel's Strapi API token..."
  docker cp create-api-token.js strapi:/tmp/create-api-token.js
  TOKEN="$(docker exec -w /app/chic -e NODE_PATH=/app/chic/node_modules -e PORT=1339 -e TOKEN_NAME=chic-admin-panel strapi node /tmp/create-api-token.js | sed -n 's/^ACCESS_KEY=//p')"
  docker exec -u root strapi rm -f /tmp/create-api-token.js
  [ -n "$TOKEN" ] || { echo "Token creation failed"; exit 1; }
  sed -i "s/^STRAPI_TOKEN=.*/STRAPI_TOKEN=$TOKEN/" .env
  [ "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" http://127.0.0.1:1337/api/panel/social/entries)" = 200 ] || { echo "New token does not work"; exit 1; }
fi

echo "[prod] Building and starting the admin panel..."
docker compose up -d --build --force-recreate admin
for i in $(seq 1 60); do curl -fs -o /dev/null http://127.0.0.1:3100/admin/login && break; sleep 2; done
curl -fs -o /dev/null http://127.0.0.1:3100/admin/login || { echo "Admin panel did not start"; exit 1; }

rm -f /etc/nginx/sites-enabled/admin.chic.ngo.conf
SITE=/etc/nginx/sites-enabled/chic.ngo.conf
if ! cmp -s nginx.conf "$SITE"; then
  echo "[prod] Routing chic.ngo/admin to the admin panel..."
  BACKUP="/root/backups/chic.ngo.conf-$(date +%Y%m%d-%H%M%S)"
  cp "$SITE" "$BACKUP" && cp nginx.conf "$SITE"
  nginx -t -q || { cp "$BACKUP" "$SITE"; echo "nginx config invalid, restored"; exit 1; }
fi
systemctl reload nginx
echo "[prod] Admin panel is running."
EOF
echo "[prod] Password is in .dev/production-credentials.txt"
