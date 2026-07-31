import manifestData from "./brand-image-manifest.json";

export interface BrandImageVariant {
  src: string;
  width: number;
  height: number;
  bytes: number;
  aspectRatio: number;
}

export interface BrandImage {
  sourceFilename: string;
  productionFilename: string;
  sourceBytes: number;
  sourceDimensions: { width: number; height: number };
  sourceExifOrientation: number;
  variants: BrandImageVariant[];
  intendedPlacements: string[];
  alt: string;
  focalPoint: { x: number; y: number; objectPosition: string };
  loadingPriority: "high" | "lazy";
  optimizationStatus: "optimized";
}

export const brandImages = manifestData.images as Record<string, BrandImage>;

export const getBrandImage = (key: string): BrandImage => {
  const image = brandImages[key];
  if (!image) throw new Error(`Unknown brand image: ${key}`);
  return image;
};
