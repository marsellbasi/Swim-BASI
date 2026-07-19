# Media guide

Only use media Swim BASI owns or has permission to publish. Never copy images from the Printful storefront.

## Formats

- Prefer AVIF for the smallest modern image delivery and WebP for broad high-quality support.
- Keep an optimized JPG fallback when source photography or integration requirements need it.
- Use PNG only for transparency or small graphics; avoid it for full-frame photography.
- Campaign video should include MP4 (H.264) and, when practical, WebM versions.
- Every video needs a compressed poster image and meaningful fallback text.

## Dimensions and targets

- Product images: 1600 × 2000 px (4:5), ideally 150–350 KB, maximum target 500 KB.
- Hero images: 2400 × 1350 px or larger (16:9), ideally below 600 KB.
- Collection/editorial images: at least 1600 px on the longest edge.
- Instagram previews: 1200 × 1200 px.
- Campaign video: 1080p, muted-safe, 6–15 seconds for loops, target below 8 MB; avoid shipping long autoplay video.

## Naming

Use lowercase kebab case: `basi-brink-pink-one-piece-front.webp`, `summer-2026-hero.avif`, and `summer-2026-campaign-loop.webm`. Include product, color, view, and version only when useful.

## Storage

- `public/brand/` — approved brand marks
- `public/images/hero/` — homepage heroes and posters
- `public/images/campaigns/` — campaign/editorial stills
- `public/images/products/` — product views
- `public/images/collections/` — collection covers
- `public/images/instagram/` — curated social previews
- `public/videos/campaigns/` — MP4/WebM campaigns
- `public/icons/` — favicon and UI assets

## Replacing placeholders

Add the optimized asset, then replace the root-relative path in the relevant page or `src/data/products.ts`. Supply descriptive alt text describing the product, color, and view. For video, pass `video`, `poster`, and accessible fallback text to `MediaFrame`. Test at mobile and desktop widths and rerun the production build.
