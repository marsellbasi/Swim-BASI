import { defineArrayMember, defineField, defineType } from 'sanity';
import { requiredExternalUrl } from '../helpers';

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
      name: 'titleTemplate',
      title: 'Title template',
      type: 'string',
      description: 'Use %s where the page title should appear, for example “%s | Swim BASI”.',
      validation: (rule) =>
        rule
          .required()
          .max(80)
          .custom((value) => (value?.includes('%s') ? true : 'Include %s for the page title.')),
    }),
    defineField({
      name: 'defaultMetaDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().min(70).max(170),
    }),
    defineField({
      name: 'canonicalSiteUrl',
      title: 'Canonical site URL',
      type: 'url',
      validation: requiredExternalUrl,
    }),
    defineField({
      name: 'defaultOpenGraphImage',
      title: 'Default Open Graph image',
      type: 'managedImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultSocialTitle',
      title: 'Default social title',
      type: 'string',
      validation: (rule) => rule.required().max(95),
    }),
    defineField({
      name: 'defaultSocialDescription',
      title: 'Default social description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'defaultNoIndex',
      title: 'Default noindex',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'defaultNoFollow',
      title: 'Default nofollow',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'organizationName',
      title: 'Organization / brand name',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({ name: 'organizationLogo', title: 'Organization logo', type: 'managedImage' }),
    defineField({
      name: 'socialLinks',
      title: 'Social profiles',
      type: 'array',
      of: [defineArrayMember({ type: 'socialLink' })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'defaultLocale',
      title: 'Default locale',
      type: 'string',
      initialValue: 'en-US',
      validation: (rule) => rule.required().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
    }),
    defineField({
      name: 'checkoutNotice',
      title: 'External checkout notice',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings', subtitle: 'Global brand and SEO defaults' }),
  },
});
