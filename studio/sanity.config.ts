import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { singletonTypes } from './schemaTypes/singletons';
import { structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID or SANITY_STUDIO_DATASET. Copy .env.example to .env for local development.',
  );
}

export default defineConfig({
  name: 'swim-basi-studio',
  title: 'Swim BASI Studio',
  projectId,
  dataset,
  basePath: '/',
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: '2026-07-30' })],
  schema: {
    types: schemaTypes,
  },
  document: {
    newDocumentOptions: (previous) =>
      previous.filter(({ templateId }) => !singletonTypes.has(templateId)),
    actions: (previous, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? previous.filter(({ action }) => action !== 'duplicate')
        : previous,
  },
});
