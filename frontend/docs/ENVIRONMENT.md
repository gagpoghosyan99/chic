# Environment setup

Add the Strapi host to your local environment file so the frontend can fetch content:

```
NEXT_PUBLIC_STRAPI_URL=https://strapi.chic.ngo
```

- This variable is required at runtime by the client and server code.
- You can point it to any Strapi instance; the value must include the protocol.

Locales are taken from the current route (`/hy`, `/ru`, `/en`) and appended as `?locale=<code>` when requesting:
- Our Team: `/api/our-teams?populate=*&locale=<code>`


