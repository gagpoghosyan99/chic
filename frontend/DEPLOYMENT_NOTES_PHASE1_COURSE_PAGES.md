# Phase 1 Course Detail Pages — Deployment Notes

Date stabilized: 2026-07-07

## What changed (Phase 1)

Frontend-only changes for individual course pages using existing Strapi `documentId` (no schema changes):

| File | Change |
|------|--------|
| `lib/strapi.ts` | Added `fetchCourseByDocumentId()` |
| `app/[locale]/courses/[documentId]/page.tsx` | New server page + `generateMetadata()` |
| `app/[locale]/courses/[documentId]/CourseDetailClient.tsx` | New detail view + registration form |
| `app/components/home/CoursesSection.tsx` | Course cards link to detail pages (modals removed) |

**Not changed:** Strapi schema, database, nginx config, registration payload, slugs, UI redesign.

## Source of truth

Canonical working copy on this server:

```text
/root/chic-frontend
```

The production container `chic-frontend` runs image `chicinfra/chic:frontend-prod` on port `3000`. After code changes, sync source into the container and rebuild inside it.

## How to build

Host does **not** have Node.js installed. Build inside the frontend container:

```bash
# 1. Sync local source into the running container
docker cp /root/chic-frontend/lib/strapi.ts chic-frontend:/app/lib/strapi.ts
docker cp /root/chic-frontend/app/components/home/CoursesSection.tsx chic-frontend:/app/app/components/home/CoursesSection.tsx
docker cp "/root/chic-frontend/app/[locale]/courses/[documentId]" chic-frontend:/app/app/[locale]/courses/

# Or sync the full tree when many files changed:
# docker cp /root/chic-frontend/. chic-frontend:/app/

# 2. Build inside container
docker exec chic-frontend sh -c 'cd /app && npm run build'
```

Alternative (if container unavailable): use a Node Docker image with the host directory mounted.

## How to restart the frontend container

```bash
docker restart chic-frontend
# Wait for Next.js to become ready (~5–10s) before validating
sleep 8
docker ps --filter name=chic-frontend
/root/chic-frontend/scripts/validate-course-pages.sh
```

Compose file (reference): `/root/chic-frontend/docker-compose.yml`

```bash
cd /root/chic-frontend && docker compose up -d
```

Current restart policy: `always` (container `chic-frontend`).

## Validation URLs

List pages:

- https://chic.ngo/hy/courses
- https://chic.ngo/en/courses
- https://chic.ngo/ru/courses

Example detail page (HY):

- https://chic.ngo/hy/courses/p1eb3lbbfigruj2wv17juhq1

Automated check:

```bash
/root/chic-frontend/scripts/validate-course-pages.sh
```

## Rollback from backup

Backups live under `/root/backups/chic-stabilization-*`.

```bash
# List backups
ls -lt /root/backups/

# Restore frontend source (example)
BACKUP=/root/backups/chic-stabilization-YYYYMMDDHHMMSS
rm -rf /root/chic-frontend
mkdir -p /root
tar -xzf "$BACKUP/chic-frontend.tar.gz" -C /root

# Restore Strapi config/source snapshot
tar -xzf "$BACKUP/chic-strapi-config.tar.gz" -C /root/chic-strapi --strip-components=0
# Note: extract paths depend on archive layout; inspect with tar -tzf first.

# Re-sync into container, rebuild, restart
docker cp /root/chic-frontend/. chic-frontend:/app/
docker exec chic-frontend sh -c 'cd /app && npm run build'
docker restart chic-frontend
```

## Strapi warning

**Strapi schema was not changed in Phase 1.** Course URLs use opaque `documentId` values from the existing API. Slugs and schema changes are deferred to a later phase.

## Strapi stack (reference)

Path: `/root/chic-strapi`

```bash
cd /root/chic-strapi && docker compose ps
cd /root/chic-strapi && docker compose up -d   # if services stopped
```

Restart policies: `unless-stopped` for `strapi` and `strapi-db`. PostgreSQL bound to `127.0.0.1:5432` only.
