/* global URL, console, process */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const dist = join(root, 'dist');
const files = readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name));
const htmlFiles = files.filter((file) => extname(file) === '.html');
const errors = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs.filter((value) => value.startsWith('/') && !value.startsWith('//'))) {
    const clean = href.split(/[?#]/)[0];
    if (!clean || clean === '/') continue;
    const target = clean.endsWith('/') ? join(dist, clean, 'index.html') : join(dist, clean);
    const alternate = join(dist, clean, 'index.html');
    if (!existsSync(target) && !existsSync(alternate)) {
      errors.push(`${relative(root, file)} has broken internal link: ${href}`);
    }
  }

  for (const match of html.matchAll(
    /<a\b([^>]*href="https:\/\/basiswim\.printful\.me[^"]*"[^>]*)>/g,
  )) {
    const attrs = match[1];
    if (!/target="_blank"/.test(attrs) || !/rel="noopener noreferrer"/.test(attrs)) {
      errors.push(`${relative(root, file)} has an unsafe Printful link`);
    }
  }

  if (/<(?:img|source)\b[^>]*src="https?:\/\//.test(html)) {
    errors.push(`${relative(root, file)} has a remote media dependency`);
  }
}

if (!existsSync(join(dist, 'robots.txt')) || !existsSync(join(dist, 'sitemap-index.xml'))) {
  errors.push('robots.txt or sitemap-index.xml is missing');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `Verified ${htmlFiles.length} pages: internal links, Printful link safety, local media, robots, and sitemap.`,
);
