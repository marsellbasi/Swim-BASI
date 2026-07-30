import { defineArrayMember, defineField, defineType } from 'sanity';

export const sizeGuide = defineType({
  name: 'sizeGuide',
  title: 'Size guide',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(400),
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
      title: 'Size rows',
      type: 'array',
      of: [defineArrayMember({ type: 'sizeGuideRow' })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'measurementInstructions',
      title: 'Measurement instructions',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sizeGuideImage',
      title: 'Optional size-guide image',
      type: 'imageWithAlt',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', validation: (rule) => rule.required() }),
  ],
  preview: { prepare: () => ({ title: 'Size Guide', subtitle: 'Measurements and fit guidance' }) },
});
