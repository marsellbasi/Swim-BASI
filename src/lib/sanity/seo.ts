import type { ManagedImage, SeoValue, SiteSettings } from './types';
import { urlForSanityImage } from './image';

export interface ResolvedSeo {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl?: string;
  image?: string;
  twitterImage?: string;
  openGraphTitle: string;
  openGraphDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  cardType: 'summary' | 'summary_large_image';
  noIndex: boolean;
  noFollow: boolean;
}

const imageUrl = (image?: ManagedImage) =>
  image?.image
    ? urlForSanityImage(image.image)
        .width(1200)
        .height(630)
        .fit('crop')
        .auto('format')
        .quality(85)
        .url()
    : undefined;

export function resolveSeo(input: {
  page?: SeoValue;
  settings?: SiteSettings | null;
  derivedTitle: string;
  derivedDescription: string;
  canonicalPath: string;
  fallbackImage?: string;
}): ResolvedSeo {
  const {
    page = {},
    settings,
    derivedTitle,
    derivedDescription,
    canonicalPath,
    fallbackImage,
  } = input;
  const rawTitle = page.metaTitle || derivedTitle;
  const title = settings?.titleTemplate?.includes('%s')
    ? settings.titleTemplate.replace('%s', rawTitle)
    : rawTitle;
  const description =
    page.metaDescription || derivedDescription || settings?.defaultMetaDescription || '';
  const socialImage =
    imageUrl(page.openGraphImage) || imageUrl(settings?.defaultOpenGraphImage) || fallbackImage;
  return {
    title,
    description,
    canonicalPath,
    canonicalUrl: page.canonicalUrl,
    image: socialImage,
    twitterImage: imageUrl(page.twitterImage) || socialImage,
    openGraphTitle: page.openGraphTitle || rawTitle || settings?.defaultSocialTitle || title,
    openGraphDescription:
      page.openGraphDescription || description || settings?.defaultSocialDescription || '',
    twitterTitle: page.twitterTitle || page.openGraphTitle || rawTitle,
    twitterDescription: page.twitterDescription || page.openGraphDescription || description,
    cardType: page.socialCardType || 'summary_large_image',
    noIndex: page.noIndex ?? settings?.defaultNoIndex ?? false,
    noFollow: page.noFollow ?? settings?.defaultNoFollow ?? false,
  };
}

export function organizationJsonLd(settings?: SiteSettings | null) {
  const baseUrl = settings?.canonicalSiteUrl || 'https://swimbasi.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.organizationName || settings?.siteName || 'Swim BASI',
    url: baseUrl,
    sameAs: (settings?.socialLinks || []).map((item) => item.url).filter(Boolean),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ label: string; href?: string }>,
  baseUrl = 'https://swimbasi.com',
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, baseUrl).toString() } : {}),
    })),
  };
}
