import { defineField, defineType } from "sanity";

export const managedImage = defineType({
  name: "managedImage",
  title: "Managed image",
  type: "object",
  fields: [
    defineField({
      name: "internalLabel",
      title: "Internal label",
      type: "string",
      description:
        "Helps editors identify this image. It is not shown on the website.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "image",
      title: "Desktop image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mobileImage",
      title: "Optional mobile image",
      type: "image",
      description:
        "Only use a separate mobile crop when the desktop hotspot cannot produce a good result.",
      options: { hotspot: true },
    }),
    defineField({
      name: "decorative",
      title: "Decorative image",
      type: "boolean",
      description:
        "Enable only when the image adds no information. Decorative images receive an empty alt attribute.",
      initialValue: false,
    }),
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description:
        "Describe the purpose of the image without starting with “image of”.",
      hidden: ({ parent }) => parent?.decorative === true,
      validation: (rule) =>
        rule
          .max(180)
          .custom((value, context) =>
            (context.parent as { decorative?: boolean })?.decorative ||
            value?.trim()
              ? true
              : "Alternative text is required unless the image is decorative.",
          ),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "credit",
      title: "Credit",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({ name: "link", title: "Optional link", type: "link" }),
    defineField({
      name: "loading",
      title: "Loading priority",
      type: "string",
      options: {
        list: [
          { title: "Lazy (default)", value: "lazy" },
          { title: "Eager / above the fold", value: "eager" },
        ],
        layout: "radio",
      },
      initialValue: "lazy",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "internalLabel",
      alt: "alt",
      decorative: "decorative",
      media: "image",
    },
    prepare: ({ title, alt, decorative, media }) => ({
      title: title || alt || "Managed image",
      subtitle: decorative ? "Decorative" : alt || "Alt text required",
      media,
    }),
  },
});
