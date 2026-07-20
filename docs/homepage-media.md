# Homepage media

The homepage media order is announcement, navigation, portrait-film introduction, abstract color
hero, silhouette edit, featured products, brand statement, campaign image, color story, BASI List,
and footer. The existing abstract hero remains a deliberate transition from the photographic film
poster into the product catalog.

## Portrait-film configuration

`src/data/homepage-media.ts` is the single configuration source. The Swim BASI portrait brand film
is live with user-initiated native playback, audible voiceover after play, and metadata-only preload.
The optimized black string-bikini night portrait remains the fallback if the film is disabled.

Production files:

```text
public/videos/campaigns/swim-basi-brand-film.mp4
public/videos/campaigns/swim-basi-brand-film-poster.webp
```

The active `homepageFilm` configuration:

1. Set `enabled: true`.
2. Uses the H.264/AAC MP4 as `videoSrc` and the final WebP film still as `poster`.
3. Omits WebM because its tested encode was larger than the MP4.
4. Keeps `autoplay: false`, `muted: false`, `loop: false`, `controls: true`,
   `playsInline: true`, and `preload: 'metadata'` for the voiceover film.
5. Omits `captionsSrc` and `transcript` until reviewed accessibility copy is available.

The component uses native video controls without custom playback controls or focus traps. It pauses
autoplay when reduced motion is requested and retains optional captions and transcript fields for a
future reviewed WebVTT track and transcript. The current release does not publish either. If muted
autoplay is ever approved for a separate cut, explicitly set `autoplay` and `muted` together, retain
controls, and retest reduced motion.

The published film is 720 × 1280 portrait and approximately 10.11 MB. Its matching poster is
approximately 45 KB. Keep future posters at the same 9:16 framing, protect faces and swimwear logos
within mobile-safe bounds, and avoid baked-in text. Add WebM only when it improves transfer size.
The current 45-second poster remains intentional after comparison with frames at 3, 6, 9, 12, and
15 seconds; the alternatives had weaker facial presence, tighter crops, or transitional overlap.

The film remains the dominant opening chapter. The abstract color hero directly below it is a
shorter secondary chapter, separated by a restrained gold rule. Desktop uses a balanced two-column
film layout and a 70–80vh hero; mobile stacks film before copy and lets the hero size from its
content rather than forcing a tall viewport-based minimum.

The raw `brand-video.MOV` source remains local and is ignored by Git. To revert, set `enabled: false`;
the responsive campaign poster returns without removing the production video files.

The existing abstract Open Graph image remains in place. None of the portrait photographs produces
a strong 1200 × 630 crop without compromising faces, products, or composition, so the release does
not create a poor social-share crop.
