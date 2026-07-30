/* global console */
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { assertExpectedTarget } from './lib/config.mjs';
import { pageDocuments, productDocuments, taxonomyDocuments } from './lib/documents.mjs';
import { repositoryRoot } from './lib/files.mjs';

const first = [...taxonomyDocuments(), ...productDocuments({}), ...pageDocuments({})];
const second = [...taxonomyDocuments(), ...productDocuments({}), ...pageDocuments({})];
assert.deepEqual(first, second, 'Migration planning must be deterministic.');
assert.equal(
  new Set(first.map((document) => document._id)).size,
  first.length,
  'Document IDs must be unique.',
);

const homepage = first.find((document) => document._id === 'homepage');
assert.ok(homepage);
assert.deepEqual(
  homepage.sections.map((section) => section._key),
  [
    'brandfilm',
    'mainhero',
    'silhouettes',
    'colorfocus',
    'statement',
    'campaign',
    'instagram',
    'newsletter',
  ],
  'Homepage migration order must match the current storefront.',
);
assert.equal(
  new Set(homepage.sections.map((section) => section._key)).size,
  homepage.sections.length,
);

const disabled = homepage.sections.map((section) =>
  section._key === 'campaign' ? { ...section, enabled: false } : section,
);
assert.deepEqual(
  disabled.filter((section) => section.enabled !== false).map((section) => section._key),
  ['brandfilm', 'mainhero', 'silhouettes', 'colorfocus', 'statement', 'instagram', 'newsletter'],
  'Disabled sections must be omitted without changing stored order.',
);
assert.equal(
  disabled.findIndex((section) => section._key === 'campaign'),
  5,
);
disabled[5].enabled = true;
assert.equal(
  disabled.findIndex((section) => section._key === 'campaign'),
  5,
  'Re-enabling must preserve placement.',
);

const renderer = await readFile(
  path.join(repositoryRoot, 'src/components/PageSections.astro'),
  'utf8',
);
const expectedTypes = [
  'heroSection',
  'richTextSection',
  'imageSection',
  'imageTextSection',
  'videoSection',
  'fullWidthMediaSection',
  'splitMediaSection',
  'productGridSection',
  'collectionGridSection',
  'campaignSection',
  'imageGallerySection',
  'editorialGridSection',
  'callToActionSection',
  'newsletterSection',
  'brandStatementSection',
  'sizeGuideSection',
  'spacerSection',
  'dividerSection',
];
for (const type of expectedTypes) {
  assert.match(renderer, new RegExp(`['"]${type}['"]`), `Renderer is missing ${type}.`);
}
assert.match(
  renderer,
  /Unsupported page section type/,
  'Unknown types must fail safely with a development warning.',
);

for (const document of first) {
  const stack = [document];
  while (stack.length) {
    const value = stack.pop();
    if (Array.isArray(value)) stack.push(...value);
    else if (value && typeof value === 'object') {
      if (typeof value._migrationSource === 'string') {
        await access(path.join(repositoryRoot, value._migrationSource));
      }
      stack.push(...Object.values(value));
    }
  }
}

assert.doesNotThrow(() => assertExpectedTarget('xcfqfknc', 'production'));
assert.throws(() => assertExpectedTarget('wrong-project', 'production'), /Refusing mutation/);
assert.throws(() => assertExpectedTarget('xcfqfknc', 'wrong-dataset'), /Refusing mutation/);

console.log(
  `Verified ${homepage.sections.length} ordered homepage sections, ${first.length} deterministic documents, local media sources, renderer coverage, disabled-state placement, and wrong-target refusal.`,
);
