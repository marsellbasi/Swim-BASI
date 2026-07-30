import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Default site description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [defineArrayMember({ type: 'socialLink' })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'checkoutNotice',
      title: 'External checkout notice',
      type: 'text',
      rows: 3,
      description: 'Explains that checkout and fulfillment are handled by Printful.',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings', subtitle: 'Global storefront defaults' }) },
});
