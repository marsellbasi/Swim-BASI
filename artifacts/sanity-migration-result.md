# Sanity migration verification

Generated: 2026-07-30T10:08:44.669Z

Target: `xcfqfknc/production`

Verified: **true**

## Remote state

- Draft documents: 58/58
- Published migrated documents: 0
- Mapped assets: 123
- Image assets: 122
- File assets: 1
- Resolved references: 393/393
- Managed images: 169
- Managed videos: 2
- Exact-content duplicates: 0
- Orphaned mapped assets: 0

## Drafts by schema type

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

## Homepage order

1. `brandfilm` — videoSection — enabled
2. `mainhero` — heroSection — enabled
3. `silhouettes` — collectionGridSection — enabled
4. `colorfocus` — productGridSection — enabled
5. `statement` — brandStatementSection — enabled
6. `campaign` — imageTextSection — enabled
7. `instagram` — editorialGridSection — enabled
8. `newsletter` — newsletterSection — enabled

## Verification checks

- PASS — allDocumentsFound
- PASS — noUnexpectedDrafts
- PASS — noMigratedDocumentsPublished
- PASS — allAssetsFound
- PASS — documentsMatchPlan
- PASS — referencesResolve
- PASS — managedImagesValid
- PASS — managedVideosValid
- PASS — productsValid
- PASS — collectionsValid
- PASS — sectionOrderValid
- PASS — brandFilmValid
- PASS — sourceCoverageValid
- PASS — noDuplicateExactAssets
- PASS — noOrphanedMappedAssets

## Editorial findings

- Missing reviewed captions: 1
- Missing reviewed transcripts: 1
- Products without verified sizes: 42
- Size-guide row set awaiting approved measurements: 1
