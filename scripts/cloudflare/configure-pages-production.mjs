/* global process, fetch, Buffer, console */
import { installSafeProcessErrorHandlers } from "../sanity/lib/safe-errors.mjs";

installSafeProcessErrorHandlers();

const tokenChunks = [];
for await (const chunk of process.stdin) tokenChunks.push(chunk);
const tokenInput = Buffer.concat(tokenChunks).toString("utf8").trim();
let apiToken = tokenInput;
if (tokenInput.startsWith("{")) {
  const parsed = JSON.parse(tokenInput);
  apiToken = parsed.token ?? parsed.accessToken ?? parsed.access_token ?? "";
}

if (!apiToken) {
  throw new Error("Cloudflare authentication was not supplied.");
}

const apiBase = "https://api.cloudflare.com/client/v4";
const projectName = "swim-basi";
const desiredEnv = {
  NODE_VERSION: { type: "plain_text", value: "22.23.1" },
  PUBLIC_SANITY_PROJECT_ID: { type: "plain_text", value: "xcfqfknc" },
  PUBLIC_SANITY_DATASET: { type: "plain_text", value: "production" },
  PUBLIC_SANITY_CONTENT_ENABLED: { type: "plain_text", value: "true" },
};

async function cloudflare(path, options = {}) {
  let response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "cause" in error
        ? error.cause?.code
        : undefined;
    throw new Error(
      `Cloudflare API request failed; details were redacted${code ? ` (${code})` : ""}.`,
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const codes = Array.isArray(payload.errors)
      ? payload.errors.map((item) => item.code).filter(Boolean)
      : [];
    throw new Error(
      `Cloudflare API request failed with HTTP ${response.status}${codes.length ? ` (codes: ${codes.join(", ")})` : ""}.`,
    );
  }
  return payload.result;
}

const accounts = await cloudflare("/accounts?per_page=50");
const matches = [];

for (const account of accounts) {
  try {
    const project = await cloudflare(
      `/accounts/${account.id}/pages/projects/${projectName}`,
    );
    matches.push({ accountId: account.id, project });
  } catch (error) {
    if (!String(error.message).includes("HTTP 404")) throw error;
  }
}

if (matches.length !== 1) {
  throw new Error(
    `Expected exactly one accessible ${projectName} Pages project; found ${matches.length}.`,
  );
}

const [{ accountId, project }] = matches;
const domains = project.domains ?? [];
if (
  project.name !== projectName ||
  project.name === "swim-basi-studio" ||
  project.production_branch !== "main" ||
  !domains.includes("swimbasi.com")
) {
  throw new Error("The discovered Pages project failed storefront safeguards.");
}

const beforeNames = Object.keys(
  project.deployment_configs?.production?.env_vars ?? {},
).sort();

await cloudflare(`/accounts/${accountId}/pages/projects/${projectName}`, {
  method: "PATCH",
  body: JSON.stringify({
    deployment_configs: {
      production: {
        env_vars: desiredEnv,
      },
    },
  }),
});

const verified = await cloudflare(
  `/accounts/${accountId}/pages/projects/${projectName}`,
);
const actualEnv = verified.deployment_configs?.production?.env_vars ?? {};

for (const [name, expected] of Object.entries(desiredEnv)) {
  if (
    actualEnv[name]?.type !== expected.type ||
    actualEnv[name]?.value !== expected.value
  ) {
    throw new Error(`Production variable ${name} failed verification.`);
  }
}

const afterNames = Object.keys(actualEnv).sort();
const removedNames = beforeNames.filter((name) => !afterNames.includes(name));
if (removedNames.length) {
  throw new Error(
    `Cloudflare variable preservation failed for ${removedNames.length} variable(s).`,
  );
}

console.log(
  JSON.stringify({
    project: verified.name,
    productionBranch: verified.production_branch,
    customDomainVerified: domains.includes("swimbasi.com"),
    preservedVariableCount: beforeNames.length,
    productionVariableNames: afterNames,
    sanityContentEnabled: actualEnv.PUBLIC_SANITY_CONTENT_ENABLED.value,
  }),
);
