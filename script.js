// slon3studio — shared behaviour for every page

const STUDIO_EMAIL = "slon3studio@gmail.com";

// Formspree form IDs. Create two forms on formspree.io (one for project requests, one for the
// newsletter) and paste each ID here, e.g. "xyzabcde" from https://formspree.io/f/xyzabcde.
// While an ID is empty, that form falls back to opening the visitor's email app.
const FORMSPREE = {
  project: "xrpqqvjq",
  newsletter: "myewwaov",
};

const LANG = document.documentElement.lang === "sl" ? "sl" : "en";

// Promotion for ad campaigns. Set active to true and every package price shows the old price
// crossed out, the discounted price and a badge. Set it back to false to end the offer.
// The discounted prices themselves (data-promo) are set per package on the pages.
const PROMO = {
  active: true,
  percent: 50,
  until: "2026-12-31", // last day of the offer; after it the normal prices show again by themselves
};

const promoOn = PROMO.active && (!PROMO.until || new Date() <= new Date(`${PROMO.until}T23:59:59`));

if (promoOn) {
  const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, LANG === "sl" ? "." : ",");
  const fmt = (n) => (LANG === "sl" ? `${group(n)} €` : `€${group(n)}`);
  const cut = (n) => Math.round((n * (100 - PROMO.percent)) / 100);
  const badge = `−${PROMO.percent} %`;

  document.querySelectorAll(".amount[data-price]").forEach((el) => {
    const full = Number(el.dataset.price);
    const now = el.dataset.promo ? Number(el.dataset.promo) : cut(full);
    el.innerHTML = `<s>${fmt(full)}</s> ${fmt(now)}`;
    const card = el.closest(".package, .plan-summary, .care-plan, .other-plan, .band-plan");
    if (card && !card.querySelector(".promo-badge")) {
      card.classList.add("is-promo");
      const b = document.createElement("span");
      b.className = "promo-badge";
      b.textContent = badge;
      card.prepend(b);
    }
  });
  document.querySelectorAll("option[data-price]").forEach((o) => {
    o.textContent = `${o.dataset.name} (${LANG === "sl" ? "od" : "from"} ${fmt(o.dataset.promo ? Number(o.dataset.promo) : cut(Number(o.dataset.price)))}, ${badge})`;
  });
  const hero = document.querySelector(".packages, .plan-summary") && document.querySelector(".page-hero .container");
  if (hero) {
    const note = document.createElement("p");
    note.className = "promo-note";
    note.textContent = (() => {
      const [y, m, d] = (PROMO.until || "").split("-").map(Number);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const monthsSl = ["januarja", "februarja", "marca", "aprila", "maja", "junija", "julija", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
      if (LANG === "sl") return `Akcija: ${PROMO.percent} % popusta na izdelavo spletnih strani in aplikacij${y ? ` do ${d}. ${monthsSl[m - 1]} ${y}` : ""}.`;
      return `Special offer: ${PROMO.percent}% off every website and app build${y ? ` until ${d} ${months[m - 1]} ${y}` : ""}.`;
    })();
    hero.appendChild(note);
  }
}
// Home: the promo pill above the headline shows only while the offer runs
if (promoOn) document.querySelectorAll(".promo-kicker").forEach((el) => (el.hidden = false));

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

// Count a form sent as an event in GoatCounter (cookie-free statistics), if it has loaded
const countEvent = (path, title) => {
  if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path, title, event: true });
};

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

// Quote request form ("Get a quote"): sent with Formspree, or opens the email app until an ID is set
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
    const chosen = packageSelect && packageSelect.value ? packageSelect.selectedOptions[0].textContent : T.notSure;
    const subject = `Quote request: ${chosen} (from ${name})`;
    const fields = {
      name,
      email: data.get("email"),
      package: chosen,
      budget: data.get("budget") || T.notSure,
      timeline: data.get("timeline") || T.notSure,
      company: data.get("company") || "-",
      features: picked.length ? picked.join(", ") : T.notSure,
      message: data.get("message"),
    };
    const body = [
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Business or website: ${fields.company}`,
      `Needs: ${fields.package}`,
      `Budget: ${fields.budget}`,
      `Timeline: ${fields.timeline}`,
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
      countEvent(`quote-sent-${fields.package}`.replace(/[^a-z0-9-]+/gi, "-").toLowerCase(), "Quote request sent");
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
      countEvent("newsletter-signup", "Newsletter sign-up");
    } catch {
      showStatus(form, T.failed, true, mail);
    } finally {
      button.removeAttribute("aria-busy");
    }
  });
});

// App Store rating: the page ships with the last known numbers, then refreshes them from Apple.
// Apple's lookup API allows cross-origin requests, so this is a plain fetch (no third-party script).
document.querySelectorAll(".rating-summary[data-app-id]").forEach(async (box) => {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${encodeURIComponent(box.dataset.appId)}&country=si`, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!res.ok) return;
    const data = await res.json();
    const r = data && data.results && data.results[0];
    if (!r || !(r.userRatingCount > 0)) return;
    const avg = Math.round(r.averageUserRating * 10) / 10;
    const n = r.userRatingCount;
    const score = avg.toFixed(1);
    box.querySelector(".rating-score").textContent = LANG === "sl" ? score.replace(".", ",") : score;
    const stars = box.querySelector(".stars");
    stars.style.setProperty("--rating", avg);
    stars.setAttribute("aria-label", LANG === "sl" ? `${score.replace(".", ",")} od 5 zvezdic` : `${score} out of 5 stars`);
    if (LANG === "sl") {
      const m = n % 100;
      const word = m === 1 ? "ocena" : m === 2 ? "oceni" : m === 3 || m === 4 ? "ocene" : "ocen";
      box.querySelector(".rating-count").textContent = `${n} ${word} v App Storu`;
    } else {
      box.querySelector(".rating-count").textContent = `${n} rating${n === 1 ? "" : "s"} on the App Store`;
    }
    box.classList.remove("is-empty");
  } catch {
    // Offline or blocked: keep the numbers the page shipped with.
  }
});

// Screenshot galleries: arrow buttons on hover (desktop), swipe on phones, tap a shot to open it large
const galleries = [...document.querySelectorAll(".shots")];

const makeArrow = (dir) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `gallery-btn ${dir}`;
  b.setAttribute("aria-label", dir === "prev" ? (LANG === "sl" ? "Prejšnji posnetki" : "Previous screenshots") : (LANG === "sl" ? "Naslednji posnetki" : "Next screenshots"));
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
    img.setAttribute("aria-label", `${LANG === "sl" ? "Povečaj posnetek" : "Enlarge screenshot"}: ${img.alt}`);
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
  box.setAttribute("aria-label", LANG === "sl" ? "Ogled posnetkov" : "Screenshot viewer");
  box.innerHTML = `
    <div class="lightbox-top"><span class="lightbox-count"></span><button type="button" class="lightbox-close" aria-label="${LANG === "sl" ? "Zapri" : "Close"}">&times;</button></div>
    <div class="lightbox-stage">
      <button type="button" class="gallery-btn prev" aria-label="${LANG === "sl" ? "Prejšnji posnetek" : "Previous screenshot"}">&#8592;</button>
      <img alt="" />
      <button type="button" class="gallery-btn next" aria-label="${LANG === "sl" ? "Naslednji posnetek" : "Next screenshot"}">&#8594;</button>
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

// The logo: hover (or tap) and the elephant raises its head and its trunk, like a real one.
// Three approved poses (resting curl, trunk stretched forward, trunk raised high). Between them
// the trunk bends segment by segment (angles along its length are blended, the tip a little later
// than the base), and the head tilts up in step with the trunk.
const ELEPHANT = {"N":80,"S0":[277.8,133.65],"A0":[306.0,136.5],"B0":[249.6,130.8],"rest":{"h":[1.5733,1.4662,1.6602,1.9029,2.1454,2.4838,2.8292,2.8734,2.8656,2.8474,2.7822,2.7081,2.6275,2.5461,2.4681,2.4357,2.408,2.377,2.3423,2.3044,2.2598,2.2131,2.1664,2.1129,2.0569,1.996,1.9273,1.8516,1.7756,1.6948,1.6176,1.5396,1.4627,1.384,1.3135,1.241,1.1699,1.0968,1.0235,0.9499,0.8732,0.801,0.7311,0.6652,0.5983,0.5292,0.4596,0.3893,0.3197,0.2448,0.1685,0.0942,0.0272,-0.0521,-0.13,-0.2012,-0.2776,-0.3609,-0.4323,-0.51,-0.5908,-0.6698,-0.7495,-0.8305,-0.9069,-0.9845,-1.0635,-1.1454,-1.2318,-1.3275,-1.5445,-1.7769,-1.995,-2.1723,-2.0709,-1.83,-1.5596,-1.2838,-1.0306,-1.0306],"L":227.23,"w":[56.69,44.16,39.34,34.81,30.56,27.88,26.76,27.21,29.18,31.31,33.37,35.23,36.89,38.33,39.56,40.58,41.39,42.1,42.82,43.55,44.28,45.01,45.74,46.44,47.11,47.72,48.25,48.71,49.05,49.25,49.31,49.23,49.02,48.68,48.24,47.71,47.13,46.49,45.8,45.08,44.35,43.6,42.81,42.03,41.27,40.52,39.8,39.11,38.48,37.89,37.35,36.82,36.33,35.88,35.45,35.03,34.65,34.29,33.94,33.63,33.34,33.06,32.79,32.54,32.31,32.1,31.9,31.7,31.51,31.01,29.95,28.33,26.25,23.84,22.28,21.59,22.08,23.16,24.81,26.96]},"mid":{"h":[1.6511,1.6082,1.5617,1.511,1.4553,1.396,1.331,1.2623,1.1897,1.113,1.0352,0.9563,0.8772,0.8012,0.7269,0.6572,0.592,0.5312,0.4753,0.4242,0.3762,0.3339,0.2937,0.2578,0.2247,0.1942,0.1662,0.1404,0.1162,0.0939,0.071,0.0553,0.0486,0.0429,0.0387,0.0357,0.0341,0.0339,0.0351,0.0379,0.0424,0.0487,0.0567,0.0671,0.0796,0.0945,0.1121,0.1328,0.1569,0.1847,0.2165,0.2528,0.2939,0.3409,0.3929,0.4508,0.514,0.5825,0.6543,0.7301,0.8054,0.9079,1.0003,1.0932,1.1863,1.2797,1.3731,1.4678,1.5643,1.6639,1.7674,1.8767,1.9932,2.1178,2.2509,2.3917,2.5377,2.6847,2.8273,2.8273],"L":212.93,"w":[56.6873,56.086,55.5652,55.0711,54.5934,54.1277,53.6713,53.2225,52.78,52.3431,51.911,51.4832,51.0593,50.6389,50.2217,49.8075,49.396,48.9872,48.5807,48.1765,47.7744,47.3743,46.9761,46.5797,46.185,45.792,45.4005,45.0106,44.622,44.2349,43.8491,43.4646,43.0813,42.6993,42.3183,41.9385,41.5598,41.1822,40.8055,40.4298,40.0552,39.6814,39.3085,38.9366,38.5655,38.1952,37.8258,37.4572,37.0893,36.7222,36.3559,35.9903,35.6254,35.2612,34.8977,34.5349,34.1727,33.8112,33.4503,33.0901,32.7304,32.3714,32.0129,31.655,31.2977,30.9409,30.5847,30.229,29.8739,29.5192,29.1651,28.8115,28.4584,28.1058,27.7537,27.402,27.0508,26.7001,26.3498,26.0]},"top":{"h":[1.447,1.0607,0.7998,0.6293,0.5095,0.4187,0.3459,0.2848,0.2308,0.1832,0.1393,0.0984,0.0598,0.023,-0.0133,-0.0475,-0.0821,-0.1152,-0.1486,-0.1817,-0.2143,-0.247,-0.2797,-0.3125,-0.3453,-0.3783,-0.4113,-0.4436,-0.465,-0.4823,-0.4996,-0.5171,-0.5346,-0.5521,-0.5698,-0.5875,-0.6052,-0.6231,-0.641,-0.659,-0.677,-0.6951,-0.7136,-0.7319,-0.7503,-0.7688,-0.7874,-0.8061,-0.8252,-0.8443,-0.8634,-0.8826,-0.9022,-0.922,-0.9417,-0.9617,-0.9822,-1.0025,-1.0232,-1.0443,-1.0653,-1.0872,-1.1087,-1.131,-1.1533,-1.1763,-1.2023,-1.2326,-1.2678,-1.3091,-1.3575,-1.4138,-1.4796,-1.5554,-1.6419,-1.738,-1.842,-1.9502,-2.0582,-2.0582],"L":212.4,"w":[56.6873,56.086,55.5652,55.0711,54.5934,54.1277,53.6713,53.2225,52.78,52.3431,51.911,51.4832,51.0593,50.6389,50.2217,49.8075,49.396,48.9872,48.5807,48.1765,47.7744,47.3743,46.9761,46.5797,46.185,45.792,45.4005,45.0106,44.622,44.2349,43.8491,43.4646,43.0813,42.6993,42.3183,41.9385,41.5598,41.1822,40.8055,40.4298,40.0552,39.6814,39.3085,38.9366,38.5655,38.1952,37.8258,37.4572,37.0893,36.7222,36.3559,35.9903,35.6254,35.2612,34.8977,34.5349,34.1727,33.8112,33.4503,33.0901,32.7304,32.3714,32.0129,31.655,31.2977,30.9409,30.5847,30.229,29.8739,29.5192,29.1651,28.8115,28.4584,28.1058,27.7537,27.402,27.0508,26.7001,26.3498,26.0]},"oA":[306.0,136.5,308.1,136.4,309.5,136.8,308.1,138.3,306.7,139.8,305.2,141.2,303.7,142.5,302.0,143.8,300.3,145.0,298.6,146.2,296.9,147.3,295.2,148.4,293.5,149.6,291.8,150.7,290.1,151.9,288.4,153.0,286.6,154.1,284.9,155.3,283.2,156.5,281.6,157.7,279.9,158.9,278.2,160.1,276.6,161.4,275.0,162.6,273.4,163.9,271.8,165.3,270.3,166.6,268.7,168.0,267.3,169.5,265.8,170.9,264.4,172.4,263.1,174.0,261.8,175.6,260.6,177.3,259.4,179.0,258.3,180.7,257.3,182.5,256.4,184.3,255.6,186.2,254.9,188.2,254.3,190.2,253.9,192.2,253.6,194.2,253.5,196.3,253.4,198.3,253.6,200.4,254.0,202.4,254.6,204.4,255.3,206.3,256.3,208.1,257.5,209.8,258.8,211.4,260.3,212.8,261.9,214.1,263.7,215.1,265.6,216.0,267.6,216.5,269.6,216.9,271.6,217.0,273.7,216.9,275.7,216.6,277.7,216.0,279.6,215.3,281.4,214.3,283.1,213.1,284.7,211.8,286.0,210.2,287.3,208.6,288.3,206.8,289.2,205.0,289.7,203.0,290.2,201.0,290.4,198.9,290.4,196.9,290.0,194.8,289.5,192.8,288.9,190.9,288.0,189.0,286.8,187.3,286.2,185.5],"oB":[249.6,130.8,249.4,133.2,247.1,135.2,244.0,136.9,241.1,138.8,238.1,140.8,235.2,142.8,232.3,144.8,229.6,147.0,226.9,149.3,224.3,151.7,221.8,154.2,219.4,156.7,217.1,159.4,214.9,162.2,212.9,165.1,211.1,168.2,209.4,171.2,208.0,174.5,206.7,177.8,205.8,181.2,205.0,184.6,204.5,188.1,204.1,191.6,204.1,195.1,204.3,198.6,204.7,202.1,205.3,205.6,206.2,209.0,207.2,212.4,208.5,215.7,210.0,218.9,211.7,222.0,213.4,225.0,215.5,227.9,217.6,230.7,220.0,233.3,222.5,235.8,225.1,238.2,227.9,240.4,230.8,242.3,233.7,244.3,236.9,245.9,240.0,247.4,243.3,248.8,246.6,250.0,250.0,251.0,253.4,251.8,256.9,252.4,260.4,252.7,263.9,253.0,267.5,253.1,271.0,252.8,274.5,252.4,278.0,251.9,281.4,251.0,284.7,249.9,288.0,248.6,291.2,247.2,294.4,245.5,297.4,243.7,300.2,241.6,302.9,239.4,305.5,237.0,307.9,234.4,310.2,231.7,312.3,228.8,314.2,225.9,315.8,222.7,317.2,219.5,318.5,216.2,319.5,212.9,320.3,209.4,320.8,205.9,321.1,202.4,321.0,198.9,320.8,195.4,320.5,191.9,319.7,188.4,318.1,185.4]};

const elephant = (() => {
  const E = ELEPHANT;
  const N = E.N;
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
  const mix = (a, b, k) => a + (b - a) * k;
  const DUR = 3.4;
  // progress: 0 = resting curl, 1 = trunk forward, 2 = trunk up
  const progress = (t) => {
    if (t < 0.15) return 0;
    if (t < 1.55) return 2 * smooth((t - 0.15) / 1.4);
    if (t < 2.1) return 2;
    return 2 * (1 - smooth((t - 2.1) / 1.2));
  };
  const blend = (key, i, p) => (p <= 1 ? mix(E.rest[key][i], E.mid[key][i], p) : mix(E.mid[key][i], E.top[key][i], p - 1));
  const len = (p) => (p <= 1 ? mix(E.rest.L, E.mid.L, p) : mix(E.mid.L, E.top.L, p - 1));
  const frame = (svg, t) => {
    const p = progress(t);
    const sway = t > 1.4 && t < 2.4 ? Math.sin((t - 1.4) * 2 * Math.PI * 1.1) * Math.exp(-(t - 1.4) * 2.2) : 0;
    const ds = len(p) / (N - 1);
    const h = [];
    const w = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const pu = Math.max(0, Math.min(2, progress(t - 0.16 * u)));
      h.push(blend("h", i, pu) + 0.07 * Math.pow(u, 1.5) * sway);
      w.push(blend("w", i, pu));
    }
    let x = E.S0[0];
    let y = E.S0[1];
    const A = [];
    const B = [];
    for (let i = 0; i < N; i++) {
      if (i) {
        x += ds * Math.cos(h[i - 1]);
        y += ds * Math.sin(h[i - 1]);
      }
      const rx = -Math.sin(h[i]);
      const ry = Math.cos(h[i]);
      A.push([x - (rx * w[i]) / 2, y - (ry * w[i]) / 2]);
      B.push([x + (rx * w[i]) / 2, y + (ry * w[i]) / 2]);
    }
    // the base stays fixed under the head
    for (let i = 0; i < 6; i++) {
      const k = smooth(i / 6);
      A[i] = [mix(E.A0[0], A[i][0], k), mix(E.A0[1], A[i][1], k)];
      B[i] = [mix(E.B0[0], B[i][0], k), mix(E.B0[1], B[i][1], k)];
    }
    // rounded tip
    const cx = x;
    const cy = y;
    const r = w[N - 1] / 2;
    const th = h[N - 1];
    const cap = [];
    for (let k = 1; k < 10; k++) {
      const a = th - Math.PI / 2 + (Math.PI * k) / 10;
      cap.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    // close to rest, fade into the exact original drawing of the trunk
    const o = 1 - smooth(p / 0.35);
    const pts = [];
    for (let i = 0; i < N; i++) pts.push([mix(A[i][0], E.oA[2 * i], o), mix(A[i][1], E.oA[2 * i + 1], o)]);
    const oEndA = [E.oA[2 * N - 2], E.oA[2 * N - 1]];
    const oEndB = [E.oB[2 * N - 2], E.oB[2 * N - 1]];
    cap.forEach((c, k) => {
      const f = (k + 1) / 10;
      pts.push([mix(c[0], mix(oEndA[0], oEndB[0], f), o), mix(c[1], mix(oEndA[1], oEndB[1], f), o)]);
    });
    for (let i = N - 1; i >= 0; i--) pts.push([mix(B[i][0], E.oB[2 * i], o), mix(B[i][1], E.oB[2 * i + 1], o)]);
    svg.querySelector(".el-trunk").setAttribute("d", "M" + pts.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L") + "Z");
    // the head tilts up in step with the trunk
    const ph = progress(t + 0.04);
    const ang = ph <= 1 ? -7 * ph : -7 - 11 * (ph - 1);
    const ty = ph <= 1 ? -4 * ph : -4 - 4 * (ph - 1);
    const ear = ph <= 1 ? 5 * ph : 5 + 5 * (ph - 1);
    svg.querySelector(".el").setAttribute("transform", `rotate(${(ang - sway * 0.8).toFixed(2)} 110 42) translate(0 ${ty.toFixed(2)})`);
    svg.querySelector(".el-ear").setAttribute("transform", `rotate(${(ear + sway * 2).toFixed(2)} 205 25)`);
  };
  const rest = (svg) => {
    ["el", "el-ear"].forEach((c) => svg.querySelector(`.${c}`).removeAttribute("transform"));
  };
  return { frame, rest, DUR };
})();

document.querySelectorAll("[data-toot]").forEach((stage) => {
  const svg = stage.querySelector("svg");
  const trunk = svg && svg.querySelector(".el-trunk");
  if (!trunk || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const restD = trunk.getAttribute("d");
  let start = 0;
  const tick = (now) => {
    const t = (now - start) / 1000;
    if (t >= elephant.DUR) {
      trunk.setAttribute("d", restD);
      elephant.rest(svg);
      start = 0;
      return;
    }
    elephant.frame(svg, t);
    requestAnimationFrame(tick);
  };
  const play = () => {
    if (start) return;
    start = performance.now();
    requestAnimationFrame(tick);
  };
  stage.addEventListener("pointerenter", play);
  stage.addEventListener("click", play);
  if (!window.matchMedia("(hover: hover)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setTimeout(play, 600);
        io.disconnect();
      }
    }, { threshold: 0.6 });
    io.observe(stage);
  }
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) window.__elephant = (t) => elephant.frame(svg, t);
});

// Mouse Controller: the iPhone app shares its page with ?download. On a Mac, open the companion
// app in the Mac App Store. iPads also say "Macintosh" but have touch points.
(() => {
  const isMac = /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints === 0;
  const link = document.querySelector(".app-actions a.store-badge-mac");
  if (!new URLSearchParams(location.search).has("download") || !isMac || !link) return;

  // Drop ?download from the address so a reload doesn't open the store again.
  history.replaceState(null, "", location.pathname + location.hash);

  const t = LANG === "sl" ? {
    title: "Odpiram Mac App Store",
    retry: "Se ni odprl?",
    again: "Odpri znova",
    steps: ["Klikni <b>Get</b> in brezplačno namesti MouseController", "Odpri ga v mapi Applications ali v Launchpadu", "Dovoli Dostopnost, ko vpraša"],
    close: "Zapri",
  } : {
    title: "Opening the Mac App Store",
    retry: "Didn't open?",
    again: "Open it again",
    steps: ["Click <b>Get</b> to install MouseController, free", "Open it from Applications or Launchpad", "Allow Accessibility when asked"],
    close: "Close",
  };

  const card = document.createElement("div");
  card.className = "download-card";
  card.setAttribute("role", "status");
  card.innerHTML =
    '<span class="download-card-icon" aria-hidden="true">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>' +
    "</span><div><strong></strong><p></p><ol>" +
    t.steps.map((s) => `<li>${s}</li>`).join("") +
    '</ol></div><button class="download-card-close" type="button"></button>';
  card.querySelector("strong").textContent = t.title;
  const p = card.querySelector("p");
  const again = document.createElement("a");
  again.href = link.href;
  again.textContent = t.again;
  p.append(`${t.retry} `, again);
  const close = card.querySelector("button");
  close.setAttribute("aria-label", t.close);
  close.textContent = "×";
  close.addEventListener("click", () => card.remove());
  link.parentNode.insertAdjacentElement("afterend", card);

  setTimeout(() => {
    location.href = link.href;
  }, 500);
})();


// Home: "Find your package" — three questions, the matching package shows on the right
document.querySelectorAll(".finder").forEach((finder) => {
  const state = { need: "site", site: "website", app: "app", care: "no" };
  const group = (q) => finder.querySelector(`.fq[data-q="${q}"]`);
  const render = () => {
    group("site").hidden = state.need !== "site";
    group("app").hidden = state.need !== "app";
    group("care").hidden = state.need === "unsure";
    const pick = state.need === "site" ? state.site : state.need === "app" ? state.app : "unsure";
    finder.querySelectorAll("[data-result]").forEach((card) => {
      card.hidden = card.dataset.result !== pick;
      const care = card.querySelector(".fr-care");
      if (care) care.hidden = state.care !== "yes" || pick === "unsure";
    });
  };
  finder.querySelectorAll(".fq").forEach((fq) => {
    fq.querySelectorAll(".fq-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        state[fq.dataset.q] = btn.dataset.value;
        fq.querySelectorAll(".fq-opt").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        render();
      });
    });
  });
  render();
});
