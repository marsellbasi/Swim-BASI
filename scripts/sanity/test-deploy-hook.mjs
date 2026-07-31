/* global process, fetch, Buffer, console */
import { installSafeProcessErrorHandlers } from "./lib/safe-errors.mjs";

installSafeProcessErrorHandlers();

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const deployHookUrl = Buffer.concat(chunks).toString("utf8").trim();

if (
  !/^https:\/\/api\.cloudflare\.com\/client\/v4\/pages\/webhooks\/deploy_hooks\/[A-Za-z0-9_-]+$/.test(
    deployHookUrl,
  )
) {
  throw new Error("The supplied Deploy Hook destination is invalid.");
}

let response;
try {
  response = await fetch(deployHookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
} catch {
  throw new Error(
    "Cloudflare Deploy Hook invocation failed; details redacted.",
  );
}

if (!response.ok) {
  throw new Error(`Cloudflare Deploy Hook returned HTTP ${response.status}.`);
}

const payload = await response.json().catch(() => ({}));
console.log(
  JSON.stringify({
    accepted: true,
    status: response.status,
    deploymentId:
      payload.id ?? payload.result?.id ?? payload.deployment_id ?? null,
    branch: "main",
    invokedAt: new Date().toISOString(),
  }),
);
