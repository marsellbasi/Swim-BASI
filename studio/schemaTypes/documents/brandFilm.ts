import { defineField, defineType } from 'sanity';
import { externalUrl, requiredSlug } from '../helpers';

export const brandFilm = defineType({
  name: 'brandFilm',
  title: 'Brand film',
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
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'videoSourceType',
      title: 'Video source',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Uploaded video', value: 'upload' },
          { title: 'External video URL', value: 'external' },
        ],
      },
      initialValue: 'upload',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'uploadedVideo',
      title: 'Uploaded video',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.videoSourceType !== 'upload',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { videoSourceType?: string })?.videoSourceType === 'upload' && !value
            ? 'Upload a video or choose an external source.'
            : true,
        ),
    }),
    defineField({
      name: 'externalVideoUrl',
      title: 'External video URL',
      type: 'url',
      hidden: ({ parent }) => parent?.videoSourceType !== 'external',
      validation: (rule) =>
        externalUrl(rule).custom((value, context) =>
          (context.parent as { videoSourceType?: string })?.videoSourceType === 'external' && !value
            ? 'Enter a video URL or choose an uploaded source.'
            : true,
        ),
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster image',
      type: 'imageWithAlt',
      description: 'Shown before playback and while the video loads.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'captionFile',
      title: 'Caption file',
      type: 'file',
      description: 'Optional reviewed WebVTT captions.',
      options: { accept: '.vtt,text/vtt' },
    }),
    defineField({ name: 'autoplay', title: 'Autoplay', type: 'boolean', initialValue: false }),
    defineField({ name: 'muted', title: 'Muted', type: 'boolean', initialValue: false }),
    defineField({ name: 'loop', title: 'Loop', type: 'boolean', initialValue: false }),
    defineField({ name: 'controls', title: 'Show controls', type: 'boolean', initialValue: true }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: { select: { title: 'title', subtitle: 'heading', media: 'posterImage.image' } },
});
