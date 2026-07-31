import { defineField, defineType } from "sanity";
import { requiredSlug } from "../helpers";

export const brandFilm = defineType({
  name: "brandFilm",
  title: "Brand film",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: requiredSlug,
    }),
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
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "video",
      title: "Managed video",
      type: "managedVideo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "seo", title: "Search and social", type: "seo" }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "heading",
      media: "video.poster.image",
    },
  },
});
