import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://swimbasi.com',
  output: 'static',
  integrations: [sitemap()],
});
