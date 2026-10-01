# Homepage editorial compression audit

Scope: `/` only. Original baseline: live `https://swimbasi.com/`, October 1, 2026. Final reconciliation uses 390 × 844 and desktop/tablet widths × 900. Original baseline measurements are in `artifacts/homepage-compression/before.json`; fresh final measurements are in `final-local.json`.

## Implementation and content safety

- Route: `src/pages/index.astro`; published `homepage` document via `getSanityPage("homepage")`, rendered by `HomepageSections.astro`. Static Astro build, not runtime CMS fetching.
- Production has eight Sanity section wrappers, six referenced products, three referenced collections, one uploaded film and four social images. Media URLs are on Sanity's CDN; product links point to the existing Printful destinations.
- `BaseLayout` fetches published site settings, announcement and header/footer navigation. `PAGE_QUERY` projects managed images (including asset dimensions, mobile images, crop/hotspot), video settings, collection hero images and curated/collection/featured/all products. No queries or documents need changes.
- Existing local fallbacks remain in `index.astro`, the content fetch helpers and individual components. They are not the live production content path. QA/build must explicitly use `PUBLIC_SANITY_CONTENT_ENABLED=true`; the example environment defaults to false. The production content and visual parity gates must pass.
- Baseline production order is film, campaign hero, silhouettes, color focus, statement, campaign edit, Instagram, BASI List. A concurrent renderer change discovered during this pass brings the campaign hero first, matching the requested sequence, without editing the published CMS array. That change is preserved; the campaign is the H1 and the film is an H2. Frontend order checks now reflect the requested order; published-document validation still verifies the unchanged CMS data.
- Dedicated homepage renderer is used only by `/`. Hero, film, collection cards and Instagram are used only by this renderer and the homepage fallback. ProductGrid/ProductCard are also used by shop, collection and generic page rendering. Newsletter is also used by PageSections. SectionHeading, MediaFrame, SanityImage, SanityVideo and the site chrome are shared. Apply layout styles through a homepage-specific scope; do not change shared route styles.

## Existing layout

- Global section padding: `clamp(72px, 9vw, 132px)`. Homepage presets exist for none/compact/standard/spacious/editorial, but a later `.homepage-section` default overrides every preset with `clamp(64px, 7vw, 104px)`. Thus the statement's editorial and hero's none values are not actually honored.
- Hero: `clamp(580px, 74vh, 760px)` with 68–84px copy padding; mobile uses 88–124px outer padding. Georgia serif display type and system sans copy; headline sizes already use clamps.
- Film: 560px-wide panel, 2:3 box capped at 780px, `object-fit: cover`; actual uploaded video is 720 × 1280 (9:16). Film media drives desktop section height.
- Silhouettes: three desktop columns, 4:5 panels (565px tall at 1440), contain-fit square CMS product art with 5% inset; 16:10 panels stacked on mobile.
- Products: four desktop columns and six square media panels create an unbalanced 4+2 grid. At 980px, three columns; at 720px, two columns; at 390px, one column. Existing homepage metadata overrides already reduce some gaps.
- Campaign: 4:5 Sanity crop and 744 × 930px rendered frame at 1440; centered text occupies much less height. Preserve the existing crop and constrain rendered media dimensions.
- Instagram: four square desktop tiles, two columns on mobile. Newsletter: two columns above 980px, one below. Footer: 74px top/60px bottom plus 54px grid gaps.
- Breakpoints: 980px (navigation/product grid/newsletter), 720px (stacked media, category cards, products/social/footer), 390px (single product/footer column); generic CMS 760px and mobile image sources 640px.

## Baseline measurements

| Section                   | 1440 × 900 | 390 × 844 |
| ------------------------- | ---------: | --------: |
| Announcement + navigation |        111 |       129 |
| Film                      |        982 |       967 |
| Hero                      |        666 |       586 |
| Silhouettes               |       1067 |      1297 |
| Color in focus            |       1417 |      3383 |
| Statement                 |        530 |       376 |
| Campaign                  |       1132 |       889 |
| Instagram                 |        686 |       632 |
| BASI List                 |        352 |       407 |
| Footer                    |        361 |       945 |
| **Document**              |   **7303** |  **9609** |

Other document baselines: 768px = 5444px; 1024px = 5901px; 1536px = 7455px. Section values rounded independently.

## Presentation direction

Reuse spacing presets with scoped fluid section/gap tokens and correct their cascade. Keep substantial hero type/composition. Bound film media at its native ratio; retain existing playback settings. Use three balanced product columns on desktop with shorter contain-fit media and two columns at normal phone widths. Preserve whole product art, all content and destinations. Cap portrait campaign media without changing its Sanity crop. Compress statement/social/newsletter bands. Keep mobile spacing and touch targets comfortable, and apply footer reductions only on the homepage.

## Final implementation

`src/styles/homepage.css` is imported only by `src/pages/index.astro`. All component rules are qualified by `.homepage-section`; footer rules additionally require homepage sections in `#main-content`. The shared global stylesheet, Sanity queries, schemas, adapters, publishing workflow and production documents are unchanged.

- Standard section space: 36–44px per edge on desktop, 40px on phones; small/large spaces and three content gaps form the common rhythm. Existing CMS spacing classes now win over the older default cascade.
- Hero retains its original serif size, overlay, photograph, CTAs and alignment. Desktop minimum height is 70vh bounded at 560–720px; phone padding is separately controlled.
- Film remains a centered two-column feature above 720px; native 9:16 media is bounded to 240–252px wide (260px on phones). No playback settings changed.
- Desktop silhouette media is 240–310px tall; mobile retains its broad 16:10 stacked panels. All product art uses contain fitting. Numbering is readable against the ivory background.
- Products form three columns above 720px and two columns from 360–720px. Below 360px, a single column protects badge/name readability. Desktop media is 210–240px tall. The desktop section heading and intro share a row to reduce empty canvas. All six products, badges, categories, names, prices, links and the Printful notice remain.
- Statement remains large serif type and a centered black interruption; at 1440px it is 65% of the baseline height.
- Campaign retains the existing Sanity 4:5 image crop in a bounded frame beside centered copy. Instagram retains four images in one desktop row, two phone columns. The newsletter remains a promotional band with the existing opening-soon message.
- Product CTAs and mobile footer links have 44px touch areas. The mobile footer is slightly taller (+32px) because links are easier to tap; desktop footer padding is modestly reduced.
- Primary product imagery stays visible until an alternate image is loaded. This CSS safeguard is homepage-only. Keyboard focus and reduced-motion rules remain active. No dependencies or frontend JS were added.

## Before / after

Fresh reconciliation measurements were collected after rebuilding on October 1, 2026: 390 × 844 and all other widths × 900, Chrome, published Sanity content and loaded images. The earlier 5,226px/6,751px candidate measurements are superseded and are not final results.

| Viewport width | Before | After | Reduction |
| -------------- | -----: | ----: | --------: |
| 390            |   9609 |  7118 | **25.9%** |
| 768            |   5444 |  4394 |     19.3% |
| 1024           |   5901 |  4229 |     28.3% |
| 1440           |   7303 |  4743 | **35.1%** |
| 1536           |   7455 |  4843 | **35.0%** |

Additional edge cases: 1920 × 900 = 4900px; 320 × 900 = 8469px (single-column products at that width). No visible horizontal overflow or unloaded primary/editorial images at any of the seven widths. Closed navigation content is excluded from element overflow diagnostics; the open menu was checked separately.

| Section                   | 1440 before | 1440 after | 390 before | 390 after |
| ------------------------- | ----------: | ---------: | ---------: | --------: |
| Announcement + navigation |         111 |        111 |        129 |       129 |
| Hero                      |         666 |        630 |        586 |       556 |
| Film                      |         982 |        527 |        967 |       841 |
| Silhouettes               |        1067 |        637 |       1297 |      1169 |
| Color in focus            |        1417 |       1016 |       3383 |      1452 |
| Statement                 |         530 |        346 |        376 |       288 |
| Campaign                  |        1132 |        519 |        889 |       813 |
| Instagram                 |         686 |        436 |        632 |       579 |
| BASI List                 |         352 |        209 |        407 |       317 |
| Footer                    |         361 |        311 |        945 |       977 |

## Validation and artifacts

- Sanity-enabled production build passes: 58 published documents, 402 references; all 17 homepage structure/content/playback checks.
- `npm run check`: 0 errors, warnings or hints. ESLint and changed-file Prettier checks pass.
- `PUBLIC_SANITY_CONTENT_ENABLED=true npm run verify`: all 12 pages, 42 products, 24 retained responsive brand images; catalog identity, direct links, media mappings, placement, link safety, robots and sitemap pass.
- Homepage Sanity media validation: 23/23 URLs healthy. Secret scan: zero findings.
- Six product identities/destinations, every link label/destination (compared independent of section order), and video source/settings match the live baseline exactly.
- Native video play/pause tested successfully, with no video error. Settings remain autoplay false, muted false, loop false, controls true, playsinline true and preload metadata.
- Mobile menu opened by pointer and closed by keyboard Enter; links remain within the viewport and at least 63px tall. Product keyboard focus displays the existing 2px gold outline. Alternate product image loading and loaded hover state work. Reduced-motion emulation reduces transition duration to 0.01ms and leaves autoplay disabled.
- All eleven other routes checked at 390px and 1440px: every document height matches baseline. Build inspection confirms the homepage compression stylesheet is absent from those routes. Shared-component changes to hero/film apply only to homepage consumers.
- Visual review covered full-page captures at 390, 768, 1024, 1440, 1536 and 1920px: intact swimwear, readable badges/metadata, no heading/CTA overlap, expected mobile stacking and retained campaign composition. Images retain explicit intrinsic dimensions and layout boxes reserve media space. No new scripts/dependencies or layout animations were introduced; field Core Web Vitals were not measured by this layout QA.

Raw final measurements: `artifacts/homepage-compression/final-local.json`, `final-local-checks.json`, `final-route-html.json`, `final-route-layout.json`, and `final-product-destinations.json`. Screenshots use `final-local-{width}.png`. Reproduce captures with `scripts/qa/homepage-responsive.ps1`; the retained browser evaluators also support section and route inspection. Generated artifacts are intentionally kept local.

For rebuilding in PowerShell, set `$env:PUBLIC_SANITY_CONTENT_ENABLED='true'` before `npm run build`. Release only after all checks and live desktop/mobile verification. The final commit, Cloudflare deployment and production results are recorded in the release response and local `production-release.json` / `final-production.json` artifacts.

## Concurrent-edit resolution and work preservation

Starting branch: `main`; starting HEAD and remote `main`: `df7285c47433581dbe85734cf290147307a97648`. There was one worktree.

The writer was a second Codex conversation, thread `01a0f6dc-5b49-7d92-a686-63c2762df34d` (recorded source `vscode`), in the same checkout. Its tool-call records explicitly show the stylesheet/import patch at 05:59 ET, subsequent CSS and browser-evaluator patches at 06:04, 06:06 and 06:15, and the report update at 06:17. It completed at 06:21 ET. The release session is `01a0f6dd-c6e9-7e42-9785-a1b308b2f4ef`.

Process inspection found an Astro dev server (PID 79996), this release's preview server (PID 71824), and a separate terminal Codex CLI (PID 78572), but no active formatter/codegen/source-rewrite watcher. The shared app-server cannot safely be terminated for one conversation. No process was killed: the conflicting conversation had already completed, and all monitored source hashes remained unchanged during four observations over 30 seconds. Unrelated sessions and servers were left alone.

Before reconciliation, a binary tracked patch plus exact copies of all 51 modified/untracked files were captured and hash-verified. The snapshot is preserved at `C:/Users/basie/AppData/Local/Temp/swimbasi-homepage-conflict-snapshot-20261001-064611`, outside source scanning. It includes the original working-tree status, HEAD, file manifest, stability observations and recovered original candidate stylesheet. Nothing was reset, stashed, discarded or blindly overwritten.

| Later file/edit                                 | Assessment and disposition                                                                                                                                                                                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/homepage.css`                       | Intentional overlapping compression work. Retained native 9:16 video, original display type, controlled media heights, 3 × 2 merchandising, 4:5 phone product panels, stronger touch targets, compact statement/social/newsletter bands, and primary-image hover safeguard. |
| `src/pages/index.astro`                         | Overlapping stylesheet import briefly duplicated the existing import. The duplicate was removed; one import and the release's wrapper remain.                                                                                                                               |
| Hero/film headings, renderer order, build gates | Preserved release-session changes: hero first, one H1, film H2, CMS array untouched. No later content changes.                                                                                                                                                              |
| Browser snapshot scripts                        | Legitimate additional QA tools; retained, with browser globals and formatting corrected.                                                                                                                                                                                    |
| Audit report and generated captures             | Legitimate evidence; report updated with freshly measured final values. Raw captures and patches remain outside the commit.                                                                                                                                                 |
| Candidate details                               | Replaced 2:3 film fitting with the actual 9:16 ratio and retained larger original editorial type. Kept 3 × 2 products; no six-across or carousel compression was introduced. Merged the candidate's modest 10px hero CTA gap.                                               |

Final independent measurements: desktop 7,303 → 4,743px, reduction **2,560px / 35.1%**; phone 9,609 → 7,118px, reduction **2,491px / 25.9%**. Six requested/extended widths have zero unloaded images, missing media dimensions or horizontal overflow, and a recorded layout-shift score of zero in these captures. All link labels/destinations and playback settings match the baseline. All six featured Printful destinations return HTTP 200, and the Instagram destination opens the Swim BASI profile.

Final suite: production build and Sanity gate, homepage gate, catalog verification, 23/23 media URLs, page-builder tests, secret scan, Astro check, ESLint and full Prettier check. The eleven other routes retain identical normalized rendered HTML; desktop/mobile computed layout is compared independently. No schema, query, adapter, production document, publishing workflow or CMS content changes were made.

Route reconciliation follow-up: all 22 desktop/mobile document heights match. Three historical mobile style fingerprints differed, so those routes were compared directly against freshly loaded production: all computed-style rows and element counts match exactly, with zero differences. The normalized HTML matches for all eleven routes. The stalled first read-only route helper (PID 87576) was positively identified and stopped; its replacement completed. No editing session, dev server or production service was terminated.
