import type {
  Product,
  ProductImageAsset,
  ProductImageView,
} from "../../data/products";
import { getImageDimensions, urlForSanityImage } from "./image";
import type { ManagedImage, PortableTextBlock, SanityProduct } from "./types";

export function portableTextToPlainText(blocks?: PortableTextBlock[]): string {
  return (blocks || [])
    .filter((block) => block._type === "block")
    .map((block) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .filter(Boolean)
    .join("\n\n");
}

function imageAsset(
  image: ManagedImage | undefined,
  view: ProductImageView,
): ProductImageAsset | null {
  if (!image?.image) return null;
  const { width, height } = getImageDimensions(image.image);
  return {
    src: urlForSanityImage(image.image)
      .width(1200)
      .fit("max")
      .auto("format")
      .quality(85)
      .url(),
    width,
    height,
    bytes: 0,
    view,
    alt: image.decorative ? "" : image.alt || "",
  };
}

export function sanityProductToLocal(product: SanityProduct): Product {
  const category = product.categories?.[0]?.slug;
  const safeCategory =
    category === "one-piece" ||
    category === "string-bikinis" ||
    category === "high-waisted-bikinis"
      ? category
      : "one-piece";
  const gallery = (product.gallery || [])
    .map((image, index) => imageAsset(image, index === 0 ? "front" : "back"))
    .filter((image): image is ProductImageAsset => Boolean(image));
  const primary = imageAsset(product.primaryImage, "front");
  const hover =
    gallery.find((image) => image.view === "back") ?? gallery[1] ?? null;
  return {
    id: product._id,
    slug: product.slug || product._id,
    name: product.name || "Untitled product",
    shortName: product.name || "Untitled product",
    category: safeCategory,
    collection:
      product.collections?.[0]?.title ||
      product.categories?.[0]?.title ||
      "Swimwear",
    colorName: product.color?.name || "Color",
    colorHex: product.color?.hex || "#77777B",
    price: product.displayPrice || 0,
    currency: "USD",
    printfulUrl: product.printfulUrl || "#",
    image: primary,
    hoverImage: hover,
    gallery: primary
      ? [primary, ...gallery.filter((image) => image.src !== primary.src)]
      : gallery,
    video: null,
    featured: product.featured === true,
    available: product.status === "active" ? null : false,
    description: product.shortDescription || "",
    sizes: [],
    badges: [],
    sortOrder: product.displayOrder || 0,
    needsPrintfulUrl: false,
  };
}
