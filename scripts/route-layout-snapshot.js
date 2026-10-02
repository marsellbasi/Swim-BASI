/* global document, getComputedStyle, location, innerWidth, scrollY */
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
  const box = (element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y + scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  };
  const footer = document.querySelector(".site-footer");
  const contentLayout = [...document.querySelectorAll("body *")]
    .filter(
      (element) =>
        !element.closest(".site-footer") &&
        !["SCRIPT", "STYLE"].includes(element.tagName),
    )
    .map((element) => {
      const css = getComputedStyle(element);
      return [
        element.tagName,
        element.className,
        box(element),
        ...[
          "display",
          "padding",
          "gap",
          "grid-template-columns",
          "font-size",
          "line-height",
          "object-fit",
          "aspect-ratio",
        ].map((property) => css.getPropertyValue(property)),
      ];
    });
  const contentSerialized = JSON.stringify(contentLayout);
  let contentHash = 2166136261;
  for (let index = 0; index < contentSerialized.length; index++)
    contentHash = Math.imul(
      contentHash ^ contentSerialized.charCodeAt(index),
      16777619,
    );
  return {
    path: location.pathname,
    width: innerWidth,
    height: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    elements: layout.length,
    styleHash: (hash >>> 0).toString(16),
    contentStyleHash: (contentHash >>> 0).toString(16),
    contentHeight: footer ? box(footer).y : null,
    footer: footer
      ? {
          ...box(footer),
          main: box(footer.querySelector(".footer-main")),
          bottom: box(footer.querySelector(".footer-bottom")),
          brand: box(footer.querySelector(".footer-brand")),
          groups: [...footer.querySelectorAll("nav")].map((nav) => ({
            label: nav.getAttribute("aria-label"),
            ...box(nav),
          })),
          links: [...footer.querySelectorAll("a")].map((link) => ({
            text: link.textContent.trim(),
            href: link.getAttribute("href"),
            ...box(link),
          })),
          text: footer.textContent.replace(/\s+/g, " ").trim(),
        }
      : null,
  };
})();
