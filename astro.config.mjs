/* global process */
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID ?? 'xcfqfknc';
const dataset = process.env.PUBLIC_SANITY_DATASET ?? 'production';

export default defineConfig({
  site: 'https://swimbasi.com',
  output: 'static',
  // Preserve the pre-v7 HTML whitespace behavior used by inline price and logo elements.
  compressHTML: true,
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: '2026-07-30',
      useCdn: false,
      perspective: 'published',
    }),
  ],
});
