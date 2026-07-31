import { defineField, defineType } from "sanity";

export const productColor = defineType({
  name: "productColor",
  title: "Product color",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Color name",
      type: "string",
      validation: (rule) => rule.required().max(50),
    }),
    defineField({
      name: "hex",
      title: "Hex value",
      type: "string",
      description: "Six-digit color value, for example #D4AF37.",
      validation: (rule) =>
        rule
          .required()
          .regex(/^#[0-9A-Fa-f]{6}$/, { name: "hex color", invert: false }),
    }),
  ],
  preview: { select: { title: "name", subtitle: "hex" } },
});
