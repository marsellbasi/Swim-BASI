# Swim BASI Sanity migration tooling

These scripts migrate the repository’s factual local content into deterministic Sanity drafts.
They never delete remote content and never publish documents.

## Credential safety

Provide a write-capable token only through the local process variable
`SANITY_API_WRITE_TOKEN`. Never put it in `.env.example`, Git, Studio-prefixed variables,
Cloudflare storefront variables, command arguments, or client-side code. Scripts report only
whether the variable is available.

Every mutation is hard-gated to project `xcfqfknc`, dataset `production`, and the explicit
`--apply` flag.

## Dry run

```sh
node scripts/sanity/migrate-all.mjs --dry-run
node scripts/sanity/verify-migration.mjs
```

Dry runs generate human- and machine-readable reports in `artifacts/`, including checksum asset
mappings, deterministic document mappings, and a rollback manifest.

## Apply and resume

After reviewing the dry run and setting the token in the local process environment:

```sh
node scripts/sanity/upload-assets.mjs --apply --resume
node scripts/sanity/migrate-taxonomy.mjs --apply --resume
node scripts/sanity/migrate-products.mjs --apply --resume
node scripts/sanity/migrate-site-settings.mjs --apply --resume
node scripts/sanity/migrate-navigation.mjs --apply --resume
node scripts/sanity/migrate-pages.mjs --apply --resume
node scripts/sanity/verify-migration.mjs
```

Assets are reused by SHA-256 mapping. Documents use deterministic IDs and `createOrReplace` on
draft IDs, so reruns converge without duplicate documents. The rollback manifest is advisory:
remote deletion is intentionally never automatic.
