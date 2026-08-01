const imageProjection = `{
  internalLabel,
  decorative,
  alt,
  caption,
  credit,
  loading,
  link,
  image{..., asset->{_id, url, originalFilename, metadata{dimensions}}},
  mobileImage{..., asset->{_id, url, originalFilename, metadata{dimensions}}}
}`;

const videoProjection = `{
  internalLabel,
  sourceType,
  externalVideoUrl,
  title,
  description,
  autoplay,
  muted,
  loop,
  controls,
  playsInline,
  preload,
  transcript,
  uploadedVideo{asset->{_id, url, originalFilename}},
  mobileVideo{asset->{_id, url, originalFilename}},
  captionsFile{asset->{_id, url, originalFilename}},
  poster${imageProjection},
  fallbackImage${imageProjection}
}`;

const seoProjection = `{
  ...,
  openGraphImage${imageProjection},
  twitterImage${imageProjection}
}`;

const productProjection = `{
  _id,
  name,
  "slug": slug.current,
  measurementUnit,
  rows,
  measurementInstructions,
  sizeGuideImage${imageProjection},
  status,
  shortDescription,
  displayPrice,
  primaryImage${imageProjection},
  gallery[]${imageProjection},
  color,
  categories[]->{title, "slug": slug.current},
  collections[]->{title, "slug": slug.current},
  printfulUrl,
  featured,
  displayOrder
}`;

const sectionProjection = `{
  ...,
  media{
    ...,
    image${imageProjection},
    video${videoProjection}
  },
  image${imageProjection},
  video${videoProjection},
  leftMedia{..., image${imageProjection}, video${videoProjection}},
  rightMedia{..., image${imageProjection}, video${videoProjection}},
  images[]${imageProjection},
  items[]{..., image${imageProjection}},
  "products": select(
    source == "curated" => products[]->${productProjection},
    source == "collection" => collection->products[]->${productProjection},
    source == "featured" => *[_type == "product" && status == "active" && featured == true && !(_id in path("drafts.**"))] | order(displayOrder asc) ${productProjection},
    source == "all" => *[_type == "product" && status == "active" && !(_id in path("drafts.**"))] | order(displayOrder asc) ${productProjection},
    []
  ),
  collection->{_id, title, "slug": slug.current, description, heroImage${imageProjection}},
  collections[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    heroImage${imageProjection},
    products[]->${productProjection}
  },
  campaign->{title, summary, "slug": slug.current, heroImage${imageProjection}}
}`;

export const PAGE_QUERY = `*[_id == $documentId && !(_id in path("drafts.**"))][0]{
  _id,
  _type,
  internalTitle,
  enabled,
  "slug": slug.current,
  sections[]${sectionProjection},
  seo${seoProjection}
}`;

export const SITE_SETTINGS_QUERY = `*[_id == "siteSettings" && !(_id in path("drafts.**"))][0]{
  ...,
  defaultOpenGraphImage${imageProjection},
  organizationLogo${imageProjection}
}`;

export const ANNOUNCEMENT_QUERY = `*[_id == "announcementBar" && !(_id in path("drafts.**"))][0]`;
export const HEADER_NAVIGATION_QUERY = `*[_id == "headerNavigation" && !(_id in path("drafts.**"))][0]{items}`;
export const FOOTER_NAVIGATION_QUERY = `*[_id == "footerNavigation" && !(_id in path("drafts.**"))][0]{groups}`;

export const PRODUCTS_QUERY = `*[_type == "product" && status == "active" && !(_id in path("drafts.**"))] | order(displayOrder asc) ${productProjection}`;

export const COLLECTIONS_QUERY = `*[_type == "productCollection" && enabled == true && !(_id in path("drafts.**"))] | order(displayOrder asc){
  _id,
  title,
  "slug": slug.current,
  description,
  heroImage${imageProjection},
  products[]->${productProjection},
  featured,
  enabled,
  sections[]${sectionProjection},
  seo${seoProjection}
}`;
