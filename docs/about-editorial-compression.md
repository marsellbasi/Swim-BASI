# About editorial compression

Starting production commit: `7f24237f1ff77a1fa94dc4778880efbdec2b0d49`.

## Implementation and content audit

The production route is `/about/`, implemented by `src/pages/about.astro` and
`src/components/AboutEditorial.astro`. The latter has exactly one consumer: the
About route. The route fetches `getSanityPage("aboutPage")` and site settings,
preserves `resolveSeo`, and fails closed when published content is unavailable.
The shared page query resolves enabled sections, Portable Text, media references,
captions, calls to action, and SEO. No data-layer changes were required.

The six existing published sections remain in their original order:

| Section key  | Content type          | Presentation                                      |
| ------------ | --------------------- | ------------------------------------------------- |
| aboutintro   | richTextSection       | Breadcrumb, eyebrow, H1, two paragraphs           |
| aboutlead    | imageTextSection      | Orange campaign photograph and story copy         |
| aboutpair    | splitMediaSection     | Pink detail and lavender photograph with captions |
| aboutpromise | brandStatementSection | Centered statement and paragraph                  |
| aboutclosing | imageSection          | Night campaign photograph and caption             |
| aboutcta     | callToActionSection   | Closing statement, sentence, two actions          |

All story copy, headlines, image references, alt text, captions, CTA labels and
destinations, and metadata are preserved. The existing title remains
`About Swim BASI | Our Story | Swim BASI`; canonical remains
`https://swimbasi.com/about`. Exactly one H1 and three content H2s remain.
Existing section lookup by key/type is retained; no local content was added.

Breadcrumbs, Button, SanityImage, BaseLayout, navigation, announcement bar, and
Footer remain unchanged. Legacy global About selectors are not used by this
renderer. Its layout is scoped to About; no global CSS was changed.

## Root causes and presentation changes

The original intro used up to 112px of top padding, 80px below, a 68px breadcrumb
gap, and a 42px copy gap. Feature/pair media reached approximately 836/846px at
1440px, despite much shorter adjacent copy. Mobile stacked two 439px photographs
into a 999px pair section. Statement and CTA padding added further empty canvas.

About now uses a consistent scoped rhythm:
`--about-major-space: clamp(40px, 4vw, 64px)`,
`--about-copy-gap: clamp(20px, 2vw, 28px)`, and a 1120px editorial frame.
Below 768px, major spacing is `clamp(32px, 9vw, 40px)` and copy gap is 20px.
The existing 430px CTA breakpoint remains.

Desktop feature columns allocate less width to media while keeping the copy
centered alongside it. The two detail photographs remain a pair on desktop and
now form a two-column diptych on mobile, with a 12px gutter. Statement and closing
CTA bands use the shared rhythm. Headline balancing improves wrapping; every
computed font size and line height matches the baseline at all measured widths.

All four source photographs are 1400 × 2100. Feature/detail panels retain 4:5
ratios and their existing focal positions. Campaign retains 16:9 on desktop and
4:5 on mobile, with unchanged focal positions. Mobile feature and campaign
heights remain unchanged. Explicit intrinsic dimensions, lazy loading, responsive
srcsets, and source URLs are retained; only `sizes` changes to describe the new
display widths. No source-image editing or additional zoom was applied.

## Measurements

Fresh production baseline and final production-build measurements use the same
browser, fonts, content, widths, and 844px viewport height at 320/390px; all other
widths use 900px height. Values are rounded pixels; independent rounding can
produce a one-pixel difference when summing sections.

| Width | Before | After | Saved | Reduction |
| ----- | -----: | ----: | ----: | --------: |
| 320   |   4311 |  3490 |   821 |     19.0% |
| 390   |   4428 |  3474 |   954 |     21.5% |
| 430   |   4639 |  3596 |  1043 |     22.5% |
| 768   |   3113 |  2756 |   357 |     11.5% |
| 1024  |   3592 |  3155 |   437 |     12.2% |
| 1440  |   4729 |  3855 |   874 |     18.5% |
| 1536  |   4801 |  3908 |   893 |     18.6% |
| 1920  |   4878 |  4001 |   877 |     18.0% |

| Section               | 1440 before → after | 390 before → after |
| --------------------- | ------------------: | -----------------: |
| Intro / text hero     |           675 → 511 |          616 → 539 |
| Feature image + story |           948 → 656 |          748 → 709 |
| Editorial image pair  |           900 → 736 |          999 → 279 |
| Point of view         |           486 → 394 |          446 → 391 |
| Night campaign        |           774 → 684 |          489 → 489 |
| Closing / CTA         |           474 → 402 |          424 → 361 |

| Panel / position            | 1440 before → after | 390 before → after |
| --------------------------- | ------------------: | -----------------: |
| Intro copy height           |           183 → 179 |          229 → 225 |
| Feature image height        |           836 → 598 |          439 → 439 |
| Feature text height         |           236 → 236 |          217 → 213 |
| Pair image heights (each)   |           846 → 683 |          439 → 212 |
| Pair caption heights (each) |             40 → 40 |            40 → 58 |
| Statement inner height      |           285 → 279 |          329 → 321 |
| Campaign image height       |           720 → 630 |          439 → 439 |
| Closing inner height        |           294 → 286 |          317 → 291 |
| CTA actions height          |             48 → 48 |          114 → 108 |
| First story paragraph Y     |           525 → 415 |          465 → 408 |
| First feature Y             |           786 → 622 |          745 → 668 |
| Footer Y                    |         4368 → 3494 |        3851 → 2897 |
| Footer height               |           361 → 361 |          577 → 577 |

The largest section transition padding at 1440px falls from 112px to 57.6px;
on mobile, major padding falls from roughly 56–62px to 35.1px. The desktop feature
image's excess height relative to its 236px copy falls from 600px to 362px.
Measured footer savings are zero: every saved pixel belongs to About content.

## QA and scope safety

- Published-mode production build, Astro check, lint, formatting, release-secret
  scan, verification suite, homepage parity, and page-builder tests pass.
- Eight-width final responsive measurements: no horizontal overflow, unloaded
  images, or observed layout shifts. Final screenshots inspected at all widths.
- All four image URLs and all 24 responsive variants return HTTP 200.
- One main landmark, one H1, logical content H2s, meaningful alt text, no duplicate
  IDs or nested links. Closing actions are 48px high; keyboard focus is visible
  with the existing 2px gold outline. Keyboard activation opens Shop correctly.
  The existing mobile menu opens and closes using its native summary control.
- All 11 other routes retain identical normalized rendered HTML. Across eight
  widths, all 88 other-route comparisons retain content height, computed content
  style hash, document height, horizontal bounds, and complete footer geometry,
  content, and links. About HTML is identical after normalizing generated scope
  IDs, asset names, and the intended image `sizes` attributes.
- About content, links, heading order, SEO, source assets, dimensions, loading,
  font sizes, and line heights match the production baseline at all eight widths.
- No dependencies, hydration, Sanity schema/query/document/content/asset changes,
  publishing changes, or local fallbacks were introduced.

Raw snapshots, screenshots, media checks, and comparisons are ignored under
`artifacts/about-compression/`, rather than committed as release payload.

## Concurrency and preservation

Main and origin/main matched the starting commit; one worktree was active. The
repository's existing Astro dev and preview processes were identified and left
running. No competing source writer was detected; three source hash samples over
20 seconds were stable before editing. Original files, hashes, status, and commit
were saved in `%TEMP%/swimbasi-about-start-20261002`. No work was discarded or
process stopped. Origin and source stability are checked again before release.

Production acceptance requires the Cloudflare storefront check to succeed for
the expected commit, live About HTML to match the build, responsive measurements
to match these results, and the approved homepage, Shop, collection, header, and
footer to retain their geometry. The release's final report records the commit
and Cloudflare deployment identifier after verification.
