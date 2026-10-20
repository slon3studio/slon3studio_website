// slon3studio — shared behaviour for every page

const STUDIO_EMAIL = "slon3studio@gmail.com";

// Footer year
document.querySelectorAll("#year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Mobile menu
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  const closeMenu = () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  // Close after picking a link (matters for #anchors on the same page) or on Escape
  siteNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// Fade sections in as they scroll into view
const revealed = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealed.forEach((el) => observer.observe(el));
} else {
  revealed.forEach((el) => el.classList.add("visible"));
}

// Project request form ("Build my app"): opens the visitor's email app with the message filled in
document.querySelectorAll("form.project-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const picked = [...form.querySelectorAll('.pick-chip[aria-pressed="true"]')].map((c) => c.textContent);
    const name = data.get("name").trim();
    const subject = `New app project: ${data.get("type")} (from ${name})`;
    const body = [
      `Name: ${name}`,
      `Email: ${data.get("email")}`,
      `Project type: ${data.get("type")}`,
      `Budget: ${data.get("budget") || "Not sure yet"}`,
      `Features: ${picked.length ? picked.join(", ") : "Not sure yet"}`,
      "",
      data.get("message"),
    ].join("\n");

    window.location.href =
      `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  });
});

// Screenshot galleries: arrow buttons on hover (desktop), swipe on phones, tap a shot to open it large
const galleries = [...document.querySelectorAll(".shots")];

const makeArrow = (dir) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `gallery-btn ${dir}`;
  b.setAttribute("aria-label", dir === "prev" ? "Previous screenshots" : "Next screenshots");
  b.innerHTML = dir === "prev" ? "&#8592;" : "&#8594;";
  return b;
};

galleries.forEach((list) => {
  const wrap = document.createElement("div");
  wrap.className = "gallery";
  list.parentNode.insertBefore(wrap, list);
  wrap.appendChild(list);

  const prev = makeArrow("prev");
  const next = makeArrow("next");
  wrap.append(prev, next);

  const step = () => list.clientWidth * 0.8;
  prev.addEventListener("click", () => list.scrollBy({ left: -step() }));
  next.addEventListener("click", () => list.scrollBy({ left: step() }));

  const update = () => {
    const max = list.scrollWidth - list.clientWidth - 2;
    prev.disabled = list.scrollLeft <= 2;
    next.disabled = list.scrollLeft >= max;
  };
  list.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  const imgs = [...list.querySelectorAll("img")];
  imgs.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Enlarge screenshot: ${img.alt}`);
    img.addEventListener("click", () => openLightbox(imgs, i, img));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(imgs, i, img);
      }
    });
  });
});

let lightbox;

function buildLightbox() {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Screenshot viewer");
  box.innerHTML = `
    <div class="lightbox-top"><span class="lightbox-count"></span><button type="button" class="lightbox-close" aria-label="Close">&times;</button></div>
    <div class="lightbox-stage">
      <button type="button" class="gallery-btn prev" aria-label="Previous screenshot">&#8592;</button>
      <img alt="" />
      <button type="button" class="gallery-btn next" aria-label="Next screenshot">&#8594;</button>
    </div>
    <p class="lightbox-caption"></p>`;
  document.body.appendChild(box);

  const state = { imgs: [], index: 0, opener: null };
  const img = box.querySelector(".lightbox-stage img");
  const prev = box.querySelector(".prev");
  const next = box.querySelector(".next");

  const show = (i) => {
    state.index = Math.max(0, Math.min(i, state.imgs.length - 1));
    const src = state.imgs[state.index];
    img.style.animation = "none";
    img.offsetHeight; // restart the fade for each picture
    img.style.animation = "";
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    box.querySelector(".lightbox-caption").textContent = src.alt;
    box.querySelector(".lightbox-count").textContent = `${state.index + 1} / ${state.imgs.length}`;
    prev.disabled = state.index === 0;
    next.disabled = state.index === state.imgs.length - 1;
  };

  const close = () => {
    box.classList.remove("open");
    document.body.classList.remove("no-scroll");
    setTimeout(() => (box.hidden = true), 200);
    // Keep the strip in step with the last picture viewed
    state.imgs[state.index].scrollIntoView({ block: "nearest", inline: "nearest" });
    if (state.opener) state.opener.focus({ preventScroll: true });
  };

  prev.addEventListener("click", () => show(state.index - 1));
  next.addEventListener("click", () => show(state.index + 1));
  box.querySelector(".lightbox-close").addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box || e.target.classList.contains("lightbox-stage")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(state.index - 1);
    else if (e.key === "ArrowRight") show(state.index + 1);
    else if (e.key === "Tab") {
      // Keep focus inside the viewer
      const focusable = [...box.querySelectorAll("button:not(:disabled)")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Swipe left or right on phones
  let startX = null;
  const stage = box.querySelector(".lightbox-stage");
  stage.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(state.index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  return {
    open(imgs, index, opener) {
      Object.assign(state, { imgs, opener });
      show(index);
      box.hidden = false;
      document.body.classList.add("no-scroll");
      requestAnimationFrame(() => box.classList.add("open"));
      box.querySelector(".lightbox-close").focus({ preventScroll: true });
    },
  };
}

function openLightbox(imgs, index, opener) {
  lightbox = lightbox || buildLightbox();
  lightbox.open(imgs, index, opener);
}

// Apps page: filter by status or platform
const filterBar = document.querySelector(".filter-bar");

if (filterBar) {
  const cards = [...document.querySelectorAll(".app-grid .app-card")];
  const empty = document.querySelector(".filter-empty");

  filterBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    filterBar.querySelectorAll(".filter-chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    const f = chip.dataset.filter;
    let shown = 0;
    cards.forEach((card) => {
      const isApp = card.dataset.status !== undefined;
      const match =
        f === "all" ||
        (isApp && (card.dataset.status === f || card.dataset.platform.split(" ").includes(f)));
      card.classList.toggle("is-hidden", !match);
      if (match && isApp) shown++;
    });
    if (empty) empty.hidden = shown > 0 || f === "all";
  });
}

// Project form: tap features to include them in the request
document.querySelectorAll(".pick-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
  });
});

// The elephant says hello. Tap it a few times for a surprise.
const heroArt = document.querySelector(".hero-art");

if (heroArt) {
  const lines = [
    "Toot toot!",
    "Hi! I'm Slon.",
    "Slon means elephant in Slovenian.",
    "Got an app idea?",
    "I never forget a feature.",
    "Built with SwiftUI and peanuts.",
    "Keep going...",
  ];
  let taps = 0;
  heroArt.tabIndex = 0;
  heroArt.setAttribute("role", "button");
  heroArt.setAttribute("aria-label", "Say hi to the slon3studio elephant");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const peanutRain = () => {
    if (reduceMotion) return;
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("span");
      p.className = "peanut";
      p.textContent = "🥜";
      p.style.left = `${Math.random() * 100}vw`;
      p.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
      p.style.animationDelay = `${Math.random() * 0.6}s`;
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  };

  const boop = () => {
    taps++;
    heroArt.classList.remove("boop");
    void heroArt.offsetWidth;
    heroArt.classList.add("boop");

    heroArt.querySelector(".elephant-bubble")?.remove();
    const bubble = document.createElement("span");
    bubble.className = "elephant-bubble";
    bubble.setAttribute("role", "status");
    bubble.textContent = taps % 8 === 0 ? "Peanut party!" : lines[(taps - 1) % lines.length];
    heroArt.appendChild(bubble);
    bubble.addEventListener("animationend", () => bubble.remove());

    if (taps % 8 === 0) peanutRain();
  };

  heroArt.addEventListener("click", boop);
  heroArt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      boop();
    }
  });
}
