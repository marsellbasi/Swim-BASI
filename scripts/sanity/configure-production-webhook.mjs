/* global process, fetch, Buffer, console */
import { createHash } from "node:crypto";
import { migrationClient } from "./lib/config.mjs";
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";

installSafeProcessErrorHandlers();

const projectId = "xcfqfknc";
const dataset = "production";
const webhookName = "Swim BASI Storefront Rebuild";
const apiVersion = "v2025-02-19";
const endpoint = `https://${projectId}.api.sanity.io/${apiVersion}/hooks/projects/${projectId}`;
const storefrontTypes = [
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
  "campaign",
  "brandFilm",
  "lookbookEntry",
];
const filter = `coalesce(after()._type, before()._type) in ${JSON.stringify(storefrontTypes)} && sanity::projectId() == "${projectId}" && sanity::dataset() == "${dataset}"`;
const projection =
  '{ "operation": delta::operation(), "documentId": coalesce(after()._id, before()._id), "documentType": coalesce(after()._type, before()._type) }';

async function readSecretFromStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

function assertDeployHookUrl(value) {
  if (
    !/^https:\/\/api\.cloudflare\.com\/client\/v4\/pages\/webhooks\/deploy_hooks\/[A-Za-z0-9_-]+$/.test(
      value,
    )
  ) {
    throw new Error("The supplied Deploy Hook destination is invalid.");
  }
}

async function request(path = "", options = {}) {
  const token = migrationClient().config().token;
  let response;

  try {
    response = await fetch(`${endpoint}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Sanity webhook request failed; details were redacted.");
  }

  if (!response.ok) {
    throw new Error(
      `Sanity webhook request failed with HTTP ${response.status}.`,
    );
  }

  return response.json();
}

const deployHookUrl = await readSecretFromStdin();
assertDeployHookUrl(deployHookUrl);

const desired = {
  type: "document",
  name: webhookName,
  description:
    "Rebuild the public Swim BASI storefront after published CMS content changes.",
  url: deployHookUrl,
  dataset,
  rule: {
    on: ["create", "update", "delete"],
    filter,
    projection,
  },
  apiVersion: "v2026-07-30",
  httpMethod: "POST",
  includeDrafts: false,
  includeAllVersions: false,
  headers: {},
  isDisabledByUser: false,
};

const listed = await request();
const hooks = Array.isArray(listed)
  ? listed
  : (listed.hooks ?? listed.items ?? []);
const matches = hooks.filter(
  (hook) => hook.name === webhookName && !hook.deletedAt,
);

if (matches.length > 1) {
  throw new Error(
    `Found ${matches.length} active webhooks named ${webhookName}.`,
  );
}

let webhook;
let created = false;

if (matches.length === 1) {
  if (matches[0].url !== deployHookUrl) {
    throw new Error(
      "An active webhook with this name uses a different destination.",
    );
  }
  webhook = await request(`/${matches[0].id}`, {
    method: "PATCH",
    body: JSON.stringify(desired),
  });
} else {
  webhook = await request("", {
    method: "POST",
    body: JSON.stringify(desired),
  });
  created = true;
}

const verified = await request(`/${webhook.id}`);
if (
  verified.name !== webhookName ||
  verified.dataset !== dataset ||
  verified.url !== deployHookUrl ||
  verified.isDisabled ||
  verified.isDisabledByUser ||
  verified.includeDrafts ||
  verified.includeAllVersions
) {
  throw new Error("The created Sanity webhook did not pass verification.");
}

console.log(
  JSON.stringify({
    created,
    id: verified.id,
    name: verified.name,
    dataset: verified.dataset,
    enabled: !verified.isDisabled && !verified.isDisabledByUser,
    events: verified.rule?.on ?? [],
    filter: verified.rule?.filter ?? "",
    includeDrafts: Boolean(verified.includeDrafts),
    includeAllVersions: Boolean(verified.includeAllVersions),
    destinationFingerprint: createHash("sha256")
      .update(deployHookUrl)
      .digest("hex")
      .slice(0, 12),
  }),
);
