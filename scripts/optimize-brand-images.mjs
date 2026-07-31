/* global Buffer, console, URL */
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";
import sharp from "sharp";

const root = new URL("../", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const sourceDirectory = join(root, "brand-images");
const outputDirectory = join(root, "public", "images", "brand");
const manifestPath = join(root, "src", "data", "brand-image-manifest.json");
const widths = [640, 960, 1400];

const imageDefinitions = [
  {
    source: "591A0504.JPG",
    name: "cotton-candy-high-waisted-studio-detail",
    alt: "Model wearing a cotton-candy high-waisted Swim BASI bikini in a studio",
    placements: ["About editorial detail"],
    focalPoint: { x: 50, y: 48, objectPosition: "50% 48%" },
    loadingPriority: "lazy",
  },
  {
    source: "591A1236.JPG",
    name: "red-string-bikini-studio-detail",
    alt: "Model wearing a red Swim BASI string bikini in a studio",
    placements: ["Homepage color story"],
    focalPoint: { x: 50, y: 50, objectPosition: "50% 50%" },
    loadingPriority: "lazy",
  },
  {
    source: "591A1606.JPG",
    name: "orange-high-waisted-poolside-full-length",
    alt: "Model wearing an orange high-waisted Swim BASI bikini poolside",
    placements: ["About lead image"],
    focalPoint: { x: 48, y: 60, objectPosition: "48% 60%" },
    loadingPriority: "lazy",
  },
  {
    source: "591A1943.JPG",
    name: "forest-green-string-bikini-studio-portrait",
    alt: "Model wearing a green Swim BASI string bikini in a studio",
    placements: ["Homepage color story"],
    focalPoint: { x: 52, y: 64, objectPosition: "52% 64%" },
    loadingPriority: "lazy",
  },
  {
    source: "591A6906.JPG",
    name: "eastern-blue-string-bikini-poolside-back",
    alt: "Rear view of a model wearing a blue Swim BASI string bikini poolside",
    placements: ["Homepage color story"],
    focalPoint: { x: 53, y: 66, objectPosition: "53% 66%" },
    loadingPriority: "lazy",
  },
  {
    source: "591A7123.JPG",
    name: "yellow-and-black-string-bikinis-night-walk",
    alt: "Two models wearing yellow and black Swim BASI string bikinis at night",
    placements: ["Homepage campaign", "About closing image"],
    focalPoint: { x: 70, y: 64, objectPosition: "70% 64%" },
    loadingPriority: "lazy",
  },
  {
    source: "591A7198.JPG",
    name: "black-string-bikini-night-portrait",
    alt: "Model wearing a black Swim BASI string bikini at night",
    placements: ["Homepage portrait-film poster"],
    focalPoint: { x: 55, y: 60, objectPosition: "55% 60%" },
    loadingPriority: "high",
  },
  {
    source: "591A7944.JPG",
    name: "lavender-string-bikini-poolside-back",
    alt: "Model wearing a lavender Swim BASI string bikini beside a pool",
    placements: ["Homepage color story", "About editorial image"],
    focalPoint: { x: 55, y: 55, objectPosition: "55% 55%" },
    loadingPriority: "lazy",
  },
];

const writeIfChanged = async (path, contents) => {
  try {
    const current = await readFile(path);
    if (Buffer.compare(current, contents) === 0) return false;
  } catch {
    // A missing output is expected on the first import.
  }
  await writeFile(path, contents);
  return true;
};

const expectedSources = new Set(imageDefinitions.map((image) => image.source));
const sourceFiles = (await readdir(sourceDirectory)).filter((file) =>
  /\.jpe?g$/i.test(file),
);
const unexpectedSources = sourceFiles.filter(
  (file) => !expectedSources.has(file),
);
const missingSources = imageDefinitions
  .map((image) => image.source)
  .filter((file) => !sourceFiles.includes(file));

if (unexpectedSources.length || missingSources.length) {
  const problems = [
    unexpectedSources.length
      ? `Unexpected sources: ${unexpectedSources.join(", ")}`
      : "",
    missingSources.length
      ? `Missing sources: ${missingSources.join(", ")}`
      : "",
  ].filter(Boolean);
  throw new Error(problems.join("\n"));
}

await mkdir(outputDirectory, { recursive: true });

let rawTotalBytes = 0;
let optimizedTotalBytes = 0;
let changedOutputs = 0;
const optimizedSizes = [];
const images = {};

for (const definition of imageDefinitions) {
  const sourcePath = join(sourceDirectory, definition.source);
  const sourceStats = await stat(sourcePath);
  const sourceMetadata = await sharp(sourcePath).metadata();
  if (
    sourceMetadata.format !== "jpeg" ||
    !sourceMetadata.width ||
    !sourceMetadata.height
  ) {
    throw new Error(`${definition.source} is not a readable JPEG image`);
  }

  rawTotalBytes += sourceStats.size;
  const variants = [];
  for (const width of widths) {
    const filename = `${definition.name}-${width}w.webp`;
    const outputPath = join(outputDirectory, filename);
    const buffer = await sharp(sourcePath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6, smartSubsample: true })
      .toBuffer();
    const outputMetadata = await sharp(buffer).metadata();
    if (
      !outputMetadata.width ||
      !outputMetadata.height ||
      outputMetadata.format !== "webp"
    ) {
      throw new Error(`Generated output is invalid: ${filename}`);
    }
    if (await writeIfChanged(outputPath, buffer)) changedOutputs += 1;
    optimizedTotalBytes += buffer.length;
    optimizedSizes.push(buffer.length);
    variants.push({
      src: `/images/brand/${filename}`,
      width: outputMetadata.width,
      height: outputMetadata.height,
      bytes: buffer.length,
      aspectRatio: Number(
        (outputMetadata.width / outputMetadata.height).toFixed(4),
      ),
    });
  }

  images[definition.name] = {
    sourceFilename: definition.source,
    productionFilename: definition.name,
    sourceBytes: sourceStats.size,
    sourceDimensions: {
      width:
        sourceMetadata.orientation && sourceMetadata.orientation >= 5
          ? sourceMetadata.height
          : sourceMetadata.width,
      height:
        sourceMetadata.orientation && sourceMetadata.orientation >= 5
          ? sourceMetadata.width
          : sourceMetadata.height,
    },
    sourceExifOrientation: sourceMetadata.orientation ?? 1,
    variants,
    intendedPlacements: definition.placements,
    alt: definition.alt,
    focalPoint: definition.focalPoint,
    loadingPriority: definition.loadingPriority,
    optimizationStatus: "optimized",
  };
}

const optimizedOutputCount = optimizedSizes.length;
const manifest = {
  generatedBy: "scripts/optimize-brand-images.mjs",
  sourceDirectory: "brand-images",
  outputDirectory: "public/images/brand",
  format: "webp",
  quality: 80,
  audit: {
    rawImageCount: imageDefinitions.length,
    rawTotalBytes,
    optimizedOutputCount,
    optimizedTotalBytes,
    reductionPercent: Number(
      (100 - (optimizedTotalBytes / rawTotalBytes) * 100).toFixed(2),
    ),
    largestOptimizedBytes: Math.max(...optimizedSizes),
    averageOptimizedBytes: Math.round(
      optimizedTotalBytes / optimizedOutputCount,
    ),
    unexpectedSources,
    missingSources,
  },
  images,
};

const manifestBuffer = Buffer.from(
  await format(JSON.stringify(manifest), { parser: "json" }),
);
const manifestChanged = await writeIfChanged(manifestPath, manifestBuffer);

console.log(
  `Optimized ${imageDefinitions.length} brand photographs into ${optimizedOutputCount} WebP variants.`,
);
console.log(
  `${(rawTotalBytes / 1024 / 1024).toFixed(2)} MB raw -> ${(optimizedTotalBytes / 1024 / 1024).toFixed(2)} MB optimized (${manifest.audit.reductionPercent}% smaller).`,
);
console.log(
  `${changedOutputs} image outputs changed; manifest ${manifestChanged ? "updated" : "unchanged"}.`,
);
