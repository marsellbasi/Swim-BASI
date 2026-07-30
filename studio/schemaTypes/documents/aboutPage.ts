import { defineArrayMember, defineField, defineType } from 'sanity';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  fields: [
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
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'imageWithAlt',
      validation: (rule) => rule.required(),
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
  preview: {
    prepare: () => ({ title: 'About Page', subtitle: 'Brand story and editorial content' }),
  },
});
