/* global document, getComputedStyle, location, innerWidth */
// Read-only comparison of shared-component layouts outside the homepage.
(async () => {
  await document.fonts.ready;
  const properties = [
    "display",
    "width",
    "height",
    "padding",
    "margin",
    "gap",
    "grid-template-columns",
    "font-size",
    "line-height",
    "object-fit",
    "aspect-ratio",
  ];
  const layout = [...document.querySelectorAll("body *")]
    .filter((element) => !["SCRIPT", "STYLE"].includes(element.tagName))
    .map((element) => {
      const css = getComputedStyle(element);
      return [
        element.tagName,
        element.className,
        ...properties.map((property) => css.getPropertyValue(property)),
      ];
    });
  const serialized = JSON.stringify(layout);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index++) {
    hash = Math.imul(hash ^ serialized.charCodeAt(index), 16777619);
  }
  return {
    path: location.pathname,
    width: innerWidth,
    height: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    elements: layout.length,
    styleHash: (hash >>> 0).toString(16),
  };
})();
