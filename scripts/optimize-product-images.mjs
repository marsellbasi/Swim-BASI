/* global Buffer, console, process */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { productImageMappings, sourceViewAliases } from './product-image-mapping.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceRoot = path.join(projectRoot, 'Swim Mockups');
const publicRoot = path.join(projectRoot, 'public');
const outputRoot = path.join(publicRoot, 'images', 'products');
const manifestPath = path.join(projectRoot, 'src', 'data', 'product-image-manifest.json');
const outputSize = 1200;
const supportedViews = ['front', 'back', 'left', 'right'];

const toPosixPath = (value) => value.split(path.sep).join('/');
const viewLabel = (view) => {
  if (view === 'left') return 'Left-side';
  if (view === 'right') return 'Right-side';
  return view[0].toUpperCase() + view.slice(1);
};
const assetAlt = (productName, view) => `${viewLabel(view)} view of the ${productName}`;

const writeIfChanged = async (filePath, contents) => {
  try {
    const current = await fs.readFile(filePath);
    if (current.equals(contents)) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
  return true;
};

const directoryNames = async (directory) =>
  (await fs.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const validateMappings = (sourceFolders) => {
  const productSlugs = new Set();
  const mappedFolders = new Set();
  for (const mapping of productImageMappings) {
    if (productSlugs.has(mapping.productSlug)) {
      throw new Error(`Duplicate product mapping: ${mapping.productSlug}`);
    }
    if (mappedFolders.has(mapping.sourceFolder)) {
      throw new Error(`Source folder mapped more than once: ${mapping.sourceFolder}`);
    }
    if (!sourceFolders.includes(mapping.sourceFolder)) {
      throw new Error(`Mapped source folder does not exist: ${mapping.sourceFolder}`);
    }
    productSlugs.add(mapping.productSlug);
    mappedFolders.add(mapping.sourceFolder);
  }
  return {
    unmatchedSourceFolders: sourceFolders.filter((folder) => !mappedFolders.has(folder)),
  };
};

const inspectSourceFolder = async (folderName) => {
  const folderPath = path.join(sourceRoot, folderName);
  const entries = (await fs.readdir(folderPath, { withFileTypes: true })).filter((entry) =>
    entry.isFile(),
  );
  const views = new Map();
  const unexpectedFiles = [];
  for (const entry of entries) {
    const relativeSource = `${folderName}/${entry.name}`;
    const alias = sourceViewAliases.get(relativeSource);
    const extension = path.extname(entry.name).toLowerCase();
    const baseName = path.basename(entry.name, extension).toLowerCase();
    const view = alias ?? baseName;
    if (extension !== '.png' || !supportedViews.includes(view)) {
      unexpectedFiles.push(relativeSource);
      continue;
    }
    if (views.has(view)) throw new Error(`Duplicate ${view} view in ${folderName}`);
    const sourcePath = path.join(folderPath, entry.name);
    const sourceStat = await fs.stat(sourcePath);
    const metadata = await sharp(sourcePath, { failOn: 'error' }).metadata();
    const stats = await sharp(sourcePath, { failOn: 'error' }).stats();
    const alpha = metadata.hasAlpha ? stats.channels.at(-1) : null;
    if (metadata.format !== 'png' || !metadata.width || !metadata.height) {
      throw new Error(`Unreadable or unsupported source image: ${relativeSource}`);
    }
    if (!metadata.hasAlpha || alpha?.min === 255) {
      throw new Error(`Source image does not contain transparency: ${relativeSource}`);
    }
    views.set(view, {
      sourcePath,
      sourceBytes: sourceStat.size,
      normalizedFilename: Boolean(alias),
    });
  }
  return { views, unexpectedFiles };
};

const optimizeView = async (mapping, view, source) => {
  const outputDirectory = path.join(outputRoot, mapping.category, mapping.productSlug);
  const outputPath = path.join(outputDirectory, `${view}.webp`);
  const buffer = await sharp(source.sourcePath, { failOn: 'error' })
    .resize({
      width: outputSize,
      height: outputSize,
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .webp({ quality: 94, alphaQuality: 100, smartSubsample: true, effort: 6 })
    .toBuffer();
  const changed = await writeIfChanged(outputPath, buffer);
  const metadata = await sharp(buffer).metadata();
  const stats = await sharp(buffer).stats();
  const alpha = metadata.hasAlpha ? stats.channels.at(-1) : null;
  if (!metadata.hasAlpha || alpha?.min === 255) {
    throw new Error(`Optimized image lost transparency: ${outputPath}`);
  }
  return {
    asset: {
      src: `/${toPosixPath(path.relative(publicRoot, outputPath))}`,
      width: metadata.width,
      height: metadata.height,
      bytes: buffer.length,
      view,
      alt: assetAlt(mapping.productName, view),
    },
    changed,
  };
};

const main = async () => {
  try {
    await fs.access(sourceRoot);
  } catch {
    throw new Error(`Raw source directory is missing: ${sourceRoot}`);
  }
  const sourceFolders = await directoryNames(sourceRoot);
  const { unmatchedSourceFolders } = validateMappings(sourceFolders);
  const inspections = new Map();
  const unexpectedFiles = [];
  let rawImageCount = 0;
  let rawTotalBytes = 0;
  for (const folder of sourceFolders) {
    const inspection = await inspectSourceFolder(folder);
    inspections.set(folder, inspection);
    unexpectedFiles.push(...inspection.unexpectedFiles);
    rawImageCount += inspection.views.size;
    rawTotalBytes += [...inspection.views.values()].reduce(
      (total, source) => total + source.sourceBytes,
      0,
    );
  }
  if (unexpectedFiles.length > 0) {
    throw new Error(`Unexpected source files:\n${unexpectedFiles.join('\n')}`);
  }

  const products = {};
  let optimizedImageCount = 0;
  let optimizedTotalBytes = 0;
  let rewrittenImageCount = 0;
  const normalizedSourceFiles = [];
  for (const mapping of productImageMappings) {
    const inspection = inspections.get(mapping.sourceFolder);
    const availableViews = supportedViews.filter((view) => inspection.views.has(view));
    if (!availableViews.includes('front')) {
      throw new Error(`Front view is required for ${mapping.sourceFolder}`);
    }
    const assets = {};
    for (const view of availableViews) {
      const source = inspection.views.get(view);
      const result = await optimizeView(mapping, view, source);
      assets[view] = result.asset;
      optimizedImageCount += 1;
      optimizedTotalBytes += result.asset.bytes;
      if (result.changed) rewrittenImageCount += 1;
      if (source.normalizedFilename)
        normalizedSourceFiles.push(`${mapping.sourceFolder}/leeft.png`);
    }
    const hoverView =
      mapping.category === 'one-piece'
        ? ['left', 'right', 'back'].find((view) => availableViews.includes(view))
        : availableViews.find((view) => view === 'back');
    products[mapping.productSlug] = {
      productSlug: mapping.productSlug,
      sourceFolder: mapping.sourceFolder,
      mappingStatus: 'exact',
      primary: assets.front,
      hover: hoverView ? assets[hoverView] : null,
      gallery: availableViews.map((view) => assets[view]),
      availableViews,
    };
  }

  const optimizedSizes = Object.values(products).flatMap((entry) =>
    entry.gallery.map((asset) => asset.bytes),
  );
  const manifest = {
    version: 1,
    sourceDirectory: 'Swim Mockups',
    outputDirectory: 'public/images/products',
    optimization: {
      format: 'webp',
      width: outputSize,
      height: outputSize,
      fit: 'inside',
      quality: 94,
      alphaQuality: 100,
    },
    audit: {
      rawFolderCount: sourceFolders.length,
      rawImageCount,
      rawTotalBytes,
      productMappingCount: productImageMappings.length,
      optimizedImageCount,
      optimizedTotalBytes,
      reductionPercent: Number((100 - (optimizedTotalBytes / rawTotalBytes) * 100).toFixed(2)),
      largestOptimizedBytes: Math.max(...optimizedSizes),
      averageOptimizedBytes: Math.round(optimizedTotalBytes / optimizedImageCount),
      unmatchedSourceFolders,
      unmatchedProductSlugs: [],
      normalizedSourceFiles,
      duplicateMappings: [],
      unexpectedFiles: [],
      corruptFiles: [],
      sourcesWithoutTransparency: [],
    },
    products,
  };
  const manifestContents = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  const manifestChanged = await writeIfChanged(manifestPath, manifestContents);
  console.log(
    `Mapped ${productImageMappings.length} products from ${sourceFolders.length} folders.`,
  );
  console.log(
    `Optimized ${optimizedImageCount} of ${rawImageCount} source images (${manifest.audit.reductionPercent}% smaller).`,
  );
  console.log(
    `${rewrittenImageCount} image files and ${manifestChanged ? 'the' : 'no'} manifest changed.`,
  );
  if (unmatchedSourceFolders.length > 0) {
    console.log(`Unmatched source folders: ${unmatchedSourceFolders.join(', ')}`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
