# Sanity migration dry run

Generated: 2026-07-30T09:47:57.730Z

Target: `xcfqfknc/production`

Write token available: **yes**

No remote mutations were performed by this dry run.

## Assets

- Tracked media inventoried: 140
- Images planned for upload: 122
- Videos planned for upload: 1
- Responsive derivatives intentionally skipped: 16
- Code-controlled media skipped: 1
- Exact-content duplicate groups: 0
- Projected bytes uploaded: 23,372,772

## Documents

- aboutPage: 1
- announcementBar: 1
- brandFilm: 1
- collectionsPage: 1
- footerNavigation: 1
- headerNavigation: 1
- homepage: 1
- product: 42
- productCategory: 3
- productCollection: 3
- shopPage: 1
- siteSettings: 1
- sizeGuide: 1

Total planned draft documents: 58

## Validation findings

- Missing reviewed captions: 1
- Missing reviewed transcripts: 1
- Product size arrays intentionally empty: 42
- Size-guide rows awaiting owner-approved measurements: 1
- Unresolved asset references in dry-run documents: expected until `upload-assets.mjs --apply` creates the checksum map.
- Remote reference integrity was not tested because no write token is available.

## Safety decision

The credential gate is available, but an apply still requires the explicit `--apply` flag.
