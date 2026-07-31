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
const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const allowedPrefixes = [
  "swim-basi.product.",
  "swim-basi.productCategory.",
  "swim-basi.productCollection.",
  "swim-basi.brandFilm.",
];
const expectedByType = {
  product: 42,
  productCategory: 3,
  productCollection: 3,
  brandFilm: 1,
};

if (!process.env.SANITY_API_WRITE_TOKEN?.trim()) {
  throw new Error("SANITY_API_WRITE_TOKEN is unavailable.");
}
if (apply && dryRun) throw new Error("Choose either --dry-run or --apply.");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});
const documentMap = await readJson(
  path.join(artifactsDirectory, "sanity-document-map.json"),
  {},
);
const publicSafeIds = Object.keys(documentMap);

const [privateDocuments, correctedDocuments, drafts, assets] =
  await Promise.all([
    client.fetch(
      `*[
        !(_id in path("drafts.**")) &&
        !(_id in path("versions.**")) &&
        _id in path("swim-basi.**")
      ]{_id,_type}`,
    ),
    client.fetch(`*[_id in $publicSafeIds]`, { publicSafeIds }),
    client.fetch(`*[_id in path("drafts.**")]`),
    client.fetch(
      `*[_type in ["sanity.imageAsset","sanity.fileAsset"]]{_id,_type}`,
    ),
  ]);

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

const privateIds = privateDocuments.map((document) => document._id).sort();
const privateIdSet = new Set(privateIds);
const countsByType = Object.fromEntries(
  Object.keys(expectedByType).map((type) => [
    type,
    privateDocuments.filter((document) => document._type === type).length,
  ]),
);
const unexpectedIds = privateDocuments
  .filter(
    (document) =>
      !allowedPrefixes.some((prefix) => document._id.startsWith(prefix)) ||
      !Object.hasOwn(expectedByType, document._type),
  )
  .map((document) => document._id);
const correctedPrivateReferences = correctedDocuments.flatMap((document) =>
  collectReferences(document)
    .filter((reference) => privateIdSet.has(reference))
    .map((reference) => ({ source: document._id, target: reference })),
);
const draftPrivateReferences = drafts.flatMap((document) =>
  collectReferences(document)
    .filter((reference) => privateIdSet.has(reference))
    .map((reference) => ({ source: document._id, target: reference })),
);
const typeCountsValid = Object.entries(expectedByType).every(
  ([type, count]) => countsByType[type] === count,
);
const safetyChecks = {
  targetCorrect: projectId === "xcfqfknc" && dataset === "production",
  exactlyExpectedPrivateDocuments:
    privateDocuments.length === 49 &&
    unexpectedIds.length === 0 &&
    typeCountsValid,
  correctedDocumentsComplete: correctedDocuments.length === 58,
  correctedReferencesClear: correctedPrivateReferences.length === 0,
  draftReferencesClear: draftPrivateReferences.length === 0,
  assetsComplete: assets.length === 123,
  publicSafeIdsContainNoPeriods: publicSafeIds.every((id) => !id.includes(".")),
};

if (!Object.values(safetyChecks).every(Boolean)) {
  throw new Error(
    "Private-ID cleanup safety checks failed. No deletion was attempted.",
  );
}

const batchResults = [];
if (apply) {
  for (let index = 0; index < privateIds.length; index += 10) {
    const ids = privateIds.slice(index, index + 10);
    let transaction = client.transaction();
    ids.forEach((id) => {
      transaction = transaction.delete(id);
    });
    const response = await transaction.commit({ visibility: "sync" });
    const remaining = await client.fetch(`count(*[_id in $ids])`, { ids });
    if (remaining !== 0) {
      throw new Error(
        `Private-ID cleanup verification failed for batch ${batchResults.length + 1}.`,
      );
    }
    batchResults.push({
      batch: batchResults.length + 1,
      documents: ids.length,
      transactionId: response.transactionId || null,
      verified: true,
    });
  }
}

const [remainingPrivate, remainingAssets, retainedCorrected] = apply
  ? await Promise.all([
      client.fetch(`count(*[_id in $privateIds])`, { privateIds }),
      client.fetch(
        `count(*[_type in ["sanity.imageAsset","sanity.fileAsset"]])`,
      ),
      client.fetch(`count(*[_id in $publicSafeIds])`, { publicSafeIds }),
    ])
  : [privateDocuments.length, assets.length, correctedDocuments.length];

const report = {
  generatedAt: new Date().toISOString(),
  mode: dryRun ? "dry-run" : "apply",
  target: { projectId, dataset },
  obsoleteDocumentsIdentified: privateDocuments.length,
  obsoleteDocumentsDeleted: apply
    ? privateDocuments.length - remainingPrivate
    : 0,
  remainingObsoleteDocuments: remainingPrivate,
  retainedCorrectedDocuments: retainedCorrected,
  retainedAssets: remainingAssets,
  countsByType,
  obsoleteDocumentIds: privateIds,
  safetyChecks,
  batches: batchResults,
  verified:
    dryRun ||
    (remainingPrivate === 0 &&
      retainedCorrected === 58 &&
      remainingAssets === 123),
};

const markdown = `# Sanity private-ID cleanup

Generated: ${report.generatedAt}

Target: \`${projectId}/${dataset}\`

Mode: **${report.mode}**

- Obsolete private-path documents identified: ${report.obsoleteDocumentsIdentified}
- Obsolete private-path documents deleted: ${report.obsoleteDocumentsDeleted}
- Remaining obsolete documents: ${report.remainingObsoleteDocuments}
- Corrected public-safe documents retained: ${report.retainedCorrectedDocuments}
- Assets retained: ${report.retainedAssets}
- Corrected references to obsolete IDs before deletion: ${correctedPrivateReferences.length}
- Draft references to obsolete IDs before deletion: ${draftPrivateReferences.length}
- Verified: ${report.verified ? "PASS" : "FAIL"}

## Obsolete documents by type

${Object.entries(countsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n")}
`;

await Promise.all([
  writeJson(
    path.join(artifactsDirectory, "sanity-private-id-cleanup.json"),
    report,
  ),
  writeText(
    path.join(artifactsDirectory, "sanity-private-id-cleanup.md"),
    markdown,
  ),
]);

console.log(
  `Sanity private-ID cleanup ${report.mode}: identified=${report.obsoleteDocumentsIdentified}, deleted=${report.obsoleteDocumentsDeleted}, correctedRetained=${report.retainedCorrectedDocuments}, assetsRetained=${report.retainedAssets}.`,
);
if (!report.verified) process.exitCode = 1;
