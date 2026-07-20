interface HomepageFilmConfig {
  enabled: boolean;
  videoSrc: string;
  webmSrc?: string;
  poster: string;
  fallbackPoster: string;
  title: string;
  eyebrow: string;
  description: string;
  status: string;
  transcript?: string;
  captionsSrc?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  playsInline: boolean;
  preload: 'none' | 'metadata' | 'auto';
}

export const homepageFilm: HomepageFilmConfig = {
  enabled: true,
  videoSrc: '/videos/campaigns/swim-basi-brand-film.mp4',
  poster: '/videos/campaigns/swim-basi-brand-film-poster.webp',
  fallbackPoster: 'black-string-bikini-night-portrait',
  title: 'Confidence, in motion.',
  eyebrow: 'THE SWIM BASI FILM',
  description: 'An introduction to the color, presence, and energy behind Swim BASI.',
  status: 'WATCH THE SWIM BASI FILM.',
  // Add captionsSrc and transcript only after the narration receives a reviewed accessibility pass.
  autoplay: false,
  muted: false,
  loop: false,
  controls: true,
  playsInline: true,
  preload: 'metadata',
};
