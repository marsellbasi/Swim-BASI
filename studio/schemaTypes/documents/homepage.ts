import { defineField, defineType } from "sanity";
import { pageSectionMembers } from "../objects/pageSections";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "internalTitle",
      title: "Internal title",
      type: "string",
      initialValue: "Homepage",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sections",
      title: "Ordered page sections",
      type: "array",
      description:
        "Drag sections by their handles to set the exact storefront order. Disabled sections remain saved but are not rendered.",
      of: pageSectionMembers,
      validation: (rule) => rule.required().min(1).max(40),
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
      title: "Homepage",
      subtitle: "Ordered page-builder content",
    }),
  },
});
