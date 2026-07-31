import { defineField, defineType } from "sanity";

export const sizeGuideRow = defineType({
  name: "sizeGuideRow",
  title: "Size row",
  type: "object",
  fields: [
    defineField({
      name: "sizeName",
      title: "Size name",
      type: "string",
      validation: (rule) => rule.required().max(20),
    }),
    defineField({
      name: "bust",
      title: "Bust",
      type: "string",
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "waist",
      title: "Waist",
      type: "string",
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "hips",
      title: "Hips",
      type: "string",
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: { title: "sizeName", bust: "bust", waist: "waist", hips: "hips" },
    prepare: ({ title, bust, waist, hips }) => ({
      title,
      subtitle: `Bust ${bust} · Waist ${waist} · Hips ${hips}`,
    }),
  },
});
