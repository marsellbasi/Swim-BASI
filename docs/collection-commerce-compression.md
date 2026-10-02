# Collection commerce compression release

Starting commit: `10a151351c5c63b2731696ca0291845ad8ea0b0c`.

## Audit and concurrency

The three routes are `/collections/one-piece/`, `/collections/string-bikinis/`, and `/collections/high-waisted-bikinis/`. Their Astro route files use one `CollectionEditorial.astro` renderer. Existing `getSanityCollections()` / COLLECTIONS_QUERY resolves published collection documents, enabled rich-text/product-grid sections, curated product references and existing collection relationships. The catalog adapter, order, price, destination, asset references and SEO resolution remain unchanged. Missing required production content still fails closed.

Each collection contains 14 products. Their union is the full 42-product Shop catalog, with no cross-listed, unclassified or inconsistently classified products. Each existing category description is one sentence; no copy rewrite was needed. Fixed category prices remain $32.99, $37.99 and $44.99 respectively.

At start, HEAD and origin/main matched, main was clean, and there was one worktree. Three source-hash observations over 20 seconds found no concurrent changes. Relevant running Astro dev and preview processes did not rewrite source. No competing editor was identified and no unrelated process was stopped. Original relevant files, commit, status and hashes were preserved outside the repository at `%TEMP%/swimbasi-collections-start-20261002`.

## Root causes and implementation

Old outer padding reached 72–96px, with a separate introduction margin and 48–72px catalog gap. Desktop 4:5 card media grew with viewport width; spacious metadata and row gaps compounded height. At 390px the old global grid switched to one column, producing fourteen large rows. Wrappers added horizontal space only, rather than duplicate vertical padding.

Collections now reuse the approved Shop card rules through `src/styles/commerce.css`. The extraction changes no Shop presentation; ProductCard, ProductGrid, global styles, header, announcement and footer remain untouched. Media is bounded to 260–320px on desktop, uses contain fitting without the former 5% inset, and retains explicit source dimensions and lazy loading. Titles flex within each row, metadata gaps are compact, CTAs have 44px minimum height and the primary image remains visible until its alternate loads.

The collection introduction uses a concise two-column desktop arrangement with original serif sizing and preserved CMS copy. Shared fluid collection spacing is 28–40px. A four-link category navigation derives collection labels/slugs from the existing fetched CMS collections. All Products points to the existing Shop route. Current-category bold text, a thicker underline and aria-current identify the active category without relying on color. All links have at least 44px height.

The price line also shows the derived product count. A visually hidden catalog H2 supports the existing H3 card hierarchy, and the nested main landmark is removed. Uniform category labels are visually hidden on these single-category pages while remaining in product markup/data; mixed-category collections retain them. One existing Printful disclosure component now appears after the catalog, as requested. Existing CMS showCheckoutNotice flags remain unchanged; no document edit was made.

Grid endings remain predictably left-aligned: four-column desktop ends with two cards; three-column tablet ends with two; two-column mobile fills seven rows. No special-case centering or added marketing section. Below 360px, the approved Shop single-column pattern protects readability. No new dependencies or client state.

## Measurements

Loaded fonts/media in Chrome; mobile 390 × 844, desktop 1440 × 900. Heights include the unchanged shared header and footer.

| Collection     | Products | Desktop before | Desktop final | Desktop reduction | Mobile before | Mobile final | Mobile reduction |
| -------------- | -------: | -------------: | ------------: | ----------------: | ------------: | -----------: | ---------------: |
| One-Piece      |       14 |          3,548 |         2,770 |     778px / 21.9% |        10,410 |        4,189 |  6,221px / 59.8% |
| String Bikinis |       14 |          3,548 |         2,770 |     778px / 21.9% |        10,360 |        4,139 |  6,221px / 60.0% |
| High-Waisted   |       14 |          3,548 |         2,770 |     778px / 21.9% |        10,410 |        4,189 |  6,221px / 59.8% |

| Collection     | Desktop first product Y | Desktop images visible: first viewport | First two desktop viewports | Mobile first product Y | Mobile first viewport / two viewports |
| -------------- | ----------------------: | -------------------------------------: | --------------------------: | ---------------------: | ------------------------------------- |
| One-Piece      |               533 → 393 |                                  4 → 8 |                      8 → 12 |              507 → 514 | 1 → 2 / 2 → 8                         |
| String Bikinis |               533 → 393 |                                  4 → 8 |                      8 → 12 |              457 → 464 | 1 → 2 / 2 → 8                         |
| High-Waisted   |               533 → 393 |                                  4 → 8 |                      8 → 12 |              507 → 514 | 1 → 2 / 2 → 8                         |

Visibility counts include partially visible images. Complete desktop cards in the first viewport improve from zero to four. On mobile, adding useful category navigation makes the first image start 7px lower, while two products appear together and the full catalog requires far less scrolling. Complete first-viewport mobile cards: String Bikinis 0 → 2; the other two remain zero at 844px viewport height.

| Width | Original columns × rows | Final columns × rows |
| ----- | ----------------------- | -------------------- |
| 390   | 1 × 14                  | 2 × 7                |
| 768   | 3 × 5                   | 3 × 5                |
| 1440  | 4 × 4                   | 4 × 4                |

| Section                                             | Desktop all collections | Mobile One-Piece / High-Waisted | Mobile String Bikinis |
| --------------------------------------------------- | ----------------------: | ------------------------------: | --------------------: |
| Intro (includes count/price)                        |               196 → 125 |                       240 → 228 |             190 → 178 |
| Category navigation                                 |                  0 → 44 |                          0 → 54 |                0 → 54 |
| Product grid                                        |           2,568 → 1,929 |                   8,903 → 2,634 |         8,903 → 2,634 |
| Disclosure                                          |                  0 → 18 |                          0 → 36 |                0 → 36 |
| Catalog end to footer, including disclosure/spacing |                 86 → 86 |                         55 → 96 |               55 → 96 |
| Footer                                              |               361 → 361 |                       945 → 945 |             945 → 945 |

Other final heights: 768px: 3,162 One-Piece/High-Waisted and 3,115 String; 1024px: 2,510 all; 1536px: 2,791 all; 1920px: 2,805 all. The larger mobile percentage is the natural result of changing fourteen single-column rows to seven two-column rows, rather than chasing a target.

## QA and scope safety

Build, Astro check (zero errors/warnings/hints), lint, formatting, security scan, page-builder tests and build verification pass. Existing build verification now checks collection landmarks, catalog heading, category destinations/current semantics, disclosure/canonical, and exact product structured-data agreement with Shop. Existing responsive tooling is generalized to collection measurements rather than duplicated. Generated QA artifacts are excluded from formatting/lint; the first lint attempt exposed old ignored Shop artifact errors, resolved by excluding the generated artifacts directory from ESLint.

All three pages were captured at 320, 390, 430, 768, 1024, 1440, 1536 and 1920px. All 24 captures have no overflow, missing primary image, missing dimensions, or measured layout shift. Product identity, order, price, URL, category, SEO and JSON-LD match the original captures exactly. Primary image alt text remains meaningful; alternate images retain decorative empty alt. No duplicate IDs or nested links. Keyboard Tab/Enter navigation, visible gold focus outline, mobile menu, category navigation and alternate-image loading were exercised.

All 42 unique Printful product destinations return HTTP 200; all 84 primary/alternate Sanity image URLs return HTTP 200; all 13 linked internal URL variants return HTTP 200. Individual collection media validation passes 28/28 per route. Product source files are unchanged: existing garment occupancy is approximately 92–96% of source height; removal of CSS inset preserves full garments without destructive zoom or cropping.

The nine unaffected routes have identical layout measurements, element counts and style hashes at 390 and 1440px (18 comparisons). Eight routes excluding Shop retain identical rendered HTML after normalizing generated asset names. Shop necessarily receives a new generated stylesheet/scope identifier, with identical computed presentation. Shop remains 6,461px desktop / 10,003px mobile. Homepage remains 4,743px / 7,118px. The collections index, About, Contact, Privacy, Shipping & Returns, Size Guide and Terms remain unchanged.

No Sanity schema, query, production document, CMS content, product classification, publishing workflow or local fallback changes. No header/footer redesign. Local ignored captures and health/comparison JSON reports are stored under `artifacts/collection-compression/`; they are not release files.

Production must pass commit/deployment checks, exact built-HTML matching, individual collection counts/content/canonicals, product/media/internal health validation and live desktop/mobile captures before this release is reported complete.
