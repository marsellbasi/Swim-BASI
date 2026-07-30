import imageManifest from '../../../src/data/product-image-manifest.json' with { type: 'json' };

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
};
const allColors = [
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
];
const families = [
  {
    category: 'one-piece',
    title: 'One-Piece Swimwear',
    label: 'One-Piece Swimsuit',
    price: 32.99,
    colors: [
      'Red Violet',
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
    ],
  },
  {
    category: 'string-bikinis',
    title: 'String Bikinis',
    label: 'String Bikini',
    price: 37.99,
    colors: allColors,
  },
  {
    category: 'high-waisted-bikinis',
    title: 'High-Waisted Bikinis',
    label: 'High-Waisted Bikini',
    price: 44.99,
    colors: allColors,
  },
];
const featured = new Set([
  'basi-brink-pink-one-piece-swimsuit',
  'basi-classic-one-piece-swimsuit',
  'basi-red-violet-string-bikini',
  'basi-classic-string-bikini',
  'basi-red-violet-high-waisted-bikini',
  'basi-classic-high-waisted-bikini',
]);
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const taxonomy = families.map((family, index) => ({
  slug: family.category,
  title: family.title,
  description: `${family.title} from Swim BASI in expressive colorways.`,
  displayOrder: index,
}));

export const products = families.flatMap((family, familyIndex) =>
  family.colors.map((colorName, colorIndex) => {
    const name = `BASI ${colorName} ${family.label}`;
    const slug = slugify(name);
    return {
      slug,
      name,
      category: family.category,
      collection: family.category,
      colorName,
      colorHex: colors[colorName],
      displayPrice: family.price,
      printfulUrl: `https://basiswim.printful.me/product/${slug}`,
      featured: featured.has(slug),
      description: `A bold ${family.label.toLowerCase()} in ${colorName}, designed for confident color and standout presence.`,
      displayOrder: familyIndex * 100 + colorIndex,
      images: imageManifest.products[slug]?.gallery || [],
    };
  }),
);

export const navigation = {
  header: [
    ['Shop', '/shop'],
    ['Collections', '/collections'],
    ['About', '/about'],
    ['Size Guide', '/size-guide'],
  ],
  footer: [
    {
      title: 'Shop',
      items: [
        ['All Products', '/shop'],
        ['One-Piece', '/collections/one-piece'],
        ['String Bikinis', '/collections/string-bikinis'],
        ['High-Waisted', '/collections/high-waisted-bikinis'],
      ],
    },
    {
      title: 'Information',
      items: [
        ['About', '/about'],
        ['Size Guide', '/size-guide'],
        ['Shipping & Returns', '/shipping-returns'],
        ['Contact', '/contact'],
      ],
    },
    {
      title: 'Connect',
      items: [
        ['Instagram ↗', 'https://instagram.com/swimbasi'],
        ['Privacy', '/privacy'],
        ['Terms', '/terms'],
      ],
    },
  ],
};
