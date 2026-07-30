import { defineArrayMember, defineField, defineType } from 'sanity';
import { externalUrl } from '../helpers';

export const managedVideo = defineType({
  name: 'managedVideo',
  title: 'Managed video',
  type: 'object',
  fields: [
    defineField({
      name: 'internalLabel',
      title: 'Internal label',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'sourceType',
      title: 'Video source',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Uploaded Sanity file', value: 'upload' },
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
      options: { accept: 'video/mp4,video/webm' },
      hidden: ({ parent }) => parent?.sourceType !== 'upload',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { sourceType?: string })?.sourceType !== 'upload' || value
            ? true
            : 'Upload a video file.',
        ),
    }),
    defineField({
      name: 'externalVideoUrl',
      title: 'External video URL',
      type: 'url',
      hidden: ({ parent }) => parent?.sourceType !== 'external',
      validation: (rule) =>
        externalUrl(rule).custom((value, context) =>
          (context.parent as { sourceType?: string })?.sourceType !== 'external' || value
            ? true
            : 'Enter an external video URL.',
        ),
    }),
    defineField({
      name: 'mobileVideo',
      title: 'Optional mobile video',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      description:
        'Use only when a substantially smaller or differently composed mobile file is necessary.',
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'managedImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Accessible title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'description',
      title: 'Accessible description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'captionsFile',
      title: 'Reviewed captions file',
      type: 'file',
      options: { accept: '.vtt,text/vtt' },
      description: 'Upload reviewed WebVTT captions. Do not upload unreviewed automatic captions.',
    }),
    defineField({
      name: 'transcript',
      title: 'Reviewed transcript',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
      description: 'Leave empty until a human-reviewed transcript is available.',
    }),
    defineField({ name: 'autoplay', title: 'Autoplay', type: 'boolean', initialValue: false }),
    defineField({
      name: 'muted',
      title: 'Muted',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, context) =>
          !(context.parent as { autoplay?: boolean })?.autoplay || value === true
            ? true
            : 'Autoplay video must be muted.',
        ),
    }),
    defineField({ name: 'loop', title: 'Loop', type: 'boolean', initialValue: false }),
    defineField({ name: 'controls', title: 'Show controls', type: 'boolean', initialValue: true }),
    defineField({
      name: 'playsInline',
      title: 'Play inline on mobile',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'preload',
      title: 'Preload strategy',
      type: 'string',
      options: {
        list: [
          { title: 'Metadata (recommended)', value: 'metadata' },
          { title: 'None', value: 'none' },
          { title: 'Auto', value: 'auto' },
        ],
      },
      initialValue: 'metadata',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'internalLabel', subtitle: 'title', media: 'poster.image' },
  },
});
