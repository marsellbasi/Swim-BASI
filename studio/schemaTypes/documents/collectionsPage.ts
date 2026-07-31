import { defineField, defineType } from "sanity";
import { pageSectionMembers } from "../objects/pageSections";

export const collectionsPage = defineType({
  name: "collectionsPage",
  title: "Collections landing page",
  type: "document",
  fields: [
    defineField({
      name: "internalTitle",
      title: "Internal title",
      type: "string",
      initialValue: "Collections Landing Page",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      initialValue: { current: "collections" },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Ordered page sections",
      type: "array",
      of: pageSectionMembers,
      validation: (rule) => rule.required().min(1).max(30),
    }),
    defineField({
      name: "seo",
      title: "Search and social",
      type: "seo",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Collections Landing Page",
      subtitle: "Collection index page builder",
    }),
  },
});
