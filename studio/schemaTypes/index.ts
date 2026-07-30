import { seo } from './objects/seo';
import { link } from './objects/link';
import { callToAction } from './objects/callToAction';
import { imageWithAlt } from './objects/imageWithAlt';
import { productColor } from './objects/productColor';
import { sizeGuideRow } from './objects/sizeGuideRow';
import { navigationItem } from './objects/navigationItem';
import { socialLink } from './objects/socialLink';
import { contentSection } from './objects/contentSection';
import { managedImage } from './objects/managedImage';
import { managedVideo } from './objects/managedVideo';
import { responsiveMedia } from './objects/responsiveMedia';
import { pageSectionTypes } from './objects/pageSections';
import { siteSettings } from './documents/siteSettings';
import { announcementBar } from './documents/announcementBar';
import { homepage } from './documents/homepage';
import { aboutPage } from './documents/aboutPage';
import { sizeGuide } from './documents/sizeGuide';
import { headerNavigation } from './documents/headerNavigation';
import { footerNavigation } from './documents/footerNavigation';
import { product } from './documents/product';
import { productCollection } from './documents/productCollection';
import { productCategory } from './documents/productCategory';
import { campaign } from './documents/campaign';
import { brandFilm } from './documents/brandFilm';
import { lookbookEntry } from './documents/lookbookEntry';
import { shopPage } from './documents/shopPage';
import { collectionsPage } from './documents/collectionsPage';

export const schemaTypes = [
  seo,
  link,
  callToAction,
  imageWithAlt,
  productColor,
  sizeGuideRow,
  navigationItem,
  socialLink,
  contentSection,
  managedImage,
  managedVideo,
  responsiveMedia,
  ...pageSectionTypes,
  siteSettings,
  announcementBar,
  homepage,
  aboutPage,
  sizeGuide,
  headerNavigation,
  footerNavigation,
  product,
  productCollection,
  productCategory,
  campaign,
  brandFilm,
  lookbookEntry,
  shopPage,
  collectionsPage,
];
