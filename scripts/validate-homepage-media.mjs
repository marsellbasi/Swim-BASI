/* global console, fetch, process */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const html = readFileSync(
  join(process.cwd(), "dist", "index.html"),
  "utf8",
).replaceAll("&amp;", "&");
const urls = [
  ...new Set(
    [
      ...html.matchAll(
        /(?:src|poster)="(https:\/\/cdn\.sanity\.io\/(?:images|files)\/[^"]+)/g,
      ),
    ].map((match) => match[1]),
  ),
];

const results = await Promise.all(
  urls.map(async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }),
);
const failed = results.filter((healthy) => !healthy).length;

console.log(
  `Homepage Sanity media validation: ${results.length - failed}/${urls.length} URLs healthy.`,
);
if (urls.length === 0 || failed > 0) process.exitCode = 1;
