import { defineField, defineType } from "sanity";
import { externalUrl } from "../helpers";

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Internal path", value: "internal" },
          { title: "External URL", value: "external" },
        ],
      },
      initialValue: "internal",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "internalPath",
      title: "Internal path",
      type: "string",
      description: "A storefront path beginning with /, for example /shop.",
      hidden: ({ parent }) => parent?.linkType !== "internal",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (
            (context.parent as { linkType?: string })?.linkType !== "internal"
          )
            return true;
          if (!value) return "An internal path is required.";
          return value.startsWith("/")
            ? true
            : "Internal paths must begin with /.";
        }),
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      hidden: ({ parent }) => parent?.linkType !== "external",
      validation: (rule) =>
        externalUrl(rule).custom((value, context) =>
          (context.parent as { linkType?: string })?.linkType === "external" &&
          !value
            ? "An external URL is required."
            : true,
        ),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
