# Swim BASI storefront content audit

Baseline: `13d02e46502b3ded04be6207ff2cb0c92ae4aad9`

## Route and section inventory

| Route                               | Source                              | Visible sections in source order                                                                                                                                            | Primary components                                                                                                  |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/`                                 | `src/pages/index.astro`             | Brand-film portrait intro; campaign hero; shop-by-silhouette collection grid; featured product grid; brand statement; campaign media feature; Instagram preview; newsletter | `PortraitVideoIntro`, `Hero`, `CollectionCard`, `ProductGrid`, `MediaFrame`, `InstagramPreview`, `NewsletterSignup` |
| `/about`                            | `src/pages/about.astro`             | Page hero; lead image/story; two-image editorial pair; closing campaign image                                                                                               | `Breadcrumbs`, `ResponsiveBrandImage`                                                                               |
| `/shop`                             | `src/pages/shop.astro`              | Page hero; catalog status; collection links; all-products grid                                                                                                              | `Breadcrumbs`, `ProductGrid`                                                                                        |
| `/collections`                      | `src/pages/collections/index.astro` | Page hero; three collection cards                                                                                                                                           | `Breadcrumbs`, `CollectionCard`                                                                                     |
| `/collections/one-piece`            | static Astro route                  | Page hero; one-piece product grid                                                                                                                                           | `Breadcrumbs`, `ProductGrid`                                                                                        |
| `/collections/string-bikinis`       | static Astro route                  | Page hero; string-bikini product grid                                                                                                                                       | `Breadcrumbs`, `ProductGrid`                                                                                        |
| `/collections/high-waisted-bikinis` | static Astro route                  | Page hero; high-waisted product grid                                                                                                                                        | `Breadcrumbs`, `ProductGrid`                                                                                        |
| `/size-guide`                       | `src/pages/size-guide.astro`        | Page hero; unfinished sizing notice; measurement and product-page guidance cards                                                                                            | `Breadcrumbs`                                                                                                       |
| `/contact`                          | code-controlled                     | Page hero; unfinished contact copy; customer-care card                                                                                                                      | `Breadcrumbs`                                                                                                       |
| `/shipping-returns`                 | code-controlled                     | Page hero; unfinished-policy notice; fulfillment, returns, and support copy                                                                                                 | `Breadcrumbs`                                                                                                       |
| `/privacy`                          | code-controlled                     | Page hero; unfinished-policy notice; privacy and third-party checkout copy                                                                                                  | `Breadcrumbs`                                                                                                       |
| `/terms`                            | code-controlled                     | Page hero; unfinished-policy notice; website, purchase, and legal copy                                                                                                      | `Breadcrumbs`                                                                                                       |

Astro generates 12 static HTML routes. Contact and legal/policy pages remain code-controlled during
this migration because their source explicitly says the content is unfinished and requires approval.

## Shared site chrome

- Announcement: hardcoded in `AnnouncementBar.astro`.
- Header: Shop, Collections, About, Size Guide; separate Instagram link.
- Mobile navigation: the same four primary links plus Instagram.
- Footer Shop group: All Products, One-Piece, String Bikinis, High-Waisted.
- Footer Information group: About, Size Guide, Shipping & Returns, Contact.
- Footer Connect group: Instagram, Privacy, Terms.

The feature-flagged adapter now reads the singleton announcement, header, footer, and site settings
documents when enabled and otherwise uses these exact local defaults.

## Local content and commerce sources

- `src/data/products.ts`: 42 generated product records across three silhouettes and 14 colors.
- `src/data/product-image-manifest.json`: 112 distinct front/back/left/right product views.
- `src/data/brand-image-manifest.json`: eight editorial originals with 640, 960, and 1400px variants.
- `src/data/homepage-media.ts`: local brand-film source, poster, playback flags, and copy.
- `src/pages/**/*.astro` and content components: current page copy and ordered visible sections.
- `src/utils/products.ts`: local sorting, filtering, and featured selection.

Every product uses a deterministic direct Printful URL under
`https://basiswim.printful.me/product/`. Printful remains checkout and availability authority.
No price, size, stock, variant, or availability data is fabricated by migration.

## Media and hardcoded paths

The complete file-level inventory is in `docs/sanity-media-inventory.md`. Hardcoded editorial paths
currently originate in `Hero.astro`, `homepage-media.ts`, the product image manifest, and the brand
image manifest. Code-controlled media includes `public/icons/favicon.svg`; `robots.txt` also remains
code-controlled. Local source assets are retained throughout rollback validation.

## Current SEO behavior

- Each route supplies a unique title and meta description to `BaseLayout`.
- `SEO.astro` outputs canonical, Open Graph, and Twitter/X tags.
- The former default social image is the campaign placeholder.
- `BaseLayout` outputs controlled Organization JSON-LD.
- Product cards output controlled Product/Offer JSON-LD without unverified inventory.
- `@astrojs/sitemap` generates the static sitemap.
- `public/robots.txt` allows indexing and points to the sitemap.
- Breadcrumb UI exists on non-home routes; controlled BreadcrumbList generation is available for
  future route adoption.

The Sanity SEO resolver uses page values, document-derived values, site defaults, then code fallback.
It normalizes absolute social URLs, canonical URLs, robots directives, and controlled schema types.
Arbitrary JSON-LD is not accepted.

## Cloudflare behavior

The storefront is a static Astro project built from repository root with `npm run build` and output
`dist`. The standalone Studio builds separately from `studio/` to `studio/dist`. Content changes in a
static storefront require a new Cloudflare build. A future Sanity webhook may invoke a confidential
Cloudflare deploy hook after approval; neither hook nor external settings are created by this task.

## Sanity ownership and code ownership

Sanity owns editorial copy, ordered page sections, editorial images/videos, product presentation,
collections, campaigns, navigation, announcements, and editable SEO. Code continues to own route
contracts, renderer/component mappings, accessibility enforcement, structured-data construction,
Printful checkout boundaries, security, feature flags, legal-page placeholders, favicon, robots,
build configuration, and fallback data until cutover is approved.
