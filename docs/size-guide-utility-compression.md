# Size Guide utility compression

Starting production commit: `aacb4b748f67de24e3ed0ac710bd91ceaca1e628`.

## Architecture and content audit

The production route `/size-guide/` uses `src/pages/size-guide.astro` and the
dedicated `src/components/SizeGuideEditorial.astro`. That component has one
consumer. Its five sections remain introduction, measurement instructions,
silhouette guidance, before-order guidance, and closing actions. The generic
`PageSections` renderer is not used and was not reintroduced.

The route obtains the published `sizeGuide` singleton using `getSanityPage`,
retains its production fail-closed behavior, and uses `resolveSeo` and shared
BaseLayout, Breadcrumbs, Button, header, announcement, and footer. The existing
page query resolves the dedicated content fields and the silhouette collection
references, plus legacy structured rows, units, instructions, and managed image
fields. No query, type, schema, or shared component changes were needed.

The Sanity schema supports `sizeName`, `bust`, `waist`, `hips`, and optional notes
per numeric size row. However, the published document has `rows: []` and unit
`inches`. The current approved page contains no numeric size table or diagrams.
It tells shoppers to compare body measurements with the product-specific sizing
on Printful. This pass preserves that behavior and does not manufacture size
values, universal fit claims, or a table. Table dimensions, table Y, first
numeric row Y, cell padding, scope attributes, and horizontal table scrolling
are therefore not applicable to this production implementation.

All copy is preserved: both intro paragraphs, all three Chest/Waist/Hips
instructions, measuring note, all three silhouette descriptions and fit notes,
ordering disclosure, CTA labels, and existing destinations. No local fallback
was introduced. Published document revision remained `slNpfnkF3xriCf32TfQmFP`.

Metadata remains `Size Guide | Swimwear Fit & Measurements | Swim BASI`, with
the original description, canonical `https://swimbasi.com/size-guide`, and
`index, follow`. Existing structured data, sitemap, and navigation are retained.

## Root causes and layout changes

The dedicated architecture had already removed the generic renderer's nested
sections. Remaining waste came from independent 64–104px section gaps, 190px
measurement and 390px silhouette minimum card heights, large card padding and
heading gaps, an ordering note with up to 72px inner padding, and a generously
padded final CTA. The 390px silhouette section alone measured 1389px.

The scoped Size Guide rhythm now uses:

- `--fit-section-space: clamp(32px, 3vw, 48px)`
- `--fit-content-gap: clamp(16px, 1.7vw, 24px)`
- `--fit-card-space: clamp(20px, 2vw, 24px)`

At 640px and below, these become 28px, 16px, and 20px. Desktop/tablet measurement
instructions stay in one three-column row; mobile uses full-width compact rows.
Silhouette guidance retains three desktop columns, the existing two-plus-one
tablet arrangement up to 900px, and one mobile column. Mobile rows use simple
rules instead of inset boxes, retaining all descriptions and fit notes.

The H1, body text, fit notes, desktop headings, and their line heights retain
their original sizes. Mobile H2s use a consistent 32px serif utility scale.
Headlines use balanced wrapping. Most savings come from layout, not typography.
The ordering band and final actions are compact; the existing reduced-motion
behavior is retained. No dependencies, scripts, hydration, or media were added.

## Measurements

Baseline was captured from actual production before editing. Final local and
production comparisons use the same eight widths, loaded fonts, and viewport
heights: 844px at 320/390px and 900px otherwise. Heights are rounded pixels;
independent rounding can produce a one-pixel difference when summing sections.

| Width | Before | After | Saved | Reduction |
| ----- | -----: | ----: | ----: | --------: |
| 320   |   4666 |  3765 |   901 |     19.3% |
| 390   |   4254 |  3454 |   800 |     18.8% |
| 430   |   4151 |  3339 |   812 |     19.6% |
| 768   |   3204 |  2483 |   721 |     22.5% |
| 1024  |   2615 |  2138 |   477 |     18.2% |
| 1440  |   2943 |  2339 |   604 |     20.5% |
| 1536  |   3003 |  2371 |   632 |     21.0% |
| 1920  |   3141 |  2473 |   668 |     21.3% |

| Section                  | 1440 before → after | 390 before → after |
| ------------------------ | ------------------: | -----------------: |
| Introduction             |           438 → 369 |          488 → 454 |
| Measurement instructions |           531 → 408 |          846 → 658 |
| Size table               |         Not present |        Not present |
| Silhouette guidance      |           665 → 509 |        1389 → 1011 |
| Before-order guidance    |           516 → 369 |          526 → 410 |
| Closing / actions        |           322 → 212 |          298 → 215 |
| Footer                   |           361 → 361 |          577 → 577 |

| Discovery / position            | 1440 before → after | 390 before → after |
| ------------------------------- | ------------------: | -----------------: |
| First measurement instruction Y |           745 → 633 |          758 → 690 |
| First measurement item Y        |           840 → 712 |          867 → 788 |
| Numeric table Y / first row Y   |         Not present |        Not present |
| Footer Y                        |         2582 → 1978 |        3677 → 2877 |

The first instruction and measurement items now begin within the initial
desktop viewport. On 390px mobile, the first measurement item enters the initial
844px viewport, where previously it began below it. At 320px, it starts at 825px
instead of 933px. Numeric size-chart access still occurs on the external product
page as described by the published copy. Footer savings are zero.

## Data parity

The structured ignored artifact `artifacts/size-guide-compression/size-data-parity.json`
records the full before/after published guidance, unit, empty size row set,
document revision, and equality result. SHA-256 of both structured sizing records:

`a879a868cc5c85c63d4929442f8f7deaab60a2b74842379171e85b292a32948c`.

Rendered measurement labels and descriptions, collection titles, fit notes,
links, intro, ordering content, and metadata match the anonymous published
dataset at all eight widths. Before and after contain exactly zero numeric size
rows. No sizing values were added, removed, changed, or hidden.

## Accessibility and QA

Exactly one H1 is retained. Measurement labels are now H3s beneath the measuring
H2; all three silhouette H3s remain below their H2. The ordered measurement list,
article structure, and labeled sections remain semantic. There are no duplicate
IDs or invalid nested links.

Small gold labels use `#806a1f`, providing 4.90:1 contrast on the cream field.
Body copy remains 16px on mobile. Size Guide breadcrumb and category links have
44px minimum touch areas, with 48px final CTAs. The Home breadcrumb's expanded
hit area is scoped to Size Guide and fits between the header and intro without
overlap. Keyboard focus retains the visible 2px gold outline. Navigation and CTA
activation are tested through the actual browser; the native mobile menu remains
unchanged. Horizontal table keyboard checks are not applicable because no table
exists. There is no page overflow at any measured width.

Build, Astro check, lint, formatting (including the Astro plugin), release-secret
scan, existing verification suite, page-builder tests, internal links, and media
checks pass. Homepage parity passes 17/17 and 23/23 homepage media URLs are
healthy. Size Guide contains no rendered image media requiring URL checks.
Final responsive measurements record zero layout shift and no unloaded images.
Final screenshots are inspected across 320–1920px. A route sweep interrupted by
rebuilding the preview was discarded and repeated against the stable final build.

All 11 unaffected routes have identical normalized HTML and unchanged content
height, computed content-style hash, document height, and footer geometry across
eight widths (88 comparisons). Header/footer/global CSS, About, homepage, Shop,
and collections are unchanged. Raw QA artifacts remain ignored.

## Preservation and release

The initial worktree was clean, main matched origin/main, and only one worktree
was active. The existing Astro dev and preview processes were identified; no
conflicting source writer was detected. Source hashes were stable before editing
and are checked again before commit. Starting files, source hashes, status, and
commit were preserved in `%TEMP%/swimbasi-size-guide-start-20261002`. No process
was stopped or concurrent work overwritten.

Production acceptance requires Cloudflare success for the expected commit,
HTTP 200 and exact built HTML on all 12 routes, live published-data parity,
matching Size Guide measurements at every width, usable narrow-mobile guidance,
working actions/navigation, no runtime errors, and unchanged approved pages.
The final release report records the commit and deployment identifier after
these checks pass.
