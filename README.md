# Swim BASI Storefront

Production-ready initial scaffold for [Swim BASI](https://swimbasi.com), a static branded catalog that sends shoppers to Printful for checkout.

## Stack

- Astro with static site generation
- TypeScript strict mode
- Plain responsive CSS
- ESLint and Prettier
- npm and Cloudflare Pages

## Prerequisites

Node.js 22.23.1 (Node 22.12.0 minimum) and npm 10+. Run `nvm use` in environments
with nvm to select the repository's pinned Node release.

## Install and run

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run format
npm run lint
npm run check
npm run build
npm run verify
```

Astro writes the production site to `dist/`.

## Project structure

- `src/pages/` — all routes
- `src/components/` — reusable interface components
- `src/data/products.ts` — central typed product catalog
- `src/utils/products.ts` — filtering and sorting helpers
- `src/styles/global.css` — design system and responsive styles
- `public/` — brand, image, video, and icon assets
- `docs/` — product, media, and deployment guides

## Managing products

Edit only `src/data/products.ts`; cards and collection pages read from that central source. Each item supports identity, category, collection, color, pricing, Printful link, media, featured state, availability, sizing, badges, and ordering. See [docs/product-management.md](docs/product-management.md).

## Adding images and video

Place owned and approved media in the matching folder under `public/images/` or `public/videos/`. Populate the product `image`, `hoverImage`, `gallery`, and `video` fields with root-relative paths. See [docs/media-guide.md](docs/media-guide.md).

## Updating Printful URLs

All catalog entries use exact direct Printful product URLs. Never guess a URL or replace a direct
product link with the general storefront. Keep each URL slug aligned with the catalog product slug
and leave `needsPrintfulUrl` set to `false` after verification.

## Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root
- Custom domain: `swimbasi.com`
- Environment variable: `NODE_VERSION=22.23.1`

See [docs/deployment.md](docs/deployment.md).

## Git workflow

Create a focused branch, make a small verified change, run quality checks, commit with a descriptive message, and open a pull request. Never commit `.env` files or credentials.

## Current limitations

- Product imagery is represented by local color-based placeholders.
- Sample availability is intentionally unconfirmed and verified at Printful.
- Most exact product links still point to the Printful storefront homepage.
- Contact and newsletter forms are presentation-only.
- Policy, size, and brand-story copy requires review.
- Checkout, inventory, tax, shipping, and fulfillment live at Printful.

## Roadmap

Campaign pages, editorial lookbooks, galleries, accessible campaign video, verified reviews, email integration, product filtering, seasonal CMS collections, direct ecommerce, and Cloudflare Images/R2 media are supported by the scaffold’s modular structure.
