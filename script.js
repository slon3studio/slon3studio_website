// slon3studio — shared behaviour for every page

const STUDIO_EMAIL = "slon3studio@gmail.com";

// Formspree form IDs. Create two forms on formspree.io (one for project requests, one for the
// newsletter) and paste each ID here, e.g. "xyzabcde" from https://formspree.io/f/xyzabcde.
// While an ID is empty, that form falls back to opening the visitor's email app.
const FORMSPREE = {
  project: "",
  newsletter: "",
};

const LANG = document.documentElement.lang === "sl" ? "sl" : "en";
const T = {
  en: {
    noteSend: "Your request comes straight to our inbox. We'll reply by email.",
    sending: "Sending...",
    sentProject: "Thanks! Your request is on its way. We'll reply by email soon.",
    sentNews: "You're on the list. Thanks for subscribing!",
    failed: "Something went wrong and the message wasn't sent.",
    tryMail: "Email us instead",
    notSure: "Not sure yet",
    subscribeSubject: "Newsletter: please subscribe me",
    subscribeBody: "Please add this address to the slon3studio newsletter:",
  },
  sl: {
    noteSend: "Povpraševanje pride naravnost v naš nabiralnik. Odgovorimo ti po e-pošti.",
    sending: "Pošiljam ...",
    sentProject: "Hvala! Povpraševanje je poslano. Kmalu ti odgovorimo po e-pošti.",
    sentNews: "Prijavljen si. Hvala!",
    failed: "Nekaj je šlo narobe in sporočilo ni bilo poslano.",
    tryMail: "Piši nam po e-pošti",
    notSure: "Še ne vem",
    subscribeSubject: "E-novice: prijava",
    subscribeBody: "Prosim, dodajte ta naslov na seznam e-novic slon3studio:",
  },
}[LANG];

const mailtoLink = (subject, body) =>
  `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

async function sendToFormspree(id, payload) {
  const res = await fetch(`https://formspree.io/f/${id}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Formspree ${res.status}`);
}

function showStatus(form, text, isError, mailHref) {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.hidden = false;
  status.classList.toggle("is-error", Boolean(isError));
  status.textContent = text;
  if (mailHref) {
    const a = document.createElement("a");
    a.href = mailHref;
    a.textContent = T.tryMail;
    status.append(" ", a);
  }
}

// Footer year
document.querySelectorAll("#year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Links have no .html (GitHub Pages adds it). A local preview server or a
// double-clicked file does not, so put it back there.
if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (/^[a-z]+:|^#|^\/\//i.test(href)) return;
    const [pathQuery, hash] = href.split("#");
    const [path, query] = pathQuery.split("?");
    if (!path || /\.[a-z0-9]+$/i.test(path)) return;
    // A local server opens a folder's index.html itself, a plain file does not
    if (path.endsWith("/") && location.protocol !== "file:") return;
    const file = path.endsWith("/") ? path + "index.html" : path + ".html";
    a.setAttribute("href", file + (query !== undefined ? "?" + query : "") + (hash !== undefined ? "#" + hash : ""));
  });
}

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

// Project request form ("Build my app"): sent with Formspree, or opens the email app until an ID is set
document.querySelectorAll("form.project-form").forEach((form) => {
  const note = form.querySelector(".form-note");
  // A package link (services?package=website) picks that package in the form
  const wanted = new URLSearchParams(location.search).get("package");
  const packageSelect = form.querySelector('select[name="package"]');
  if (wanted && packageSelect && packageSelect.querySelector(`option[value="${CSS.escape(wanted)}"]`)) packageSelect.value = wanted;
  if (FORMSPREE.project && note) note.textContent = T.noteSend;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (data.get("_gotcha")) return; // a bot filled the hidden field
    const picked = [...form.querySelectorAll('.pick-chip[aria-pressed="true"]')].map((c) => c.textContent);
    const name = data.get("name").trim();
    const subject = `New app project: ${data.get("type")} (from ${name})`;
    const fields = {
      name,
      email: data.get("email"),
      type: data.get("type"),
      package: packageSelect && packageSelect.value ? packageSelect.selectedOptions[0].textContent : T.notSure,
      budget: data.get("budget") || T.notSure,
      features: picked.length ? picked.join(", ") : T.notSure,
      message: data.get("message"),
    };
    const body = [
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Project type: ${fields.type}`,
      `Package: ${fields.package}`,
      `Budget: ${fields.budget}`,
      `Features: ${fields.features}`,
      "",
      fields.message,
    ].join("\n");

    if (!FORMSPREE.project) {
      window.location.href = mailtoLink(subject, body);
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.setAttribute("aria-busy", "true");
    showStatus(form, T.sending);
    try {
      await sendToFormspree(FORMSPREE.project, { ...fields, _subject: subject, language: LANG });
      form.reset();
      form.querySelectorAll(".pick-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      showStatus(form, T.sentProject);
    } catch {
      showStatus(form, T.failed, true, mailtoLink(subject, body));
    } finally {
      button.removeAttribute("aria-busy");
    }
  });
});

// Newsletter sign-up: Formspree, or an email to the studio until an ID is set
document.querySelectorAll("form.newsletter-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (data.get("_gotcha")) return;
    const email = data.get("email").trim();
    const mail = mailtoLink(T.subscribeSubject, `${T.subscribeBody} ${email}`);

    if (!FORMSPREE.newsletter) {
      window.location.href = mail;
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.setAttribute("aria-busy", "true");
    showStatus(form, T.sending);
    try {
      await sendToFormspree(FORMSPREE.newsletter, { email, _subject: "Newsletter sign-up", language: LANG, page: location.pathname });
      form.reset();
      showStatus(form, T.sentNews);
    } catch {
      showStatus(form, T.failed, true, mail);
    } finally {
      button.removeAttribute("aria-busy");
    }
  });
});

// App Store rating: the page ships with the last known numbers, then refreshes them from Apple
document.querySelectorAll(".rating-summary[data-app-id]").forEach((box, i) => {
  const cb = `slonRating${i}`;
  const script = document.createElement("script");
  const done = () => {
    delete window[cb];
    script.remove();
  };
  window[cb] = (data) => {
    const r = data && data.results && data.results[0];
    if (r && r.userRatingCount > 0) {
      const avg = Math.round(r.averageUserRating * 10) / 10;
      const n = r.userRatingCount;
      const score = avg.toFixed(1);
      box.querySelector(".rating-score").textContent = LANG === "sl" ? score.replace(".", ",") : score;
      const stars = box.querySelector(".stars");
      stars.style.setProperty("--rating", avg);
      stars.setAttribute("aria-label", LANG === "sl" ? `${score.replace(".", ",")} od 5 zvezdic` : `${score} out of 5 stars`);
      let word;
      if (LANG === "sl") {
        const m = n % 100;
        word = m === 1 ? "ocena" : m === 2 ? "oceni" : m === 3 || m === 4 ? "ocene" : "ocen";
        box.querySelector(".rating-count").textContent = `${n} ${word} v App Storu`;
      } else {
        box.querySelector(".rating-count").textContent = `${n} rating${n === 1 ? "" : "s"} on the App Store`;
      }
      box.classList.remove("is-empty");
    }
    done();
  };
  script.src = `https://itunes.apple.com/lookup?id=${encodeURIComponent(box.dataset.appId)}&country=si&callback=${cb}`;
  script.onerror = done;
  document.head.appendChild(script);
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
const filterBar = document.querySelector('.filter-bar[data-filter-for="apps"]');

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

// News page: filter posts by app. A link like news#Rotera opens with that app picked.
const newsFilter = document.querySelector('.filter-bar[data-filter-for="news"]');

if (newsFilter) {
  const posts = [...document.querySelectorAll(".post[data-app]")];
  const apply = (f) => {
    newsFilter.querySelectorAll(".filter-chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === f)));
    posts.forEach((p) => {
      const show = f === "all" || p.dataset.app === f;
      p.classList.toggle("is-hidden", !show);
      if (show) p.classList.add("visible");
    });
  };
  newsFilter.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    apply(chip.dataset.filter);
    history.replaceState(null, "", chip.dataset.filter === "all" ? location.pathname : `#${chip.dataset.filter}`);
  });
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (newsFilter.querySelector(`[data-filter="${CSS.escape(fromHash)}"]`)) apply(fromHash);
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
  const lines = LANG === "sl" ? [
    "Tuuut!",
    "Živjo! Jaz sem Slon.",
    "Slon je po angleško elephant.",
    "Imaš idejo za aplikacijo?",
    "Nobene funkcije ne pozabim.",
    "Narejeno s SwiftUI in arašidi.",
    "Kar daj naprej ...",
  ] : [
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
  heroArt.setAttribute("aria-label", LANG === "sl" ? "Pozdravi slona slon3studio" : "Say hi to the slon3studio elephant");
  const hint = heroArt.querySelector(".tap-hint");
  if (hint && window.matchMedia("(hover: hover)").matches) hint.textContent = LANG === "sl" ? "Klikni me!" : "Click me!";

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
    heroArt.classList.add("tapped");
    heroArt.classList.remove("boop");
    void heroArt.offsetWidth;
    heroArt.classList.add("boop");

    heroArt.querySelector(".elephant-bubble")?.remove();
    const bubble = document.createElement("span");
    bubble.className = "elephant-bubble";
    bubble.setAttribute("role", "status");
    bubble.textContent = taps % 8 === 0 ? (LANG === "sl" ? "Arašidova zabava!" : "Peanut party!") : lines[(taps - 1) % lines.length];
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
