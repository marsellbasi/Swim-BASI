import { defineField, defineType } from 'sanity';

export const navigationItem = defineType({
  name: 'navigationItem',
  title: 'Navigation item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'link',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'children',
      title: 'Child links',
      type: 'array',
      description: 'Optional second-level links. Child links cannot have another level.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'destination',
              title: 'Destination',
              type: 'link',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'label' } },
        },
      ],
      validation: (rule) => rule.max(10),
    }),
  ],
  preview: { select: { title: 'label' } },
});
