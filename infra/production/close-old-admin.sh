#!/usr/bin/env bash
# Turns off public access to the built-in Strapi admin, once https://admin.chic.ngo works:
#   - strapi.chic.ngo only serves /api/*, /uploads/* and /_health (infra/nginx/strapi.chic.ngo.conf)
#   - Strapi's port 1337 is bound to 127.0.0.1 instead of the whole internet
#   - the staging test copy is stopped so nobody keeps editing it by mistake
#   bash infra/production/close-old-admin.sh
set -euo pipefail

HOST="${CHIC_SSH_HOST:-chic-prod}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

[ "$(curl -s -o /dev/null -w '%{http_code}' https://admin.chic.ngo/login)" = 200 ] \
  || { echo "https://admin.chic.ngo is not reachable yet; not closing the old admin."; exit 1; }

rsync -az "$ROOT/infra/nginx/strapi.chic.ngo.conf" "$HOST:/root/chic-admin/strapi-nginx.conf"
ssh "$HOST" bash -s <<'EOF'
set -euo pipefail
TS="$(date +%Y%m%d-%H%M%S)"
cp /etc/nginx/sites-enabled/strapi.chic.ngo.conf "/root/backups/strapi.chic.ngo.conf-$TS"
cp /root/chic-strapi/docker-compose.yml "/root/backups/chic-strapi-docker-compose.yml-$TS"

echo "[prod] Restricting strapi.chic.ngo to the content API..."
cp /root/chic-admin/strapi-nginx.conf /etc/nginx/sites-enabled/strapi.chic.ngo.conf
nginx -t -q || { cp "/root/backups/strapi.chic.ngo.conf-$TS" /etc/nginx/sites-enabled/strapi.chic.ngo.conf; echo "nginx config invalid, restored"; exit 1; }
systemctl reload nginx

if grep -q '"1337:1337"' /root/chic-strapi/docker-compose.yml; then
  echo "[prod] Closing Strapi's public port (Strapi restarts, about 1-2 minutes)..."
  sed -i 's/"1337:1337"/"127.0.0.1:1337:1337"/' /root/chic-strapi/docker-compose.yml
  (cd /root/chic-strapi && docker compose up -d strapi)
  for i in $(seq 1 120); do [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:1337/_health)" = 204 ] && break; sleep 3; done
fi

if [ -f /root/chic-staging/docker-compose.yml ]; then
  echo "[prod] Stopping the staging test copy..."
  (cd /root/chic-staging && docker compose stop)
fi
EOF

check() { printf '  %-45s %s (want %s)\n' "$1" "$(curl -s -o /dev/null -m 10 -w '%{http_code}' "$1" || true)" "$2"; }
echo "[prod] Checks:"
check https://chic.ngo/hy 200
check "https://strapi.chic.ngo/api/coursess?locale=hy" 200
check https://strapi.chic.ngo/admin 404
check http://77.237.245.211:1337/admin 000
check https://admin.chic.ngo/login 200
