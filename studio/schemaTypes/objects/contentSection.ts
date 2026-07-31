import { defineArrayMember, defineField, defineType } from "sanity";

export const contentSection = defineType({
  name: "contentSection",
  title: "Content section",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "image", title: "Image", type: "imageWithAlt" }),
    defineField({
      name: "callToAction",
      title: "Call to action",
      type: "callToAction",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Text only", value: "text" },
          { title: "Image left", value: "imageLeft" },
          { title: "Image right", value: "imageRight" },
          { title: "Full width", value: "fullWidth" },
        ],
      },
      initialValue: "text",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow", media: "image.image" },
  },
});
