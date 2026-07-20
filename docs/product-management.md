# Product management

The catalog has one source of truth: `src/data/products.ts`. Do not duplicate product cards in page files.

## Add a product

Add a color to the correct family or add a fully typed `Product` entry. Use a stable lowercase slug,
exact visible price, and the exact Printful URL. Leave `available` as `null` unless inventory status
is reliably synchronized. Product mockup paths are populated from the generated image manifest; do
not hardcode them into page components.

## Product mockups and galleries

Raw mockups belong in the ignored `Swim Mockups/` import directory. Add an explicit product/folder
entry to `scripts/product-image-mapping.mjs`, then run `npm run images:products`. The generated
manifest supplies each product's `image`, `hoverImage`, and ordered `gallery` fields through the
central catalog.

The front view is primary. One-pieces prefer the left, then right, then back view for hover. Bikinis
use the back view for hover. Gallery order is front, back, left, right, and only existing views are
included. Never duplicate or invent an angle. See `docs/media-guide.md` for the full import process.

## Edit or remove

Edit the central entry to update every page. Remove an entry from the source data to remove it from all grids. Before removal, search for direct links to its slug.

## Feature and reorder

Set `featured: true` to make an item eligible for the homepage. The homepage takes the first six featured items after sorting. Change `sortOrder` to reorder without changing names or IDs; lower numbers appear first.

## Categorize

Use one of the typed categories: `one-piece`, `string-bikinis`, or `high-waisted-bikinis`. Collection pages use `filterByCategory`; additional merchandising collections can use `filterByCollection`.

## Printful links

Every current product uses a unique direct URL under `https://basiswim.printful.me/product/`. Never
invent a product URL or replace a direct link with the general storefront. The URL slug must exactly
match the catalog product slug, and `needsPrintfulUrl` must remain `false` for verified entries. Run
`npm run build` and `npm run verify` after any link update; verification rejects blank, duplicate,
non-Printful, fallback, or slug-conflicting product links.

## Launch checklist

Verify names, prices, product-specific size data, descriptions, images, alt text, exact checkout URLs, and availability behavior against the live Printful store. Run `npm run check && npm run build` after any catalog edit.
