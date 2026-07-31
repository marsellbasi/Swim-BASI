import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

if (!projectId || !dataset) {
  throw new Error("Missing SANITY_STUDIO_PROJECT_ID or SANITY_STUDIO_DATASET.");
}

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "swim-basi",
  vite: {
    resolve: {
      // The Studio uses no TypeScript path aliases. Keep Vite from walking into the
      // parent Astro project when this standalone workspace is built in isolation.
      tsconfigPaths: false,
    },
  },
});
