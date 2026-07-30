import { defineArrayMember, defineField, defineType } from 'sanity';
import { requiredSlug } from '../helpers';

export const productCollection = defineType({
  name: 'productCollection',
  title: 'Collection',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({ name: 'heroImage', title: 'Hero image', type: 'imageWithAlt' }),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      description: 'Order products here when this collection needs a curated sequence.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', enabled: 'enabled', media: 'heroImage.image' },
    prepare: ({ title, enabled, media }) => ({
      title,
      subtitle: enabled ? 'Enabled' : 'Disabled',
      media,
    }),
  },
});
