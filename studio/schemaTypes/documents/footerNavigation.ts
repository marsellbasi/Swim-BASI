import { defineArrayMember, defineField, defineType } from "sanity";

export const footerNavigation = defineType({
  name: "footerNavigation",
  title: "Footer navigation",
  type: "document",
  fields: [
    defineField({
      name: "groups",
      title: "Link groups",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerNavigationGroup",
          title: "Link group",
          fields: [
            defineField({
              name: "title",
              title: "Group title",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "items",
              title: "Links",
              type: "array",
              of: [defineArrayMember({ type: "navigationItem" })],
              validation: (rule) => rule.required().min(1).max(12),
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(6),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Footer Navigation",
      subtitle: "Footer link groups",
    }),
  },
});
