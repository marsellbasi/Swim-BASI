/* global process, console */
import path from "node:path";
import { createClient } from "@sanity/client";
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";
import {
  artifactsDirectory,
  readJson,
  writeJson,
  writeText,
} from "./lib/files.mjs";

installSafeProcessErrorHandlers();

const projectId = "xcfqfknc";
const dataset = "production";
const apiVersion = "2026-07-31";
const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;

if (projectId !== "xcfqfknc" || dataset !== "production") {
  throw new Error("Refusing publication outside xcfqfknc/production.");
}
if (!process.env.SANITY_API_WRITE_TOKEN?.trim()) {
  throw new Error("SANITY_API_WRITE_TOKEN is unavailable.");
}
if (apply && dryRun) throw new Error("Choose either --apply or --dry-run.");

const documentMap = await readJson(
  path.join(artifactsDirectory, "sanity-document-map.json"),
  {},
);
const approved = Object.entries(documentMap).map(([publishedId, entry]) => ({
  publishedId,
  draftId: entry.draftId,
  type: entry.type,
}));
if (approved.length !== 58) {
  throw new Error(
    `Expected 58 approved documents, received ${approved.length}.`,
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: "raw",
});

const draftIds = approved.map((document) => document.draftId);
const publishedIds = approved.map((document) => document.publishedId);
const [drafts, existingPublished, allDraftIds] = await Promise.all([
  client.fetch(`*[_id in $draftIds]`, { draftIds }),
  client.fetch(`*[_id in $publishedIds]{_id,_type}`, { publishedIds }),
  client.fetch(`*[_id in path("drafts.**")]._id`),
]);
const foundDraftIds = new Set(drafts.map((document) => document._id));
const missingDrafts = draftIds.filter((id) => !foundDraftIds.has(id));
const approvedByPublishedId = new Map(
  approved.map((document) => [document.publishedId, document]),
);
const conflictingPublished = existingPublished.filter(
  (document) =>
    approvedByPublishedId.get(document._id)?.type !== document._type,
);
const inactiveProducts = drafts
  .filter(
    (document) => document._type === "product" && document.status !== "active",
  )
  .map((document) => document._id);
if (missingDrafts.length)
  throw new Error(`Missing ${missingDrafts.length} approved drafts.`);
if (conflictingPublished.length) {
  throw new Error(
    `Refusing to overwrite ${conflictingPublished.length} published documents with unexpected schema types.`,
  );
}
if (inactiveProducts.length) {
  throw new Error(
    `Refusing to publish ${inactiveProducts.length} products that are not active.`,
  );
}

const approvedDraftSet = new Set(draftIds);
const unrelatedDrafts = allDraftIds.filter((id) => !approvedDraftSet.has(id));
const byType = (type) => approved.filter((document) => document.type === type);
const chunks = (items, size) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
const phases = [
  { name: "site-settings", documents: byType("siteSettings") },
  { name: "product-categories", documents: byType("productCategory") },
  { name: "product-collections", documents: byType("productCollection") },
  ...chunks(byType("product"), 10).map((documents, index) => ({
    name: `products-${index + 1}`,
    documents,
  })),
  { name: "header-navigation", documents: byType("headerNavigation") },
  { name: "footer-navigation", documents: byType("footerNavigation") },
  { name: "announcement-bar", documents: byType("announcementBar") },
  { name: "about-page", documents: byType("aboutPage") },
  { name: "shop-page", documents: byType("shopPage") },
  { name: "collections-page", documents: byType("collectionsPage") },
  { name: "size-guide", documents: byType("sizeGuide") },
  { name: "brand-film", documents: byType("brandFilm") },
  { name: "homepage", documents: byType("homepage") },
];

const phaseResults = [];
for (const phase of phases) {
  const actions = phase.documents.map(({ publishedId, draftId }) => ({
    actionType: "sanity.action.document.publish",
    publishedId,
    draftId,
  }));
  const response = await client.action(actions, { dryRun });
  const result = {
    phase: phase.name,
    documents: phase.documents.length,
    dryRun,
    transactionId: response.transactionId || null,
    verified: true,
  };
  if (apply) {
    const phasePublishedIds = phase.documents.map(
      (document) => document.publishedId,
    );
    const phaseDraftIds = phase.documents.map((document) => document.draftId);
    const state = await client.fetch(
      `{
        "published": count(*[_id in $phasePublishedIds]),
        "drafts": count(*[_id in $phaseDraftIds])
      }`,
      { phasePublishedIds, phaseDraftIds },
    );
    result.verified =
      state.published === phase.documents.length && state.drafts === 0;
    result.published = state.published;
    result.remainingDrafts = state.drafts;
    if (!result.verified) {
      throw new Error(
        `Publication verification failed after phase ${phase.name}.`,
      );
    }
  }
  phaseResults.push(result);
  console.log(
    `${dryRun ? "Dry-run" : "Published"} ${phase.name}: ${phase.documents.length} approved documents.`,
  );
}

const finalState = apply
  ? await client.fetch(
      `{
        "published": *[_id in $publishedIds]{_id,_type},
        "drafts": *[_id in $draftIds]{_id,_type}
      }`,
      { publishedIds, draftIds },
    )
  : { published: [], drafts };
const countsByType = Object.fromEntries(
  Object.entries(
    (apply ? finalState.published : drafts).reduce((counts, document) => {
      counts[document._type] = (counts[document._type] || 0) + 1;
      return counts;
    }, {}),
  ).sort(([left], [right]) => left.localeCompare(right)),
);

const report = {
  generatedAt: new Date().toISOString(),
  mode: dryRun ? "dry-run" : "apply",
  target: { projectId, dataset },
  method: "@sanity/client Actions API (sanity.action.document.publish)",
  approvedDocuments: approved.length,
  existingApprovedDocumentsUpdated: existingPublished.length,
  unrelatedDraftsPreserved: unrelatedDrafts.length,
  publishedDocuments: apply ? finalState.published.length : 0,
  remainingApprovedDrafts: apply ? finalState.drafts.length : drafts.length,
  countsByType,
  phases: phaseResults,
  verified:
    dryRun ||
    (finalState.published.length === approved.length &&
      finalState.drafts.length === 0),
};

if (apply) {
  const markdown = `# Sanity production publication

Generated: ${report.generatedAt}

Target: \`${projectId}/${dataset}\`

Method: ${report.method}

Verified: **${report.verified}**

- Approved documents: ${report.approvedDocuments}
- Published documents: ${report.publishedDocuments}
- Remaining approved drafts: ${report.remainingApprovedDrafts}
- Unrelated drafts preserved: ${report.unrelatedDraftsPreserved}

## Published documents by type

${Object.entries(countsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n")}

## Publication phases

${phaseResults
  .map(
    (phase) =>
      `- ${phase.phase}: ${phase.documents} documents — ${phase.verified ? "PASS" : "FAIL"}`,
  )
  .join("\n")}
`;
  await Promise.all([
    writeJson(
      path.join(artifactsDirectory, "sanity-production-publication.json"),
      report,
    ),
    writeText(
      path.join(artifactsDirectory, "sanity-production-publication.md"),
      markdown,
    ),
  ]);
}

console.log(
  `Sanity production publication ${report.mode}: ${report.verified ? "PASS" : "FAIL"}.`,
);
if (!report.verified) process.exitCode = 1;
