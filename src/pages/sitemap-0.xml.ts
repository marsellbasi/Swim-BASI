import type { APIRoute } from "astro";
import { getSanityCollections, getSanityPage } from "../lib/sanity/content";
import type { SeoValue } from "../lib/sanity/types";

export const prerender = true;

const fallbackRoutes = [
  "/",
  "/about",
  "/shop",
  "/collections",
  "/collections/one-piece",
  "/collections/string-bikinis",
  "/collections/high-waisted-bikinis",
  "/size-guide",
  "/contact",
  "/shipping-returns",
  "/privacy",
  "/terms",
];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const include = (seo?: SeoValue) =>
  seo?.noIndex !== true && seo?.includeInSitemap !== false;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL("https://swimbasi.com");
  const [homepage, about, shop, collectionsPage, sizeGuide, collections] =
    await Promise.all([
      getSanityPage("homepage"),
      getSanityPage("aboutPage"),
      getSanityPage("shopPage"),
      getSanityPage("collectionsPage"),
      getSanityPage("sizeGuide"),
      getSanityCollections(),
    ]);
  const managed = [
    { path: "/", seo: homepage?.seo },
    { path: "/about", seo: about?.seo },
    { path: "/shop", seo: shop?.seo },
    { path: "/collections", seo: collectionsPage?.seo },
    { path: "/size-guide", seo: sizeGuide?.seo },
    ...(collections || []).map((collection) => ({
      path: `/collections/${collection.slug}`,
      seo: collection.seo,
    })),
  ];
  const managedPaths = new Set(managed.map((route) => route.path));
  const routes = [
    ...managed.filter((route) => include(route.seo)),
    ...fallbackRoutes
      .filter((route) => !managedPaths.has(route))
      .map((path) => ({ path, seo: undefined })),
  ];
  const urls = routes
    .map(({ path, seo }) => {
      const loc = escapeXml(new URL(path, origin).toString());
      const priority = seo?.sitemapPriority
        ? `<priority>${seo.sitemapPriority}</priority>`
        : "";
      const changefreq = seo?.sitemapChangeFrequency
        ? `<changefreq>${seo.sitemapChangeFrequency}</changefreq>`
        : "";
      return `<url><loc>${loc}</loc>${changefreq}${priority}</url>`;
    })
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
