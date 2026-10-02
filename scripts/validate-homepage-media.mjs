/* global AbortSignal, console, fetch, process */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const page = process.argv[2] || "";
if (!/^[a-z0-9/-]*$/.test(page)) throw new Error("Invalid route path");
const includeHover = process.argv.includes("--include-hover");
const html = readFileSync(
  join(process.cwd(), "dist", page, "index.html"),
  "utf8",
).replaceAll("&amp;", "&");
const urls = [
  ...new Set(
    [
      ...html.matchAll(
        includeHover
          ? /(?:src|poster|data-hover-src)="(https:\/\/cdn\.sanity\.io\/(?:images|files)\/[^"]+)/g
          : /(?:src|poster)="(https:\/\/cdn\.sanity\.io\/(?:images|files)\/[^"]+)/g,
      ),
    ].map((match) => match[1]),
  ),
];

const results = await Promise.all(
  urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(20000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }),
);
const failed = results.filter((healthy) => !healthy).length;

console.log(
  `${page || "Homepage"} Sanity media validation: ${results.length - failed}/${urls.length} URLs healthy.`,
);
if (urls.length === 0 || failed > 0) process.exitCode = 1;
