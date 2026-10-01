#!/usr/bin/env bash
# Validate Phase 1 course detail pages and core deployment health.
set -u

PASS=0
FAIL=0
WARN=0

pass() { echo "[PASS] $*"; PASS=$((PASS + 1)); }
fail() { echo "[FAIL] $*"; FAIL=$((FAIL + 1)); }
warn() { echo "[WARN] $*"; WARN=$((WARN + 1)); }

check_http() {
  local label="$1"
  local url="$2"
  local expected="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$url" || echo "000")
  if [ "$code" = "$expected" ]; then
    pass "$label ($code) $url"
  else
    fail "$label expected HTTP $expected got $code — $url"
  fi
}

echo "=== Course Pages Validation ==="
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo

# Container health
for c in chic-frontend strapi strapi-db; do
  status=$(docker inspect -f '{{.State.Status}}' "$c" 2>/dev/null || echo "missing")
  if [ "$status" = "running" ]; then
    pass "container $c is Up ($status)"
  else
    fail "container $c not running (status=$status)"
  fi
done

echo
echo "--- List pages ---"
check_http "HY courses list" "https://chic.ngo/hy/courses"
check_http "EN courses list" "https://chic.ngo/en/courses"
check_http "RU courses list" "https://chic.ngo/ru/courses"

echo
echo "--- Strapi admin ---"
check_http "Strapi admin" "https://strapi.chic.ngo/admin"

echo
echo "--- Course detail (from live Strapi API) ---"
if ! command -v python3 >/dev/null 2>&1; then
  fail "python3 required to parse Strapi JSON"
else
  API_JSON=$(curl -s --max-time 20 "https://strapi.chic.ngo/api/coursess?populate=*&locale=hy" || true)
  PARSED=$(printf '%s' "$API_JSON" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    x = d.get('data', [{}])[0]
    print(x.get('documentId', ''))
    print(x.get('title', ''))
except Exception:
    print('')
    print('')
" 2>/dev/null || true)

  DOC_ID=$(printf '%s\n' "$PARSED" | sed -n '1p')
  TITLE=$(printf '%s\n' "$PARSED" | sed -n '2p')

  if [ -z "$DOC_ID" ]; then
    fail "could not fetch HY course documentId from Strapi"
  else
    pass "fetched documentId=$DOC_ID"
    DETAIL_URL="https://chic.ngo/hy/courses/${DOC_ID}"
    check_http "HY course detail" "$DETAIL_URL"

    HTML=$(curl -s --max-time 20 "$DETAIL_URL" || true)
    if [ -n "$TITLE" ] && printf '%s' "$HTML" | grep -Fq "$TITLE"; then
      pass "course title found in detail HTML"
    elif [ -n "$HTML" ] && [ "${#HTML}" -gt 1000 ]; then
      warn "detail page loaded but title substring not found in HTML (title may be encoded differently)"
    else
      fail "detail HTML empty or too short"
    fi
  fi
fi

echo
echo "--- nginx config (local) ---"
if nginx -t >/dev/null 2>&1; then
  pass "nginx -t syntax OK"
else
  fail "nginx -t failed"
fi

echo
echo "=== Summary ==="
echo "PASS: $PASS  FAIL: $FAIL  WARN: $WARN"
if [ "$FAIL" -gt 0 ]; then
  echo "Result: FAILED"
  exit 1
fi
echo "Result: OK"
exit 0
