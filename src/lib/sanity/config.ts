export const SANITY_API_VERSION = "2026-07-30";
export const SANITY_PROJECT_ID =
  import.meta.env.PUBLIC_SANITY_PROJECT_ID || "xcfqfknc";
export const SANITY_DATASET =
  import.meta.env.PUBLIC_SANITY_DATASET || "production";
export const SANITY_CONTENT_ENABLED =
  import.meta.env.PUBLIC_SANITY_CONTENT_ENABLED?.toLowerCase() === "true";

export const SANITY_EXPECTED_PRODUCT_COUNT = 42;
