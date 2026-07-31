/* global URL, console, process */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import sharp from "sharp";

const root = new URL("../", import.meta.url).pathname.replace(/^\/(\w:)/, "$1");
const dist = join(root, "dist");
const files = readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => join(entry.parentPath, entry.name));
const htmlFiles = files.filter((file) => extname(file) === ".html");
const errors = [];
const productBaseUrl = "https://basiswim.printful.me/product/";
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs.filter(
    (value) => value.startsWith("/") && !value.startsWith("//"),
  )) {
    const clean = href.split(/[?#]/)[0];
    if (!clean || clean === "/") continue;
    const target = clean.endsWith("/")
      ? join(dist, clean, "index.html")
      : join(dist, clean);
    const alternate = join(dist, clean, "index.html");
    if (!existsSync(target) && !existsSync(alternate)) {
      errors.push(`${relative(root, file)} has broken internal link: ${href}`);
    }
  }

  const localMediaPaths = [
    ...html.matchAll(/(?:src|data-hover-src)="(\/[^"?#]+)"/g),
  ].map((match) => match[1]);
  for (const mediaPath of localMediaPaths) {
    const target = join(dist, mediaPath);
    if (!existsSync(target)) {
      errors.push(
        `${relative(root, file)} has broken local media: ${mediaPath}`,
      );
    }
  }

  const srcsetMediaPaths = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap(
    (match) =>
      match[1].split(",").map((candidate) => candidate.trim().split(/\s+/)[0]),
  );
  for (const mediaPath of srcsetMediaPaths.filter((path) =>
    path?.startsWith("/"),
  )) {
    if (!existsSync(join(dist, mediaPath))) {
      errors.push(
        `${relative(root, file)} has broken responsive media: ${mediaPath}`,
      );
    }
  }

  for (const match of html.matchAll(
    /<img\b([^>]*\/images\/products\/[^>]*)>/g,
  )) {
    const attrs = match[1];
    if (!/width="\d+"/.test(attrs) || !/height="\d+"/.test(attrs)) {
      errors.push(
        `${relative(root, file)} has product media without dimensions`,
      );
    }
  }

  for (const match of html.matchAll(
    /<a\b([^>]*href="https:\/\/basiswim\.printful\.me[^"]*"[^>]*)>/g,
  )) {
    const attrs = match[1];
    if (
      !/target="_blank"/.test(attrs) ||
      !/rel="noopener noreferrer"/.test(attrs)
    ) {
      errors.push(`${relative(root, file)} has an unsafe Printful link`);
    }
  }

  for (const match of html.matchAll(
    /<a\b([^>]*href="https:\/\/instagram\.com\/swimbasi[^>]*?)>/g,
  )) {
    const attrs = match[1];
    if (
      !/target="_blank"/.test(attrs) ||
      !/rel="noopener noreferrer"/.test(attrs)
    ) {
      errors.push(`${relative(root, file)} has an unsafe Instagram link`);
    }
  }

  if (/<(?:img|source)\b[^>]*src="https?:\/\//.test(html)) {
    errors.push(`${relative(root, file)} has a remote media dependency`);
  }
}

if (
  !existsSync(join(dist, "robots.txt")) ||
  !existsSync(join(dist, "sitemap-index.xml"))
) {
  errors.push("robots.txt or sitemap-index.xml is missing");
}

const shopHtml = readFileSync(join(dist, "shop", "index.html"), "utf8");
const productSchemas = [];
for (const match of shopHtml.matchAll(
  /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
)) {
  try {
    const schema = JSON.parse(match[1]);
    if (schema["@type"] === "Product") productSchemas.push(schema);
  } catch (error) {
    errors.push(
      `shop/index.html has invalid product structured data: ${error.message}`,
    );
  }
}

const productCards = [
  ...shopHtml.matchAll(/<article\b([^>]*class="product-card"[^>]*)>/g),
].map((match) => ({
  id: match[1].match(/data-product-id="([^"]+)"/)?.[1],
  slug: match[1].match(/data-product-slug="([^"]+)"/)?.[1],
}));
const productIds = productCards.map((card) => card.id).filter(Boolean);
const productSlugs = productCards.map((card) => card.slug).filter(Boolean);
const productUrls = productSchemas.map((schema) => schema.url);

if (productSchemas.length !== 42 || productCards.length !== 42) {
  errors.push(
    `Expected 42 shop products; found ${productSchemas.length} schemas and ${productCards.length} cards`,
  );
}
if (new Set(productIds).size !== 42)
  errors.push("Product IDs are missing or duplicated");
if (new Set(productSlugs).size !== 42)
  errors.push("Product slugs are missing or duplicated");
if (new Set(productUrls).size !== 42)
  errors.push("Printful product URLs are missing or duplicated");

const categoryCounts = {
  "one-piece": 0,
  "string-bikinis": 0,
  "high-waisted-bikinis": 0,
};
for (const schema of productSchemas) {
  const expectedSlug = slugify(schema.name);
  let expectedPrice;
  if (schema.name.endsWith("One-Piece Swimsuit")) {
    categoryCounts["one-piece"] += 1;
    expectedPrice = 32.99;
  } else if (schema.name.endsWith("String Bikini")) {
    categoryCounts["string-bikinis"] += 1;
    expectedPrice = 37.99;
  } else if (schema.name.endsWith("High-Waisted Bikini")) {
    categoryCounts["high-waisted-bikinis"] += 1;
    expectedPrice = 44.99;
  } else {
    errors.push(
      `Unrecognized product category in structured data: ${schema.name}`,
    );
  }

  if (schema.url !== `${productBaseUrl}${expectedSlug}`) {
    errors.push(
      `${schema.name} has a blank, fallback, non-Printful, or slug-conflicting URL`,
    );
  }
  if (schema.offers?.url !== schema.url) {
    errors.push(
      `${schema.name} structured checkout URL does not match its product URL`,
    );
  }
  if (Number(schema.offers?.price) !== expectedPrice) {
    errors.push(`${schema.name} has an unexpected price`);
  }
  if (!productSlugs.includes(expectedSlug)) {
    errors.push(`${schema.name} does not match a rendered product-card slug`);
  }
}

for (const [category, expectedCount] of Object.entries({
  "one-piece": 14,
  "string-bikinis": 14,
  "high-waisted-bikinis": 14,
})) {
  if (categoryCounts[category] !== expectedCount) {
    errors.push(
      `Expected ${expectedCount} ${category} products; found ${categoryCounts[category]}`,
    );
  }
}

const imageManifest = JSON.parse(
  readFileSync(
    join(root, "src", "data", "product-image-manifest.json"),
    "utf8",
  ),
);
const imageEntries = Object.entries(imageManifest.products);
const galleryPaths = imageEntries.flatMap(([, entry]) =>
  entry.gallery.map((asset) => asset.src),
);
if (
  imageEntries.length !== 42 ||
  imageManifest.audit.productMappingCount !== 42
) {
  errors.push(
    "Product image manifest does not contain exactly 42 mapped products",
  );
}
if (imageManifest.audit.unmatchedSourceFolders.length !== 0) {
  errors.push(
    `Unmatched product image sources: ${imageManifest.audit.unmatchedSourceFolders.join(", ")}`,
  );
}
if (new Set(galleryPaths).size !== galleryPaths.length) {
  errors.push(
    "One or more product gallery assets are mapped to multiple products or views",
  );
}
for (const [slug, entry] of imageEntries) {
  if (!productSlugs.includes(slug))
    errors.push(`Image manifest product is absent from shop: ${slug}`);
  if (!entry.primary || (entry.gallery.length > 1 && !entry.hover)) {
    errors.push(`${slug} is missing required primary or hover media`);
  }
  const expectedViews = ["front", "back", "left", "right"].filter((view) =>
    entry.availableViews.includes(view),
  );
  if (
    entry.gallery.map((asset) => asset.view).join(",") !==
    expectedViews.join(",")
  ) {
    errors.push(
      `${slug} gallery views are not in front, back, left, right order`,
    );
  }
  for (const asset of entry.gallery) {
    if (!existsSync(join(dist, asset.src)))
      errors.push(`Missing manifest asset: ${asset.src}`);
    if (asset.width !== 1200 || asset.height !== 1200) {
      errors.push(`Unexpected product image dimensions: ${asset.src}`);
    }
  }
}

const brandManifest = JSON.parse(
  readFileSync(join(root, "src", "data", "brand-image-manifest.json"), "utf8"),
);
const brandEntries = Object.values(brandManifest.images);
const brandVariants = brandEntries.flatMap((entry) => entry.variants);
if (
  brandEntries.length !== 8 ||
  brandVariants.length !== 24 ||
  brandManifest.audit.rawImageCount !== 8 ||
  brandManifest.audit.optimizedOutputCount !== 24
) {
  errors.push(
    "Brand image manifest does not contain eight sources and 24 responsive outputs",
  );
}
if (
  brandManifest.audit.unexpectedSources.length ||
  brandManifest.audit.missingSources.length ||
  new Set(brandVariants.map((variant) => variant.src)).size !==
    brandVariants.length
) {
  errors.push(
    "Brand image manifest has missing, unexpected, or duplicate media",
  );
}
for (const entry of brandEntries) {
  if (
    !entry.alt ||
    !entry.focalPoint?.objectPosition ||
    entry.optimizationStatus !== "optimized"
  ) {
    errors.push(
      `${entry.productionFilename} is missing alt, focal, or optimization metadata`,
    );
  }
  for (const variant of entry.variants) {
    const outputPath = join(dist, variant.src);
    if (!existsSync(outputPath)) {
      errors.push(`Missing brand image output: ${variant.src}`);
      continue;
    }
    const metadata = await sharp(outputPath).metadata();
    if (
      metadata.format !== "webp" ||
      metadata.width !== variant.width ||
      metadata.height !== variant.height
    ) {
      errors.push(`Brand image metadata mismatch: ${variant.src}`);
    }
  }
}

const homepageHtml = readFileSync(join(dist, "index.html"), "utf8");
const aboutHtml = readFileSync(join(dist, "about", "index.html"), "utf8");
if (
  !homepageHtml.includes('data-film-state="video"') ||
  !homepageHtml.includes("data-homepage-film") ||
  !homepageHtml.includes(
    'poster="/videos/campaigns/swim-basi-brand-film-poster.webp"',
  ) ||
  !homepageHtml.includes(
    'src="/videos/campaigns/swim-basi-brand-film.mp4" type="video/mp4"',
  ) ||
  !homepageHtml.includes('controls playsinline preload="metadata"') ||
  !homepageHtml.includes("PRESS PLAY. STEP INTO SWIM BASI.") ||
  homepageHtml.includes("FILM PREMIERE COMING SOON.") ||
  homepageHtml.includes("<track") ||
  homepageHtml.includes('type="video/webm"')
) {
  errors.push("Homepage active portrait-film configuration is invalid");
}
if ((homepageHtml.match(/data-brand-image=/g) ?? []).length !== 5) {
  errors.push(
    "Homepage should render five intentional responsive brand-image placements",
  );
}
if ((aboutHtml.match(/data-brand-image=/g) ?? []).length !== 4) {
  errors.push("About page should render four editorial brand images");
}
if ((homepageHtml.match(/class="instagram-tile"/g) ?? []).length !== 4) {
  errors.push("Homepage should render four photographic color-story tiles");
}
for (const html of [homepageHtml, aboutHtml]) {
  for (const match of html.matchAll(/<img\b([^>]*\/images\/brand\/[^>]*)>/g)) {
    const attrs = match[1];
    if (
      !/width="\d+"/.test(attrs) ||
      !/height="\d+"/.test(attrs) ||
      !/srcset=/.test(attrs)
    ) {
      errors.push(
        "Brand photography is missing dimensions or responsive sources",
      );
    }
  }
}
if ((homepageHtml.match(/\/images\/brand\//g) ?? []).length === 0) {
  errors.push("Homepage does not reference optimized brand photography");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Verified ${htmlFiles.length} pages, 42 products, and 24 responsive brand images: catalog identity, direct links, media mappings, homepage/About placements, link safety, robots, and sitemap.`,
);
