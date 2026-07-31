/* global process, console, Buffer */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const files = execFileSync(
  "git",
  ["ls-files", "-co", "--exclude-standard", "-z"],
  {
    cwd: repositoryRoot,
    encoding: "buffer",
  },
)
  .toString("utf8")
  .split("\0")
  .filter(Boolean);
const allowedEnvironmentFiles = new Set([
  ".env.example",
  "studio/.env.example",
]);
const blockedExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".mp4",
  ".png",
  ".webp",
  ".woff",
  ".woff2",
]);
const exactSecrets = [
  process.env.SANITY_API_WRITE_TOKEN,
  process.env.CLOUDFLARE_API_TOKEN,
].filter(Boolean);
const findings = [];

for (const relativePath of files) {
  const normalized = relativePath.replaceAll("\\", "/");
  const basename = path.posix.basename(normalized);
  if (
    (basename === ".env" || basename.startsWith(".env.")) &&
    !allowedEnvironmentFiles.has(normalized)
  ) {
    findings.push({ file: normalized, reason: "real environment file" });
    continue;
  }
  if (blockedExtensions.has(path.extname(normalized).toLowerCase())) continue;

  const absolutePath = path.join(repositoryRoot, relativePath);
  const buffer = fs.readFileSync(absolutePath);
  if (buffer.includes(Buffer.from([0]))) continue;
  const content = buffer.toString("utf8");

  if (exactSecrets.some((secret) => content.includes(secret))) {
    findings.push({ file: normalized, reason: "current credential value" });
  }
  if (
    /authorization\s*[:=]\s*["']?Bearer\s+[A-Za-z0-9._~-]{20,}/i.test(content)
  ) {
    findings.push({ file: normalized, reason: "authorization header value" });
  }
  if (
    /https:\/\/api\.cloudflare\.com\/client\/v4\/pages\/webhooks\/deploy_hooks\/[A-Za-z0-9_-]+/.test(
      content,
    )
  ) {
    findings.push({ file: normalized, reason: "Cloudflare Deploy Hook URL" });
  }
  if (
    /(?:SANITY_API_WRITE_TOKEN|CLOUDFLARE_API_TOKEN)\s*=\s*(?!$|example|placeholder|replace-me)[^\s#]+/im.test(
      content,
    )
  ) {
    findings.push({ file: normalized, reason: "credential assignment" });
  }
}

const uniqueFindings = [
  ...new Map(
    findings.map((finding) => [`${finding.file}:${finding.reason}`, finding]),
  ).values(),
];

console.log(
  JSON.stringify({
    scannedFiles: files.length,
    findingCount: uniqueFindings.length,
    findings: uniqueFindings,
  }),
);
if (uniqueFindings.length) process.exitCode = 1;
