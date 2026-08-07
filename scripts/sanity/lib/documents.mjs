import { ids } from "./config.mjs";
import { navigation, products, taxonomy } from "./source-data.mjs";

const key = (value) =>
  value
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 12)
    .toLowerCase();
const block = (text, blockKey = "body") => [
  {
    _type: "block",
    _key: key(blockKey),
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: `${key(blockKey)}text`, text, marks: [] },
    ],
  },
];
const link = (destination) =>
  destination.startsWith("http")
    ? {
        _type: "link",
        linkType: "external",
        externalUrl: destination,
        openInNewTab: true,
      }
    : {
        _type: "link",
        linkType: "internal",
        internalPath: destination,
        openInNewTab: false,
      };
const cta = (label, destination, style = "primary") => ({
  _type: "callToAction",
  label,
  destination: link(destination),
  style,
});

export function managedImage(source, alt, assetMap, options = {}) {
  const assetId = assetMap[source]?.sanityAssetId;
  return {
    _type: "managedImage",
    internalLabel: options.internalLabel || source.split("/").at(-1),
    image: assetId
      ? { _type: "image", asset: { _type: "reference", _ref: assetId } }
      : undefined,
    alt,
    decorative: false,
    loading: options.loading || "lazy",
    caption: options.caption,
    _migrationSource: source,
  };
}

const commonSection = (type, sectionKey, internalName, overrides = {}) => ({
  _type: type,
  _key: sectionKey,
  internalName,
  enabled: true,
  theme: "white",
  spacing: "standard",
  ...overrides,
});

const collectionPositioning = {
  "one-piece": "Clean lines. Confident coverage.",
  "string-bikinis": "Minimal shape. Maximum attitude.",
  "high-waisted-bikinis": "Defined waist. Effortless confidence.",
};

export function taxonomyDocuments() {
  const categories = taxonomy.map((item) => ({
    _id: ids.category(item.slug),
    _type: "productCategory",
    title: item.title,
    slug: { _type: "slug", current: item.slug },
    description: item.description,
    displayOrder: item.displayOrder,
    enabled: true,
  }));
  const collections = taxonomy.map((item) => ({
    _id: ids.collection(item.slug),
    _type: "productCollection",
    title: item.title,
    slug: { _type: "slug", current: item.slug },
    description: collectionPositioning[item.slug],
    products: products
      .filter((product) => product.collection === item.slug)
      .map((product) => ({
        _type: "reference",
        _key: key(product.slug),
        _ref: ids.product(product.slug),
        _weak: true,
      })),
    featured: true,
    displayOrder: item.displayOrder,
    enabled: true,
    sections: [
      commonSection(
        "richTextSection",
        `${key(item.slug)}intro`,
        `${item.title} heading`,
        {
          eyebrow:
            item.slug === "one-piece"
              ? "$32.99"
              : item.slug === "string-bikinis"
                ? "$37.99"
                : "$44.99",
          heading: item.title,
          content: block(
            item.slug === "one-piece"
              ? "Clean lines, bold color, and a silhouette built for presence."
              : item.slug === "string-bikinis"
                ? "A minimal silhouette with maximum confidence."
                : "A flattering, confident silhouette with a little more coverage.",
            `${item.slug}intro`,
          ),
        },
      ),
      commonSection(
        "productGridSection",
        `${key(item.slug)}grid`,
        `${item.title} products`,
        {
          heading: item.title,
          source: "curated",
          products: products
            .filter((product) => product.collection === item.slug)
            .map((product) => ({
              _type: "reference",
              _key: key(product.slug),
              _ref: ids.product(product.slug),
              _weak: true,
            })),
          limit: 14,
          showCheckoutNotice: false,
        },
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: `${item.title} | Swim BASI`,
      metaDescription: item.description,
      includeInSitemap: true,
      sitemapPriority: "0.8",
      sitemapChangeFrequency: "weekly",
      structuredDataType: "CollectionPage",
    },
  }));
  return [...categories, ...collections];
}

export function productDocuments(assetMap) {
  return products.map((product) => {
    const images = product.images.map((image, index) =>
      managedImage(`public${image.src}`, image.alt, assetMap, {
        internalLabel: `${product.name} ${image.view || index + 1}`,
      }),
    );
    return {
      _id: ids.product(product.slug),
      _type: "product",
      name: product.name,
      slug: { _type: "slug", current: product.slug },
      status: "active",
      shortDescription: product.description,
      description: block(product.description, product.slug),
      displayPrice: product.displayPrice,
      primaryImage: images[0],
      gallery: images.map((image, index) => ({
        ...image,
        _key: `image${index + 1}`,
      })),
      color: {
        _type: "productColor",
        name: product.colorName,
        hex: product.colorHex,
      },
      categories: [
        {
          _type: "reference",
          _key: key(product.category),
          _ref: ids.category(product.category),
          _weak: true,
        },
      ],
      collections: [
        {
          _type: "reference",
          _key: key(product.collection),
          _ref: ids.collection(product.collection),
          _weak: true,
        },
      ],
      printfulUrl: product.printfulUrl,
      featured: product.featured,
      newArrival: false,
      displayOrder: product.displayOrder,
      availableSizes: [],
      careInstructions: [],
      seo: {
        _type: "seo",
        metaTitle: `${product.name} | Swim BASI`,
        metaDescription: product.description,
        includeInSitemap: true,
        sitemapPriority: "0.7",
        sitemapChangeFrequency: "weekly",
        structuredDataType: "Product",
      },
    };
  });
}

export function siteSettingsDocuments(assetMap) {
  return [
    {
      _id: "siteSettings",
      _type: "siteSettings",
      siteName: "Swim BASI",
      titleTemplate: "%s | Swim BASI",
      defaultMetaDescription:
        "Bold color and flattering silhouettes from Swim BASI, a women's swimwear brand built for confident entrances.",
      canonicalSiteUrl: "https://swimbasi.com",
      defaultOpenGraphImage: managedImage(
        "public/images/hero/swim-basi-campaign-placeholder.png",
        "Abstract ivory fabric forms with gold, coral, and blue details reflected on water",
        assetMap,
        { loading: "eager" },
      ),
      defaultSocialTitle: "Swim BASI | Confidence Looks Good on You",
      defaultSocialDescription:
        "Swimwear designed for women who embody confidence.",
      defaultNoIndex: false,
      defaultNoFollow: false,
      organizationName: "Swim BASI",
      socialLinks: [
        {
          _type: "socialLink",
          _key: "instagram",
          platform: "Instagram",
          url: "https://instagram.com/swimbasi",
          label: "Follow Swim BASI on Instagram",
        },
      ],
      defaultLocale: "en-US",
      checkoutNotice:
        "Products are presented by Swim BASI and checkout is completed securely through Printful.",
    },
    {
      _id: "announcementBar",
      _type: "announcementBar",
      enabled: true,
      message: "Welcome to Swim BASI — Confidence in Every Color.",
    },
  ];
}

export function navigationDocuments() {
  const item = ([label, destination], index) => ({
    _type: "navigationItem",
    _key: `item${index}`,
    label,
    destination: link(destination),
  });
  return [
    {
      _id: "headerNavigation",
      _type: "headerNavigation",
      items: navigation.header.map(item),
    },
    {
      _id: "footerNavigation",
      _type: "footerNavigation",
      groups: navigation.footer.map((group, groupIndex) => ({
        _type: "footerNavigationGroup",
        _key: `group${groupIndex}`,
        title: group.title,
        items: group.items.map(item),
      })),
    },
  ];
}

export function pageDocuments(assetMap) {
  const hero = managedImage(
    "public/images/hero/swim-basi-campaign-placeholder.png",
    "Abstract ivory fabric forms with gold, coral, and blue details reflected on water",
    assetMap,
    { loading: "eager" },
  );
  const brand = (name, alt, options) =>
    managedImage(
      `public/images/brand/${name}-1400w.webp`,
      alt,
      assetMap,
      options,
    );
  const brandFilmPoster = managedImage(
    "public/videos/campaigns/swim-basi-brand-film-poster.webp",
    "Swim BASI brand film poster",
    assetMap,
    { loading: "eager" },
  );
  const productRefs = products
    .filter((product) => product.featured)
    .map((product) => ({
      _type: "reference",
      _key: key(product.slug),
      _ref: ids.product(product.slug),
      _weak: true,
    }));
  const collectionRefs = taxonomy.map((item) => ({
    _type: "reference",
    _key: key(item.slug),
    _ref: ids.collection(item.slug),
    _weak: true,
  }));
  const homepage = {
    _id: "homepage",
    _type: "homepage",
    internalTitle: "Homepage",
    enabled: true,
    sections: [
      commonSection("videoSection", "brandfilm", "Brand film introduction", {
        theme: "ivory",
        spacing: "standard",
        eyebrow: "THE SWIM BASI FILM",
        heading: "Confidence, in motion.",
        body: "An introduction to the color, presence, and energy behind Swim BASI.",
        variant: "portrait",
        video: {
          _type: "managedVideo",
          internalLabel: "Swim BASI brand film",
          sourceType: "upload",
          uploadedVideo: assetMap[
            "public/videos/campaigns/swim-basi-brand-film.mp4"
          ]?.sanityAssetId
            ? {
                _type: "file",
                asset: {
                  _type: "reference",
                  _ref: assetMap[
                    "public/videos/campaigns/swim-basi-brand-film.mp4"
                  ].sanityAssetId,
                },
              }
            : undefined,
          poster: brandFilmPoster,
          fallbackImage: brand(
            "black-string-bikini-night-portrait",
            "Woman wearing a black string bikini at night",
          ),
          title: "Confidence, in motion.",
          description:
            "The Swim BASI brand film introduces the color, presence, and energy behind the brand.",
          autoplay: false,
          muted: false,
          loop: false,
          controls: true,
          playsInline: true,
          preload: "metadata",
        },
        callToAction: cta("Shop the collection", "/shop"),
      }),
      commonSection("heroSection", "mainhero", "Main campaign hero", {
        spacing: "none",
        eyebrow: "Swim BASI / The color edit",
        heading: "Confidence Looks Good on You.",
        body: "Bold color. Flattering silhouettes. Swimwear made to be seen.",
        media: {
          _type: "responsiveMedia",
          mediaType: "image",
          image: hero,
          fit: "cover",
        },
        primaryCallToAction: cta("Shop Swim BASI", "/shop"),
        secondaryCallToAction: cta(
          "Explore Collections",
          "/collections",
          "secondary",
        ),
        alignment: "left",
        variant: "overlay",
      }),
      commonSection(
        "collectionGridSection",
        "silhouettes",
        "Shop by silhouette",
        {
          eyebrow: "Find your shape",
          heading: "Shop by silhouette",
          body: "Three distinct ways to make your presence known.",
          collections: collectionRefs,
          variant: "cards",
        },
      ),
      commonSection("productGridSection", "colorfocus", "Color in focus", {
        theme: "ivory",
        eyebrow: "The BASI edit",
        heading: "Color in focus",
        body: "A first look at signature Swim BASI silhouettes in colors designed to make an entrance.",
        source: "curated",
        products: productRefs,
        limit: 6,
        showCheckoutNotice: true,
      }),
      commonSection("brandStatementSection", "statement", "Our point of view", {
        theme: "ink",
        spacing: "editorial",
        eyebrow: "Our point of view",
        heading: "Take up space. Wear the color.",
        body: "Swim BASI is made for confident entrances, unforgettable color, and the kind of presence that never needs permission.",
        alignment: "center",
      }),
      commonSection("imageTextSection", "campaign", "Campaign edit", {
        eyebrow: "The campaign edit",
        heading: "Made for the moment",
        body: block(
          "Statement swimwear for poolside confidence, destination color, and every moment made to be remembered.",
          "campaigncopy",
        ),
        media: {
          _type: "responsiveMedia",
          mediaType: "image",
          image: brand(
            "yellow-and-black-string-bikinis-night-walk",
            "Two women wearing yellow and black string bikinis walking at night",
          ),
          fit: "cover",
        },
        layout: "stacked",
      }),
      commonSection(
        "editorialGridSection",
        "instagram",
        "Follow the color story",
        {
          heading: "Follow the color story",
          items: [
            {
              _type: "editorialItem",
              _key: "reddetail",
              internalName: "Red studio detail",
              image: brand(
                "red-string-bikini-studio-detail",
                "Detail of a red string bikini in the studio",
              ),
            },
            {
              _type: "editorialItem",
              _key: "greenstudio",
              internalName: "Forest green studio portrait",
              image: brand(
                "forest-green-string-bikini-studio-portrait",
                "Swim BASI green string-bikini studio portrait",
              ),
            },
            {
              _type: "editorialItem",
              _key: "bluestudio",
              internalName: "Eastern blue poolside",
              image: brand(
                "eastern-blue-string-bikini-poolside-back",
                "Back view of an eastern blue string bikini poolside",
              ),
            },
            {
              _type: "editorialItem",
              _key: "lavenderpool",
              internalName: "Lavender poolside portrait",
              image: brand(
                "lavender-string-bikini-poolside-back",
                "Swim BASI lavender string-bikini poolside portrait",
              ),
            },
          ],
        },
      ),
      commonSection("newsletterSection", "newsletter", "The BASI list", {
        theme: "ivory",
        eyebrow: "The BASI list",
        heading: "Color, confidence, and first access.",
        body: "Be first to hear about new colors, seasonal drops, campaign releases, and Swim BASI updates.",
        emailLabel: "Email address",
        buttonLabel: "Join the list",
      }),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Swim BASI | Confidence Looks Good on You",
      metaDescription:
        "Bold color and flattering silhouettes from Swim BASI. Explore one-piece swimwear, string bikinis, and high-waisted bikinis.",
      includeInSitemap: true,
      sitemapPriority: "1.0",
      sitemapChangeFrequency: "weekly",
      structuredDataType: "WebPage",
    },
  };
  const about = {
    _id: "aboutPage",
    _type: "aboutPage",
    internalTitle: "About Page",
    enabled: true,
    slug: { _type: "slug", current: "about" },
    sections: [
      commonSection("richTextSection", "aboutintro", "About page heading", {
        eyebrow: "Our story",
        heading: "Designed to be seen. Made to be lived in.",
        content: [
          ...block(
            "Swim BASI is swimwear for women who lead with confidence. We pair expressive color, flattering silhouettes, and a clean point of view so every piece feels bold without trying too hard.",
            "aboutintro",
          ),
          ...block(
            "Whether poolside, on vacation, or somewhere in between, Swim BASI is made for the moments when you want to feel completely present in your own skin.",
            "aboutintrosecondary",
          ),
        ],
      }),
      commonSection("imageTextSection", "aboutlead", "Color with intention", {
        heading: "Color with intention.",
        body: [
          ...block(
            "Color is part of the attitude. Every shade is chosen to feel expressive, elevated, and easy to own—from soft tones to saturated statements.",
            "colorintent",
          ),
          ...block(
            "The goal isn't simply to stand out. It's to wear color in a way that feels unmistakably like you.",
            "colorintentsecondary",
          ),
        ],
        media: {
          _type: "responsiveMedia",
          mediaType: "image",
          image: brand(
            "orange-high-waisted-poolside-full-length",
            "Woman wearing an orange high-waisted bikini poolside",
          ),
          fit: "cover",
        },
        layout: "mediaLeft",
      }),
      commonSection("splitMediaSection", "aboutpair", "Brand image pair", {
        leftMedia: {
          _type: "responsiveMedia",
          mediaType: "image",
          image: brand(
            "cotton-candy-high-waisted-studio-detail",
            "Detail of a cotton candy high-waisted bikini in the studio",
            { caption: "Color, considered from every angle." },
          ),
          fit: "cover",
        },
        rightMedia: {
          _type: "responsiveMedia",
          mediaType: "image",
          image: brand(
            "lavender-string-bikini-poolside-back",
            "Back view of a lavender string bikini poolside",
            { caption: "Presence belongs wherever you bring it." },
          ),
          fit: "cover",
        },
      }),
      commonSection(
        "brandStatementSection",
        "aboutpromise",
        "Our point of view",
        {
          eyebrow: "Our point of view",
          heading: "Confidence looks different on everyone.",
          body: "Swim BASI isn't about dressing for permission. It's about choosing the color, silhouette, and energy that make you feel most like yourself. Our collections are built to give women room to be playful, polished, bold, soft—or all of it at once.",
          alignment: "center",
        },
      ),
      commonSection("imageSection", "aboutclosing", "Swim BASI after dark", {
        image: brand(
          "yellow-and-black-string-bikinis-night-walk",
          "Two women wearing yellow and black string bikinis walking at night",
          { caption: "Swim BASI after dark." },
        ),
        width: "wide",
      }),
      commonSection(
        "callToActionSection",
        "aboutcta",
        "Closing shop call to action",
        {
          eyebrow: "Swim BASI",
          heading: "Your confidence is the statement.",
          body: "Find the color and silhouette that feel like you.",
          primaryCallToAction: cta("SHOP THE COLLECTION", "/shop"),
          secondaryCallToAction: cta(
            "EXPLORE COLLECTIONS",
            "/collections",
            "text",
          ),
          alignment: "center",
        },
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "About Swim BASI | Our Story",
      metaDescription:
        "Meet Swim BASI, a women's swimwear brand built around confidence, expressive color, and strong silhouettes.",
      includeInSitemap: true,
      sitemapPriority: "0.7",
      sitemapChangeFrequency: "monthly",
      structuredDataType: "AboutPage",
    },
  };
  const sizeGuide = {
    _id: "sizeGuide",
    _type: "sizeGuide",
    internalTitle: "Size Guide",
    enabled: true,
    slug: { _type: "slug", current: "size-guide" },
    measurementUnit: "inches",
    rows: [],
    measurementInstructions: block(
      "Use a flexible measuring tape and keep it level. Measure bust, natural waist, and the fullest part of your hips.",
      "measure",
    ),
    sections: [
      commonSection("richTextSection", "sizeintro", "Size guide heading", {
        eyebrow: "Fit notes",
        heading: "Size guide",
        content: block(
          "The right fit starts with product-specific measurements. Detailed Swim BASI sizing guidance is being finalized. Until then, review the sizing information on each Printful product page before ordering.",
          "sizeintro",
        ),
      }),
      commonSection("sizeGuideSection", "sizetable", "Measurement guidance", {
        heading: "Measure with care",
        body: "Use a flexible measuring tape and keep it level. Fabric, stretch, and cut can affect fit. Always review the latest product-specific sizing information at Printful before ordering.",
        showMeasurements: true,
        showInstructions: true,
      }),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Swimwear Size Guide | Swim BASI",
      metaDescription:
        "Find Swim BASI fit notes and product-specific sizing guidance before ordering through Printful.",
      includeInSitemap: true,
      sitemapPriority: "0.7",
      sitemapChangeFrequency: "monthly",
      structuredDataType: "WebPage",
    },
  };
  const shop = {
    _id: "shopPage",
    _type: "shopPage",
    internalTitle: "Shop Landing Page",
    enabled: true,
    slug: { _type: "slug", current: "shop" },
    sections: [
      commonSection("richTextSection", "shopintro", "Shop page heading", {
        eyebrow: "The complete color edit",
        heading: "Shop all swimwear",
        content: block(
          "Bold silhouettes organized in a full spectrum of color. Checkout is completed securely through Printful.",
          "shopintro",
        ),
      }),
      commonSection(
        "productGridSection",
        "allproducts",
        "Complete product catalog",
        {
          source: "curated",
          products: products.map((product) => ({
            _type: "reference",
            _key: key(product.slug),
            _ref: ids.product(product.slug),
            _weak: true,
          })),
          heading: "All products",
          limit: 42,
          showCheckoutNotice: true,
        },
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Shop All Swimwear | Swim BASI",
      metaDescription:
        "Explore the complete Swim BASI catalog of one-piece swimwear, string bikinis, and high-waisted bikinis.",
      includeInSitemap: true,
      sitemapPriority: "0.8",
      sitemapChangeFrequency: "weekly",
      structuredDataType: "CollectionPage",
    },
  };
  const collectionsPage = {
    _id: "collectionsPage",
    _type: "collectionsPage",
    internalTitle: "Collections Landing Page",
    enabled: true,
    slug: { _type: "slug", current: "collections" },
    sections: [
      commonSection(
        "richTextSection",
        "collectionsintro",
        "Collections heading",
        {
          eyebrow: "Choose your silhouette",
          heading: "Collections",
          content: block(
            "Find the shape that feels like you—confident, expressive, and made for wherever the day takes you.",
            "collectionsintro",
          ),
        },
      ),
      commonSection(
        "collectionGridSection",
        "collectioncards",
        "Collection cards",
        {
          heading: "Shop by silhouette",
          body: "Three ways to make the water yours.",
          collections: collectionRefs,
          variant: "cards",
        },
      ),
      commonSection(
        "callToActionSection",
        "collectionscta",
        "Closing shop call to action",
        {
          eyebrow: "Swim BASI",
          heading: "Not sure where to start?",
          body: "Explore every style, color, and silhouette in one place.",
          primaryCallToAction: cta("SHOP ALL SWIMWEAR", "/shop"),
          secondaryCallToAction: cta("SIZE GUIDE", "/size-guide", "text"),
          alignment: "center",
        },
      ),
    ],
    seo: {
      _type: "seo",
      metaTitle: "Swimwear Collections | Swim BASI",
      metaDescription:
        "Explore Swim BASI one-piece, string bikini, and high-waisted bikini collections.",
      includeInSitemap: true,
      sitemapPriority: "0.8",
      sitemapChangeFrequency: "weekly",
      structuredDataType: "CollectionPage",
    },
  };
  const brandFilm = {
    _id: ids.brandFilm("swim-basi-brand-film"),
    _type: "brandFilm",
    title: "Swim BASI Brand Film",
    slug: { _type: "slug", current: "swim-basi-brand-film" },
    eyebrow: "THE SWIM BASI FILM",
    heading: "Confidence, in motion.",
    description:
      "An introduction to the color, presence, and energy behind Swim BASI.",
    video: homepage.sections[0].video,
    featured: true,
  };
  return [homepage, about, sizeGuide, shop, collectionsPage, brandFilm];
}
