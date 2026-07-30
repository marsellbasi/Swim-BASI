# Cloudflare Pages deployment

Connect `https://github.com/marsellbasi/Swim-BASI` to Cloudflare Pages with:

- Production branch: `main`
- Framework preset: Astro (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node version: `22.23.1`

Set the Cloudflare Pages environment variable `NODE_VERSION` to `22.23.1` for both
production and preview builds. Astro requires Node 22.12.0 or newer; the repository's
`.nvmrc` and `package.json` keep local and hosted builds on the supported Node 22 line.

Configure these public build-time values when the Sanity integration is approved:

- `PUBLIC_SANITY_PROJECT_ID=xcfqfknc`
- `PUBLIC_SANITY_DATASET=production`
- `PUBLIC_SANITY_CONTENT_ENABLED=false`

Keep the content flag false until published Sanity content passes owner review and parity validation.
The public dataset needs no frontend read token. Never configure `SANITY_API_WRITE_TOKEN` on the
storefront project.

The storefront remains static, so a Sanity publish requires a new Cloudflare build before visitors
see it. After owner approval, create a Cloudflare deploy hook and a Sanity webhook for relevant
published document changes. Treat the hook URL as an operational secret. This repository does not
create or expose a hook.

## Custom domain

Add `swimbasi.com` to the Pages project, verify DNS, and make it the canonical production hostname. Add `www.swimbasi.com` and configure a permanent redirect to `https://swimbasi.com` so search engines see one canonical host. Confirm HTTPS, the sitemap, robots file, and canonical tags after DNS becomes active.

## Release check

Run `npm run format:check`, `npm run lint`, `npm run check`, and `npm run build`. Inspect policy placeholders, all Printful links, product imagery, responsive layout, and forms before public launch.
