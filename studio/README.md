# Swim BASI Studio

Standalone Sanity Studio for the Swim BASI storefront. It uses Sanity project `xcfqfknc`,
dataset `production`, and is intended to run at `https://studio.swimbasi.com`.

The Studio is isolated from the root Astro application: it has its own dependencies, lockfile,
commands, build output, and deployment settings. Building it does not build or modify the storefront.

## Local setup

Use Node 22.23.1 and npm 10 or newer.

```sh
cd studio
cp .env.example .env
npm ci
npm run dev
```

The local Studio opens on `http://localhost:3333`. The `.env` file is ignored and must never be
committed.

## Validation and build

```sh
npm run typecheck
npm run build
```

The static production build is written to `studio/dist`. `static/_redirects` is copied into that
output and sends all nested routes to `index.html`, so Cloudflare Pages refreshes do not return 404.

## Environment variables

```text
SANITY_STUDIO_PROJECT_ID=xcfqfknc
SANITY_STUDIO_DATASET=production
```

These values identify public Sanity resources and are safe to expose in the compiled Studio.
Authentication is handled by Sanity; no API token belongs in this application.

## Cloudflare Pages settings

- Root directory: `studio`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.23.1`
- Environment variables: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and
  `NODE_VERSION=22.23.1`
- Production domain: `studio.swimbasi.com`
- SPA fallback: `studio/static/_redirects` contains `/* /index.html 200`

Create a separate Cloudflare Pages project for this directory. Do not change the existing storefront
Pages project.

## Sanity project setup

In the Sanity project settings, add these credentialed CORS origins:

- `https://studio.swimbasi.com`
- `http://localhost:3333`

Add `http://127.0.0.1:3333` only if development uses that hostname. Before storefront integration,
also add `https://swimbasi.com` (and any browser-based preview origin that will query Sanity
directly). Prefer exact origins and remove temporary preview origins when no longer needed.
