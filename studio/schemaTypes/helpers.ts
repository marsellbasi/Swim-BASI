import type { SlugRule, SlugValue, UrlRule } from "sanity";

export const externalUrl = (rule: UrlRule) =>
  rule.uri({
    scheme: ["http", "https"],
    allowRelative: false,
  });

export const requiredExternalUrl = (rule: UrlRule) =>
  externalUrl(rule.required());

export const requiredSlug = (rule: SlugRule) =>
  rule
    .required()
    .custom((value: SlugValue | undefined) =>
      value?.current ? true : "A slug is required.",
    );
