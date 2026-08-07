import { defineArrayMember, defineField, defineType } from "sanity";
import { pageSectionMembers } from "../objects/pageSections";

export const sizeGuide = defineType({
  name: "sizeGuide",
  title: "Size guide",
  type: "document",
  fields: [
    defineField({
      name: "internalTitle",
      title: "Internal title",
      type: "string",
      initialValue: "Size Guide",
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
      initialValue: { current: "size-guide" },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "measurementUnit",
      title: "Measurement unit",
      type: "string",
      options: {
        list: [
          { title: "Inches", value: "inches" },
          { title: "Centimeters", value: "centimeters" },
        ],
        layout: "radio",
      },
      initialValue: "inches",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rows",
      title: "Structured size rows",
      type: "array",
      of: [defineArrayMember({ type: "sizeGuideRow" })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "measurementInstructions",
      title: "Measurement instructions",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "intro",
      title: "Page introduction",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "body",
          title: "Supporting copy",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(400),
        }),
        defineField({
          name: "secondaryBody",
          title: "Secondary copy",
          type: "text",
          rows: 3,
          validation: (rule) => rule.max(400),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "measurementGuide",
      title: "How to measure",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "intro",
          title: "Introduction",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(400),
        }),
        defineField({
          name: "cards",
          title: "Measurement cards",
          type: "array",
          of: [
            defineArrayMember({
              name: "measurementCard",
              title: "Measurement card",
              type: "object",
              fields: [
                defineField({
                  name: "heading",
                  title: "Measurement",
                  type: "string",
                  validation: (rule) => rule.required().max(40),
                }),
                defineField({
                  name: "body",
                  title: "Instructions",
                  type: "text",
                  rows: 3,
                  validation: (rule) => rule.required().max(300),
                }),
              ],
            }),
          ],
          validation: (rule) => rule.required().length(3),
        }),
        defineField({
          name: "note",
          title: "Measurement note",
          type: "string",
          validation: (rule) => rule.max(240),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "silhouetteGuide",
      title: "Fit by silhouette",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "items",
          title: "Silhouette fit panels",
          type: "array",
          of: [
            defineArrayMember({
              name: "silhouetteFit",
              title: "Silhouette fit",
              type: "object",
              fields: [
                defineField({
                  name: "collection",
                  title: "Collection",
                  type: "reference",
                  to: [{ type: "productCollection" }],
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "body",
                  title: "Fit overview",
                  type: "text",
                  rows: 4,
                  validation: (rule) => rule.required().max(500),
                }),
                defineField({
                  name: "fitNote",
                  title: "Fit note",
                  type: "text",
                  rows: 3,
                  validation: (rule) => rule.required().max(400),
                }),
                defineField({
                  name: "callToActionLabel",
                  title: "Shopping link label",
                  type: "string",
                  validation: (rule) => rule.required().max(60),
                }),
              ],
            }),
          ],
          validation: (rule) => rule.required().length(3),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "beforeOrder",
      title: "Before you order",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "body",
          title: "Guidance",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(500),
        }),
        defineField({
          name: "secondaryBody",
          title: "Checkout note",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(400),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "closingCallToAction",
      title: "Closing call to action",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "primaryCallToAction",
          title: "Primary call to action",
          type: "callToAction",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "secondaryCallToAction",
          title: "Secondary call to action",
          type: "callToAction",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sizeGuideImage",
      title: "Optional size-guide image",
      type: "managedImage",
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
      title: "Size Guide",
      subtitle: "Fit content and ordered sections",
    }),
  },
});
