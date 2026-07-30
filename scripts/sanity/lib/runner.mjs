/* global process, console */
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { artifactsDirectory, readJson, repositoryRoot, writeJson, writeText } from './files.mjs';
import {
  assertMutationSafety,
  draftId,
  migrationClient,
  parseMode,
  projectId,
  dataset,
  tokenAvailable,
} from './config.mjs';
import { inventoryMedia } from '../inventory-media.mjs';
import {
  navigationDocuments,
  pageDocuments,
  productDocuments,
  siteSettingsDocuments,
  taxonomyDocuments,
} from './documents.mjs';

const assetMapPath = path.join(artifactsDirectory, 'sanity-asset-map.json');
const documentMapPath = path.join(artifactsDirectory, 'sanity-document-map.json');
const rollbackPath = path.join(artifactsDirectory, 'sanity-rollback-manifest.json');

const stripMigrationFields = (value) => {
  if (Array.isArray(value)) return value.map(stripMigrationFields);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([name, child]) => !name.startsWith('_migration') && child !== undefined)
      .map(([name, child]) => [name, stripMigrationFields(child)]),
  );
};

const comparableDocument = (value) => {
  if (Array.isArray(value)) return value.map(comparableDocument);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([name, child]) =>
          !['_rev', '_createdAt', '_updatedAt'].includes(name) && child !== undefined,
      )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, child]) => [name, comparableDocument(child)]),
  );
};

const documentsMatch = (left, right) =>
  JSON.stringify(comparableDocument(left)) === JSON.stringify(comparableDocument(right));

async function uploadAssets(mode, inventory) {
  const groupArgument = process.argv.slice(2).find((argument) => argument.startsWith('--group='));
  const group = groupArgument?.split('=')[1];
  const inGroup = (item) => {
    if (!group) return true;
    if (group === 'sitewide') return item.source.includes('/images/hero/');
    if (group === 'products') return item.source.includes('/images/products/');
    if (group === 'campaigns') return item.source.includes('/images/brand/');
    if (group === 'brand-film') return item.source.includes('/videos/campaigns/');
    if (group === 'pages')
      return (
        !item.source.includes('/images/hero/') &&
        !item.source.includes('/images/products/') &&
        !item.source.includes('/images/brand/') &&
        !item.source.includes('/videos/campaigns/')
      );
    throw new Error(`Unknown asset group: ${group}`);
  };
  const planned = inventory.filter((item) => item.recommendation === 'upload' && inGroup(item));
  const existingMap = await readJson(assetMapPath, {});
  if (!mode.apply) {
    return {
      map: existingMap,
      planned: planned.length,
      uploaded: 0,
      reused: Object.keys(existingMap).length,
    };
  }
  assertMutationSafety(mode);
  const client = migrationClient();
  const map = { ...existingMap };
  let uploaded = 0;
  let reused = 0;
  for (const item of planned) {
    if (map[item.source]?.sha256 === item.sha256 && map[item.source]?.sanityAssetId) {
      reused += 1;
      continue;
    }
    const assetType = item.type === 'video' || item.type === 'captions' ? 'file' : 'image';
    const absolutePath = path.join(repositoryRoot, item.source);
    const asset = await client.assets.upload(assetType, createReadStream(absolutePath), {
      filename: path.basename(absolutePath),
      source: { id: item.sha256, name: 'Swim BASI repository migration', url: item.source },
    });
    map[item.source] = {
      sha256: item.sha256,
      sanityAssetId: asset._id,
      assetType,
      originalFilename: path.basename(absolutePath),
    };
    uploaded += 1;
    await writeJson(assetMapPath, map);
  }
  return { map, planned: planned.length, uploaded, reused };
}

function documentsForPhase(phase, assetMap) {
  if (phase === 'taxonomy') return taxonomyDocuments();
  if (phase === 'products') return productDocuments(assetMap);
  if (phase === 'pages') return pageDocuments(assetMap);
  if (phase === 'navigation') return navigationDocuments();
  if (phase === 'site-settings') return siteSettingsDocuments(assetMap);
  return [
    ...taxonomyDocuments(),
    ...productDocuments(assetMap),
    ...siteSettingsDocuments(assetMap),
    ...navigationDocuments(),
    ...pageDocuments(assetMap),
  ];
}

async function writeDocuments(mode, documents) {
  if (!mode.apply)
    return {
      createdOrReplaced: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      planned: documents.length,
      documentMap: {},
    };
  assertMutationSafety(mode);
  const client = migrationClient();
  const documentMap = await readJson(documentMapPath, {});
  const rollback = await readJson(rollbackPath, {
    projectId,
    dataset,
    generatedAt: new Date().toISOString(),
    draftDocumentIds: [],
    assetIds: [],
  });
  const targets = documents.map((source) =>
    stripMigrationFields({ ...source, _id: draftId(source._id) }),
  );
  const targetIds = targets.map((target) => target._id);
  const existingDocuments = targetIds.length
    ? await client.fetch(`*[_id in $targetIds]`, { targetIds })
    : [];
  const existingById = new Map(existingDocuments.map((document) => [document._id, document]));
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  for (const source of documents) {
    const targetId = draftId(source._id);
    const target = stripMigrationFields({ ...source, _id: targetId });
    const existing = existingById.get(targetId);
    if (existing && documentsMatch(existing, target)) {
      unchanged += 1;
    } else {
      await client.createOrReplace(target);
      if (existing) updated += 1;
      else created += 1;
    }
    documentMap[source._id] = { draftId: targetId, type: source._type, deterministic: true };
    if (!rollback.draftDocumentIds.includes(targetId)) rollback.draftDocumentIds.push(targetId);
  }
  await writeJson(documentMapPath, documentMap);
  await writeJson(rollbackPath, rollback);
  return {
    createdOrReplaced: created + updated,
    created,
    updated,
    unchanged,
    planned: documents.length,
    documentMap,
  };
}

function markdownReport(report) {
  return `# Sanity migration dry run

Generated: ${report.generatedAt}

Target: \`${report.target.projectId}/${report.target.dataset}\`

Write token available: **${report.tokenAvailable ? 'yes' : 'no'}**

No remote mutations were performed by this dry run.

## Assets

- Tracked media inventoried: ${report.assets.inventoryCount}
- Images planned for upload: ${report.assets.imagesPlanned}
- Videos planned for upload: ${report.assets.videosPlanned}
- Responsive derivatives intentionally skipped: ${report.assets.skippedDerivatives}
- Code-controlled media skipped: ${report.assets.codeControlled}
- Exact-content duplicate groups: ${report.assets.duplicateGroups}
- Projected bytes uploaded: ${report.assets.projectedBytes.toLocaleString()}

## Documents

${Object.entries(report.documents.byType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

Total planned draft documents: ${report.documents.total}

## Validation findings

- Missing reviewed captions: ${report.findings.missingCaptions}
- Missing reviewed transcripts: ${report.findings.missingTranscripts}
- Product size arrays intentionally empty: ${report.findings.productsWithoutSizes}
- Size-guide rows awaiting owner-approved measurements: ${report.findings.sizeGuideRowsMissing}
- Unresolved asset references in dry-run documents: expected until \`upload-assets.mjs --apply\` creates the checksum map.
- Remote reference integrity was not tested because no write token is available.

## Safety decision

${report.tokenAvailable ? 'The credential gate is available, but an apply still requires the explicit `--apply` flag.' : 'Paused before remote mutation. Set `SANITY_API_WRITE_TOKEN` only in the local process environment, rerun validation, then explicitly run with `--apply`.'}
`;
}

export async function runMigration({ phase = 'all', argv = process.argv.slice(2) } = {}) {
  const mode = parseMode(argv);
  assertMutationSafety(mode);
  const inventory = await inventoryMedia();
  const assetResult =
    phase === 'assets' || phase === 'all'
      ? await uploadAssets(mode, inventory)
      : { map: await readJson(assetMapPath, {}), planned: 0, uploaded: 0, reused: 0 };
  const documents = phase === 'assets' ? [] : documentsForPhase(phase, assetResult.map);
  const documentResult = await writeDocuments(mode, documents);
  const duplicateGroups = new Set(
    inventory
      .filter((item) => item.duplicateStatus !== 'unique')
      .map((item) => item.duplicateStatus),
  ).size;
  const uploadable = inventory.filter((item) => item.recommendation === 'upload');
  const report = {
    generatedAt: new Date().toISOString(),
    mode: mode.apply ? 'apply' : 'dry-run',
    phase,
    target: { projectId, dataset },
    tokenAvailable,
    assets: {
      inventoryCount: inventory.length,
      imagesPlanned: uploadable.filter((item) => item.type === 'image').length,
      videosPlanned: uploadable.filter((item) => item.type === 'video').length,
      skippedDerivatives: inventory.filter((item) => item.recommendation === 'skip-derivative')
        .length,
      codeControlled: inventory.filter((item) => item.recommendation === 'keep-code').length,
      duplicateGroups,
      projectedBytes: uploadable.reduce((sum, item) => sum + item.bytes, 0),
      uploaded: assetResult.uploaded,
      reused: assetResult.reused,
    },
    documents: {
      total: documents.length,
      byType: Object.fromEntries(
        [...new Set(documents.map((document) => document._type))]
          .sort()
          .map((type) => [type, documents.filter((document) => document._type === type).length]),
      ),
      written: documentResult.createdOrReplaced,
      created: documentResult.created,
      updated: documentResult.updated,
      unchanged: documentResult.unchanged,
    },
    findings: {
      missingCaptions: 1,
      missingTranscripts: 1,
      productsWithoutSizes: 42,
      sizeGuideRowsMissing: 1,
    },
  };
  const prefix = mode.apply ? 'sanity-migration-result' : 'sanity-migration-dry-run';
  await writeJson(path.join(artifactsDirectory, `${prefix}.json`), report);
  await writeText(path.join(artifactsDirectory, `${prefix}.md`), markdownReport(report));
  if (!mode.apply) {
    await writeJson(assetMapPath, assetResult.map);
    await writeJson(
      documentMapPath,
      Object.fromEntries(
        documents.map((document) => [
          document._id,
          { draftId: draftId(document._id), type: document._type, planned: true },
        ]),
      ),
    );
    await writeJson(rollbackPath, {
      projectId,
      dataset,
      generatedAt: report.generatedAt,
      mode: 'planned-only',
      draftDocumentIds: documents.map((document) => draftId(document._id)),
      assetIds: [],
    });
    await writeText(
      path.join(artifactsDirectory, 'sanity-editorial-review.md'),
      `# Sanity editorial review

Generated: ${report.generatedAt}

## Owner review required

- The brand film has no reviewed captions or transcript. No text was fabricated.
- All 42 products have empty size arrays because the repository has no verified sizes.
- The size table is empty pending approved bust, waist, and hip measurements.
- Product availability remains unasserted; Printful is the checkout source of truth.
- Review migrated image alternative text before publication.
- Image credits and campaign dates are unavailable and remain empty.
- Confirm MP4 resolution with FFprobe before apply; FFprobe was unavailable locally.
- Policy and customer-care pages remain code-controlled because their copy is unfinished.
- SEO values reproduce current source copy and still require editorial review.

Do not publish migrated documents until this checklist and visual parity are approved.
`,
    );
  }
  console.log(
    mode.apply
      ? `Applied phase "${phase}": assets uploaded=${assetResult.uploaded}, reused=${assetResult.reused}; documents created=${documentResult.created}, updated=${documentResult.updated}, unchanged=${documentResult.unchanged}.`
      : `Dry-run planned phase "${phase}": ${uploadable.length} assets and ${documents.length} documents.`,
  );
  return report;
}
