function initMarquee(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  const clone = group.parentElement?.querySelector(".marquee-group[aria-hidden]");
  if (!clone) return;
  clone.innerHTML = group.innerHTML;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initScrollReveal() {
  if (prefersReducedMotion()) return;

  document.body.classList.add("js-scroll");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );

  const reveal = (el, delay = 0) => {
    if (!el) return;
    el.classList.add("reveal");
    if (delay) el.style.setProperty("--reveal-delay", `${delay}s`);
    observer.observe(el);
  };

  const revealStagger = (parent, selector, step = 0.08) => {
    if (!parent) return;
    parent.querySelectorAll(selector).forEach((el, i) => reveal(el, i * step));
  };

  // Hero — logo ao carregar
  const heroLogo = document.querySelector(".hero-logo");
  if (heroLogo) {
    heroLogo.classList.add("reveal");
    heroLogo.style.setProperty("--reveal-delay", "0.2s");
    requestAnimationFrame(() => heroLogo.classList.add("is-visible"));
  }

  const scrollHint = document.querySelector(".scroll-hint");
  if (scrollHint) {
    scrollHint.classList.add("reveal");
    scrollHint.style.setProperty("--reveal-delay", "0.5s");
    setTimeout(() => scrollHint.classList.add("is-visible"), 400);
  }

  // Intro (manifesto)
  revealStagger(document.querySelector(".intro-inner"), ":scope > *", 0.1);

  // Sobre
  reveal(document.querySelector(".sobre-image"));
  revealStagger(document.querySelector(".sobre-content"), ":scope > *", 0.09);

  // Portfólio e catálogo
  revealStagger(document.querySelector(".portfolio .container"), ":scope > *", 0.08);
  reveal(document.querySelector(".portfolio .container + .container"));
  reveal(document.querySelector(".marquee--portfolio"), 0.1);

  const catalogHeader = document.querySelector(".catalogo .container");
  if (catalogHeader) {
    reveal(catalogHeader.querySelector(".section-title"));
    reveal(catalogHeader.querySelector(".section-lead"), 0.06);
  }
  document.querySelectorAll(".catalog-project").forEach((card, i) => {
    reveal(card, 0.15 + i * 0.1);
  });

  // Agenda
  const agenda = document.querySelector(".agenda .container");
  reveal(agenda?.querySelector(".section-title"));
  revealStagger(agenda, ".agenda-item", 0.1);
  reveal(agenda?.querySelector(".btn"), 0.28);

  // Contato
  revealStagger(document.querySelector(".contact-left"), ":scope > *", 0.1);
  revealStagger(document.querySelector(".contact-right"), ":scope > *", 0.12);

  // Footer
  revealStagger(document.querySelector(".footer"), ":scope > *", 0.07);
}

function initActiveNav() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = document.querySelectorAll(".nav-menu a[href^='#']");
  if (!sections.length || !navLinks.length) return;

  const headerOffset = () =>
    (document.getElementById("header")?.offsetHeight || 72) + 48;

  const sectionToNavId = (id) => (id === "intro" ? "home" : id);

  const applyActive = (sectionId) => {
    const navId = sectionToNavId(sectionId);
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${navId}`);
    });
  };

  const setActiveFromScroll = () => {
    const scrollY = window.scrollY;
    const trigger = scrollY + headerOffset();
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight - 2;

    let currentId = sections[0].id;

    if (scrollY >= maxScroll - 8) {
      currentId = sections[sections.length - 1].id;
    } else {
      for (let i = sections.length - 1; i >= 0; i--) {
        if (trigger >= sections[i].offsetTop) {
          currentId = sections[i].id;
          break;
        }
      }
    }

    applyActive(currentId);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const hash = link.getAttribute("href")?.slice(1);
      if (hash) applyActive(hash);
    });
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (hash && sections.some((s) => s.id === hash)) applyActive(hash);
  });

  setActiveFromScroll();
  window.addEventListener("scroll", setActiveFromScroll, { passive: true });
}

function initParallax() {
  if (prefersReducedMotion()) return;

  const heroVideo = document.querySelector(".hero-video");
  if (!heroVideo) return;

  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const limit = window.innerHeight;

    if (y < limit) {
      heroVideo.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
    } else {
      heroVideo.style.transform = "";
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

initMarquee("portfolioMarqueeGroup");

const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
});

navToggle.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navMenu.classList.toggle("open", !open);
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("open");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initActiveNav();
  initParallax();
});
