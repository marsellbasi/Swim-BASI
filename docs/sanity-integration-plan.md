# Swim BASI Sanity integration plan

## 1. Current-state audit

Swim BASI is a static Astro 7.1.1 storefront built with TypeScript 5.9.3 on Node 22.23.1. It
currently has no runtime CMS dependency.

- `src/data/products.ts` generates the 42-product catalog from three hard-coded silhouette families,
  a color table, fixed prices, featured-color rules, and deterministic Printful URLs.
- `src/data/product-image-manifest.json` maps each product slug to optimized primary, hover, and
  gallery assets under `public/images/products/`.
- `src/utils/products.ts` sorts products and derives category, collection, and featured product lists.
- The three collection routes are explicit Astro pages. Their product grids use category filters;
  the collection index and homepage cards select representative products in code.
- `src/pages/index.astro` supplies homepage section order and most copy directly in component props.
  `Hero.astro`, `InstagramPreview.astro`, `NewsletterSignup.astro`, and other components also contain
  section-specific content.
- `src/data/homepage-media.ts` is the film configuration source. It points to
  `public/videos/campaigns/swim-basi-brand-film.mp4` and its WebP poster, and controls playback flags.
- `src/data/brand-images.ts` and `src/data/brand-image-manifest.json` provide repository-owned
  responsive editorial imagery.
- `Header.astro`, `MobileNavigation.astro`, and `Footer.astro` contain navigation and footer links.
- Checkout stays external: product cards link to direct Swim BASI Printful product URLs.

No existing local content is replaced or deleted by the Studio work.

## 2. Proposed content architecture

Sanity should own editor-facing product, merchandising, campaign, page, navigation, and SEO content.
Astro should remain responsible for presentation, routing conventions, Sanity queries, validation
at the application boundary, responsive image rendering, accessibility behavior, analytics,
checkout behavior, and fallback/error states.

The seven singleton documents provide one canonical record for global and page-level surfaces.
Collections cover reusable commerce and editorial records. Object types keep shared fields
consistent without creating unnecessary documents.

## 3. Existing content-to-Sanity mapping

| Current source                                       | Sanity target                         | Notes                                                                                    |
| ---------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/data/products.ts` product records               | `product`                             | Preserve slug, name, price, Printful URL, order, featured flag, color, and descriptions. |
| Product family/category constants                    | `productCategory`                     | Seed one-piece, string bikinis, and high-waisted bikinis.                                |
| `collection` and explicit collection routes          | `productCollection`                   | Create curated collection records while preserving current route slugs.                  |
| Product image manifest and `public/images/products/` | Product image assets                  | Upload approved optimized files with existing manifest alt text; verify order and crops. |
| Homepage props and component copy                    | `homepage` and `contentSection`       | Map content first; retain component layout semantics in code.                            |
| `src/data/homepage-media.ts`                         | `brandFilm` plus `homepage.brandFilm` | Preserve playback settings and media files exactly.                                      |
| `Header.astro` / `MobileNavigation.astro` links      | `headerNavigation`                    | One shared ordered model for desktop and mobile.                                         |
| `Footer.astro` link groups                           | `footerNavigation`                    | Preserve legal and service routes.                                                       |
| Announcement component content                       | `announcementBar`                     | Enable only after matching current behavior.                                             |
| About page content and brand manifest images         | `aboutPage` / `contentSection`        | Preserve editorial order and approved focal points.                                      |
| Size guide page                                      | `sizeGuide` / `sizeGuideRow`          | Convert measurements into structured rows.                                               |
| Page SEO props                                       | Relevant document `seo` fields        | Keep code defaults until every migrated record is complete.                              |

## 4. Product migration plan

1. Write a deterministic, repeatable import script that reads `products.ts` and the image manifest.
2. Create category and collection documents with stable `_id` values and current public slugs.
3. Upload existing optimized WebP assets; use hashes or source paths to make retries idempotent.
4. Create draft product documents with stable IDs, references, direct Printful URLs, and ordering.
5. Compare counts (42 products), slugs, prices, image counts, alt text, and Printful links.
6. Publish only after editorial review. Keep local data as the storefront source throughout.
7. Add a typed Sanity query layer behind a feature flag, initially comparing rather than rendering.
8. Switch one noncritical preview environment, then production, only after parity tests pass.

Do not treat Printful availability, inventory, tax, shipping, or fulfillment as Sanity-owned facts.

## 5. Homepage migration plan

Create the singleton homepage document and map the current film introduction, abstract hero,
silhouette collections, featured products, brand statement, campaign image, color story, BASI List,
and SEO metadata. Keep the section component library and visual styling in Astro. Query references
in one homepage request, validate the response, and fall back to current local content during the
transition. Preserve the current section order until a separate design change is approved.

## 6. Brand-film migration plan

Create a `brandFilm` document using the existing title and copy, upload the MP4 and poster, and keep
autoplay false, muted false, loop false, and controls true. Add a reviewed WebVTT file later; do not
invent captions. Compare media dimensions, duration, transfer size, poster focal point, native
controls, reduced-motion behavior, and audible playback before switching. Keep the local files and
`homepage-media.ts` as rollback assets until the Sanity path has operated reliably.

## 7. Navigation migration plan

Model current desktop and mobile header links once in `headerNavigation`, and current footer groups
in `footerNavigation`. Resolve only allow-listed internal paths in Astro and apply safe external-link
attributes in code. Test keyboard order, mobile disclosure behavior, active states, legal routes,
and broken-link detection. Navigation should switch only when both singleton documents are valid.

## 8. Recommended staged implementation order

1. Deploy the isolated Studio and configure Sanity CORS.
2. Seed singleton documents and taxonomy records without changing the storefront.
3. Import products and media as drafts; run parity reports.
4. Add a read-only Astro Sanity client, query types, response validation, and local fallbacks.
5. Integrate global settings and announcement content.
6. Integrate product/category/collection queries in a preview environment.
7. Integrate homepage and brand film.
8. Integrate navigation and remaining editorial pages.
9. Remove local fallbacks only in a later, separately approved cleanup after an observation period.

## 9. Rollback strategy

Keep current local data, media, and rendering code in Git until migration is proven. Gate CMS reads
with an environment flag and retain a local adapter with the same normalized shape. Rollback means
disabling the flag and rebuilding the storefront; it must not require deleting Sanity documents.
Pin the last known-good query API version, retain previous Cloudflare deployments, and avoid schema
field removal until all consumers have moved.

## 10. Cloudflare deployment plan

Create a separate Cloudflare Pages project connected to the same repository:

- Root directory: `studio`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.23.1` (set `NODE_VERSION=22.23.1`)
- Studio variables: `SANITY_STUDIO_PROJECT_ID=xcfqfknc` and
  `SANITY_STUDIO_DATASET=production`
- Custom domain: `studio.swimbasi.com`
- SPA fallback: `static/_redirects` copies `/* /index.html 200` into the build

Leave the storefront Cloudflare project, its root directory, and its domain untouched. Configure the
custom domain only after the new Pages project builds successfully.

## 11. Sanity CORS plan

Add `https://studio.swimbasi.com` with credentials enabled for Studio authentication. Add
`http://localhost:3333` with credentials for local Studio work, and optionally
`http://127.0.0.1:3333` if that hostname is used. Before browser-side storefront queries, add
`https://swimbasi.com`; add `https://www.swimbasi.com` only while it serves content rather than a
redirect. Register exact Cloudflare preview origins only when preview builds require direct
browser-side requests, and remove temporary origins afterward. Server/build-time queries do not
need the requesting machine's origin in the browser CORS list.

## 12. Testing checklist

- Install the Studio with `npm ci` on Node 22.23.1.
- Run Studio TypeScript validation and production build.
- Confirm `_redirects` exists in `studio/dist`.
- Open direct nested Studio routes locally and in a Pages preview.
- Confirm Sanity login, dataset, create, edit, publish, discard, unpublish, and restore behavior.
- Confirm singleton navigation opens fixed IDs and generic create menus cannot duplicate them.
- Validate required fields, URL rules, slug rules, image alt text, hotspots, previews, and references.
- Run root format check, lint, Astro check, production build, and build verification.
- Compare product counts, slugs, prices, ordering, images, alt text, and Printful links.
- Test all storefront routes, responsive images, keyboard navigation, reduced motion, video controls,
  sitemap, robots, canonical URLs, and external checkout disclosures.
- Verify no token, `.env`, or private asset was committed.

## 13. Risks and assumptions

- Sanity contains no content until editors or a later import populate it.
- Project membership and permissions for Basi Productions are configured outside this repository.
- Uploaded videos and product assets affect Sanity usage and CDN costs.
- Bidirectional product/collection references can drift unless migration and editorial procedures
  define one authoritative ordering strategy.
- Display price can drift from Printful; checkout must continue to treat Printful as authoritative.
- External video hosts differ in embed and privacy behavior; uploaded video is the predictable path.
- Caption content is not yet available and requires human review.
- Cloudflare preview hostnames may require additional CORS entries if the Studio is tested there.
- Schema changes should remain additive while the Astro client and Studio evolve independently.
- The planned custom domain, DNS, Cloudflare project, Sanity CORS, and content import are manual
  follow-up work and are intentionally not performed in this branch.
