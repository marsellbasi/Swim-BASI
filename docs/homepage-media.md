# Homepage media

The homepage media order is announcement, navigation, portrait-film introduction, abstract color
hero, silhouette edit, featured products, brand statement, campaign image, color story, BASI List,
and footer. The existing abstract hero remains a deliberate transition from the photographic film
poster into the product catalog.

## Portrait-film configuration

`src/data/homepage-media.ts` is the single configuration source. Poster mode is active while
`enabled` is `false` or neither video source is provided. It uses the optimized black string-bikini
night portrait and shows customer-facing premiere copy with a working `/shop` CTA—never a fake video
control.

When the approved film is ready, add optimized files at:

```text
public/videos/campaigns/swim-basi-brand-film.mp4
public/videos/campaigns/swim-basi-brand-film.webm
public/videos/campaigns/swim-basi-brand-film-poster.webp
public/videos/campaigns/swim-basi-brand-film-captions.vtt
```

Then update `homepageFilm`:

1. Set `enabled: true`.
2. Set `videoSrc` to the MP4 path and `webmSrc` only when that file exists.
3. Map the approved poster through the brand-media workflow or use its final static path.
4. Set `captionsSrc` to the reviewed WebVTT file.
5. Paste the reviewed transcript into `transcript`.
6. Keep `autoplay: false`, `muted: false`, `loop: false`, `controls: true`, and `playsInline: true`
   for the voiceover film.

The component switches automatically from campaign-poster mode to native video controls. It pauses
autoplay when reduced motion is requested and exposes captions and transcript fields without custom
playback controls or focus traps. If muted autoplay is ever approved for a separate cut, explicitly
set `autoplay` and `muted` together, retain controls, and retest reduced motion.

Use 1080 × 1920 portrait video. Keep the poster at the same 9:16 framing, protect faces and swimwear
logos within mobile-safe bounds, and avoid baked-in text. Aim for an 8–12 MB MP4 maximum, with WebM
only when it improves transfer size. Test locally with `npm run build` and `npm run preview`, including
keyboard playback, pause, sound, captions, transcript, 320px mobile, and desktop framing.

To revert, set `enabled: false`; the responsive campaign poster and premiere message return without
removing the video files.

The existing abstract Open Graph image remains in place. None of the portrait photographs produces
a strong 1200 × 630 crop without compromising faces, products, or composition, so the release does
not create a poor social-share crop.
