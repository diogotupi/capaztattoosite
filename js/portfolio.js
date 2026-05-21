function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const mobileMarqueeMq = () =>
  window.matchMedia("(max-width: 900px), (pointer: coarse)");

function fullSizeSrc(src) {
  return src.replace(/\/upload\/([^/]+)\//, "/upload/q_auto/f_auto,w_1600/");
}

let marqueeSuppressClick = false;

function initPortfolioMarqueeTouch() {
  const marquee = document.querySelector(".marquee--portfolio");
  const track = marquee?.querySelector(".marquee-track");
  if (!marquee || !track) return;

  /* Celular: só animação CSS (fiável no iPhone 13 e com “Reduzir movimento”). */
  const ensureCssMarquee = () => {
    track.classList.remove("is-touch-scroll");
    track.style.transform = "";
    marquee.classList.remove("is-touch-drive", "is-marquee-css-only");
  };

  ensureCssMarquee();
  mobileMarqueeMq().addEventListener("change", ensureCssMarquee);
}

function initPortfolioMarqueeBoost() {
  const marquee = document.querySelector(".marquee--portfolio");
  const track = marquee?.querySelector(".marquee-track");
  if (!marquee || !track || prefersReducedMotion()) return;

  const mq = mobileMarqueeMq();
  let lastX = null;
  let lastTime = 0;
  let idleTimer = null;

  const setBoost = (on) => {
    if (mq.matches) return;
    track.classList.toggle("is-marquee-boost", on);
  };

  marquee.addEventListener(
    "mousemove",
    (e) => {
      if (mq.matches) return;
      const now = performance.now();
      if (lastX !== null) {
        const dt = Math.max(now - lastTime, 16);
        const vx = Math.abs(e.clientX - lastX) / dt;
        if (vx > 0.55) setBoost(true);
      }
      lastX = e.clientX;
      lastTime = now;

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setBoost(false), 700);
    },
    { passive: true }
  );

  marquee.addEventListener("mouseleave", () => {
    lastX = null;
    clearTimeout(idleTimer);
    setBoost(false);
  });
}

function initPortfolioLightbox() {
  const lightbox = document.getElementById("portfolioLightbox");
  const group = document.getElementById("portfolioMarqueeGroup");
  const marquee = document.querySelector(".marquee--portfolio");
  if (!lightbox || !group) return;

  const img = lightbox.querySelector(".lightbox-img--portfolio");
  const viewport = document.getElementById("portfolioLightboxViewport");
  const counter = document.getElementById("portfolioLightboxCounter");
  const closeEls = lightbox.querySelectorAll("[data-portfolio-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-portfolio-prev]");
  const nextBtn = lightbox.querySelector("[data-portfolio-next]");

  const slides = [...group.querySelectorAll(".marquee-item img")].map((el) => ({
    thumb: el.getAttribute("src") || el.src,
    full: fullSizeSrc(el.getAttribute("src") || el.src),
    alt: el.getAttribute("alt") || "",
  }));

  if (!slides.length) return;

  const preloadCache = new Map();

  const preload = (i) => {
    const src = slides[i].full;
    if (preloadCache.has(src)) return preloadCache.get(src);
    const promise = new Promise((resolve) => {
      const el = new Image();
      el.onload = () => resolve();
      el.onerror = () => resolve();
      el.src = src;
    });
    preloadCache.set(src, promise);
    return promise;
  };

  slides.forEach((_, i) => preload(i));

  let index = 0;
  let lastFocus = null;
  let isOpen = false;
  let isAnimating = false;

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragX = 0;
  let dragY = 0;
  let isDragging = false;
  let suppressClick = false;

  const updateCounter = () => {
    if (!counter) return;
    counter.textContent = `${index + 1} / ${slides.length}`;
  };

  const clearMotionStyles = () => {
    img.classList.remove("is-dragging", "is-fading");
    img.style.transform = "";
    img.style.opacity = "";
  };

  const setImage = (i) => {
    const slide = slides[i];
    img.src = slide.full;
    img.alt = slide.alt;
    updateCounter();
  };

  const go = async (delta, { skipFade = false } = {}) => {
    const next = (index + delta + slides.length) % slides.length;
    if (isAnimating || next === index) return;

    isAnimating = true;
    clearMotionStyles();

    await preload(next);

    if (!skipFade && !prefersReducedMotion()) {
      img.classList.add("is-fading");
      await new Promise((r) => setTimeout(r, 140));
    }

    index = next;
    setImage(index);

    if (!skipFade && !prefersReducedMotion()) {
      img.classList.remove("is-fading");
    }

    isAnimating = false;
    preload((index + 1) % slides.length);
    preload((index - 1 + slides.length) % slides.length);
  };

  const open = async (startIndex) => {
    lastFocus = document.activeElement;
    index = startIndex;
    clearMotionStyles();
    isAnimating = true;
    await preload(index);
    setImage(index);
    isAnimating = false;
    isOpen = true;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close")?.focus();
    preload((index + 1) % slides.length);
    preload((index - 1 + slides.length) % slides.length);
  };

  const close = () => {
    isOpen = false;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    clearMotionStyles();
    img.removeAttribute("src");
    lastFocus?.focus();
  };

  const findIndexFromImg = (targetImg) => {
    const src = targetImg.getAttribute("src") || targetImg.src;
    return slides.findIndex((s) => s.thumb === src || s.full === src);
  };

  marquee?.addEventListener("click", (e) => {
    if (suppressClick || marqueeSuppressClick) {
      suppressClick = false;
      marqueeSuppressClick = false;
      return;
    }
    const item = e.target.closest(".marquee-item");
    if (!item) return;
    const thumb = item.querySelector("img");
    if (!thumb) return;
    const i = findIndexFromImg(thumb);
    if (i >= 0) open(i);
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    go(-1);
  });

  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    go(1);
  });

  closeEls.forEach((el) => el.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    pointerId = null;
    viewport?.classList.remove("is-dragging");
    img.classList.remove("is-dragging");

    const threshold = Math.min(80, window.innerWidth * 0.14);
    if (Math.abs(dragX) > 12) suppressClick = true;

    if (Math.abs(dragX) > threshold && Math.abs(dragX) > Math.abs(dragY)) {
      clearMotionStyles();
      go(dragX < 0 ? 1 : -1, { skipFade: true });
    } else {
      clearMotionStyles();
    }

    dragX = 0;
    dragY = 0;
  };

  viewport?.addEventListener(
    "pointerdown",
    (e) => {
      if (!isOpen || isAnimating || e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      dragX = 0;
      dragY = 0;
      isDragging = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
      img.classList.add("is-dragging");
    },
    { passive: true }
  );

  viewport?.addEventListener(
    "pointermove",
    (e) => {
      if (!isDragging || e.pointerId !== pointerId) return;
      dragX = e.clientX - startX;
      dragY = e.clientY - startY;
      if (Math.abs(dragY) > Math.abs(dragX) && Math.abs(dragX) < 12) return;
      img.style.transform = `translateX(${dragX}px)`;
      img.style.opacity = String(Math.max(0.4, 1 - Math.abs(dragX) / 360));
    },
    { passive: true }
  );

  viewport?.addEventListener("pointerup", endDrag);
  viewport?.addEventListener("pointercancel", endDrag);
}

document.addEventListener("DOMContentLoaded", () => {
  initPortfolioMarqueeTouch();
  initPortfolioMarqueeBoost();
  initPortfolioLightbox();
});
