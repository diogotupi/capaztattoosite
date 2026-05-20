function initCatalogLightbox() {
  const lightbox = document.getElementById("catalogLightbox");
  if (!lightbox) return;

  const img = lightbox.querySelector(".lightbox-img");
  const titleEl = lightbox.querySelector(".lightbox-title");
  const metaEl = lightbox.querySelector(".lightbox-meta");
  const triggers = document.querySelectorAll(".catalog-project-trigger");
  const closeEls = lightbox.querySelectorAll("[data-lightbox-close]");

  const lang = () => window.CapazI18n?.getStoredLang() || "pt";
  const minLabel = () =>
    window.CapazI18n?.translations[lang()]?.["catalog.min"] || "mínimo";
  const priceLabel = () =>
    window.CapazI18n?.translations[lang()]?.["catalog.price"] || "preço";

  let lastFocus = null;

  const open = (trigger) => {
    lastFocus = document.activeElement;
    const src = trigger.dataset.src;
    const title = trigger.dataset.title;
    const min = trigger.dataset.min || "";
    const price = trigger.dataset.price || "";

    img.src = src;
    img.alt = title;
    titleEl.textContent = title;
    metaEl.textContent = `${minLabel()} ${min} · ${priceLabel()} ${price}`;

    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close")?.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    img.src = "";
    lastFocus?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => open(trigger));
  });

  closeEls.forEach((el) => el.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (!lightbox.hidden && e.key === "Escape") close();
  });
}

document.addEventListener("DOMContentLoaded", initCatalogLightbox);
