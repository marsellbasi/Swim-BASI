# Sanity visual editing roadmap

## Recommendation

Keep the storefront statically generated for the current migration. Native Sanity array controls
already provide the required visual drag handles for exact page-section ordering, without making
preview infrastructure a cutover dependency.

## Live preview and click-to-edit

A later preview phase should add Sanity Presentation Tool, a protected preview URL, stega-encoded
draft queries, Astro’s Visual Editing overlay, and authenticated draft-mode entry/exit endpoints.
Click-to-edit depends on stable source mappings from GROQ results to rendered fields. Production
queries should continue returning clean published values without stega metadata.

## Preview drag-and-drop

Direct manipulation inside the preview requires Presentation Tool document locations and
drag-enabled array mappings. Section `_key` values must remain stable so preview items map to their
array members. The current schema and renderer already preserve those keys and exact array order.

## Rendering decision

Do not move the public site to server rendering solely for visual editing. Prefer a separate,
authenticated server-rendered preview deployment while production remains static. Reconsider
production server rendering only if real-time delivery or personalization justifies the operational
and caching tradeoffs.

## Security and Cloudflare requirements

- Keep draft-read tokens server-only; never use the migration write token.
- Protect preview URLs with Cloudflare Access or equivalent authentication.
- Return `noindex, nofollow` and prevent shared caching for draft previews.
- Add only exact preview and Studio origins to Sanity CORS, with credentials only where required.
- Keep production on the published perspective.

## Recommended timing

Implement after published content reaches visual and SEO parity, the static rebuild webhook is
operational, and editors complete the first production review.
