function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const desktopMarqueeMq = () => window.matchMedia("(min-width: 901px) and (hover: hover)");

function fullSizeSrc(src) {
  return src.replace(/\/upload\/([^/]+)\//, "/upload/q_auto/f_auto,w_1600/");
}

let marqueeSuppressClick = false;

function waitMarqueeImages(track) {
  const imgs = track.querySelectorAll("img");
  return Promise.all(
    [...imgs].map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) resolve();
          else {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }
        })
    )
  );
}

function initPortfolioMarquee() {
  const marquee = document.querySelector(".marquee--portfolio");
  const track = marquee?.querySelector(".marquee-track");
  const prevBtn = marquee?.querySelector("[data-marquee-prev]");
  const nextBtn = marquee?.querySelector("[data-marquee-next]");
  if (!marquee || !track) return;

  if (prefersReducedMotion()) return;

  let loopLen = 0;
  let offset = 0;
  let velocity = 0;
  let autoSpeed = 0.55;
  let rafId = null;
  let isDragging = false;
  let pointerId = null;
  let lastX = 0;
  let lastTime = 0;
  let dragTotal = 0;
  let hoverPaused = false;
  const desktopMq = desktopMarqueeMq();

  const normalize = () => {
    if (loopLen <= 0) return;
    while (offset <= -loopLen) offset += loopLen;
    while (offset > 0) offset -= loopLen;
  };

  const apply = () => {
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const measure = () => {
    const group = track.querySelector(".marquee-group:not([aria-hidden])");
    if (!group) return false;

    let w = group.scrollWidth || group.getBoundingClientRect().width;
    if (w < 40) {
      w = [...group.querySelectorAll(".marquee-item")].reduce(
        (sum, el) => sum + el.getBoundingClientRect().width,
        0
      );
    }
    if (w < 40) w = track.scrollWidth / 2;
    if (w < 40) return false;

    loopLen = w;
    normalize();
    apply();
    return true;
  };

  const tick = () => {
    const allowAuto = !isDragging && loopLen > 0 && !(hoverPaused && desktopMq.matches);

    if (allowAuto) {
      if (Math.abs(velocity) > 0.08) {
        offset += velocity;
        velocity *= 0.94;
        normalize();
        apply();
      } else {
        velocity = 0;
        offset -= autoSpeed;
        normalize();
        apply();
      }
    }
    rafId = requestAnimationFrame(tick);
  };

  let running = false;

  const enableJsDrive = () => {
    marquee.classList.add("is-js-marquee");
    track.style.animation = "none";
    track.style.webkitAnimation = "none";
  };

  const enableCssFallback = () => {
    running = false;
    marquee.classList.remove("is-js-marquee");
    track.style.animation = "";
    track.style.webkitAnimation = "";
    track.style.transform = "";
    cancelAnimationFrame(rafId);
    rafId = null;
  };

  const boot = () => {
    if (!measure()) return false;
    enableJsDrive();
    if (!running) {
      running = true;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    }
    return true;
  };

  const nudge = (dir) => {
    if (loopLen <= 0 && !measure()) return;
    const step = Math.min(loopLen * 0.28, 380);
    offset += dir * step;
    velocity = 0;
    normalize();
    apply();
  };

  const start = async () => {
    await waitMarqueeImages(track);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    if (boot()) return;

    for (const ms of [120, 400, 900, 2000]) {
      await new Promise((r) => setTimeout(r, ms));
      if (boot()) return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && boot()) io.disconnect();
      },
      { threshold: 0.05, rootMargin: "80px 0px" }
    );
    io.observe(marquee);

    window.addEventListener("load", () => boot(), { once: true });

    setTimeout(() => {
      if (!running && !boot()) enableCssFallback();
    }, 3200);
  };

  let pointerActive = false;
  let startPointerX = 0;

  const onTrackPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest(".marquee-control")) return;
    if (!running) boot();
    if (loopLen <= 0) return;

    pointerActive = true;
    pointerId = e.pointerId;
    startPointerX = e.clientX;
    lastX = e.clientX;
    lastTime = performance.now();
    dragTotal = 0;
    isDragging = false;
    velocity = 0;
  };

  const onTrackPointerMove = (e) => {
    if (!pointerActive || e.pointerId !== pointerId) return;

    const totalDx = e.clientX - startPointerX;
    if (!isDragging && Math.abs(totalDx) > 8) {
      isDragging = true;
      try {
        track.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (!isDragging) return;

    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max(now - lastTime, 1);
    dragTotal += Math.abs(dx);
    offset += dx;
    velocity = (dx / dt) * (1000 / 60);
    lastX = e.clientX;
    lastTime = now;
    normalize();
    apply();
  };

  const onTrackPointerEnd = (e) => {
    if (!pointerActive || e.pointerId !== pointerId) return;
    const pid = pointerId;
    pointerActive = false;
    pointerId = null;

    if (isDragging) {
      try {
        track.releasePointerCapture(pid);
      } catch {
        /* ignore */
      }
      if (dragTotal > 12 && e.pointerType === "touch") marqueeSuppressClick = true;
      velocity *= 0.85;
    }

    isDragging = false;
  };

  track.addEventListener("pointerdown", onTrackPointerDown, { passive: true });
  track.addEventListener("pointermove", onTrackPointerMove, { passive: true });
  track.addEventListener("pointerup", onTrackPointerEnd, { passive: true });
  track.addEventListener("pointercancel", onTrackPointerEnd, { passive: true });

  const setHoverPaused = (paused) => {
    if (!desktopMq.matches) return;
    hoverPaused = paused;
  };

  marquee.addEventListener("mouseenter", () => setHoverPaused(true));
  marquee.addEventListener("mouseleave", () => setHoverPaused(false));

  const onArrow = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!running) boot();
    nudge(dir);
  };

  prevBtn?.addEventListener("click", onArrow(1));
  nextBtn?.addEventListener("click", onArrow(-1));

  window.addEventListener("resize", () => measure());
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
  }

  void start();
}

function initPortfolioMarqueeBoost() {
  const marquee = document.querySelector(".marquee--portfolio");
  const track = marquee?.querySelector(".marquee-track");
  if (!marquee || !track || prefersReducedMotion()) return;

  const mq = desktopMarqueeMq();
  let lastX = null;
  let lastTime = 0;
  let idleTimer = null;

  marquee.addEventListener(
    "mousemove",
    (e) => {
      if (!mq.matches) return;
      const now = performance.now();
      if (lastX !== null) {
        const dt = Math.max(now - lastTime, 16);
        const vx = Math.abs(e.clientX - lastX) / dt;
        if (vx > 0.55) {
          /* reservado para futuro boost visual */
        }
      }
      lastX = e.clientX;
      lastTime = now;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        lastX = null;
      }, 700);
    },
    { passive: true }
  );
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

  const openFromItem = (item) => {
    if (marqueeSuppressClick) {
      marqueeSuppressClick = false;
      return;
    }
    const thumb = item.querySelector("img");
    if (!thumb) return;
    const i = findIndexFromImg(thumb);
    if (i >= 0) open(i);
  };

  group.querySelectorAll(".marquee-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      openFromItem(item);
    });
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
  initPortfolioMarquee();
  initPortfolioMarqueeBoost();
  initPortfolioLightbox();
});
