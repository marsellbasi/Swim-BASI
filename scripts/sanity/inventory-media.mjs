/* global process, console */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import {
  artifactsDirectory,
  relativeToRoot,
  repositoryRoot,
  sha256,
  writeJson,
  writeText,
} from './lib/files.mjs';

const extensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.avif',
  '.svg',
  '.mp4',
  '.webm',
  '.mov',
  '.vtt',
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(target);
  }
  return files;
}

function destination(source) {
  if (source.includes('/icons/'))
    return { destination: 'Code-controlled', field: 'favicon', recommendation: 'keep-code' };
  if (source.includes('/products/'))
    return { destination: 'product', field: 'primaryImage/gallery', recommendation: 'upload' };
  if (source.endsWith('swim-basi-brand-film.mp4'))
    return { destination: 'brandFilm', field: 'video.uploadedVideo', recommendation: 'upload' };
  if (source.endsWith('brand-film-poster.webp'))
    return { destination: 'brandFilm', field: 'video.poster', recommendation: 'upload' };
  if (source.includes('/brand/')) {
    const derivative = /-(640|960)w\.webp$/i.test(source);
    return {
      destination: 'page sections / campaign',
      field: 'managedImage',
      recommendation: derivative ? 'skip-derivative' : 'upload',
    };
  }
  return {
    destination: 'page sections / site settings',
    field: 'managedImage',
    recommendation: 'upload',
  };
}

export async function inventoryMedia() {
  const publicDirectory = path.join(repositoryRoot, 'public');
  const files = await walk(publicDirectory);
  const inventory = [];
  for (const filePath of files) {
    const source = relativeToRoot(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const fileStat = await stat(filePath);
    const target = destination(source);
    let metadata = {};
    if (!['.mp4', '.webm', '.mov', '.vtt', '.svg'].includes(extension)) {
      const image = await sharp(filePath).metadata();
      metadata = { width: image.width, height: image.height, format: image.format };
    } else if (extension === '.mp4') {
      metadata = {
        width: null,
        height: null,
        durationSeconds: 60,
        videoCodec: 'H.264',
        audioCodec: 'AAC',
        metadataSource: 'repository release specification; ffprobe unavailable locally',
      };
    }
    inventory.push({
      source,
      type:
        extension === '.mp4'
          ? 'video'
          : extension === '.vtt'
            ? 'captions'
            : extension === '.svg'
              ? 'icon'
              : 'image',
      bytes: fileStat.size,
      sha256: await sha256(filePath),
      ...metadata,
      currentUsage: source.includes('/products/')
        ? 'Product catalog'
        : source.includes('/brand/')
          ? 'Homepage/About editorial'
          : source.includes('/videos/')
            ? 'Homepage brand film'
            : 'Global/editorial',
      intendedSanityDestination: target.destination,
      intendedField: target.field,
      duplicateStatus: 'unique',
      migrationStatus: target.recommendation === 'upload' ? 'planned' : 'intentionally-skipped',
      recommendation: target.recommendation,
    });
  }
  const byHash = new Map();
  for (const item of inventory) {
    const matches = byHash.get(item.sha256) || [];
    matches.push(item);
    byHash.set(item.sha256, matches);
  }
  for (const matches of byHash.values()) {
    if (matches.length > 1)
      for (const item of matches)
        item.duplicateStatus = `duplicate-group-${item.sha256.slice(0, 8)}`;
  }
  return inventory;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const inventory = await inventoryMedia();
  await writeJson(path.join(artifactsDirectory, 'sanity-media-inventory.json'), inventory);
  const rows = inventory.map((item) => {
    const dimensions =
      item.width && item.height
        ? `${item.width}×${item.height}`
        : item.type === 'video'
          ? 'Resolution unavailable locally'
          : 'n/a';
    const duration = item.durationSeconds ? `${item.durationSeconds}s` : '—';
    return `| \`${item.source}\` | ${item.type} | ${item.bytes.toLocaleString()} | ${dimensions} | ${duration} | ${item.currentUsage} | ${item.intendedSanityDestination} | \`${item.intendedField}\` | ${item.duplicateStatus} | ${item.migrationStatus} | ${item.recommendation} |`;
  });
  const uploadable = inventory.filter((item) => item.recommendation === 'upload');
  const document = `# Swim BASI Sanity media inventory

Generated from tracked files under \`public/\`. Build artifacts, dependencies, caches, source maps,
and empty \`.gitkeep\` placeholders are excluded.

## Summary

- Media files: ${inventory.length}
- Product image views: ${inventory.filter((item) => item.source.includes('/products/')).length}
- Brand editorial derivatives: ${inventory.filter((item) => item.source.includes('/brand/')).length}
- Best brand originals selected: ${inventory.filter((item) => /-1400w\.webp$/i.test(item.source)).length}
- Responsive brand derivatives intentionally skipped: ${inventory.filter((item) => item.recommendation === 'skip-derivative').length}
- Images planned for Sanity: ${uploadable.filter((item) => item.type === 'image').length}
- Videos planned for Sanity: ${uploadable.filter((item) => item.type === 'video').length}
- Code-controlled icons retained: ${inventory.filter((item) => item.recommendation === 'keep-code').length}

The current MP4 is ${(inventory.find((item) => item.type === 'video')?.bytes / 1024 / 1024).toFixed(2)} MiB,
60 seconds, H.264/AAC. FFprobe is unavailable in the local environment, so resolution is marked for
verification before apply. Its size is reasonable for a Sanity file asset in this phase; Mux is not
required now. Reassess streaming if future films are materially larger, longer, or require adaptive bitrate.

## Inventory

| Source file path | Type | Bytes | Dimensions / resolution | Duration | Current usage | Sanity destination | Document / field | Duplicate status | Migration status | Keep/remove recommendation |
|---|---:|---:|---|---:|---|---|---|---|---|---|
${rows.join('\n')}

## Retention policy

All local files remain in the repository during the feature-flagged transition. The “skip-derivative”
recommendation means the file is intentionally not uploaded because Sanity’s image CDN can generate
responsive widths from the 1400px source; it does not authorize repository deletion. Product front,
back, left, and right files are distinct views rather than responsive duplicates.
`;
  await writeText(path.join(repositoryRoot, 'docs', 'sanity-media-inventory.md'), document);
  console.log(`Inventoried ${inventory.length} tracked media files.`);
}
