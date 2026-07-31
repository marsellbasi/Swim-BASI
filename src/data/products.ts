import productImageData from "./product-image-manifest.json";

export type ProductCategory =
  | "one-piece"
  | "string-bikinis"
  | "high-waisted-bikinis";
export type ProductImageView = "front" | "back" | "left" | "right";

export interface ProductImageAsset {
  src: string;
  width: number;
  height: number;
  bytes: number;
  view: ProductImageView;
  alt: string;
}

interface ProductImageSet {
  primary: ProductImageAsset;
  hover: ProductImageAsset | null;
  gallery: ProductImageAsset[];
  availableViews: ProductImageView[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  collection: string;
  colorName: string;
  colorHex: string;
  price: number;
  currency: "USD";
  printfulUrl: string;
  image: ProductImageAsset | null;
  hoverImage: ProductImageAsset | null;
  gallery: ProductImageAsset[];
  video: string | null;
  featured: boolean;
  /** Sample catalog entries are not confirmed inventory. */
  available: boolean | null;
  description: string;
  sizes: string[];
  badges: string[];
  sortOrder: number;
  /** Retained for compatibility with catalog-management tooling; all current entries are direct. */
  needsPrintfulUrl: boolean;
}

const PRINTFUL_PRODUCT_BASE_URL = "https://basiswim.printful.me/product";
const productImageManifest = productImageData.products as Record<
  string,
  ProductImageSet
>;
const colors = {
  "Brink Pink": "#F16A8D",
  Classic: "#1E3A5F",
  Burgundy: "#6E1F36",
  "Mona Lisa": "#A45A52",
  Red: "#C91F37",
  "Cotton Candy": "#F5B9D0",
  Orange: "#E8692A",
  "Eastern Blue": "#247BA0",
  "Forest Green": "#285943",
  Brown: "#68483A",
  Grey: "#77777B",
  Black: "#111111",
  Yellow: "#E1B92F",
  "Red Violet": "#9E2A68",
} as const;

const families = [
  {
    category: "one-piece" as const,
    label: "One-Piece Swimsuit",
    price: 32.99,
    colorNames: [
      "Red Violet",
      "Brink Pink",
      "Classic",
      "Burgundy",
      "Mona Lisa",
      "Red",
      "Cotton Candy",
      "Orange",
      "Eastern Blue",
      "Forest Green",
      "Brown",
      "Grey",
      "Black",
      "Yellow",
    ] as const,
  },
  {
    category: "string-bikinis" as const,
    label: "String Bikini",
    price: 37.99,
    colorNames: [
      "Red Violet",
      "Classic",
      "Burgundy",
      "Mona Lisa",
      "Red",
      "Cotton Candy",
      "Eastern Blue",
      "Orange",
      "Forest Green",
      "Brink Pink",
      "Brown",
      "Grey",
      "Black",
      "Yellow",
    ] as const,
  },
  {
    category: "high-waisted-bikinis" as const,
    label: "High-Waisted Bikini",
    price: 44.99,
    colorNames: [
      "Red Violet",
      "Classic",
      "Burgundy",
      "Mona Lisa",
      "Red",
      "Cotton Candy",
      "Eastern Blue",
      "Orange",
      "Forest Green",
      "Brink Pink",
      "Brown",
      "Grey",
      "Black",
      "Yellow",
    ] as const,
  },
];

const featuredColors: Record<ProductCategory, readonly string[]> = {
  "one-piece": ["Brink Pink", "Classic"],
  "string-bikinis": ["Red Violet", "Classic"],
  "high-waisted-bikinis": ["Red Violet", "Classic"],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const products: Product[] = families.flatMap((family, familyIndex) =>
  family.colorNames.map((colorName, colorIndex) => {
    const name = `BASI ${colorName} ${family.label}`;
    const slug = slugify(name);
    const imageSet = productImageManifest[slug];
    return {
      id: `${family.category}-${slugify(colorName)}`,
      slug,
      name,
      shortName:
        family.category === "one-piece" && colorName === "Red Violet"
          ? "Red Violet One-Piece"
          : `${colorName} ${family.label}`,
      category: family.category,
      collection: family.label.replace(" Swimsuit", " Swimwear"),
      colorName,
      colorHex: colors[colorName],
      price: family.price,
      currency: "USD",
      printfulUrl: `${PRINTFUL_PRODUCT_BASE_URL}/${slug}`,
      image: imageSet?.primary ?? null,
      hoverImage: imageSet?.hover ?? null,
      gallery: imageSet?.gallery ?? [],
      video: null,
      featured: featuredColors[family.category].includes(colorName),
      available: null,
      description: `A bold ${family.label.toLowerCase()} in ${colorName}, designed for confident color and standout presence.`,
      sizes: [],
      badges: [],
      sortOrder: familyIndex * 100 + colorIndex,
      needsPrintfulUrl: false,
    };
  }),
);
