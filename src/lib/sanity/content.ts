import { sanityClient } from 'sanity:client';
import { SANITY_CONTENT_ENABLED, SANITY_EXPECTED_PRODUCT_COUNT } from './config';
import {
  ANNOUNCEMENT_QUERY,
  COLLECTIONS_QUERY,
  FOOTER_NAVIGATION_QUERY,
  HEADER_NAVIGATION_QUERY,
  PAGE_QUERY,
  PRODUCTS_QUERY,
  SITE_SETTINGS_QUERY,
} from './queries';
import type {
  NavigationItem,
  SanityCollection,
  SanityLink,
  SanityPage,
  SanityProduct,
  SiteSettings,
} from './types';

const warn = (message: string) => {
  if (import.meta.env.DEV || import.meta.env.PUBLIC_SANITY_CONTENT_ENABLED === 'true') {
    console.warn(`[Sanity] ${message}`);
  }
};

async function safeFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!SANITY_CONTENT_ENABLED) return null;
  try {
    return await sanityClient.fetch<T>(query, params, { perspective: 'published' });
  } catch (error) {
    warn(
      `Published content fetch failed; local fallback remains active. ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return null;
  }
}

export async function getSanityPage(documentId: string): Promise<SanityPage | null> {
  const page = await safeFetch<SanityPage>(PAGE_QUERY, { documentId });
  if (!page?.enabled || !Array.isArray(page.sections) || page.sections.length === 0) {
    if (SANITY_CONTENT_ENABLED) warn(`${documentId} is missing, disabled, or has no sections.`);
    return null;
  }
  return page;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings>(SITE_SETTINGS_QUERY);
}

export async function getNavigation(): Promise<{
  header: NavigationItem[] | null;
  footer: Array<{ title?: string; items?: NavigationItem[] }> | null;
}> {
  if (!SANITY_CONTENT_ENABLED) return { header: null, footer: null };
  const [header, footer] = await Promise.all([
    safeFetch<{ items?: NavigationItem[] }>(HEADER_NAVIGATION_QUERY),
    safeFetch<{ groups?: Array<{ title?: string; items?: NavigationItem[] }> }>(
      FOOTER_NAVIGATION_QUERY,
    ),
  ]);
  return { header: header?.items ?? null, footer: footer?.groups ?? null };
}

export async function getAnnouncement() {
  return safeFetch<{ enabled?: boolean; message?: string; link?: SanityLink; linkLabel?: string }>(
    ANNOUNCEMENT_QUERY,
  );
}

export async function getSanityProducts(): Promise<SanityProduct[] | null> {
  const products = await safeFetch<SanityProduct[]>(PRODUCTS_QUERY);
  if (!products) return null;
  if (products.length !== SANITY_EXPECTED_PRODUCT_COUNT) {
    warn(
      `Expected ${SANITY_EXPECTED_PRODUCT_COUNT} active products but received ${products.length}; using the complete local catalog instead of combining records.`,
    );
    return null;
  }
  const valid = products.every(
    (product) => product.slug && product.name && product.printfulUrl && product.primaryImage?.image,
  );
  if (!valid) {
    warn('Published products failed required-field validation; using the complete local catalog.');
    return null;
  }
  return products;
}

export async function getSanityCollections(): Promise<SanityCollection[] | null> {
  const collections = await safeFetch<SanityCollection[]>(COLLECTIONS_QUERY);
  if (!collections?.length) return null;
  if (collections.length !== 3) {
    warn(
      `Expected 3 enabled collections but received ${collections.length}; local collection routes remain authoritative.`,
    );
    return null;
  }
  const productIds = new Set(
    collections.flatMap((collection) => collection.products || []).map((product) => product._id),
  );
  if (productIds.size !== SANITY_EXPECTED_PRODUCT_COUNT) {
    warn(
      `Expected ${SANITY_EXPECTED_PRODUCT_COUNT} unique collection products but received ${productIds.size}; local collection routes remain authoritative.`,
    );
    return null;
  }
  return collections;
}
