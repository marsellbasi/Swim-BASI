import { defineArrayMember, defineField, defineType } from "sanity";

export const headerNavigation = defineType({
  name: "headerNavigation",
  title: "Header navigation",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Navigation items",
      type: "array",
      of: [defineArrayMember({ type: "navigationItem" })],
      validation: (rule) => rule.required().min(1).max(10),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Header Navigation",
      subtitle: "Primary storefront navigation",
    }),
  },
});
