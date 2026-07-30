import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import type { SanityImageValue } from './types';
import { SANITY_DATASET, SANITY_PROJECT_ID } from './config';

const builder = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });

export const urlForSanityImage = (source: SanityImageSource) => builder.image(source);

export function getImageDimensions(source: SanityImageValue) {
  const dimensions =
    source.asset && 'metadata' in source.asset ? source.asset.metadata?.dimensions : undefined;
  return {
    width: dimensions?.width ?? 1600,
    height: dimensions?.height ?? 1200,
  };
}
