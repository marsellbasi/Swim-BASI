import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://swimbasi.com',
  output: 'static',
  // Preserve the pre-v7 HTML whitespace behavior used by inline price and logo elements.
  compressHTML: true,
  integrations: [sitemap()],
});
