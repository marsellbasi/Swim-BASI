import { defineArrayMember, defineField, defineType } from 'sanity';
import { pageSectionMembers } from '../objects/pageSections';

export const sizeGuide = defineType({
  name: 'sizeGuide',
  title: 'Size guide',
  type: 'document',
  fields: [
    defineField({
      name: 'internalTitle',
      title: 'Internal title',
      type: 'string',
      initialValue: 'Size Guide',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({ name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      initialValue: { current: 'size-guide' },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'measurementUnit',
      title: 'Measurement unit',
      type: 'string',
      options: {
        list: [
          { title: 'Inches', value: 'inches' },
          { title: 'Centimeters', value: 'centimeters' },
        ],
        layout: 'radio',
      },
      initialValue: 'inches',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rows',
      title: 'Structured size rows',
      type: 'array',
      of: [defineArrayMember({ type: 'sizeGuideRow' })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'measurementInstructions',
      title: 'Measurement instructions',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'sizeGuideImage',
      title: 'Optional size-guide image',
      type: 'managedImage',
    }),
    defineField({
      name: 'sections',
      title: 'Ordered page sections',
      type: 'array',
      of: pageSectionMembers,
      validation: (rule) => rule.required().min(1).max(30),
    }),
    defineField({
      name: 'seo',
      title: 'Search and social',
      type: 'seo',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Size Guide', subtitle: 'Fit content and ordered sections' }),
  },
});
