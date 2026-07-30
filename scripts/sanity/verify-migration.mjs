/* global process, console */
import path from 'node:path';
import { dataset, migrationClient, projectId, tokenAvailable } from './lib/config.mjs';
import { artifactsDirectory, readJson, writeJson, writeText } from './lib/files.mjs';

const documentMap = await readJson(path.join(artifactsDirectory, 'sanity-document-map.json'), {});
if (!tokenAvailable) {
  const result = {
    verified: false,
    reason: 'SANITY_API_WRITE_TOKEN is unavailable; no remote query was attempted.',
    target: { projectId, dataset },
    plannedDocuments: Object.keys(documentMap).length,
  };
  await writeJson(path.join(artifactsDirectory, 'sanity-migration-verification.json'), result);
  await writeText(
    path.join(artifactsDirectory, 'sanity-migration-verification.md'),
    `# Sanity migration verification\n\nRemote verification paused: ${result.reason}\n`,
  );
  console.log(result.reason);
  process.exit(0);
}

const client = migrationClient();
const ids = Object.values(documentMap).map((entry) => entry.draftId);
const documents = await client.fetch(`*[_id in $ids]{_id, _type, "references": references(_id)}`, {
  ids,
});
const missing = ids.filter((id) => !documents.some((document) => document._id === id));
const result = {
  verified: missing.length === 0,
  target: { projectId, dataset },
  expectedDocuments: ids.length,
  foundDocuments: documents.length,
  missing,
};
await writeJson(path.join(artifactsDirectory, 'sanity-migration-verification.json'), result);
await writeText(
  path.join(artifactsDirectory, 'sanity-migration-verification.md'),
  `# Sanity migration verification\n\nVerified: **${result.verified}**\n\nExpected: ${ids.length}\n\nFound: ${documents.length}\n\nMissing: ${missing.length}\n`,
);
if (!result.verified) process.exitCode = 1;
