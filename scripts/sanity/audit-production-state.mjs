/* global process, console */
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  artifactsDirectory,
  readJson,
  writeJson,
  writeText,
} from "./lib/files.mjs";
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";

installSafeProcessErrorHandlers();

const projectId = "xcfqfknc";
const dataset = "production";
const apiVersion = "2026-07-31";
const contentTypes = [
  "siteSettings",
  "announcementBar",
  "homepage",
  "aboutPage",
  "shopPage",
  "collectionsPage",
  "sizeGuide",
  "headerNavigation",
  "footerNavigation",
  "product",
  "productCategory",
  "productCollection",
  "campaign",
  "brandFilm",
  "lookbookEntry",
];

if (!process.env.SANITY_API_WRITE_TOKEN?.trim()) {
  throw new Error("SANITY_API_WRITE_TOKEN is unavailable.");
}

const rawClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});
const anonymousClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

const [rawDocuments, assets, anonymousDocuments, documentMap] =
  await Promise.all([
    rawClient.fetch(`*[_type in $contentTypes]`, { contentTypes }),
    rawClient.fetch(
      `*[_type in ["sanity.imageAsset","sanity.fileAsset"]]{_id,_type}`,
    ),
    anonymousClient.fetch(`*[_type in $contentTypes]{_id,_type}`, {
      contentTypes,
    }),
    readJson(path.join(artifactsDirectory, "sanity-document-map.json"), {}),
  ]);

const countsByType = (documents) =>
  Object.fromEntries(
    [...new Set(documents.map((document) => document._type))]
      .sort()
      .map((type) => [
        type,
        documents.filter((document) => document._type === type).length,
      ]),
  );
const isDraft = (id) => id.startsWith("drafts.");
const isVersion = (id) => id.startsWith("versions.");
const rootId = (id) => (isDraft(id) ? id.slice("drafts.".length) : id);
const isPrivatePublishedId = (id) =>
  !isDraft(id) && !isVersion(id) && id.includes(".");

const drafts = rawDocuments.filter((document) => isDraft(document._id));
const authenticatedPublished = rawDocuments.filter(
  (document) => !isDraft(document._id) && !isVersion(document._id),
);
const privatePublished = authenticatedPublished.filter((document) =>
  isPrivatePublishedId(document._id),
);
const expectedPublicIds = Object.keys(documentMap);
const expectedDraftIds = expectedPublicIds.map((id) => documentMap[id].draftId);
const replacementDrafts = drafts.filter((document) =>
  expectedDraftIds.includes(document._id),
);
const correctedPublished = authenticatedPublished.filter((document) =>
  expectedPublicIds.includes(document._id),
);
const correctedDocuments =
  replacementDrafts.length > 0 ? replacementDrafts : correctedPublished;

function collectReferences(value, references = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectReferences(item, references));
  } else if (value && typeof value === "object") {
    if (value._type === "reference" && typeof value._ref === "string") {
      references.push(value._ref);
    }
    Object.values(value).forEach((item) => collectReferences(item, references));
  }
  return references;
}

const rawIds = new Set(rawDocuments.map((document) => document._id));
const assetIds = new Set(assets.map((asset) => asset._id));
const resolvableIds = new Set([
  ...rawIds,
  ...[...rawIds].map(rootId),
  ...assetIds,
]);
const allReferences = rawDocuments.flatMap((document) =>
  collectReferences(document).map((reference) => ({
    source: document._id,
    target: reference,
  })),
);
const brokenReferences = allReferences.filter(
  ({ target }) => !resolvableIds.has(target),
);
const privateReferences = allReferences.filter(({ target }) =>
  isPrivatePublishedId(target),
);
const replacementReferences = allReferences.filter(
  ({ target }) =>
    expectedPublicIds.includes(target) && rawIds.has(`drafts.${target}`),
);
const correctedReferences = correctedDocuments.flatMap((document) =>
  collectReferences(document).map((reference) => ({
    source: document._id,
    target: reference,
  })),
);
const correctedPrivateReferences = correctedReferences.filter(({ target }) =>
  isPrivatePublishedId(target),
);
const draftPrivateReferences = allReferences.filter(
  ({ source, target }) => isDraft(source) && isPrivatePublishedId(target),
);

const publicSafeIds = expectedPublicIds.filter((id) => !id.includes("."));
const unsafeExpectedIds = expectedPublicIds.filter((id) => id.includes("."));
const products = correctedDocuments.filter(
  (document) => document._type === "product",
);
const productSlugs = products.map((document) => document.slug?.current);
const productPrintfulUrls = products.map((document) => document.printfulUrl);
const homepage = correctedDocuments.find(
  (document) => document._type === "homepage",
);

const report = {
  generatedAt: new Date().toISOString(),
  target: { projectId, dataset },
  authenticatedPublishedByType: countsByType(authenticatedPublished),
  anonymousPublishedByType: countsByType(anonymousDocuments),
  draftsByType: countsByType(drafts),
  authenticatedPublishedCount: authenticatedPublished.length,
  anonymousPublishedCount: anonymousDocuments.length,
  draftCount: drafts.length,
  privatePublishedCount: privatePublished.length,
  privatePublishedIds: privatePublished.map((document) => document._id).sort(),
  replacementDraftCount: replacementDrafts.length,
  correctedPublishedCount: correctedPublished.length,
  replacementIdsPublicSafe:
    publicSafeIds.length === expectedPublicIds.length &&
    unsafeExpectedIds.length === 0,
  assets: {
    images: assets.filter((asset) => asset._type === "sanity.imageAsset")
      .length,
    files: assets.filter((asset) => asset._type === "sanity.fileAsset").length,
    total: assets.length,
  },
  references: {
    total: allReferences.length,
    broken: brokenReferences.length,
    pointingToPrivateIds: privateReferences.length,
    pointingToReplacementDrafts: replacementReferences.length,
    correctedDocumentsPointingToPrivateIds: correctedPrivateReferences.length,
    draftsPointingToPrivateIds: draftPrivateReferences.length,
  },
  products: {
    count: products.length,
    uniqueSlugs:
      productSlugs.length === products.length &&
      new Set(productSlugs).size === products.length,
    printfulUrlsPresent:
      productPrintfulUrls.length === products.length &&
      productPrintfulUrls.every(Boolean),
  },
  homepageSectionKeys: (homepage?.sections || []).map(
    (section) => section._key,
  ),
};

const markdown = `# Sanity production-state audit

Generated: ${report.generatedAt}

Target: \`${projectId}/${dataset}\`

- Authenticated published content documents: ${report.authenticatedPublishedCount}
- Anonymous published content documents: ${report.anonymousPublishedCount}
- Drafts: ${report.draftCount}
- Obsolete private-path published documents: ${report.privatePublishedCount}
- Approved public-safe replacement drafts: ${report.replacementDraftCount}
- Corrected public-safe published documents: ${report.correctedPublishedCount}
- Replacement IDs are public-safe: ${report.replacementIdsPublicSafe ? "PASS" : "FAIL"}
- Assets: ${report.assets.images} images, ${report.assets.files} files (${report.assets.total} total)
- References inspected: ${report.references.total}
- Broken references: ${report.references.broken}
- References pointing to private IDs: ${report.references.pointingToPrivateIds}
- References pointing to public-safe replacement drafts: ${report.references.pointingToReplacementDrafts}
- Corrected published/draft references pointing to private IDs: ${report.references.correctedDocumentsPointingToPrivateIds}
- Draft references pointing to private IDs: ${report.references.draftsPointingToPrivateIds}
- Products: ${report.products.count}
- Product slugs unique: ${report.products.uniqueSlugs ? "PASS" : "FAIL"}
- Printful URLs present: ${report.products.printfulUrlsPresent ? "PASS" : "FAIL"}
`;

await Promise.all([
  writeJson(
    path.join(artifactsDirectory, "sanity-production-state-audit.json"),
    report,
  ),
  writeText(
    path.join(artifactsDirectory, "sanity-production-state-audit.md"),
    markdown,
  ),
]);

console.log(
  `Sanity production-state audit: published=${report.authenticatedPublishedCount}, anonymous=${report.anonymousPublishedCount}, drafts=${report.draftCount}, private=${report.privatePublishedCount}, assets=${report.assets.total}, brokenRefs=${report.references.broken}.`,
);

if (
  correctedDocuments.length !== 58 ||
  !report.replacementIdsPublicSafe ||
  report.assets.total !== 123 ||
  report.references.broken !== 0 ||
  report.references.correctedDocumentsPointingToPrivateIds !== 0 ||
  report.references.draftsPointingToPrivateIds !== 0 ||
  !report.products.uniqueSlugs ||
  !report.products.printfulUrlsPresent
) {
  process.exitCode = 1;
}
