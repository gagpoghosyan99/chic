# chic

Source for [chic.ngo](https://chic.ngo), mirrored from the production server (`chic-prod`, 77.237.245.211).

| Path | What it is | Runs on server as |
|---|---|---|
| `frontend/` | Next.js site (`chic.ngo`) | `chic-frontend` container, port 3000, from `/root/chic-frontend` |
| `strapi/` | Strapi CMS (`strapi.chic.ngo`) | `strapi` container, port 1337, from `/root/chic-strapi/chic` |
| `infra/nginx/` | nginx site configs | `/etc/nginx/sites-enabled/` |
| `infra/docker-compose.*.yml` | Compose files | `/root/chic-frontend`, `/root/chic-strapi`, `/root/watchtower` |

Images are pulled from Docker Hub (`chicinfra/chic:frontend-prod`, `chicinfra/chic:strapi-prod`) and auto-updated by Watchtower. Cloudflare terminates HTTPS in front of nginx.

Secrets (`.env` files), the Postgres data directory, and `strapi/public/uploads` are not in this repo. See `frontend/.env.example` and `strapi/.env.example`.
