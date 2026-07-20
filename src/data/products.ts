export type ProductCategory = 'one-piece' | 'string-bikinis' | 'high-waisted-bikinis';

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
  currency: 'USD';
  printfulUrl: string;
  /** TODO: Replace empty paths with approved, owned product photography. */
  image: string;
  hoverImage: string;
  gallery: string[];
  video: string | null;
  featured: boolean;
  /** Sample catalog entries are not confirmed inventory. */
  available: boolean | null;
  description: string;
  sizes: string[];
  badges: string[];
  sortOrder: number;
  /** TODO: Replace storefront fallback with the exact Printful product URL. */
  needsPrintfulUrl: boolean;
}

const STOREFRONT_URL = 'https://basiswim.printful.me';
const colors = {
  'Brink Pink': '#F16A8D',
  Classic: '#1E3A5F',
  Burgundy: '#6E1F36',
  'Mona Lisa': '#A45A52',
  Red: '#C91F37',
  'Cotton Candy': '#F5B9D0',
  Orange: '#E8692A',
  'Eastern Blue': '#247BA0',
  'Forest Green': '#285943',
  Brown: '#68483A',
  Grey: '#77777B',
  Black: '#111111',
  Yellow: '#E1B92F',
  'Red Violet': '#9E2A68',
} as const;

const families = [
  {
    category: 'one-piece' as const,
    label: 'One-Piece Swimsuit',
    price: 32.99,
    colorNames: [
      'Brink Pink',
      'Classic',
      'Burgundy',
      'Mona Lisa',
      'Red',
      'Cotton Candy',
      'Orange',
      'Eastern Blue',
      'Forest Green',
      'Brown',
      'Grey',
      'Black',
      'Yellow',
    ] as const,
  },
  {
    category: 'string-bikinis' as const,
    label: 'String Bikini',
    price: 37.99,
    colorNames: [
      'Red Violet',
      'Classic',
      'Burgundy',
      'Mona Lisa',
      'Red',
      'Cotton Candy',
      'Eastern Blue',
      'Orange',
      'Forest Green',
      'Brink Pink',
      'Brown',
      'Grey',
      'Black',
      'Yellow',
    ] as const,
  },
  {
    category: 'high-waisted-bikinis' as const,
    label: 'High-Waisted Bikini',
    price: 44.99,
    colorNames: [
      'Red Violet',
      'Classic',
      'Burgundy',
      'Mona Lisa',
      'Red',
      'Cotton Candy',
      'Eastern Blue',
      'Orange',
      'Forest Green',
      'Brink Pink',
      'Brown',
      'Grey',
      'Black',
      'Yellow',
    ] as const,
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const products: Product[] = families.flatMap((family, familyIndex) =>
  family.colorNames.map((colorName, colorIndex) => {
    const name = `BASI ${colorName} ${family.label}`;
    const confirmed = family.category === 'one-piece' && colorName === 'Brink Pink';
    return {
      id: `${family.category}-${slugify(colorName)}`,
      slug: slugify(name),
      name,
      shortName: `${colorName} ${family.label}`,
      category: family.category,
      collection: family.label.replace(' Swimsuit', ' Swimwear'),
      colorName,
      colorHex: colors[colorName],
      price: family.price,
      currency: 'USD',
      // TODO(product-links): replace fallback links with exact Printful product URLs.
      printfulUrl: confirmed
        ? 'https://basiswim.printful.me/product/basi-brink-pink-one-piece-swimsuit'
        : STOREFRONT_URL,
      image: '',
      hoverImage: '',
      gallery: [],
      video: null,
      featured: familyIndex < 3 && colorIndex < 2,
      available: null,
      description: `A bold ${family.label.toLowerCase()} in ${colorName}, designed for confident color and standout presence.`,
      sizes: [],
      badges: [],
      sortOrder: familyIndex * 100 + colorIndex,
      needsPrintfulUrl: !confirmed,
    };
  }),
);
