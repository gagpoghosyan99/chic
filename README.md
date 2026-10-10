# chic

Source for [chic.ngo](https://chic.ngo), mirrored from the production server (`chic-prod`, 77.237.245.211).

| Path | What it is | Runs on server as |
|---|---|---|
| `frontend/` | Next.js site (`chic.ngo`) | `chic-frontend` container, port 3000, from `/root/chic-frontend` |
| `strapi/` | Strapi CMS (`strapi.chic.ngo`) | `strapi` container, port 1337, from `/root/chic-strapi/chic` |
| `admin/` | New CHIC admin panel (Next.js), planned for `admin.chic.ngo` | not deployed yet |
| `infra/nginx/` | nginx site configs | `/etc/nginx/sites-enabled/` |
| `infra/docker-compose.*.yml` | Compose files | `/root/chic-frontend`, `/root/chic-strapi`, `/root/watchtower` |

Images are pulled from Docker Hub (`chicinfra/chic:frontend-prod`, `chicinfra/chic:strapi-prod`) and auto-updated by Watchtower. Cloudflare terminates HTTPS in front of nginx.

Secrets (`.env` files), the Postgres data directory, and `strapi/public/uploads` are not in this repo.

## Local development (no Docker)

Needs only **Node.js 20–24** and npm. Everything runs on your Mac: a local Postgres (installed through npm into `.dev/`), a development Strapi, and the admin panel. Nothing writes to production.

```bash
npm run db:pull   # once: copy production data + images to your Mac (read-only on the server)
npm run setup     # once: install everything, create the dev database, load the copy
npm run dev       # every day: start everything; Ctrl+C stops it
```

Then open **http://localhost:3001**. The password is in `.dev/dev-credentials.txt`.

| Command | What it does |
|---|---|
| `npm run dev` | Starts local Postgres (port 5433), dev Strapi (http://127.0.0.1:1337) and the admin panel (http://localhost:3001) |
| `npm run dev:site` | Same, plus the public website at http://localhost:3000, reading from dev Strapi |
| `npm run db:pull` | Downloads a fresh copy of production data into `.dev/snapshot.sql` and images into `strapi/public/uploads` (needs the `chic-prod` SSH alias; only reads from the server) |
| `npm run db:reset` | Throws away local changes and reloads the dev database from `.dev/snapshot.sql` |

How production is kept safe:

- The dev database is `chic_dev` on `127.0.0.1:5433`, inside `.dev/`. `npm run dev` refuses to start if `strapi/.env` points anywhere else.
- `npm run setup` writes `strapi/.env` and `admin/.env.local` with fresh local-only secrets. The dev Strapi API token and the dev Strapi admin user are created automatically.
- `.dev/` (snapshot with personal data, database, passwords) and all `.env` files are git-ignored. Never commit them.

### Admin panel

- Interface in Armenian, Russian and English (switch in the sidebar).
- Edit every website section, with all three languages side by side; save as draft or publish; preview before publishing.
- Drag and drop to reorder the team, courses and blog.
- Upload and pick images; YouTube videos in articles.
- Course registrations and volunteer applications, with Excel download.

The admin talks to Strapi only through a private API in `strapi/src/api/panel/`, which requires a full-access API token.
