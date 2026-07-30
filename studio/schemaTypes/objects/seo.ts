import { defineField, defineType } from 'sanity';
import { externalUrl } from '../helpers';

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Search-result title. Aim for 50–60 characters.',
      validation: (rule) =>
        rule.max(60).warning('Search engines may truncate titles over 60 characters.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Short search-result summary. Aim for 120–160 characters.',
      validation: (rule) =>
        rule.max(160).warning('Search engines may truncate descriptions over 160 characters.'),
    }),
    defineField({
      name: 'socialImage',
      title: 'Social sharing image',
      type: 'imageWithAlt',
      description: 'Use a landscape image suitable for social previews.',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL override',
      type: 'url',
      description: 'Usually leave blank. Use only when this content’s canonical URL is elsewhere.',
      validation: externalUrl,
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
