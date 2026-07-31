/* global console, fetch, process */
import { createClient } from "@sanity/client";
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";

installSafeProcessErrorHandlers();

const baseUrl = "https://swimbasi.com";
const routes = [
  "/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/shipping-returns/",
  "/shop/",
  "/size-guide/",
  "/terms/",
  "/collections/",
  "/collections/high-waisted-bikinis/",
  "/collections/one-piece/",
  "/collections/string-bikinis/",
];
const commerceRoutes = routes.filter(
  (route) => route === "/shop/" || route.startsWith("/collections/"),
);
const expectedTypes = [
  "siteSettings",
  "announcementBar",
  "homepage",
  "aboutPage",
  "shopPage",
  "collectionsPage",
  "sizeGuide",
  "headerNavigation",
  "footerNavigation",
  "product",
  "productCategory",
  "productCollection",
  "brandFilm",
];

const client = createClient({
  projectId: "xcfqfknc",
  dataset: "production",
  apiVersion: "2026-07-31",
  perspective: "published",
  useCdn: false,
});

const [documents, assets, routeResults, sitemap, robots] = await Promise.all([
  client.fetch(
    `*[_type in $types]{
      _id,
      _type,
      "slug": slug.current,
      printfulUrl,
      "collectionProductCount": count(products)
    }`,
    { types: expectedTypes },
  ),
  client.fetch(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{_id,_type}`,
  ),
  Promise.all(
    routes.map(async (route) => {
      const response = await fetch(`${baseUrl}${route}`);
      return { route, status: response.status, html: await response.text() };
    }),
  ),
  fetch(`${baseUrl}/sitemap-0.xml`).then((response) => response.text()),
  fetch(`${baseUrl}/robots.txt`).then((response) => response.text()),
]);

const products = documents.filter(({ _type }) => _type === "product");
const categories = documents.filter(({ _type }) => _type === "productCategory");
const collections = documents.filter(
  ({ _type }) => _type === "productCollection",
);
const imageAssets = assets.filter(({ _type }) => _type === "sanity.imageAsset");
const fileAssets = assets.filter(({ _type }) => _type === "sanity.fileAsset");
const shopHtml =
  routeResults.find(({ route }) => route === "/shop/")?.html ?? "";
const allHtml = routeResults.map(({ html }) => html).join("\n");
const uniquePrintfulUrls = new Set(
  products.map(({ printfulUrl }) => printfulUrl).filter(Boolean),
);

const routeChecks = routeResults.map(({ route, status, html }) => ({
  route,
  status,
  sanityImageCount: (
    html.match(/cdn\.sanity\.io\/images\/xcfqfknc\/production\//g) ?? []
  ).length,
  sanityFileCount: (
    html.match(/cdn\.sanity\.io\/files\/xcfqfknc\/production\//g) ?? []
  ).length,
  localProductImageCount: (html.match(/\/images\/products\//g) ?? []).length,
  hasDescription: /<meta name="description" content="[^"]+"/.test(html),
  hasCanonical:
    /<link rel="canonical" href="https:\/\/swimbasi\.com[^"]*"/.test(html),
  hasOpenGraph: /<meta property="og:title" content="[^"]+"/.test(html),
  hasAbsoluteOpenGraphImage:
    /<meta property="og:image" content="https:\/\/[^"]+"/.test(html),
  hasTwitterCard: /<meta name="twitter:card" content="[^"]+"/.test(html),
  hasStructuredData: html.includes('type="application/ld+json"'),
}));

const checks = {
  routesHealthy:
    routeChecks.length === 12 &&
    routeChecks.every(({ status }) => status === 200),
  documentsComplete: documents.length === 58,
  productsComplete: products.length === 42,
  categoriesComplete: categories.length === 3,
  collectionsComplete:
    collections.length === 3 &&
    collections.every(
      ({ collectionProductCount }) => collectionProductCount === 14,
    ),
  assetsComplete:
    assets.length === 123 &&
    imageAssets.length === 122 &&
    fileAssets.length === 1,
  printfulLinksComplete:
    uniquePrintfulUrls.size === 42 &&
    [...uniquePrintfulUrls].every((url) => shopHtml.includes(url)),
  sanityMediaLive:
    routeChecks.every(({ sanityImageCount }) => sanityImageCount > 0) &&
    routeChecks.find(({ route }) => route === "/")?.sanityFileCount === 1,
  zeroUnexpectedProductFallback: routeChecks
    .filter(({ route }) => commerceRoutes.includes(route))
    .every(({ localProductImageCount }) => localProductImageCount === 0),
  seoComplete: routeChecks.every(
    ({
      hasDescription,
      hasCanonical,
      hasOpenGraph,
      hasAbsoluteOpenGraphImage,
      hasTwitterCard,
      hasStructuredData,
    }) =>
      hasDescription &&
      hasCanonical &&
      hasOpenGraph &&
      hasAbsoluteOpenGraphImage &&
      hasTwitterCard &&
      hasStructuredData,
  ),
  sitemapComplete: routes.every((route) =>
    sitemap.includes(
      `<loc>${baseUrl}${route === "/" ? "/" : route.replace(/\/$/, "")}</loc>`,
    ),
  ),
  robotsValid:
    robots.includes("Sitemap: https://swimbasi.com/sitemap-index.xml") &&
    /User-agent: \*\r?\n(?:Content-Signal:[^\r\n]+\r?\n)?Allow: \//.test(
      robots,
    ),
  noDraftExposure:
    !allHtml.includes("drafts.") && !allHtml.includes("versions."),
};

const report = {
  verified: Object.values(checks).every(Boolean),
  checkedAt: new Date().toISOString(),
  counts: {
    routes: routeChecks.length,
    documents: documents.length,
    products: products.length,
    categories: categories.length,
    collections: collections.length,
    images: imageAssets.length,
    videos: fileAssets.length,
    uniquePrintfulUrls: uniquePrintfulUrls.size,
    unexpectedFallbacks: routeChecks
      .filter(({ route }) => commerceRoutes.includes(route))
      .reduce((sum, route) => sum + route.localProductImageCount, 0),
  },
  checks,
  routes: routeChecks,
};

console.log(JSON.stringify(report));
if (!report.verified) process.exitCode = 1;
