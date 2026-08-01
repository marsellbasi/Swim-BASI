/* global process, console */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";
import {
  artifactsDirectory,
  readJson,
  repositoryRoot,
  writeJson,
  writeText,
} from "./lib/files.mjs";

installSafeProcessErrorHandlers();

const projectId = "xcfqfknc";
const dataset = "production";
const apiVersion = "2026-07-31";
const expectedHomepageOrder = [
  "brandfilm",
  "mainhero",
  "silhouettes",
  "colorfocus",
  "statement",
  "campaign",
  "instagram",
  "newsletter",
];

const args = new Set(process.argv.slice(2));
const buildGate = args.has("--build-gate");
const prePublish = args.has("--pre-publish");
const published =
  args.has("--published") ||
  (buildGate && process.env.PUBLIC_SANITY_CONTENT_ENABLED === "true");

if (buildGate && !published) {
  console.log(
    "Sanity production gate skipped because PUBLIC_SANITY_CONTENT_ENABLED is not true.",
  );
  process.exit(0);
}
if (!prePublish && !published) {
  throw new Error("Choose --pre-publish, --published, or --build-gate.");
}
if (prePublish && !process.env.SANITY_API_WRITE_TOKEN?.trim()) {
  throw new Error(
    "SANITY_API_WRITE_TOKEN is required for authenticated draft validation.",
  );
}

const documentMap = await readJson(
  path.join(artifactsDirectory, "sanity-document-map.json"),
  {},
);
const assetMap = await readJson(
  path.join(artifactsDirectory, "sanity-asset-map.json"),
  {},
);
const publishedIds = Object.keys(documentMap);
const expectedIds = prePublish
  ? Object.values(documentMap).map((entry) => entry.draftId)
  : publishedIds;
const expectedIdSet = new Set(expectedIds);
const publishedIdSet = new Set(publishedIds);
const mappedAssetIds = new Set(
  Object.values(assetMap).map((entry) => entry.sanityAssetId),
);
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: prePublish ? process.env.SANITY_API_WRITE_TOKEN : undefined,
  useCdn: false,
  perspective: prePublish ? "raw" : "published",
});

const [documents, assets] = await Promise.all([
  client.fetch(`*[_id in $expectedIds]`, { expectedIds }),
  client.fetch(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{_id,_type}`,
  ),
]);
const documentsById = new Map(
  documents.map((document) => [document._id, document]),
);
const assetsById = new Map(assets.map((asset) => [asset._id, asset]));

const collect = (value, predicate, result = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collect(item, predicate, result));
    return result;
  }
  if (!value || typeof value !== "object") return result;
  if (predicate(value)) result.push(value);
  Object.values(value).forEach((child) => collect(child, predicate, result));
  return result;
};

const refs = documents.flatMap((document) =>
  collect(
    document,
    (value) => value._type === "reference" && typeof value._ref === "string",
  ).map((reference) => ({ source: document._id, ref: reference._ref })),
);
const unresolvedReferences = refs.filter(({ ref }) => {
  if (assetsById.has(ref)) return false;
  if (!publishedIdSet.has(ref)) return true;
  return prePublish
    ? !documentsById.has(`drafts.${ref}`)
    : !documentsById.has(ref);
});

const managedImages = documents.flatMap((document) =>
  collect(document, (value) => value._type === "managedImage").map((image) => ({
    source: document._id,
    ref: image.image?.asset?._ref,
    alt: image.alt,
    decorative: image.decorative,
  })),
);
const invalidImages = managedImages.filter(
  ({ ref, alt, decorative }) =>
    !ref ||
    assetsById.get(ref)?._type !== "sanity.imageAsset" ||
    (!decorative && !alt?.trim()),
);
const managedVideos = documents.flatMap((document) =>
  collect(document, (value) => value._type === "managedVideo").map((video) => ({
    source: document._id,
    videoRef: video.uploadedVideo?.asset?._ref,
    posterRef: video.poster?.image?.asset?._ref,
  })),
);
const invalidVideos = managedVideos.filter(
  ({ videoRef, posterRef }) =>
    !videoRef ||
    assetsById.get(videoRef)?._type !== "sanity.fileAsset" ||
    !posterRef ||
    assetsById.get(posterRef)?._type !== "sanity.imageAsset",
);

const products = documents.filter((document) => document._type === "product");
const categories = documents.filter(
  (document) => document._type === "productCategory",
);
const collections = documents.filter(
  (document) => document._type === "productCollection",
);
const productSlugs = products
  .map((product) => product.slug?.current)
  .filter(Boolean);
const duplicateProductSlugs = productSlugs.filter(
  (slug, index) => productSlugs.indexOf(slug) !== index,
);
const productsMissingPrintfulUrl = products
  .filter((product) => !product.printfulUrl)
  .map((product) => product._id);
const inactiveProducts = products
  .filter((product) => product.status !== "active")
  .map((product) => product._id);
const collectionErrors = collections.flatMap((collection) => {
  const refs = collection.products?.map((reference) => reference._ref) || [];
  return refs.length === 14 && new Set(refs).size === refs.length
    ? []
    : [
        `${collection._id}: expected 14 unique ordered products, received ${refs.length}`,
      ];
});

const homepage = documents.find((document) => document._type === "homepage");
const homepageOrder = homepage?.sections?.map((section) => section._key) || [];
const disabledHomepageSections =
  homepage?.sections?.filter((section) => section.enabled === false) || [];
const requiredSingletonTypes = [
  "siteSettings",
  "announcementBar",
  "homepage",
  "aboutPage",
  "shopPage",
  "collectionsPage",
  "sizeGuide",
  "headerNavigation",
  "footerNavigation",
  "brandFilm",
];
const missingSingletonTypes = requiredSingletonTypes.filter(
  (type) => !documents.some((document) => document._type === type),
);

const seoDocuments = documents.filter((document) =>
  [
    "product",
    "productCollection",
    "homepage",
    "aboutPage",
    "shopPage",
    "collectionsPage",
    "sizeGuide",
  ].includes(document._type),
);
const invalidSeoDocuments = seoDocuments
  .filter(
    (document) =>
      !document.seo?.metaTitle?.trim() ||
      !document.seo?.metaDescription?.trim(),
  )
  .map((document) => document._id);
const siteSettings = documents.find(
  (document) => document._type === "siteSettings",
);
const siteSettingsSeoValid = Boolean(
  siteSettings?.siteName &&
  siteSettings?.canonicalSiteUrl === "https://swimbasi.com" &&
  siteSettings?.defaultMetaDescription &&
  siteSettings?.defaultOpenGraphImage?.image?.asset?._ref,
);

const distChecks = {
  checked: published && fs.existsSync(path.join(repositoryRoot, "dist")),
  shopUsesSanityCdn: null,
  shopAvoidsLocalProductImages: null,
};
if (distChecks.checked) {
  const shopHtml = fs.readFileSync(
    path.join(repositoryRoot, "dist", "shop", "index.html"),
    "utf8",
  );
  distChecks.shopUsesSanityCdn = shopHtml.includes(
    "cdn.sanity.io/images/xcfqfknc/production/",
  );
  distChecks.shopAvoidsLocalProductImages =
    !shopHtml.includes("/images/products/");
}

const checks = {
  targetCorrect: projectId === "xcfqfknc" && dataset === "production",
  expectedDocumentCount: documents.length === 58,
  allExpectedIdsFound: expectedIds.every((id) => documentsById.has(id)),
  noUnexpectedIds: documents.every((document) =>
    expectedIdSet.has(document._id),
  ),
  assetsComplete: [...mappedAssetIds].every((id) => assetsById.has(id)),
  referencesResolve: unresolvedReferences.length === 0,
  productsComplete: products.length === 42,
  productsActive: inactiveProducts.length === 0,
  productSlugsUnique:
    productSlugs.length === 42 && duplicateProductSlugs.length === 0,
  printfulUrlsComplete: productsMissingPrintfulUrl.length === 0,
  categoriesComplete: categories.length === 3,
  collectionsComplete:
    collections.length === 3 && collectionErrors.length === 0,
  singletonDocumentsComplete: missingSingletonTypes.length === 0,
  homepageOrderValid:
    JSON.stringify(homepageOrder) === JSON.stringify(expectedHomepageOrder) &&
    disabledHomepageSections.length === 0,
  managedImagesValid: invalidImages.length === 0,
  managedVideosValid: managedVideos.length === 2 && invalidVideos.length === 0,
  seoValid: invalidSeoDocuments.length === 0 && siteSettingsSeoValid,
  builtShopUsesSanity:
    !distChecks.checked ||
    (distChecks.shopUsesSanityCdn && distChecks.shopAvoidsLocalProductImages),
};

const report = {
  generatedAt: new Date().toISOString(),
  mode: prePublish ? "pre-publish" : "published",
  target: { projectId, dataset },
  verified: Object.values(checks).every(Boolean),
  counts: {
    documents: documents.length,
    products: products.length,
    categories: categories.length,
    collections: collections.length,
    assets: assets.length,
    imageAssets: assets.filter((asset) => asset._type === "sanity.imageAsset")
      .length,
    fileAssets: assets.filter((asset) => asset._type === "sanity.fileAsset")
      .length,
    references: refs.length,
    managedImages: managedImages.length,
    managedVideos: managedVideos.length,
    seoDocuments: seoDocuments.length,
  },
  homepageOrder,
  checks,
  errors: {
    missingExpectedIds: expectedIds.filter((id) => !documentsById.has(id)),
    unresolvedReferences,
    inactiveProducts,
    duplicateProductSlugs,
    productsMissingPrintfulUrl,
    collectionErrors,
    missingSingletonTypes,
    invalidImages,
    invalidVideos,
    invalidSeoDocuments,
  },
  distChecks,
};

if (prePublish) {
  const markdown = `# Sanity production pre-publish validation

Generated: ${report.generatedAt}

Target: \`${projectId}/${dataset}\`

Verified: **${report.verified}**

- Draft documents: ${report.counts.documents}/58
- Products: ${report.counts.products}/42
- Categories: ${report.counts.categories}/3
- Collections: ${report.counts.collections}/3
- Assets: ${report.counts.assets}/123
- Resolved references: ${report.counts.references}
- Managed images: ${report.counts.managedImages}
- Managed videos: ${report.counts.managedVideos}
- SEO documents: ${report.counts.seoDocuments}

## Checks

${Object.entries(checks)
  .map(([name, passed]) => `- ${passed ? "PASS" : "FAIL"} — ${name}`)
  .join("\n")}
`;
  await Promise.all([
    writeJson(
      path.join(artifactsDirectory, "sanity-production-pre-publish.json"),
      report,
    ),
    writeText(
      path.join(artifactsDirectory, "sanity-production-pre-publish.md"),
      markdown,
    ),
  ]);
}

console.log(
  `Sanity ${report.mode} validation: ${report.verified ? "PASS" : "FAIL"} (${documents.length} documents, ${refs.length} references).`,
);
if (!report.verified) {
  console.error(
    `Failed checks: ${Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([name]) => name)
      .join(", ")}`,
  );
}
if (!report.verified) process.exitCode = 1;
