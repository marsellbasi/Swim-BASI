import { runMigration } from "./lib/runner.mjs";
await runMigration({ phase: "assets" });
