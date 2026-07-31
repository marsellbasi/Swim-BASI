import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const studioRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(studioRoot, "static", "_redirects");
const destination = resolve(studioRoot, "dist", "_redirects");

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
