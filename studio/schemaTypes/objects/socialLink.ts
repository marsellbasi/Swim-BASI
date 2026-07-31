import { defineField, defineType } from "sanity";
import { requiredExternalUrl } from "../helpers";

export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "url",
      title: "Profile URL",
      type: "url",
      validation: requiredExternalUrl,
    }),
    defineField({
      name: "label",
      title: "Accessible label",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});
