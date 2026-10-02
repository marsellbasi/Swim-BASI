# Global footer compression release

Starting commit: `20958f4a214fe5f44d458c7c81ac951f501edcaa`. Scope: shared footer presentation only.

## Audit and preserved architecture

`Footer.astro` is rendered through `BaseLayout.astro` on all twelve HTML routes: homepage, Shop, three collections, collections index, About, Size Guide, Shipping & Returns, Contact, Privacy and Terms. The renderer receives published footer navigation groups and site settings through the existing `getNavigation()` / FOOTER_NAVIGATION_QUERY and `getSiteSettings()` paths. Existing renderer fallback behavior is untouched; no new fallback or hardcoded CMS data is introduced. The logo, brand sentence, three labeled navigation groups, eleven destinations, copyright and Powered by confidence remain byte-identical in rendered HTML.

Global footer CSS used 74px top / 60px bottom padding, 54px grid gaps, and four desktop columns. At 980px it switched to three columns and put Connect onto another row. At 720px the brand spanned two navigation columns, but the 390px breakpoint changed everything to one column. Homepage-specific footer overrides had different spacing and mobile 44px links. These produced two footer-height variants, rather than the previously reported universal 945px / 361px.

At start, main and origin/main matched the approved commit, the working tree was clean, and there was one worktree. Three source-hash observations over twenty seconds were identical. Relevant Astro development/preview processes did not rewrite source; no conflicting editor was detected or stopped. Original footer, global CSS and BaseLayout files plus commit/status were saved at `%TEMP%/swimbasi-footer-start-20261002`. The complete original built site was preserved in ignored local QA artifacts.

## Layout changes

At 720px and below, the brand spans the full width, Shop and Information sit beside each other, Connect spans the grid with three visible links in one row, and the copyright/signature row stacks compactly. Padding becomes 40px / 32px, row gaps 28px, column gaps 24px, heading-to-link margin 8px and navigation gaps zero with 44px link heights. Copyright margins become zero with an 8px gap and 16px outer padding. Original font sizes remain unchanged.

From 721–980px, four columns with a 1.4fr brand column and three flexible navigation columns avoid the former sparse second row. Padding is 48px / 40px and gaps 28px. Desktop above 980px retains its approved column structure, spacing and exact footer height, including the homepage's existing desktop variant. Homepage footer overrides are limited to desktop so smaller widths share the global solution. No homepage content selectors changed.

The footer-only SWIM wordmark color changes from the existing dark gold to the existing brighter gold token, improving its contrast on black from 3.77:1 to 9.42:1. Other footer text remains at least 8.52:1. Header logo styling is unaffected. No JS, dependency, hydration, accordion or information-architecture changes.

## Footer measurements

Chrome at the listed viewport widths × 900px; loaded fonts/media. Pixel heights are rounded.

| Width | Other eleven routes before → final | Homepage before → final |
| ----- | ---------------------------------: | ----------------------: |
| 320   |                          945 → 577 |               977 → 577 |
| 390   |                          945 → 577 |               977 → 577 |
| 430   |                          743 → 577 |               744 → 577 |
| 768   |                          533 → 368 |               465 → 368 |
| 1024  |                          361 → 361 |               311 → 311 |
| 1440  |                          361 → 361 |               311 → 311 |
| 1536  |                          361 → 361 |               311 → 311 |
| 1920  |                          361 → 361 |               311 → 311 |

390px footer reduction: 368px / 38.9% on eleven routes, 400px / 40.9% on homepage.

## Total page-height savings

All savings come from the footer. Non-footer content height, element geometry and computed styles are unchanged across all 96 route/width comparisons. Desktop total heights are unchanged.

| Route              | 390px before → final | Page savings | 1440px unchanged |
| ------------------ | -------------------: | -----------: | ---------------: |
| Homepage           |        7,118 → 6,718 |          400 |            4,743 |
| Shop               |       10,003 → 9,635 |          368 |            6,461 |
| One-Piece          |        4,189 → 3,821 |          368 |            2,770 |
| String Bikinis     |        4,139 → 3,771 |          368 |            2,770 |
| High-Waisted       |        4,189 → 3,821 |          368 |            2,770 |
| About              |        4,796 → 4,428 |          368 |            4,729 |
| Size Guide         |        4,621 → 4,254 |          367 |            2,943 |
| Shipping & Returns |        2,171 → 1,803 |          368 |            1,624 |
| Contact            |        1,814 → 1,446 |          368 |            1,341 |

One-pixel differences between rounded footer savings and total scroll-height savings result from fractional layout rounding; no content changed. Privacy, Terms and collections index receive the same mobile footer improvement.

## QA and safety

Build, Astro check (zero errors, warnings or hints), lint, formatting, secret scan, existing build/internal-link verification, homepage parity gate, published Sanity validation and page-builder tests pass. Existing route-layout-snapshot tooling now reports footer geometry, destinations and non-footer geometry/style hashes; no duplicate committed responsive runner was introduced. Existing build verification checks one identical shared footer on every route and preserves its bottom-row signature.

All twelve pages were measured before and after at 320, 390, 430, 768, 1024, 1440, 1536 and 1920px. All 96 comparisons show identical non-footer geometry/styles and all twelve normalized HTML pages are unchanged after generated asset names are normalized. Footer content, URLs, order and grouping match the original exactly. Navigation targets are at least 44px on mobile/tablet; desktop retains its approved link rhythm. All eleven footer destinations were traversed with keyboard Tab, showing a visible 2px gold outline; Enter successfully navigates. Labeled semantic nav groups and external-link safety attributes remain unchanged. Mobile header menu opens with the same destinations.

Visual QA covers both homepage and standard footer variants at every width: no collisions, clipped text, awkward narrow tablet columns or horizontal overflow. Product grids, media, introduction sections, navigation/header and all other page content retain approved measurements. Logo and body text remain readable, with no reduced font sizes.

No Sanity schemas, queries, documents, CMS content, assets or publishing workflows changed. `Footer.astro` and `BaseLayout.astro` are untouched. Generated captures, comparison reports and the original build remain ignored under `artifacts/footer-compression/`.

Production verification must confirm the expected Cloudflare commit, exact built-HTML matches for all twelve routes, live footer measurements, preserved non-footer layout, internal destinations, keyboard/mobile navigation and no release runtime errors before reporting completion.
