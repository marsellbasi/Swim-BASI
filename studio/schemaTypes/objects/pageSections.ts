import { defineArrayMember, defineField, defineType } from 'sanity';
import type { ReactNode } from 'react';

const themes = [
  { title: 'White', value: 'white' },
  { title: 'Ivory', value: 'ivory' },
  { title: 'Ink', value: 'ink' },
  { title: 'Brand color', value: 'brand' },
];
const spacings = [
  { title: 'None', value: 'none' },
  { title: 'Compact', value: 'compact' },
  { title: 'Standard', value: 'standard' },
  { title: 'Spacious', value: 'spacious' },
  { title: 'Editorial', value: 'editorial' },
];
const alignments = [
  { title: 'Left', value: 'left' },
  { title: 'Center', value: 'center' },
  { title: 'Right', value: 'right' },
];

const commonFields = () => [
  defineField({
    name: 'internalName',
    title: 'Internal name',
    type: 'string',
    description: 'Editor-facing label used in the page section list.',
    validation: (rule) => rule.required().max(80),
  }),
  defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
  defineField({
    name: 'theme',
    title: 'Theme',
    type: 'string',
    options: { list: themes },
    initialValue: 'white',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'spacing',
    title: 'Vertical spacing',
    type: 'string',
    options: { list: spacings },
    initialValue: 'standard',
    validation: (rule) => rule.required(),
  }),
];

const preview = (type: string, mediaPath?: string) => ({
  select: {
    title: 'internalName',
    enabled: 'enabled',
    ...(mediaPath ? { media: mediaPath } : {}),
  },
  prepare: ({
    title,
    enabled,
    media,
  }: {
    title?: string;
    enabled?: boolean;
    media?: ReactNode;
  }) => ({
    title: `${enabled === false ? 'Disabled · ' : ''}${title || type}`,
    subtitle: type,
    media,
  }),
});

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: 'media',
      title: 'Hero media',
      type: 'responsiveMedia',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryCallToAction',
      title: 'Primary call to action',
      type: 'callToAction',
    }),
    defineField({
      name: 'secondaryCallToAction',
      title: 'Secondary call to action',
      type: 'callToAction',
    }),
    defineField({
      name: 'alignment',
      title: 'Text alignment',
      type: 'string',
      options: { list: alignments },
      initialValue: 'left',
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Overlay', value: 'overlay' },
          { title: 'Split', value: 'split' },
          { title: 'Editorial', value: 'editorial' },
        ],
      },
      initialValue: 'overlay',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: preview('Hero', 'media.image.image'),
});

export const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Rich text',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      options: { list: alignments },
      initialValue: 'left',
    }),
  ],
  preview: preview('Rich text'),
});

export const imageSection = defineType({
  name: 'imageSection',
  title: 'Image',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'heading',
      title: 'Optional heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'managedImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      options: {
        list: [
          { title: 'Contained', value: 'contained' },
          { title: 'Wide', value: 'wide' },
          { title: 'Full viewport', value: 'full' },
        ],
      },
      initialValue: 'contained',
    }),
  ],
  preview: preview('Image', 'image.image'),
});

export const imageTextSection = defineType({
  name: 'imageTextSection',
  title: 'Media and text',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'responsiveMedia',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'callToAction', title: 'Call to action', type: 'callToAction' }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Media left', value: 'mediaLeft' },
          { title: 'Media right', value: 'mediaRight' },
          { title: 'Stacked', value: 'stacked' },
        ],
      },
      initialValue: 'mediaLeft',
    }),
  ],
  preview: preview('Media and text', 'media.image.image'),
});

export const videoSection = defineType({
  name: 'videoSection',
  title: 'Video',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'managedVideo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Landscape', value: 'landscape' },
          { title: 'Portrait with copy', value: 'portrait' },
          { title: 'Full width', value: 'full' },
        ],
      },
      initialValue: 'landscape',
    }),
    defineField({ name: 'callToAction', title: 'Call to action', type: 'callToAction' }),
  ],
  preview: preview('Video', 'video.poster.image'),
});

export const fullWidthMediaSection = defineType({
  name: 'fullWidthMediaSection',
  title: 'Full-width media',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'responsiveMedia',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Overlay heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'body',
      title: 'Overlay copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: 'callToAction', title: 'Call to action', type: 'callToAction' }),
    defineField({
      name: 'alignment',
      title: 'Overlay alignment',
      type: 'string',
      options: { list: alignments },
      initialValue: 'left',
    }),
  ],
  preview: preview('Full-width media', 'media.image.image'),
});

export const splitMediaSection = defineType({
  name: 'splitMediaSection',
  title: 'Split media',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'heading',
      title: 'Optional heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'leftMedia',
      title: 'Left media',
      type: 'responsiveMedia',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rightMedia',
      title: 'Right media',
      type: 'responsiveMedia',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: preview('Split media', 'leftMedia.image.image'),
});

export const productGridSection = defineType({
  name: 'productGridSection',
  title: 'Product grid',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'source',
      title: 'Product source',
      type: 'string',
      options: {
        list: [
          { title: 'Curated products', value: 'curated' },
          { title: 'Collection', value: 'collection' },
          { title: 'Featured products', value: 'featured' },
          { title: 'All active products', value: 'all' },
        ],
      },
      initialValue: 'curated',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'products',
      title: 'Curated products',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      hidden: ({ parent }) => parent?.source !== 'curated',
      validation: (rule) => rule.unique().max(24),
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'productCollection' }],
      hidden: ({ parent }) => parent?.source !== 'collection',
    }),
    defineField({
      name: 'limit',
      title: 'Maximum products',
      type: 'number',
      initialValue: 6,
      validation: (rule) => rule.required().integer().min(1).max(42),
    }),
    defineField({
      name: 'showCheckoutNotice',
      title: 'Show Printful checkout notice',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: preview('Product grid'),
});

export const collectionGridSection = defineType({
  name: 'collectionGridSection',
  title: 'Collection grid',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'collections',
      title: 'Collections',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'productCollection' }] })],
      validation: (rule) => rule.required().min(1).max(8).unique(),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Cards', value: 'cards' },
          { title: 'Editorial', value: 'editorial' },
        ],
      },
      initialValue: 'cards',
    }),
  ],
  preview: preview('Collection grid'),
});

export const campaignSection = defineType({
  name: 'campaignSection',
  title: 'Campaign feature',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'campaign',
      title: 'Campaign',
      type: 'reference',
      to: [{ type: 'campaign' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headingOverride',
      title: 'Optional heading override',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({ name: 'callToAction', title: 'Call to action', type: 'callToAction' }),
  ],
  preview: preview('Campaign feature'),
});

export const imageGallerySection = defineType({
  name: 'imageGallerySection',
  title: 'Image gallery / lookbook',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({ type: 'managedImage' })],
      validation: (rule) => rule.required().min(1).max(24),
    }),
    defineField({
      name: 'variant',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'Editorial masonry', value: 'editorial' },
          { title: 'Horizontal gallery', value: 'horizontal' },
        ],
      },
      initialValue: 'grid',
    }),
  ],
  preview: preview('Image gallery', 'images.0.image'),
});

export const editorialGridSection = defineType({
  name: 'editorialGridSection',
  title: 'Editorial grid',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'items',
      title: 'Editorial items',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'editorialItem',
          title: 'Editorial item',
          type: 'object',
          fields: [
            defineField({
              name: 'internalName',
              title: 'Internal name',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'managedImage',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (rule) => rule.max(100),
            }),
            defineField({
              name: 'copy',
              title: 'Copy',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(240),
            }),
            defineField({ name: 'callToAction', title: 'Call to action', type: 'callToAction' }),
          ],
          preview: { select: { title: 'internalName', subtitle: 'heading', media: 'image.image' } },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(12),
    }),
  ],
  preview: preview('Editorial grid', 'items.0.image.image'),
});

export const callToActionSection = defineType({
  name: 'callToActionSection',
  title: 'Call to action',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'primaryCallToAction',
      title: 'Primary call to action',
      type: 'callToAction',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryCallToAction',
      title: 'Secondary call to action',
      type: 'callToAction',
    }),
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      options: { list: alignments },
      initialValue: 'center',
    }),
  ],
  preview: preview('Call to action'),
});

export const newsletterSection = defineType({
  name: 'newsletterSection',
  title: 'Newsletter',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'emailLabel',
      title: 'Email field label',
      type: 'string',
      initialValue: 'Email address',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button label',
      type: 'string',
      initialValue: 'Join the list',
      validation: (rule) => rule.required().max(40),
    }),
  ],
  preview: preview('Newsletter'),
});

export const brandStatementSection = defineType({
  name: 'brandStatementSection',
  title: 'Brand statement',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heading',
      title: 'Statement',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      options: { list: alignments },
      initialValue: 'center',
    }),
  ],
  preview: preview('Brand statement'),
});

export const sizeGuideSection = defineType({
  name: 'sizeGuideSection',
  title: 'Size guide',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: 'showMeasurements',
      title: 'Show structured measurement table',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showInstructions',
      title: 'Show measurement instructions',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: preview('Size guide'),
});

export const spacerSection = defineType({
  name: 'spacerSection',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'internalName',
      title: 'Internal name',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
    defineField({
      name: 'spacing',
      title: 'Height',
      type: 'string',
      options: { list: spacings.filter((item) => item.value !== 'none') },
      initialValue: 'standard',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: preview('Spacer'),
});

export const dividerSection = defineType({
  name: 'dividerSection',
  title: 'Divider',
  type: 'object',
  fields: [
    ...commonFields(),
    defineField({
      name: 'style',
      title: 'Divider style',
      type: 'string',
      options: {
        list: [
          { title: 'Thin line', value: 'line' },
          { title: 'Brand mark', value: 'mark' },
          { title: 'Color rule', value: 'color' },
        ],
      },
      initialValue: 'line',
    }),
    defineField({
      name: 'accessibleLabel',
      title: 'Accessible label',
      type: 'string',
      description: 'Optional label when the divider communicates a meaningful transition.',
      validation: (rule) => rule.max(100),
    }),
  ],
  preview: preview('Divider'),
});

export const pageSectionTypes = [
  heroSection,
  richTextSection,
  imageSection,
  imageTextSection,
  videoSection,
  fullWidthMediaSection,
  splitMediaSection,
  productGridSection,
  collectionGridSection,
  campaignSection,
  imageGallerySection,
  editorialGridSection,
  callToActionSection,
  newsletterSection,
  brandStatementSection,
  sizeGuideSection,
  spacerSection,
  dividerSection,
];

export const pageSectionMembers = [
  defineArrayMember({ type: 'heroSection' }),
  defineArrayMember({ type: 'richTextSection' }),
  defineArrayMember({ type: 'imageSection' }),
  defineArrayMember({ type: 'imageTextSection' }),
  defineArrayMember({ type: 'videoSection' }),
  defineArrayMember({ type: 'fullWidthMediaSection' }),
  defineArrayMember({ type: 'splitMediaSection' }),
  defineArrayMember({ type: 'productGridSection' }),
  defineArrayMember({ type: 'collectionGridSection' }),
  defineArrayMember({ type: 'campaignSection' }),
  defineArrayMember({ type: 'imageGallerySection' }),
  defineArrayMember({ type: 'editorialGridSection' }),
  defineArrayMember({ type: 'callToActionSection' }),
  defineArrayMember({ type: 'newsletterSection' }),
  defineArrayMember({ type: 'brandStatementSection' }),
  defineArrayMember({ type: 'sizeGuideSection' }),
  defineArrayMember({ type: 'spacerSection' }),
  defineArrayMember({ type: 'dividerSection' }),
];
