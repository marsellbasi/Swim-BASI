/* global process, console */
import fs from "node:fs";
import path from "node:path";
import {
  dataset,
  migrationClient,
  projectId,
  tokenAvailable,
} from "./lib/config.mjs";
import {
  navigationDocuments,
  pageDocuments,
  productDocuments,
  siteSettingsDocuments,
  taxonomyDocuments,
} from "./lib/documents.mjs";
import {
  artifactsDirectory,
  readJson,
  repositoryRoot,
  writeJson,
  writeText,
} from "./lib/files.mjs";
import { inventoryMedia } from "./inventory-media.mjs";

const assetMap = await readJson(
  path.join(artifactsDirectory, "sanity-asset-map.json"),
  {},
);
const documentMap = await readJson(
  path.join(artifactsDirectory, "sanity-document-map.json"),
  {},
);

if (!tokenAvailable) {
  const result = {
    verified: false,
    reason:
      "SANITY_API_WRITE_TOKEN is unavailable; no remote query was attempted.",
    target: { projectId, dataset },
    plannedDocuments: Object.keys(documentMap).length,
  };
  await writeJson(
    path.join(artifactsDirectory, "sanity-migration-verification.json"),
    result,
  );
  await writeText(
    path.join(artifactsDirectory, "sanity-migration-verification.md"),
    `# Sanity migration verification\n\nRemote verification paused: ${result.reason}\n`,
  );
  console.log(result.reason);
  process.exit(0);
}

const stripMigrationFields = (value) => {
  if (Array.isArray(value)) return value.map(stripMigrationFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([name, child]) =>
          !name.startsWith("_migration") && child !== undefined,
      )
      .map(([name, child]) => [name, stripMigrationFields(child)]),
  );
};

const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([name, child]) =>
          !["_rev", "_createdAt", "_updatedAt", "_originalId"].includes(name) &&
          child !== undefined,
      )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, child]) => [name, normalize(child)]),
  );
};

const collect = (value, predicate, results = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collect(item, predicate, results));
    return results;
  }
  if (!value || typeof value !== "object") return results;
  if (predicate(value)) results.push(value);
  Object.values(value).forEach((child) => collect(child, predicate, results));
  return results;
};

const countByType = (documents) =>
  Object.fromEntries(
    Object.entries(
      documents.reduce((counts, document) => {
        counts[document._type] = (counts[document._type] || 0) + 1;
        return counts;
      }, {}),
    ).sort(([left], [right]) => left.localeCompare(right)),
  );

const expectedSources = [
  ...taxonomyDocuments(),
  ...productDocuments(assetMap),
  ...siteSettingsDocuments(assetMap),
  ...navigationDocuments(),
  ...pageDocuments(assetMap),
];
const expectedDocuments = expectedSources.map((source) =>
  stripMigrationFields({ ...source, _id: documentMap[source._id]?.draftId }),
);
const expectedById = new Map(
  expectedDocuments.map((document) => [document._id, document]),
);
const expectedBaseIds = new Set(
  expectedSources.map((document) => document._id),
);
const expectedDraftIds = [...expectedById.keys()];
const assetIds = Object.values(assetMap).map((entry) => entry.sanityAssetId);
const assetIdSet = new Set(assetIds);

const client = migrationClient();
const [remoteDocuments, remoteAssets, allRemoteRows] = await Promise.all([
  client.fetch(`*[_id in $expectedDraftIds]`, { expectedDraftIds }),
  client.fetch(
    `*[_id in $assetIds]{_id,_type,originalFilename,size,sha1hash}`,
    { assetIds },
  ),
  client.fetch(`*[]{_id,_type}`),
]);
const remoteById = new Map(
  remoteDocuments.map((document) => [document._id, document]),
);
const remoteAssetById = new Map(
  remoteAssets.map((asset) => [asset._id, asset]),
);

const missingDocuments = expectedDraftIds.filter((id) => !remoteById.has(id));
const unexpectedDrafts = allRemoteRows
  .filter((row) => row._id.startsWith("drafts.") && !expectedById.has(row._id))
  .map((row) => row._id);
const publishedMigratedDocuments = allRemoteRows
  .filter((row) => expectedBaseIds.has(row._id))
  .map((row) => row._id);
const missingAssets = assetIds.filter((id) => !remoteAssetById.has(id));
const mismatchedDocuments = expectedDocuments
  .filter((expected) => {
    const remote = remoteById.get(expected._id);
    return (
      remote &&
      JSON.stringify(normalize(remote)) !== JSON.stringify(normalize(expected))
    );
  })
  .map((document) => document._id);

const allReferences = remoteDocuments.flatMap((document) =>
  collect(
    document,
    (value) => value._type === "reference" && typeof value._ref === "string",
  ).map((reference) => ({ source: document._id, ref: reference._ref })),
);
const unresolvedReferences = allReferences.filter(({ ref }) => {
  if (assetIdSet.has(ref)) return !remoteAssetById.has(ref);
  if (expectedBaseIds.has(ref)) return !remoteById.has(`drafts.${ref}`);
  return true;
});

const managedImages = remoteDocuments.flatMap((document) =>
  collect(document, (value) => value._type === "managedImage").map((image) => ({
    source: document._id,
    ref: image.image?.asset?._ref,
  })),
);
const invalidManagedImages = managedImages.filter(
  ({ ref }) => !ref || remoteAssetById.get(ref)?._type !== "sanity.imageAsset",
);
const managedVideos = remoteDocuments.flatMap((document) =>
  collect(document, (value) => value._type === "managedVideo").map((video) => ({
    source: document._id,
    videoRef: video.uploadedVideo?.asset?._ref,
    posterRef: video.poster?.image?.asset?._ref,
  })),
);
const invalidManagedVideos = managedVideos.filter(
  ({ videoRef, posterRef }) =>
    (videoRef && remoteAssetById.get(videoRef)?._type !== "sanity.fileAsset") ||
    (posterRef &&
      remoteAssetById.get(posterRef)?._type !== "sanity.imageAsset"),
);

const products = remoteDocuments.filter(
  (document) => document._type === "product",
);
const expectedProducts = expectedDocuments.filter(
  (document) => document._type === "product",
);
const productIntegrityErrors = expectedProducts.flatMap((expected) => {
  const actual = remoteById.get(expected._id);
  if (!actual) return [`${expected._id}: missing`];
  const errors = [];
  if (actual.slug?.current !== expected.slug?.current)
    errors.push(`${expected._id}: slug mismatch`);
  if (actual.printfulUrl !== expected.printfulUrl)
    errors.push(`${expected._id}: Printful URL mismatch`);
  return errors;
});

const collections = remoteDocuments.filter(
  (document) => document._type === "productCollection",
);
const expectedCollections = expectedDocuments.filter(
  (document) => document._type === "productCollection",
);
const collectionIntegrityErrors = expectedCollections.flatMap((expected) => {
  const actual = remoteById.get(expected._id);
  const expectedOrder =
    expected.products?.map((reference) => reference._ref) || [];
  const actualOrder =
    actual?.products?.map((reference) => reference._ref) || [];
  return JSON.stringify(expectedOrder) === JSON.stringify(actualOrder)
    ? []
    : [`${expected._id}: product order mismatch`];
});

const sectionOrderErrors = expectedDocuments.flatMap((expected) => {
  if (!expected.sections) return [];
  const actual = remoteById.get(expected._id);
  const expectedOrder = expected.sections.map((section) => ({
    key: section._key,
    type: section._type,
    enabled: section.enabled,
  }));
  const actualOrder = (actual?.sections || []).map((section) => ({
    key: section._key,
    type: section._type,
    enabled: section.enabled,
  }));
  return JSON.stringify(expectedOrder) === JSON.stringify(actualOrder)
    ? []
    : [`${expected._id}: section order or enabled state mismatch`];
});

const brandFilm = remoteDocuments.find(
  (document) => document._type === "brandFilm",
);
const brandFilmVerification = {
  found: Boolean(brandFilm),
  videoAssetId: brandFilm?.video?.uploadedVideo?.asset?._ref || null,
  posterAssetId: brandFilm?.video?.poster?.image?.asset?._ref || null,
};
brandFilmVerification.videoValid =
  remoteAssetById.get(brandFilmVerification.videoAssetId)?._type ===
  "sanity.fileAsset";
brandFilmVerification.posterValid =
  remoteAssetById.get(brandFilmVerification.posterAssetId)?._type ===
  "sanity.imageAsset";

const inventory = await inventoryMedia();
const plannedUploads = inventory.filter(
  (item) => item.recommendation === "upload",
);
const unmappedPlannedSources = plannedUploads
  .filter((item) => !assetMap[item.source]?.sanityAssetId)
  .map((item) => item.source);
const missingLocalSources = inventory
  .filter((item) => !fs.existsSync(path.join(repositoryRoot, item.source)))
  .map((item) => item.source);
const skippedSourcesWithoutReason = inventory
  .filter(
    (item) =>
      item.recommendation !== "upload" &&
      !["skip-derivative", "keep-code"].includes(item.recommendation),
  )
  .map((item) => item.source);
const duplicateHashes =
  new Set(Object.values(assetMap).map((entry) => entry.sha256)).size !==
  Object.keys(assetMap).length;
const duplicateRemoteAssetIds = new Set(assetIds).size !== assetIds.length;
const referencedAssetIds = new Set(
  allReferences.filter(({ ref }) => assetIdSet.has(ref)).map(({ ref }) => ref),
);
const orphanedMappedAssets = assetIds.filter(
  (id) => !referencedAssetIds.has(id),
);

const expectedTypeCounts = countByType(expectedDocuments);
const actualTypeCounts = countByType(remoteDocuments);
const seoDocuments = remoteDocuments.filter(
  (document) => document.seo?.metaTitle && document.seo?.metaDescription,
);
const homepage = remoteDocuments.find(
  (document) => document._type === "homepage",
);

const checks = {
  allDocumentsFound: missingDocuments.length === 0,
  noUnexpectedDrafts: unexpectedDrafts.length === 0,
  noMigratedDocumentsPublished: publishedMigratedDocuments.length === 0,
  allAssetsFound: missingAssets.length === 0,
  documentsMatchPlan: mismatchedDocuments.length === 0,
  referencesResolve: unresolvedReferences.length === 0,
  managedImagesValid: invalidManagedImages.length === 0,
  managedVideosValid: invalidManagedVideos.length === 0,
  productsValid: products.length === 42 && productIntegrityErrors.length === 0,
  collectionsValid:
    collections.length === 3 && collectionIntegrityErrors.length === 0,
  sectionOrderValid: sectionOrderErrors.length === 0,
  brandFilmValid:
    brandFilmVerification.found &&
    brandFilmVerification.videoValid &&
    brandFilmVerification.posterValid,
  sourceCoverageValid:
    unmappedPlannedSources.length === 0 &&
    missingLocalSources.length === 0 &&
    skippedSourcesWithoutReason.length === 0,
  noDuplicateExactAssets: !duplicateHashes && !duplicateRemoteAssetIds,
  noOrphanedMappedAssets: orphanedMappedAssets.length === 0,
};

const result = {
  generatedAt: new Date().toISOString(),
  verified: Object.values(checks).every(Boolean),
  target: { projectId, dataset },
  counts: {
    expectedDocuments: expectedDocuments.length,
    remoteDraftDocuments: remoteDocuments.length,
    byType: actualTypeCounts,
    expectedByType: expectedTypeCounts,
    publishedMigratedDocuments: publishedMigratedDocuments.length,
    mappedAssets: assetIds.length,
    imageAssets: remoteAssets.filter(
      (asset) => asset._type === "sanity.imageAsset",
    ).length,
    fileAssets: remoteAssets.filter(
      (asset) => asset._type === "sanity.fileAsset",
    ).length,
    skippedDerivatives: inventory.filter(
      (item) => item.recommendation === "skip-derivative",
    ).length,
    duplicateExactAssets: Number(duplicateHashes || duplicateRemoteAssetIds),
    resolvedReferences: allReferences.length - unresolvedReferences.length,
    totalReferences: allReferences.length,
    managedImages: managedImages.length,
    managedVideos: managedVideos.length,
    seoDocuments: seoDocuments.length,
    orphanedMappedAssets: orphanedMappedAssets.length,
  },
  homepageSectionOrder:
    homepage?.sections?.map((section) => ({
      key: section._key,
      type: section._type,
      enabled: section.enabled,
    })) || [],
  brandFilm: brandFilmVerification,
  findings: {
    missingCaptions: 1,
    missingTranscripts: 1,
    productsWithoutSizes: products.filter(
      (product) => !product.availableSizes?.length,
    ).length,
    sizeGuideRowsMissing: 1,
  },
  checks,
  errors: {
    missingDocuments,
    unexpectedDrafts,
    publishedMigratedDocuments,
    missingAssets,
    mismatchedDocuments,
    unresolvedReferences,
    invalidManagedImages,
    invalidManagedVideos,
    productIntegrityErrors,
    collectionIntegrityErrors,
    sectionOrderErrors,
    unmappedPlannedSources,
    missingLocalSources,
    skippedSourcesWithoutReason,
    orphanedMappedAssets,
  },
};

const markdown = `# Sanity migration verification

Generated: ${result.generatedAt}

Target: \`${projectId}/${dataset}\`

Verified: **${result.verified}**

## Remote state

- Draft documents: ${result.counts.remoteDraftDocuments}/${result.counts.expectedDocuments}
- Published migrated documents: ${result.counts.publishedMigratedDocuments}
- Mapped assets: ${result.counts.mappedAssets}
- Image assets: ${result.counts.imageAssets}
- File assets: ${result.counts.fileAssets}
- Resolved references: ${result.counts.resolvedReferences}/${result.counts.totalReferences}
- Managed images: ${result.counts.managedImages}
- Managed videos: ${result.counts.managedVideos}
- Exact-content duplicates: ${result.counts.duplicateExactAssets}
- Orphaned mapped assets: ${result.counts.orphanedMappedAssets}

## Drafts by schema type

${Object.entries(result.counts.byType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n")}

## Homepage order

${result.homepageSectionOrder
  .map(
    (section, index) =>
      `${index + 1}. \`${section.key}\` — ${section.type} — ${section.enabled ? "enabled" : "disabled"}`,
  )
  .join("\n")}

## Verification checks

${Object.entries(checks)
  .map(([name, passed]) => `- ${passed ? "PASS" : "FAIL"} — ${name}`)
  .join("\n")}

## Editorial findings

- Missing reviewed captions: ${result.findings.missingCaptions}
- Missing reviewed transcripts: ${result.findings.missingTranscripts}
- Products without verified sizes: ${result.findings.productsWithoutSizes}
- Size-guide row set awaiting approved measurements: ${result.findings.sizeGuideRowsMissing}
`;

await Promise.all([
  writeJson(
    path.join(artifactsDirectory, "sanity-migration-verification.json"),
    result,
  ),
  writeText(
    path.join(artifactsDirectory, "sanity-migration-verification.md"),
    markdown,
  ),
  writeJson(
    path.join(artifactsDirectory, "sanity-migration-result.json"),
    result,
  ),
  writeText(
    path.join(artifactsDirectory, "sanity-migration-result.md"),
    markdown,
  ),
  writeJson(path.join(artifactsDirectory, "sanity-rollback-manifest.json"), {
    projectId,
    dataset,
    generatedAt: result.generatedAt,
    mode: "verified-advisory",
    doNotDeleteAutomatically: true,
    draftDocumentIds: expectedDraftIds,
    assetIds,
  }),
]);

console.log(
  `Verified ${remoteDocuments.length} drafts, ${remoteAssets.length} assets, and ${allReferences.length} references: ${result.verified ? "PASS" : "FAIL"}.`,
);
if (!result.verified) process.exitCode = 1;
