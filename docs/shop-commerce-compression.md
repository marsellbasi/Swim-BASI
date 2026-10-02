# Shop commerce compression release

Scope: `/shop/` only. Starting commit: `92d3c65d1601dd188af20ac152481969f6f2f38e`.

## Production route and content audit

SHOP navigation, the homepage Shop Swim BASI CTA, and footer All Products all point to `/shop`, which resolves to `/shop/`. `src/pages/shop.astro` fetches the published `shopPage` through `getSanityPage`; `ShopEditorial.astro` renders its enabled introduction and product-grid sections. Production fails closed if the page or required catalog content is absent.

The actual Shop catalog contains **42 products**, not six. Six is the homepage's featured subset. The existing PAGE_QUERY resolves active published products in displayOrder order; the renderer retains its existing limit and adapter. Names, category labels, prices, product IDs, ordering, Sanity assets, and Printful destinations remain unchanged. Category navigation is derived from existing referenced collection titles and slugs; no hardcoded catalog or new query is introduced.

ProductGrid/ProductCard also serve the homepage, three collection routes, and generic CMS sections. Those components and global styles are unchanged. Shop-only Astro-scoped styles control layout. Header, announcement, footer, homepage CSS, schemas, queries, CMS documents and publishing workflows are unchanged.

SEO remains the published title, description, canonical `/shop`, organization JSON-LD and 42 product/offer JSON-LD objects. No invented structured data. The nested main landmark is replaced with a div, retaining the BaseLayout main and one H1.

## Structural findings and implementation

- Intro padding was 72–96px desktop and 48–64px phone, followed by 36–48px copy margin, large heading gaps, then 56–80px catalog margin. The wrap contributes horizontal space only; there was no duplicate vertical wrapper padding.
- The secondary catalog heading and checkout disclosure added another heading block before products. The H1 and supporting CMS sentence remain; the secondary H2 is controlled and disclosure moves below the grid. The original introduction already explains Printful checkout.
- Four desktop columns used 4:5 media that grew to 418px at 1440px; category/card metadata and 58px row gaps compounded height. There was no extra media max-height to remove.
- At exactly 390px the global breakpoint switched to one product column, creating 42 rows. Two columns now remain down to 360px; below that a single column protects readability.
- Three desktop columns were tested with all 42 products: the page remained 8,267px tall. Four columns with bounded 260–320px media preserve recognizable garments and produce materially faster browsing. At tablet widths 721–999px the grid uses three columns.
- Common Shop spacing uses 28–40px fluid outer space and 32px grid/disclosure gaps. Metadata spacing is tighter, titles flex to align row prices/CTAs, and each product CTA is at least 44px tall. Category links occupy one row, with wrapped labels on phones and 44px touch targets.
- CSS image inset changes from 5% to zero, preserving contain fitting. The primary image stays visible until its alternate loads. No new frontend scripts or dependencies.
- Footer markup, padding and separation inside the footer remain untouched. Catalog bottom padding is reduced; no giant trailing canvas is added.

## Before and final measurements

Chrome captures, loaded media/fonts, 390 × 844 and other requested widths × 900.

| Width | Before |  Final |        Reduction |
| ----- | -----: | -----: | ---------------: |
| 390   | 28,413 | 10,003 | 18,410px / 64.8% |
| 768   |  8,088 |  7,334 |     754px / 9.3% |
| 1024  |  6,451 |  5,797 |    654px / 10.1% |
| 1440  |  8,266 |  6,461 |  1,805px / 21.8% |
| 1536  |  8,482 |  6,506 |  1,976px / 23.3% |

Additional final widths: 430 = 10,293px; 1920 = 6,524px; 320 = 21,355px. The large 390px reduction comes from the existing 42-row breakpoint, not from shrinking text.

| Discovery                             |  Desktop 1440 before → final |            Phone 390 before → final |
| ------------------------------------- | ---------------------------: | ----------------------------------: |
| First product top                     |                  656 → 416px |                         628 → 543px |
| Products visible in first viewport    | 4 partial → 4 complete cards | 1 partial image → 2 complete images |
| Products visible within two viewports |                       8 → 12 |                               2 → 6 |
| Complete cards within two viewports   |                        4 → 8 |                               1 → 4 |

Visibility means product media starts inside the measured viewport band; complete cards include the CTA. Phone catalog grid occupies approximately 32 → 10 viewport heights. No paging/carousel/filter machinery added.

| Grid width | Before columns × rows | Final columns × rows |
| ---------- | --------------------- | -------------------- |
| 390        | 1 × 42                | 2 × 21               |
| 768        | 3 × 14                | 3 × 14               |
| 1440       | 4 × 11                | 4 × 11               |

The actual 42-product desktop catalog naturally has two cards in its last row. Four columns were selected after testing the full catalog rather than treating the Shop page as the six-product homepage feature.

| Region (px)                                     | Desktop before → final | Phone before → final |
| ----------------------------------------------- | ---------------------: | -------------------: |
| Intro excluding new category row and its margin |              353 → 173 |            341 → 293 |
| Category navigation                             |            absent → 44 |          absent → 44 |
| Catalog heading block                           |                74 → 29 |              80 → 25 |
| Product grid                                    |          7,162 → 5,598 |       26,786 → 8,419 |
| Disclosure                                      |                18 → 18 |              36 → 36 |
| Footer                                          |              361 → 361 |            945 → 945 |

New navigation has an additional 16px top margin. Intro including it measures 233px desktop / 353px phone. Before catalog-heading heights included the disclosure, so region values should not be summed as exclusive sections. Announcement/header heights remain 111px desktop / 129px phone.

## Product imagery

Representative one-piece, string bikini and high-waisted source files are 1200px squares. Approximate garment bounds occupy 96%, 93%, and 92% of source height and 67%, 65%, and 54% of width. These naturally narrow silhouettes do not justify destructive cropping. Removing the CSS inset increases useful garment scale inside the tighter frame. All sources, proportions, straps and alternate views remain intact.

## QA and scope safety

- Production build: 12 pages; published Sanity gate 58 documents / 402 references; homepage gate 17/17.
- Astro check: zero errors, warnings or hints. ESLint, full Prettier, existing catalog verification, page-builder tests and security scan pass.
- All 42 Printful destinations return HTTP 200; all 84 Shop primary/alternate media URLs and 23 homepage media URLs are healthy.
- Eight capture widths have zero overflow, unloaded primary media, missing dimensions or recorded layout shift. Product identity/order/prices/destinations and SEO/JSON-LD match the baseline. Every CTA is at least 44px; card heights and CTA rows align.
- Visual review covers first viewport, full catalog captures, long phone product names, later bikini rows, category labels, badges and footer. All product links use native keyboard-accessible anchors; unique product CTA labels remain. Real Tab navigation shows a 2px gold focus outline. Mobile menu opens and navigates; reduced-motion and existing lazy alternate loading remain.
- All eleven other routes have identical normalized rendered HTML, and all 22 desktop/mobile heights match. Three collection routes have before/final screenshots. One homepage style fingerprint differed during media loading; a fresh production/local comparison with loaded video metadata found zero computed-style differences across all 255 elements. Homepage desktop stays 4,743px; no homepage presentation code changed.
- No field Core Web Vitals assessment is claimed; these are controlled responsive layout checks.

## Concurrency and release evidence

The checkout started clean on main with one worktree. Source hashes were stable across three observations over 20 seconds. The existing Astro dev server is a read-only source watcher; no formatter/codegen process or conflicting source edits were observed. Relevant originals, HEAD/status and hash observations are preserved in `C:/Users/basie/AppData/Local/Temp/swimbasi-shop-start-20261002`. No external session or server was terminated. Only this session's positively identified stalled read-only QA helpers were stopped and replaced.

Generated evidence is kept locally under ignored `artifacts/shop-compression/`; it is not staged. Existing homepage QA tooling was extended to measure Shop and accept an artifact directory, and the existing media checker accepts a route/alternate-media option. Reproduce captures using `scripts/qa/homepage-responsive.ps1 -Url https://swimbasi.com/shop/ -Label production -Session swim-shop-audit -ArtifactDirectory artifacts/shop-compression`.

Final commit, deployment check/identifier and actual live desktop/mobile verification are recorded in the release response and local production artifacts after deployment.
