/* global document, getComputedStyle, innerWidth, innerHeight, location, scrollY, scrollTo, requestAnimationFrame, setTimeout */
// Read-only browser evaluation for the editorial compression audit.
(async () => {
  await document.fonts.ready;
  // Trigger normal lazy loading before judging images or taking a full-page capture.
  for (
    let top = 0;
    top < document.documentElement.scrollHeight;
    top += innerHeight
  ) {
    scrollTo({ top, behavior: "instant" });
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  await Promise.race([
    Promise.all(
      [...document.images]
        .filter((element) => !element.dataset.hoverSrc)
        .map((element) =>
          element.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                element.addEventListener("load", resolve, { once: true });
                element.addEventListener("error", resolve, { once: true });
              }),
        ),
    ),
    new Promise((resolve) => setTimeout(resolve, 8000)),
  ]);
  await Promise.all(
    [...document.images]
      .filter(
        (element) =>
          !element.dataset.hoverSrc && element.complete && element.naturalWidth,
      )
      .map((element) => element.decode().catch(() => {})),
  );
  scrollTo({ top: 0, behavior: "instant" });
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  const box = (element) => {
    const rect = element.getBoundingClientRect();
    const css = getComputedStyle(element);
    return {
      height: Math.round(rect.height),
      width: Math.round(rect.width),
      top: Math.round(rect.top + scrollY),
      paddingTop: css.paddingTop,
      paddingBottom: css.paddingBottom,
      gap: css.gap,
      aspectRatio: css.aspectRatio,
      columns: css.gridTemplateColumns,
    };
  };
  return {
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight },
    height: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    sections: [...document.querySelectorAll("[data-homepage-section]")].map(
      (element) => ({
        key: element.dataset.homepageSection,
        classes: element.className,
        ...box(element),
        content: box(element.firstElementChild),
        media: [
          ...element.querySelectorAll(
            ".film-intro-media, .collection-art, .product-visual, .homepage-campaign-frame, .instagram-tile",
          ),
        ].map(box),
      }),
    ),
    chrome: [
      ...document.querySelectorAll(".announcement, .site-header, .site-footer"),
    ].map((element) => ({ name: element.className, ...box(element) })),
    products: [...document.querySelectorAll(".product-card")].map(
      (element) => ({
        slug: element.dataset.productSlug,
        href: element.querySelector("a").href,
      }),
    ),
    links: [...document.querySelectorAll("a[href]")].map((element) => ({
      text: element.textContent.trim(),
      href: element.getAttribute("href"),
    })),
    video: [...document.querySelectorAll("video")].map((element) => ({
      src: element.querySelector("source")?.src,
      autoplay: element.autoplay,
      muted: element.muted,
      loop: element.loop,
      controls: element.controls,
      playsInline: element.playsInline,
      preload: element.preload,
      videoWidth: element.videoWidth,
      videoHeight: element.videoHeight,
    })),
    images: [...document.images]
      .filter((element) => !element.dataset.hoverSrc)
      .map((element) => ({
        src: element.currentSrc,
        alt: element.alt,
        width: element.getAttribute("width"),
        height: element.getAttribute("height"),
        complete: element.complete,
        naturalWidth: element.naturalWidth,
        fit: getComputedStyle(element).objectFit,
      })),
    overflow: [...document.querySelectorAll("main *, header *, footer *")]
      .filter((element) => {
        const closedDetails = element.closest("details:not([open])");
        if (
          closedDetails &&
          !closedDetails.querySelector("summary")?.contains(element)
        )
          return false;
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1)
        );
      })
      .map((element) => ({ tag: element.tagName, class: element.className })),
  };
})();
