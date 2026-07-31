import { defineArrayMember, defineField, defineType } from "sanity";
import { requiredSlug } from "../helpers";
import { pageSectionMembers } from "../objects/pageSections";

export const lookbookEntry = defineType({
  name: "lookbookEntry",
  title: "Lookbook entry",
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
      name: "image",
      title: "Image",
      type: "managedImage",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Editorial caption",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "products",
      title: "Featured products",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (rule) => rule.unique().max(12),
    }),
    defineField({
      name: "campaign",
      title: "Campaign",
      type: "reference",
      to: [{ type: "campaign" }],
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sections",
      title: "Ordered editorial sections",
      type: "array",
      of: pageSectionMembers,
      validation: (rule) => rule.max(20),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", enabled: "enabled", media: "image.image" },
    prepare: ({ title, enabled, media }) => ({
      title,
      subtitle: enabled ? "Enabled" : "Disabled",
      media,
    }),
  },
});
