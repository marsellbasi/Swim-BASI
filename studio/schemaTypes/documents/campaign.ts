import { defineArrayMember, defineField, defineType } from 'sanity';
import { requiredSlug } from '../helpers';
import { pageSectionMembers } from '../objects/pageSections';

export const campaign = defineType({
  name: 'campaign',
  title: 'Campaign',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: requiredSlug,
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'managedImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Ordered page sections',
      type: 'array',
      of: pageSectionMembers,
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related products',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', title: 'Campaign date', type: 'date' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'heroImage.image' } },
});
