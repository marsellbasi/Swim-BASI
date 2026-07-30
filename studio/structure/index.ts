import type { StructureResolver, StructureBuilder } from 'sanity/structure';

const singleton = (S: StructureBuilder, title: string, schemaType: string) =>
  S.listItem()
    .title(title)
    .id(schemaType)
    .child(S.document().schemaType(schemaType).documentId(schemaType).title(title));

const collection = (S: StructureBuilder, title: string, schemaType: string) =>
  S.documentTypeListItem(schemaType).title(title);

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Swim BASI')
    .items([
      S.listItem()
        .title('Website')
        .child(
          S.list()
            .title('Website')
            .items([
              singleton(S, 'Site Settings', 'siteSettings'),
              singleton(S, 'Announcement Bar', 'announcementBar'),
              singleton(S, 'Homepage', 'homepage'),
              singleton(S, 'About Page', 'aboutPage'),
              singleton(S, 'Size Guide', 'sizeGuide'),
              singleton(S, 'Shop Landing Page', 'shopPage'),
              singleton(S, 'Collections Landing Page', 'collectionsPage'),
            ]),
        ),
      S.listItem()
        .title('Commerce')
        .child(
          S.list()
            .title('Commerce')
            .items([
              collection(S, 'Products', 'product'),
              collection(S, 'Collections', 'productCollection'),
              collection(S, 'Product Categories', 'productCategory'),
            ]),
        ),
      S.listItem()
        .title('Campaigns')
        .child(
          S.list()
            .title('Campaigns')
            .items([
              collection(S, 'Campaigns', 'campaign'),
              collection(S, 'Brand Films', 'brandFilm'),
              collection(S, 'Lookbook', 'lookbookEntry'),
            ]),
        ),
      S.listItem()
        .title('Navigation')
        .child(
          S.list()
            .title('Navigation')
            .items([
              singleton(S, 'Header Navigation', 'headerNavigation'),
              singleton(S, 'Footer Navigation', 'footerNavigation'),
            ]),
        ),
    ]);
