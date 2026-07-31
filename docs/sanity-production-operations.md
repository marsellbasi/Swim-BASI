# Sanity production operations

Swim BASI uses Sanity as the published editorial source for the static Astro
storefront. The storefront remains independently recoverable because the local
catalog, page copy, and media are still present in the repository.

## Normal editorial workflow

1. Open `https://studio.swimbasi.com`.
2. Edit an existing document or create content using the controlled schemas.
3. Preview and validate the document in Studio.
4. Publish the document when the change is approved.
5. Wait for the public storefront Cloudflare Pages build to finish.
6. Verify the affected page at `https://swimbasi.com`.

Draft autosaves do not rebuild the storefront. Published creates, updates, and
deletes for storefront content do.

## Publication and rebuild sequence

1. Sanity promotes the approved draft to the published document ID.
2. The enabled `Swim BASI Storefront Rebuild` webhook evaluates the mutation.
3. Matching published mutations send a minimal POST to the Cloudflare Pages
   Deploy Hook.
4. The Deploy Hook starts a production build of the `swim-basi` Pages project
   from `main`.
5. Astro queries Sanity using the anonymous published perspective and generates
   static files.
6. Cloudflare promotes the successful build to `swimbasi.com`.

The Studio Pages project is `swim-basi-studio`; it is not the webhook target.
The Deploy Hook URL is a credential and must never be copied into source code,
documentation, issue trackers, chat, or public environment variables.

Typical builds take a few minutes. A short additional edge-propagation delay can
occur after Cloudflare marks a deployment active.

## Webhook scope

The webhook listens to create, update, and delete events in the `production`
dataset for these document types:

- `siteSettings`
- `announcementBar`
- `homepage`
- `aboutPage`
- `shopPage`
- `collectionsPage`
- `sizeGuide`
- `headerNavigation`
- `footerNavigation`
- `product`
- `productCategory`
- `productCollection`
- `campaign`
- `brandFilm`
- `lookbookEntry`

Drafts, Content Release versions, assets, Sanity system documents, and unrelated
metadata are excluded. The payload contains only the operation, document ID, and
document type. Publishing a document that references a replaced asset causes the
rebuild; direct asset mutations do not.

## Production environment

The public storefront production environment requires:

- `NODE_VERSION=22.23.1`
- `PUBLIC_SANITY_PROJECT_ID=xcfqfknc`
- `PUBLIC_SANITY_DATASET=production`
- `PUBLIC_SANITY_CONTENT_ENABLED=true`

No read token is required because the dataset is public. Never add
`SANITY_API_WRITE_TOKEN`, a Cloudflare API token, or the Deploy Hook URL to
Cloudflare build variables.

## Inspecting failed deliveries

1. In Sanity Manage, open the Swim BASI project.
2. Open **API → Webhooks → Swim BASI Storefront Rebuild**.
3. Inspect recent messages and attempts for the HTTP status and retry history.
4. In Cloudflare, open **Workers & Pages → swim-basi → Deployments**.
5. Confirm that a production deployment for `main` exists and inspect its build
   logs.
6. Run `npm run sanity:validate:production` locally to verify published content.
7. Run `npm run sanity:validate:live` after deployment to verify the live site.

Sanity treats 2xx responses as successful and retries eligible failures. Avoid
repeatedly republishing while an incident is still being diagnosed.

## Temporarily disabling the webhook

In Sanity Manage, edit `Swim BASI Storefront Rebuild`, clear **Enable webhook**,
and save. Existing published content remains available; only automatic rebuilds
stop. Re-enable it after resolving the issue and trigger one controlled
production rebuild.

## Rotating the Deploy Hook

1. Disable the Sanity webhook to prevent calls during rotation.
2. Create a replacement production Deploy Hook on `swim-basi` for `main`.
3. Update the Sanity webhook destination directly in Sanity Manage.
4. Test the replacement with one secure POST without printing or storing the URL.
5. Confirm a successful production deployment.
6. Delete the obsolete Deploy Hook in Cloudflare.
7. Re-enable and verify the Sanity webhook.

Treat both the old and new URLs as credentials throughout the rotation.

## Emergency rollback

1. Set `PUBLIC_SANITY_CONTENT_ENABLED=false` only in the `swim-basi` production
   environment.
2. Trigger a production deployment from `main`.
3. Wait for the deployment and edge propagation to complete.
4. Verify that `swimbasi.com` again uses repository-local catalog and media.
5. Leave all published Sanity documents and assets intact.
6. Diagnose and correct the issue before setting the flag back to `true`.

The rollback does not require deleting documents, assets, webhooks, or local
fallback files.

## Avoiding rebuild storms

- Complete related edits as drafts and publish them in one editorial session.
- Do not enable draft or version webhook events.
- Do not include asset documents in the webhook filter.
- Avoid no-op republishes and repeated publish/unpublish cycles.
- Temporarily disable the webhook during bulk maintenance, then trigger one
  controlled rebuild after validation.
- Keep the webhook filter limited to document types rendered by the storefront.
