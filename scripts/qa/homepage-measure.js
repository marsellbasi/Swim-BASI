/* global document, window, getComputedStyle */
// Run inside agent-browser eval after scrolling through the page to load lazy media.
(async () => {
  await document.fonts.ready;
  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return {
      x: Math.round(box.x),
      y: Math.round(box.y + window.scrollY),
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
  };
  const sections = [
    ...document.querySelectorAll("[data-homepage-section]"),
  ].map((element) => {
    const content = element.firstElementChild;
    const style = getComputedStyle(content);
    return {
      key: element.dataset.homepageSection,
      ...rect(element),
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      media: [
        ...element.querySelectorAll(
          ".film-intro-media, .collection-art, .product-visual, .homepage-campaign-frame, .instagram-tile",
        ),
      ].map(rect),
    };
  });
  const images = [...document.querySelectorAll("img[src]")].map((img) => ({
    alt: img.alt,
    loaded: img.complete && img.naturalWidth > 0,
    dimensions: Boolean(
      img.getAttribute("width") && img.getAttribute("height"),
    ),
    source: img.currentSrc || img.src,
    fit: getComputedStyle(img).objectFit,
  }));
  const video = document.querySelector("video");
  const shop = document.querySelector(".shop-page");
  const cards = [...document.querySelectorAll(".product-card")];
  const productBoxes = cards.map((card) => ({
    slug: card.dataset.productSlug,
    ...rect(card),
    media: rect(card.querySelector(".product-visual")),
    name: card.querySelector("h3").textContent.trim(),
    category: card.querySelector(".product-category").textContent.trim(),
    price: card.querySelector(".price").textContent.trim(),
    href: card.querySelector("a").href,
    cta: rect(card.querySelector(".product-cta")),
  }));
  return {
    url: window.location.href,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    documentHeight: document.documentElement.scrollHeight,
    documentWidth: document.documentElement.scrollWidth,
    layoutShiftScore: window.__homepageLayoutShiftScore ?? null,
    sections,
    shop: shop
      ? {
          sections: [
            ["intro", ".shop-intro"],
            ["categoryNavigation", ".shop-category-nav"],
            ["catalogHeading", ".shop-catalog__header"],
            ["productGrid", ".product-grid"],
            ["disclosure", ".checkout-notice"],
            ["footer", ".site-footer"],
            ["header", ".site-header"],
            ["announcement", ".announcement"],
          ].map(([key, selector]) => {
            const element = document.querySelector(selector);
            return { key, ...(element ? rect(element) : { height: 0 }) };
          }),
          columns: getComputedStyle(
            document.querySelector(".product-grid"),
          ).gridTemplateColumns.split(" ").length,
          products: productBoxes,
          firstProductTop: productBoxes[0]?.y,
          imagesVisibleFirstViewport: productBoxes.filter(
            (card) => card.media.y < window.innerHeight,
          ).length,
          cardsFullyVisibleFirstViewport: productBoxes.filter(
            (card) => card.y + card.height <= window.innerHeight,
          ).length,
          imagesVisibleTwoViewports: productBoxes.filter(
            (card) => card.media.y < window.innerHeight * 2,
          ).length,
          cardsFullyVisibleTwoViewports: productBoxes.filter(
            (card) => card.y + card.height <= window.innerHeight * 2,
          ).length,
          seo: {
            title: document.title,
            description: document.querySelector('meta[name="description"]')
              ?.content,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            jsonLd: [
              ...document.querySelectorAll(
                'script[type="application/ld+json"]',
              ),
            ].map((script) => JSON.parse(script.textContent)),
          },
        }
      : null,
    headingOrder: [...document.querySelectorAll("main h1, main h2")].map(
      (e) => ({ tag: e.tagName, text: e.textContent.trim() }),
    ),
    images,
    links: [...document.querySelectorAll("a")].map((e) => ({
      text: e.textContent.trim(),
      href: e.getAttribute("href"),
    })),
    overflow: [...document.querySelectorAll("body *")]
      .filter((e) => {
        // Closed navigation descendants are not visible or interactive.
        if (e.closest("details:not([open])") && !e.closest("summary"))
          return false;
        const box = e.getBoundingClientRect();
        return (
          box.width > 0 &&
          getComputedStyle(e).position !== "fixed" &&
          (box.left < -1 || box.right > window.innerWidth + 1)
        );
      })
      .map((e) => ({ tag: e.tagName, class: e.className, ...rect(e) })),
    video: video
      ? {
          source: video.currentSrc,
          readyState: video.readyState,
          error: video.error?.message || null,
          intrinsicWidth: video.videoWidth,
          intrinsicHeight: video.videoHeight,
          autoplay: video.autoplay,
          muted: video.muted,
          loop: video.loop,
          controls: video.controls,
          playsInline: video.playsInline,
          preload: video.preload,
        }
      : null,
  };
})();
