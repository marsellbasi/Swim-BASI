import { defineArrayMember, defineField, defineType } from 'sanity';

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'heroBody',
      title: 'Hero body',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: 'heroMediaType',
      title: 'Hero media type',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Brand film', value: 'video' },
        ],
      },
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'imageWithAlt',
      hidden: ({ parent }) => parent?.heroMediaType !== 'image',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { heroMediaType?: string })?.heroMediaType === 'image' && !value
            ? 'Choose a hero image.'
            : true,
        ),
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero video',
      type: 'reference',
      to: [{ type: 'brandFilm' }],
      hidden: ({ parent }) => parent?.heroMediaType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { heroMediaType?: string })?.heroMediaType === 'video' && !value
            ? 'Choose a brand film.'
            : true,
        ),
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
      name: 'featuredCollections',
      title: 'Featured collections',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'productCollection' }] })],
      validation: (rule) => rule.unique().max(6),
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Featured products',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      validation: (rule) => rule.unique().max(12),
    }),
    defineField({
      name: 'brandFilm',
      title: 'Featured brand film',
      type: 'reference',
      to: [{ type: 'brandFilm' }],
    }),
    defineField({
      name: 'contentSections',
      title: 'Content sections',
      type: 'array',
      of: [defineArrayMember({ type: 'contentSection' })],
      validation: (rule) => rule.max(20),
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', validation: (rule) => rule.required() }),
  ],
  preview: { prepare: () => ({ title: 'Homepage', subtitle: 'Swim BASI storefront homepage' }) },
});
