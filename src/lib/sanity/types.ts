export interface SanityAsset {
  _id?: string;
  url?: string;
  originalFilename?: string;
  metadata?: {
    dimensions?: { width?: number; height?: number; aspectRatio?: number };
  };
}

export interface SanityImageValue {
  _type?: "image";
  asset?: SanityAsset | { _ref?: string };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; width: number; height: number };
}

export interface ManagedImage {
  internalLabel?: string;
  image?: SanityImageValue;
  mobileImage?: SanityImageValue;
  decorative?: boolean;
  alt?: string;
  caption?: string;
  credit?: string;
  loading?: "lazy" | "eager";
  link?: SanityLink;
}

export interface ManagedVideo {
  internalLabel?: string;
  sourceType?: "upload" | "external";
  uploadedVideo?: { asset?: SanityAsset };
  mobileVideo?: { asset?: SanityAsset };
  externalVideoUrl?: string;
  poster?: ManagedImage;
  fallbackImage?: ManagedImage;
  title?: string;
  description?: string;
  captionsFile?: { asset?: SanityAsset };
  transcript?: PortableTextBlock[];
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
}

export interface SanityLink {
  linkType?: "internal" | "external";
  internalPath?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
}

export interface SanityCallToAction {
  label?: string;
  destination?: SanityLink;
  style?: "primary" | "secondary" | "text";
}

export interface PortableTextBlock {
  _type?: string;
  _key?: string;
  children?: Array<{ _key?: string; text?: string }>;
}

export interface SeoValue {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: ManagedImage;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: ManagedImage;
  socialCardType?: "summary" | "summary_large_image";
  breadcrumbLabel?: string;
  includeInSitemap?: boolean;
  sitemapPriority?: string;
  sitemapChangeFrequency?: string;
  structuredDataType?: "WebPage" | "CollectionPage" | "AboutPage" | "Product";
}

export interface SiteSettings {
  siteName?: string;
  titleTemplate?: string;
  defaultMetaDescription?: string;
  canonicalSiteUrl?: string;
  defaultOpenGraphImage?: ManagedImage;
  defaultSocialTitle?: string;
  defaultSocialDescription?: string;
  defaultNoIndex?: boolean;
  defaultNoFollow?: boolean;
  organizationName?: string;
  organizationLogo?: ManagedImage;
  socialLinks?: Array<{ platform?: string; url?: string; label?: string }>;
  contactEmail?: string;
  defaultLocale?: string;
  checkoutNotice?: string;
}

export interface PageSection {
  _key: string;
  _type: string;
  internalName?: string;
  enabled?: boolean;
  theme?: string;
  spacing?: string;
  eyebrow?: string;
  heading?: string;
  body?: string | PortableTextBlock[];
  content?: PortableTextBlock[];
  media?: {
    mediaType?: "image" | "video";
    image?: ManagedImage;
    video?: ManagedVideo;
    fit?: string;
  };
  image?: ManagedImage;
  video?: ManagedVideo;
  leftMedia?: {
    mediaType?: "image" | "video";
    image?: ManagedImage;
    video?: ManagedVideo;
  };
  rightMedia?: {
    mediaType?: "image" | "video";
    image?: ManagedImage;
    video?: ManagedVideo;
  };
  images?: ManagedImage[];
  items?: Array<{
    _key?: string;
    internalName?: string;
    image?: ManagedImage;
    heading?: string;
    copy?: string;
    callToAction?: SanityCallToAction;
  }>;
  primaryCallToAction?: SanityCallToAction;
  secondaryCallToAction?: SanityCallToAction;
  callToAction?: SanityCallToAction;
  alignment?: string;
  layout?: string;
  variant?: string;
  width?: string;
  source?: string;
  products?: SanityProduct[];
  collection?: SanityCollection;
  collections?: SanityCollection[];
  limit?: number;
  showCheckoutNotice?: boolean;
  campaign?: {
    title?: string;
    summary?: string;
    heroImage?: ManagedImage;
    slug?: string;
  };
  emailLabel?: string;
  buttonLabel?: string;
  style?: string;
  accessibleLabel?: string;
}

export interface SanityPage {
  _id: string;
  _type: string;
  internalTitle?: string;
  enabled?: boolean;
  slug?: string;
  sections?: PageSection[];
  seo?: SeoValue;
  measurementUnit?: "inches" | "centimeters";
  rows?: Array<{
    _key?: string;
    sizeName?: string;
    bust?: string;
    waist?: string;
    hips?: string;
    notes?: string;
  }>;
  measurementInstructions?: PortableTextBlock[];
  sizeGuideImage?: ManagedImage;
  intro?: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    secondaryBody?: string;
  };
  measurementGuide?: {
    eyebrow?: string;
    heading?: string;
    intro?: string;
    cards?: Array<{ _key?: string; heading?: string; body?: string }>;
    note?: string;
  };
  silhouetteGuide?: {
    eyebrow?: string;
    heading?: string;
    items?: Array<{
      _key?: string;
      collection?: SanityCollection;
      body?: string;
      fitNote?: string;
      callToActionLabel?: string;
    }>;
  };
  beforeOrder?: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    secondaryBody?: string;
  };
  closingCallToAction?: {
    heading?: string;
    primaryCallToAction?: SanityCallToAction;
    secondaryCallToAction?: SanityCallToAction;
  };
}

export interface SanityProduct {
  _id: string;
  name?: string;
  slug?: string;
  status?: string;
  shortDescription?: string;
  displayPrice?: number;
  primaryImage?: ManagedImage;
  gallery?: ManagedImage[];
  color?: { name?: string; hex?: string };
  categories?: Array<{ title?: string; slug?: string }>;
  collections?: Array<{ title?: string; slug?: string }>;
  printfulUrl?: string;
  featured?: boolean;
  displayOrder?: number;
}

export interface SanityCollection {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  heroImage?: ManagedImage;
  products?: SanityProduct[];
  featured?: boolean;
  enabled?: boolean;
  sections?: PageSection[];
  seo?: SeoValue;
}

export interface NavigationItem {
  _key?: string;
  label?: string;
  destination?: SanityLink;
  children?: NavigationItem[];
}
