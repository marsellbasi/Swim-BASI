import { defineField, defineType } from "sanity";

export const responsiveMedia = defineType({
  name: "responsiveMedia",
  title: "Responsive media",
  type: "object",
  fields: [
    defineField({
      name: "mediaType",
      title: "Media type",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
      },
      initialValue: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "managedImage",
      hidden: ({ parent }) => parent?.mediaType !== "image",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { mediaType?: string })?.mediaType !== "image" ||
          value
            ? true
            : "Choose an image.",
        ),
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "managedVideo",
      hidden: ({ parent }) => parent?.mediaType !== "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { mediaType?: string })?.mediaType !== "video" ||
          value
            ? true
            : "Choose a video.",
        ),
    }),
    defineField({
      name: "fit",
      title: "Media fit",
      type: "string",
      options: {
        list: [
          { title: "Cover", value: "cover" },
          { title: "Contain", value: "contain" },
          { title: "Natural dimensions", value: "natural" },
        ],
      },
      initialValue: "cover",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      mediaType: "mediaType",
      imageTitle: "image.internalLabel",
      videoTitle: "video.internalLabel",
      image: "image.image",
      poster: "video.poster.image",
    },
    prepare: ({ mediaType, imageTitle, videoTitle, image, poster }) => ({
      title:
        mediaType === "video" ? videoTitle || "Video" : imageTitle || "Image",
      subtitle: mediaType === "video" ? "Video" : "Image",
      media: mediaType === "video" ? poster : image,
    }),
  },
});
