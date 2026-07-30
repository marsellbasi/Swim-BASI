import { defineField, defineType } from 'sanity';
import { requiredSlug } from '../helpers';

export const productCategory = defineType({
  name: 'productCategory',
  title: 'Product category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      validation: requiredSlug,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: 'image', title: 'Category image', type: 'imageWithAlt' }),
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
    select: { title: 'title', enabled: 'enabled', media: 'image.image' },
    prepare: ({ title, enabled, media }) => ({
      title,
      subtitle: enabled ? 'Enabled' : 'Disabled',
      media,
    }),
  },
});
