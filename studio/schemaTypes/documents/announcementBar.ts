import { defineField, defineType } from "sanity";

export const announcementBar = defineType({
  name: "announcementBar",
  title: "Announcement bar",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "string",
      validation: (rule) => rule.required().max(140),
    }),
    defineField({ name: "link", title: "Optional link", type: "link" }),
    defineField({
      name: "linkLabel",
      title: "Link label",
      type: "string",
      validation: (rule) => rule.max(40),
    }),
  ],
  preview: {
    select: { message: "message", enabled: "enabled" },
    prepare: ({ message, enabled }) => ({
      title: "Announcement Bar",
      subtitle: `${enabled ? "Enabled" : "Disabled"} · ${message ?? "No message"}`,
    }),
  },
});
