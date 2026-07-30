/* global process */
import { runMigration } from './lib/runner.mjs';
if (process.argv.includes('--apply')) {
  throw new Error(
    'migrate-all.mjs is dry-run only. Apply the documented ordered phase commands to preserve dependency order.',
  );
}
await runMigration({ phase: 'all' });
