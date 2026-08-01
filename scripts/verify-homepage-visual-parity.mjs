/* global console, process */
import fs from "node:fs";
import path from "node:path";

if (process.env.PUBLIC_SANITY_CONTENT_ENABLED !== "true") {
  console.log(
    "Homepage visual-parity gate skipped because Sanity content is disabled.",
  );
  process.exit(0);
}

const root = path.resolve(import.meta.dirname, "..");
const htmlPath = path.join(root, "dist", "index.html");
const cssPath = path.join(root, "src", "styles", "global.css");

if (!fs.existsSync(htmlPath)) {
  throw new Error(
    "Build output is missing. Run the Sanity-enabled production build first.",
  );
}

const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const expectedOrder = [
  "brandfilm",
  "mainhero",
  "silhouettes",
  "colorfocus",
  "statement",
  "campaign",
  "instagram",
  "newsletter",
];
const actualOrder = [...html.matchAll(/data-homepage-section="([^"]+)"/g)].map(
  (match) => match[1],
);
const section = (key) => {
  const start = html.indexOf(`data-homepage-section="${key}"`);
  if (start < 0) return "";
  const next = html.indexOf('data-homepage-section="', start + 1);
  return html.slice(start, next < 0 ? html.indexOf("</main>", start) : next);
};
const count = (value, pattern) => (value.match(pattern) || []).length;
const sanityImageHost = "cdn.sanity.io/images/xcfqfknc/production/";
const sanityFileHost = "cdn.sanity.io/files/xcfqfknc/production/";

const brandFilm = section("brandfilm");
const silhouettes = section("silhouettes");
const colorFocus = section("colorfocus");
const campaign = section("campaign");
const gallery = section("instagram");
const homepageBody = html.slice(html.indexOf("<main"), html.indexOf("</main>"));

const checks = {
  orderedSections:
    JSON.stringify(actualOrder) === JSON.stringify(expectedOrder),
  originalHomepageRenderer: !homepageBody.includes("cms-section--"),
  silhouetteCards: count(silhouettes, /class="collection-card"/g) === 3,
  silhouetteImages:
    count(silhouettes, /class="collection-picture"/g) === 3 &&
    count(silhouettes, new RegExp(sanityImageHost, "g")) >= 3,
  silhouetteRoutes: [
    "/collections/one-piece",
    "/collections/string-bikinis",
    "/collections/high-waisted-bikinis",
  ].every((route) => silhouettes.includes(`href="${route}"`)),
  oneBrandFilm: count(brandFilm, /<video/g) === 1,
  brandFilmSource: brandFilm.includes(sanityFileHost),
  brandFilmPoster: brandFilm.includes(`poster="https://${sanityImageHost}`),
  brandFilmPlayback:
    /<video[^>]*controls[^>]*playsinline[^>]*preload="metadata"/.test(
      brandFilm,
    ) && !/<video[^>]*(autoplay|loop|muted)/.test(brandFilm),
  productGrid:
    count(colorFocus, /class="product-card"/g) === 6 &&
    count(colorFocus, /product-image--primary/g) === 6,
  campaignCrop:
    count(campaign, /class="media-frame-picture"/g) === 1 &&
    campaign.includes("h=1500") &&
    campaign.includes("fit=crop"),
  galleryCrop:
    count(gallery, /class="instagram-tile"/g) === 4 &&
    count(gallery, /class="instagram-picture"/g) === 4 &&
    count(gallery, /h=1200/g) >= 4 &&
    count(gallery, /fit=crop/g) >= 4,
  noLocalHomepageMedia: !homepageBody.includes('src="/images/'),
  noDraftExposure:
    !homepageBody.includes("drafts.") && !homepageBody.includes("versions."),
  spacingTokens:
    ["none", "compact", "standard", "spacious", "editorial"].every((token) =>
      css.includes(`.homepage-spacing--${token}`),
    ) && css.includes("--homepage-section-space"),
};

const failed = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

console.log(
  `Homepage visual-parity gate: ${failed.length ? "FAIL" : "PASS"} (${Object.keys(checks).length - failed.length}/${Object.keys(checks).length} checks).`,
);
if (failed.length) {
  console.error(`Failed checks: ${failed.join(", ")}`);
  process.exitCode = 1;
}
