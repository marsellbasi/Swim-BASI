/* global process, console */

const REDACTED = "[REDACTED]";

function safeMessage(reason) {
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  let message =
    reason instanceof Error
      ? `${reason.name}: ${reason.message}`
      : String(reason ?? "Unknown error");

  if (token) message = message.split(token).join(REDACTED);
  return message
    .replace(
      /authorization:\s*Bearer\s+[^\s'"]+/gi,
      "authorization: Bearer [REDACTED]",
    )
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/g, "Bearer [REDACTED]");
}

let installed = false;

export function installSafeProcessErrorHandlers() {
  if (installed) return;
  installed = true;

  process.on("uncaughtException", (error) => {
    console.error(`Fatal error: ${safeMessage(error)}`);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    console.error(`Fatal rejection: ${safeMessage(reason)}`);
    process.exit(1);
  });
}
