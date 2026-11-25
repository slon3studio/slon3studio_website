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

// The logo: hover (or tap) and the elephant comes alive: it lifts its head and raises its trunk.
// The original drawing is bent as one shape (no separate pieces): every point of the outline
// follows a chain of small "bones" along the trunk, blended smoothly, and the head tilts with it.
const ELEPHANT = {"N":80,"hr":[1.5733,1.4662,1.6602,1.9029,2.1454,2.4838,2.8292,2.8734,2.8656,2.8474,2.7822,2.7081,2.6275,2.5461,2.4681,2.4357,2.408,2.377,2.3423,2.3044,2.2598,2.2131,2.1664,2.1129,2.0569,1.996,1.9273,1.8516,1.7756,1.6948,1.6176,1.5396,1.4627,1.384,1.3135,1.241,1.1699,1.0968,1.0235,0.9499,0.8732,0.801,0.7311,0.6652,0.5983,0.5292,0.4596,0.3893,0.3197,0.2448,0.1685,0.0942,0.0272,-0.0521,-0.13,-0.2012,-0.2776,-0.3609,-0.4323,-0.51,-0.5908,-0.6698,-0.7495,-0.8305,-0.9069,-0.9845,-1.0635,-1.1454,-1.2318,-1.3275,-1.5445,-1.7769,-1.995,-2.1723,-2.0709,-1.83,-1.5596,-1.2838,-1.0306,-1.0306],"Lr":227.23,"mid":{"h":[1.6518,1.6101,1.5648,1.5158,1.4628,1.4046,1.3429,1.2765,1.2066,1.1329,1.0577,0.9802,0.9041,0.8283,0.7554,0.686,0.6205,0.5592,0.5025,0.4506,0.4017,0.3584,0.3173,0.2803,0.2462,0.2149,0.186,0.1595,0.1342,0.1115,0.0904,0.0672,0.0545,0.0481,0.0431,0.0393,0.0369,0.0359,0.0363,0.0383,0.0418,0.0471,0.0541,0.0632,0.0742,0.0878,0.1036,0.1221,0.1439,0.1688,0.1972,0.2295,0.2661,0.3072,0.353,0.4042,0.4598,0.5198,0.5839,0.6518,0.7208,0.7907,0.86,0.9753,1.0344,1.0945,1.158,1.2252,1.297,1.374,1.4569,1.547,1.645,1.752,1.8682,1.993,2.1258,2.2623,2.3992,2.3992],"L":207.2},"top":{"h":[1.447,1.0607,0.7998,0.6293,0.5095,0.4187,0.3459,0.2848,0.2308,0.1832,0.1393,0.0984,0.0598,0.023,-0.0133,-0.0475,-0.0821,-0.1152,-0.1486,-0.1817,-0.2143,-0.247,-0.2797,-0.3125,-0.3453,-0.3783,-0.4113,-0.4436,-0.465,-0.4823,-0.4996,-0.5171,-0.5346,-0.5521,-0.5698,-0.5875,-0.6052,-0.6231,-0.641,-0.659,-0.677,-0.6951,-0.7136,-0.7319,-0.7503,-0.7688,-0.7874,-0.8061,-0.8252,-0.8443,-0.8634,-0.8826,-0.9022,-0.922,-0.9417,-0.9617,-0.9822,-1.0025,-1.0232,-1.0443,-1.0653,-1.0872,-1.1087,-1.131,-1.1533,-1.1763,-1.2023,-1.2326,-1.2678,-1.3091,-1.3575,-1.4138,-1.4796,-1.5554,-1.6419,-1.738,-1.842,-1.9502,-2.0582,-2.0582],"L":212.4},"spine":[[277.8,133.65],[277.793,136.526],[278.093,139.387],[277.836,142.252],[276.899,144.971],[275.335,147.385],[273.059,149.144],[270.322,150.028],[267.548,150.79],[264.781,151.574],[262.028,152.408],[259.336,153.42],[256.725,154.628],[254.221,156.042],[251.84,157.656],[249.591,159.45],[247.402,161.315],[245.266,163.241],[243.19,165.232],[241.185,167.294],[239.259,169.431],[237.43,171.651],[235.707,173.954],[234.094,176.335],[232.609,178.799],[231.266,181.342],[230.079,183.962],[229.075,186.658],[228.278,189.422],[227.693,192.238],[227.338,195.092],[227.203,197.965],[227.293,200.84],[227.603,203.7],[228.137,206.526],[228.869,209.308],[229.801,212.029],[230.923,214.677],[232.236,217.236],[233.733,219.693],[235.406,222.032],[237.254,224.236],[239.256,226.302],[241.397,228.222],[243.66,229.998],[246.037,231.618],[248.52,233.07],[251.097,234.346],[253.759,235.437],[256.489,236.341],[259.28,237.038],[262.115,237.521],[264.979,237.791],[267.854,237.87],[270.727,237.72],[273.579,237.347],[276.397,236.772],[279.163,235.984],[281.854,234.968],[284.466,233.763],[286.976,232.359],[289.365,230.757],[291.62,228.971],[293.725,227.012],[295.666,224.888],[297.438,222.623],[299.029,220.227],[300.427,217.713],[301.614,215.093],[302.57,212.38],[303.263,209.588],[303.339,206.713],[302.75,203.898],[301.566,201.276],[299.939,198.905],[298.559,196.381],[297.822,193.6],[297.854,190.724],[298.668,187.966],[300.148,185.499]],"p":[268.44,253.08,1.0,53.0,267.07,253.06,1.0,52.87,265.69,253.05,1.0,52.393,264.32,253.04,1.0,52.0,262.95,253.02,1.0,51.796,261.55,252.87,1,51.307,260.15,252.72,1,51.0,258.76,252.56,1,50.726,257.36,252.41,1,50.238,255.96,252.26,1,50.0,254.65,252.0,1,49.699,253.34,251.73,1,49.234,252.03,251.46,1,49.0,250.72,251.2,1,48.719,249.47,250.85,1,48.269,248.22,250.51,1,48.0,246.97,250.16,1,47.759,245.6,249.64,1,47.25,244.22,249.13,1,47.0,242.85,248.62,1,46.632,241.48,248.1,1,46.125,240.38,247.59,1,46.0,239.27,247.09,1,45.685,238.16,246.59,1,45.265,237.06,246.08,1,45.0,235.87,245.44,1,44.785,234.68,244.79,1,44.318,233.49,244.15,1,44.0,232.29,243.35,1,43.756,231.09,242.55,1,43.256,229.9,241.75,1,43.0,228.7,240.95,1,42.668,227.5,240.15,1,42.172,226.27,239.13,1,42.0,225.04,238.12,1,41.51,223.81,237.1,1,41.0,222.83,236.16,1,40.956,221.85,235.22,1,40.488,220.87,234.29,1,40.019,219.89,233.35,1,40.0,218.93,232.24,1,39.554,217.98,231.12,1,39.046,217.02,230.01,1,39.0,216.27,229.0,1,38.605,215.52,228.0,1,38.171,214.77,227.0,1,38.0,214.02,225.99,1,37.817,213.5,225.18,1,37.482,212.97,224.36,1,37.146,212.22,222.99,1,37.0,211.47,221.62,1,36.581,210.71,220.24,1,36.039,209.96,218.87,1,36.0,209.45,217.75,1,35.59,208.94,216.62,1,35.163,208.43,215.5,1,35.0,207.92,214.38,1,34.852,207.46,213.13,1,34.391,207.0,211.88,1,34.0,206.68,210.77,1,34.0,206.35,209.65,1,33.662,206.03,208.54,1,33.261,205.66,206.99,1,33.0,205.29,205.44,1,32.765,204.92,203.89,1.0,32.215,204.76,202.49,0.999,32.0,204.6,201.09,0.997,31.842,204.44,199.7,0.994,31.355,204.28,198.3,0.99,31.0,204.12,196.9,0.985,31.0,204.07,195.66,0.983,30.574,204.02,194.41,0.981,30.142,204.05,193.24,0.982,30.0,204.08,192.08,0.983,29.96,204.11,190.91,0.984,29.556,204.28,189.61,0.978,29.101,204.45,188.31,0.971,29.0,204.62,187.02,0.964,28.854,204.79,185.72,0.956,28.4,204.96,184.42,0.948,28.0,205.35,182.97,0.949,28.0,205.73,181.52,0.951,27.534,206.12,180.08,0.952,27.013,206.5,178.63,0.953,27.0,206.89,177.18,0.955,26.604,207.43,175.81,0.965,26.092,207.97,174.44,0.974,26.0,208.62,173.02,0.977,25.614,209.26,171.61,0.961,25.072,209.91,170.19,0.942,25.0,210.69,168.88,0.931,24.513,211.47,167.58,0.92,24.0,212.24,166.28,0.908,23.923,213.02,164.97,0.896,23.395,213.77,163.91,0.893,23.0,214.51,162.84,0.889,22.935,215.26,161.78,0.868,22.482,216.01,160.71,0.837,22.03,217.01,159.53,0.811,21.879,218.01,158.36,0.784,21.343,219.01,157.18,0.756,21.0,220.01,156.0,0.726,20.65,221.05,154.91,0.707,20.126,222.1,153.81,0.687,19.962,223.14,152.72,0.667,19.437,224.29,151.67,0.658,19.0,225.44,150.62,0.627,18.658,226.6,149.56,0.59,18.117,227.75,148.51,0.552,17.849,228.91,147.55,0.525,17.326,230.08,146.58,0.498,17.0,231.24,145.62,0.47,16.52,232.34,144.82,0.456,16.051,233.44,144.03,0.443,15.795,234.54,143.23,0.429,15.325,235.64,142.44,0.416,15.0,236.74,141.64,0.402,14.63,238.03,140.81,0.379,14.1,239.32,139.98,0.35,14.0,240.61,139.14,0.322,13.622,241.9,138.31,0.295,13.089,243.19,137.48,0.268,13.0,244.48,136.65,0.242,12.633,245.73,135.99,0.232,12.143,246.97,135.33,0.222,12.0,248.22,134.67,0.217,11.768,249.47,134.01,0.214,11.278,249.74,133.5,0.174,11.119,249.63,133.25,0.151,11.117,248.22,133.2,0.096,11.554,246.89,133.34,0.062,11.994,245.56,133.48,0.037,12.0,244.23,133.62,0.019,12.191,242.73,133.9,0.008,12.693,241.23,134.18,0.001,13.0,239.73,134.45,0,0.0,238.23,134.73,0,0.0,236.9,135.02,0,0.0,235.57,135.31,0,0.0,234.24,135.6,0,0.0,233.08,135.92,0,0.0,231.91,136.24,0,0.0,230.75,136.56,0,0.0,230.0,136.85,0,0.0,229.25,137.14,0,0.0,228.38,137.38,0,0.0,227.5,137.61,0,0.0,226.25,138.1,0,0.0,225.0,138.59,0,0.0,223.76,139.07,0,0.0,222.51,139.56,0,0.0,221.26,140.16,0,0.0,220.01,140.77,0,0.0,218.77,141.37,0,0.0,217.52,141.98,0,0.0,216.27,142.58,0,0.0,215.4,143.09,0,0.0,214.52,143.6,0,0.0,213.4,144.35,0,0.0,212.28,145.11,0,0.0,211.15,145.86,0,0.0,210.03,146.61,0,0.0,209.14,147.32,0,0.0,208.25,148.02,0,0.0,207.36,148.73,0,0.0,206.29,149.73,0,0.0,205.23,150.72,0,0.0,204.16,151.72,0,0.0,203.32,152.66,0,0.0,202.49,153.59,0,0.0,201.65,154.53,0,0.0,200.81,155.47,0,0.0,200.07,156.53,0,0.0,199.34,157.59,0,0.0,198.61,158.65,0,0.0,197.87,159.71,0,0.0,197.34,160.71,0,0.0,196.8,161.71,0,0.0,196.55,161.99,0,0.0,196.05,162.03,0,0.0,195.8,161.68,0,0.0,195.47,160.21,0,0.0,195.0,158.96,0,0.0,194.52,157.71,0,0.0,193.86,156.27,0,0.0,193.21,154.84,0,0.0,192.55,153.4,0,0.0,191.79,152.23,0,0.0,191.03,151.06,0,0.0,190.26,149.9,0,0.0,189.5,148.73,0,0.0,188.68,147.73,0,0.0,187.86,146.73,0,0.0,187.03,145.73,0,0.0,186.21,144.73,0,0.0,185.39,143.73,0,0.0,184.28,142.7,0,0.0,183.18,141.67,0,0.0,182.07,140.64,0,0.0,181.07,139.86,0,0.0,180.07,139.08,0,0.0,179.07,138.31,0,0.0,178.07,137.53,0,0.0,177.77,136.99,0,0.0,177.98,136.49,0,0.0,178.61,135.99,0,0.0,179.51,134.98,0,0.0,180.42,133.97,0,0.0,181.32,132.96,0,0.0,182.32,131.72,0,0.0,183.33,130.48,0,0.0,184.33,129.24,0,0.0,185.34,128.0,0,0.0,186.34,126.76,0,0.0,187.12,125.64,0,0.0,187.89,124.51,0,0.0,188.67,123.39,0,0.0,189.45,122.26,0,0.0,190.22,121.02,0,0.0,191.0,119.77,0,0.0,191.78,118.53,0,0.0,192.55,117.28,0,0.0,193.05,116.35,0,0.0,193.55,115.42,0,0.0,194.18,114.04,0,0.0,194.8,112.66,0,0.0,195.43,111.28,0,0.0,195.94,109.91,0,0.0,196.46,108.53,0,0.0,196.97,107.16,0,0.0,197.49,105.79,0,0.0,197.85,104.54,0,0.0,198.2,103.29,0,0.0,198.56,102.04,0,0.0,198.81,100.74,0,0.0,199.05,99.44,0,0.0,199.29,98.13,0,0.0,199.54,96.83,0,0.0,199.65,95.49,0,0.0,199.75,94.15,0,0.0,199.86,92.81,0,0.0,199.87,91.44,0,0.0,199.87,90.06,0,0.0,199.88,88.69,0,0.0,199.88,87.32,0,0.0,199.77,85.8,0,0.0,199.65,84.29,0,0.0,199.54,82.77,0,0.0,199.28,81.47,0,0.0,199.02,80.17,0,0.0,198.77,78.88,0,0.0,198.51,77.58,0,0.0,198.02,76.13,0,0.0,197.53,74.69,0,0.0,197.04,73.25,0,0.0,196.55,71.8,0,0.0,195.88,70.38,0,0.0,195.22,68.97,0,0.0,194.55,67.55,0,0.0,193.87,66.32,0,0.0,193.18,65.08,0,0.0,192.5,63.85,0,0.0,191.75,62.85,0,0.0,191.0,61.86,0,0.0,190.25,60.86,0,0.0,189.5,59.86,0,0.0,188.52,58.75,0,0.0,187.54,57.64,0,0.0,186.56,56.53,0,0.0,185.46,55.55,0,0.0,184.36,54.58,0,0.0,183.26,53.6,0,0.0,182.16,52.62,0,0.0,181.28,51.95,0,0.0,180.4,51.29,0,0.0,179.52,50.62,0,0.0,178.3,49.87,0,0.0,177.08,49.12,0,0.0,175.86,48.37,0,0.0,174.64,47.62,0,0.0,173.58,47.16,0,0.0,172.58,46.52,0,0.0,171.17,45.89,0,0.0,169.75,45.25,0,0.0,168.34,44.62,0,0.0,166.9,44.12,0,0.0,165.45,43.62,0,0.0,164.01,43.13,0,0.0,162.57,42.63,0,0.0,161.33,42.29,0,0.0,160.09,41.94,0,0.0,158.85,41.6,0,0.0,157.6,41.35,0,0.0,156.36,41.11,0,0.0,155.11,40.86,0,0.0,153.86,40.61,0,0.0,152.45,40.47,0,0.0,151.03,40.34,0,0.0,149.62,40.2,0,0.0,148.2,40.06,0,0.0,146.78,39.93,0,0.0,145.37,39.79,0,0.0,144.12,39.76,0,0.0,142.88,39.73,0,0.0,141.63,39.7,0,0.0,140.38,39.67,0,0.0,138.84,39.67,0,0.0,137.3,39.67,0,0.0,135.76,39.67,0,0.0,134.21,39.68,0,0.0,132.67,39.68,0,0.0,131.13,39.68,0,0.0,129.59,39.68,0,0.0,128.05,39.68,0,0.0,126.51,39.68,0,0.0,124.97,39.68,0,0.0,123.43,39.68,0,0.0,121.88,39.69,0,0.0,120.34,39.69,0,0.0,118.8,39.69,0,0.0,117.26,39.69,0,0.0,115.72,39.69,0,0.0,114.18,39.69,0,0.0,112.64,39.69,0,0.0,111.1,39.69,0,0.0,109.55,39.7,0,0.0,108.01,39.7,0,0.0,106.47,39.7,0,0.0,104.93,39.7,0,0.0,104.54,39.64,0,0.0,104.29,39.39,0,0.0,104.35,38.89,0,0.0,104.55,38.64,0,0.0,105.87,37.89,0,0.0,107.18,37.15,0,0.0,107.78,36.64,0,0.0,109.03,35.89,0,0.0,110.29,35.14,0,0.0,111.37,34.39,0,0.0,112.44,33.64,0,0.0,113.66,32.88,0,0.0,114.87,32.13,0,0.0,116.08,31.38,0,0.0,117.3,30.62,0,0.0,118.52,29.87,0,0.0,119.73,29.11,0,0.0,120.94,28.36,0,0.0,122.16,27.6,0,0.0,123.08,27.15,0,0.0,124.24,26.38,0,0.0,125.4,25.6,0,0.0,126.75,24.8,0,0.0,128.1,24.01,0,0.0,129.44,23.21,0,0.0,130.79,22.41,0,0.0,132.14,21.62,0,0.0,133.49,20.82,0,0.0,134.84,20.02,0,0.0,136.18,19.22,0,0.0,137.53,18.43,0,0.0,138.88,17.63,0,0.0,139.92,17.17,0,0.0,141.27,16.36,0,0.0,142.62,15.55,0,0.0,143.83,14.9,0,0.0,145.03,14.24,0,0.0,146.24,13.59,0,0.0,147.45,12.94,0,0.0,148.65,12.28,0,0.0,149.86,11.63,0,0.0,151.11,11.03,0,0.0,152.36,10.43,0,0.0,153.61,9.82,0,0.0,154.86,9.22,0,0.0,156.11,8.62,0,0.0,157.23,8.13,0,0.0,158.36,7.65,0,0.0,159.48,7.16,0,0.0,160.6,6.68,0,0.0,162.03,6.17,0,0.0,163.47,5.67,0,0.0,164.91,5.17,0,0.0,166.34,4.66,0,0.0,167.47,4.34,0,0.0,168.61,4.01,0,0.0,169.74,3.69,0,0.0,171.14,3.41,0,0.0,172.54,3.12,0,0.0,173.93,2.84,0,0.0,175.33,2.56,0,0.0,176.91,2.41,0,0.0,178.49,2.26,0,0.0,180.07,2.11,0,0.0,181.23,2.07,0,0.0,182.4,2.04,0,0.0,183.56,2.0,0,0.0,184.81,2.03,0,0.0,186.06,2.06,0,0.0,187.31,2.09,0,0.0,188.56,2.12,0,0.0,189.72,2.22,0,0.0,190.89,2.31,0,0.0,192.05,2.41,0,0.0,193.45,2.66,0,0.0,194.85,2.9,0,0.0,196.24,3.15,0,0.0,197.64,3.39,0,0.0,199.04,3.64,0,0.0,200.21,3.97,0,0.0,201.37,4.31,0,0.0,202.54,4.64,0,0.0,203.91,5.13,0,0.0,205.28,5.62,0,0.0,206.66,6.1,0,0.0,208.03,6.59,0,0.0,209.28,7.18,0,0.0,210.53,7.77,0,0.0,211.77,8.36,0,0.0,213.02,8.95,0,0.0,214.27,9.54,0,0.0,215.52,10.24,0,0.0,216.76,10.94,0,0.0,218.01,11.64,0,0.0,219.11,12.41,0,0.0,220.21,13.19,0,0.0,221.31,13.96,0,0.0,222.41,14.74,0,0.0,223.51,15.51,0,0.0,224.51,16.3,0,0.0,225.5,17.09,0,0.0,226.5,17.87,0,0.0,227.5,18.66,0,0.0,228.55,19.56,0,0.0,229.6,20.46,0,0.0,230.65,21.36,0,0.0,231.7,22.26,0,0.0,232.75,23.16,0,0.0,233.73,23.91,0,0.0,234.71,24.66,0,0.0,235.69,25.41,0,0.0,236.67,26.16,0,0.0,237.77,26.82,0,0.0,238.88,27.48,0,0.0,239.98,28.14,0,0.0,241.0,28.64,0,0.0,242.03,29.15,0,0.0,243.25,29.66,0,0.0,244.48,30.16,0,0.0,245.85,30.58,0,0.0,247.22,31.0,0,0.0,248.72,31.31,0,0.0,250.22,31.63,0,0.0,251.62,32.01,0,0.0,253.02,32.38,0,0.0,254.42,32.76,0,0.0,255.82,33.14,0,0.0,256.89,33.37,0,0.0,257.96,33.59,0,0.0,259.45,34.17,0,0.0,260.7,34.54,0,0.0,261.95,34.9,0,0.0,263.2,35.27,0,0.0,264.45,35.63,0,0.0,265.51,36.14,0,0.0,266.35,36.39,0,0.0,267.19,36.64,0,0.0,268.38,37.12,0,0.0,269.56,37.59,0,0.0,270.75,38.07,0,0.0,271.94,38.55,0,0.0,272.93,39.15,0,0.0,274.18,39.62,0,0.0,275.51,40.27,0,0.0,276.85,40.91,0,0.0,278.18,41.56,0,0.0,279.35,42.23,0,0.0,280.51,42.91,0,0.0,281.68,43.58,0,0.0,282.84,44.25,0,0.0,284.0,44.93,0,0.0,285.17,45.6,0,0.0,286.23,46.34,0,0.0,287.29,47.08,0,0.0,288.35,47.81,0,0.0,289.41,48.55,0,0.0,290.33,49.25,0,0.0,291.24,49.96,0,0.0,292.16,50.66,0,0.0,293.24,51.65,0,0.0,294.32,52.63,0,0.0,295.4,53.62,0,0.0,296.48,54.61,0,0.0,297.45,55.67,0,0.0,298.42,56.72,0,0.0,299.39,57.78,0,0.0,299.91,58.45,0,0.0,300.44,59.11,0,0.0,301.19,60.23,0,0.0,301.94,61.36,0,0.0,302.7,62.48,0,0.0,303.45,63.6,0,0.0,304.13,64.77,0,0.0,304.81,65.93,0,0.0,305.49,67.1,0,0.0,306.21,68.53,0,0.0,306.92,69.95,0,0.0,307.64,71.38,0,0.0,308.36,72.8,0,0.0,309.08,74.23,0,0.0,309.79,75.65,0,0.0,310.51,77.08,0,0.0,310.98,78.28,0,0.0,311.46,79.49,0,0.0,311.93,80.69,0,0.0,312.41,81.9,0,0.0,312.88,83.1,0,0.0,313.48,84.32,0,0.0,313.94,85.83,0,0.0,314.41,87.35,0,0.0,314.87,88.86,0,0.0,315.49,90.31,0,0.0,315.75,91.44,0,0.0,316.0,92.56,0,0.0,316.5,94.06,0,0.0,316.78,95.43,0,0.0,317.06,96.81,0,0.0,317.35,98.18,0,0.0,317.63,99.55,0,0.0,317.78,100.85,0,0.0,317.94,102.15,0,0.0,318.09,103.44,0,0.0,318.25,104.74,0,0.0,318.4,106.04,0,0.0,318.43,107.12,0,0.0,318.46,108.2,0,0.0,318.49,109.28,0,0.0,318.44,110.66,0,0.0,318.4,112.03,0,0.0,318.21,113.59,0,0.0,318.02,115.15,0,0.0,317.83,116.71,0,0.0,317.64,118.27,0,0.0,317.32,119.6,0,0.0,317.0,120.93,0,0.0,316.69,122.26,0,0.0,316.37,123.59,0,0.0,315.93,124.93,0,0.0,315.49,126.26,0,0.0,314.98,127.5,0,0.0,314.46,128.75,0,0.0,313.81,130.0,0,0.0,313.15,131.25,0,0.0,312.5,132.5,0,0.0,311.97,133.38,0,0.0,311.43,134.25,0,0.0,310.75,135.16,0,0.0,310.06,136.06,0.002,2.0,309.38,136.97,0.026,2.0,308.38,138.05,0.087,2.0,307.38,139.13,0.175,2.0,306.38,140.21,0.285,2.0,305.38,141.1,0.395,2.0,304.39,141.99,0.517,2.085,303.33,142.78,0.628,2.393,302.26,143.57,0.733,2.7,301.2,144.37,0.827,3.0,300.14,145.16,0.905,3.0,298.83,146.03,0.968,3.0,297.52,146.9,0.998,3.0,296.21,147.78,1,3.0,294.9,148.65,1,3.168,293.59,149.52,1,3.603,292.28,150.39,1,4.0,290.97,151.26,1,4.0,289.66,152.13,1,4.0,288.35,153.0,1,4.181,287.04,153.88,1,4.683,285.73,154.75,1,5.0,284.42,155.62,1,5.0,283.32,156.41,1,5.0,282.22,157.2,1,5.191,281.12,157.98,1,5.661,280.02,158.77,1,6.0,278.92,159.56,1,6.0,277.92,160.33,1,6.0,276.93,161.1,1,6.0,275.93,161.87,1,6.411,274.93,162.64,1,6.823,273.71,163.66,1,7.121,272.48,164.68,1,7.625,271.26,165.7,1,8.171,270.17,166.7,1,8.629,269.09,167.7,1,9.193,268.0,168.7,1,9.655,267.03,169.7,1,10.485,266.07,170.69,1,11.399,265.1,171.69,1,12.382,264.37,172.52,1,13.292,263.65,173.36,1,13.664,262.92,174.19,1,14.574,262.18,175.16,1,15.212,261.44,176.12,1,15.626,260.69,177.09,1,16.239,259.95,178.05,1,16.655,259.29,179.11,1,17.302,258.62,180.18,1,17.724,257.96,181.24,1,18.409,257.29,182.56,1,19.192,256.63,183.88,1,19.688,255.96,185.2,1,20.54,255.46,186.51,1,21.383,254.96,187.83,1,22.238,254.64,189.02,1,22.645,254.31,190.22,1,23.507,253.99,191.41,1,24.404,253.81,192.66,1,25.352,253.62,193.91,1,26.385,253.54,195.07,1,27.454,253.45,196.24,1,28.54,253.37,197.4,1,30.378,253.49,198.9,1,31.61,253.61,200.4,1,33.552,253.83,201.53,1,34.592,254.05,202.65,1,35.645,254.5,204.06,1,37.458,254.96,205.47,1,38.618,255.45,206.56,1,40.353,255.94,207.64,1,41.378,256.44,208.39,1,41.687,256.94,209.14,1,42.593,257.87,210.26,1,43.652,258.8,211.38,1,44.704,259.69,212.25,1,45.701,260.59,213.13,1,46.686,261.25,213.63,1,47.532,261.91,214.13,1,48.362,262.8,214.63,1,49.298,263.68,215.13,1,49.638,264.81,215.63,1,50.647,265.94,216.13,1,51.624,267.27,216.41,1,52.595,268.61,216.7,1,53.645,269.94,216.98,1,54.664,271.1,217.0,1,55.571,272.27,217.01,1,56.502,273.43,217.03,1,57.462,274.93,216.72,1,58.472,276.43,216.41,1,59.507,277.5,216.13,1,60.407,278.74,215.63,1,61.369,279.98,215.13,1,62.316,280.89,214.63,1,62.667,281.81,214.13,1,63.512,282.67,213.46,1,64.344,283.53,212.8,1,64.711,284.39,212.13,1,65.529,284.97,211.5,1,66.276,285.55,210.88,1,66.564,286.51,209.63,1,67.561,287.47,208.39,1,68.562,287.98,207.51,1,73.886,288.48,206.64,1,74.0,288.99,205.39,1,74.0,289.49,204.14,1,74.145,289.79,202.81,1,74.501,290.08,201.48,1,74.857,290.38,200.15,1,75.0,290.43,199.03,1,75.0,290.48,197.9,1,75.209,290.37,196.91,1,75.554,290.26,195.91,1,75.898,289.96,194.66,1,76.0,289.67,193.41,1,76.034,289.37,192.16,1,76.468,288.91,191.03,1,76.857,288.46,189.91,1,77.0,288.04,189.16,1,77.0,287.63,188.42,1,77.0,286.78,187.29,1,77.054,285.94,186.17,1,77.346,285.91,185.67,1,77.51,286.16,185.46,1,77.604,287.76,185.46,1,77.763,289.36,185.45,1,77.922,290.95,185.45,1,78.0,292.55,185.44,1,78.0,294.15,185.44,1,78.0,295.75,185.43,1,78.234,297.35,185.43,1,78.521,298.94,185.42,1,78.808,300.54,185.42,1,79.0,302.14,185.41,1,79.0,303.74,185.41,1,79.0,305.34,185.4,1,79.0,306.93,185.4,1,79.0,308.53,185.39,1,79.0,310.13,185.39,1,79.0,311.73,185.38,1,79.0,313.33,185.38,1,79.0,314.92,185.37,1,79.0,316.52,185.37,1,79.0,318.12,185.36,1,79.0,318.87,185.72,1,79.0,319.37,186.67,1,79.0,319.65,187.98,1,79.0,319.94,189.29,1,79.0,320.22,190.6,1,79.0,320.5,191.91,1,73.0,320.68,193.41,1,72.758,320.85,194.91,1,72.258,320.91,196.21,1,72.0,320.97,197.51,1,72.0,321.02,198.8,1,72.0,321.08,200.1,1,71.987,321.14,201.4,1,71.542,321.04,202.81,1,71.068,320.94,204.23,1,71.0,320.84,205.64,1,71.0,320.71,206.72,1,71.0,320.59,207.81,1,70.778,320.46,208.89,1,70.4,320.13,210.3,1,70.0,319.8,211.72,1,70.0,319.47,213.13,1,70.0,319.11,214.3,1,69.739,318.75,215.46,1,69.315,318.39,216.63,1,69.0,317.91,217.81,1,68.992,317.44,219.0,1,68.549,316.97,220.19,1,68.105,316.49,221.37,1,68.0,315.82,222.7,1,67.629,315.14,224.03,1,67.111,314.47,225.36,1,67.0,313.72,226.55,1,66.56,312.97,227.74,1,66.073,312.22,228.92,1,66.0,311.47,230.11,1,65.531,310.77,231.0,1,65.139,310.08,231.89,1,65.0,309.38,232.78,1,64.777,308.39,233.86,1,64.27,307.41,234.94,1,64.0,306.43,236.02,1,63.666,305.44,237.1,1,63.158,304.35,238.1,1,63.0,303.26,239.09,1,62.565,302.17,240.09,1,62.051,301.2,240.84,1,62.0,300.23,241.59,1,61.622,299.25,242.34,1,61.195,298.28,243.09,1,61.0,297.15,243.8,1,60.723,296.03,244.51,1,60.26,294.9,245.22,1,60.0,293.74,245.85,1,59.761,292.57,246.49,1,59.301,291.41,247.12,1,59.0,290.29,247.63,1,58.818,289.16,248.13,1,58.388,288.04,248.64,1,58.0,286.91,249.15,1,57.903,285.49,249.63,1,57.383,284.08,250.12,1,57.0,282.66,250.6,1,56.776,281.24,251.08,1,56.256,279.8,251.42,1,56.0,278.37,251.76,1,55.63,276.93,252.1,1,55.117,275.51,252.26,1,54.995,274.1,252.43,1,54.5,272.69,252.59,1,54.005,271.27,252.75,1,53.916,269.86,252.92,1,53.422]};

const elephant = (() => {
  const E = ELEPHANT;
  const N = E.N;
  const P = E.p;
  const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10));
  const mix = (a, b, k) => a + (b - a) * k;
  const DUR = 2.4;
  // 0 = resting curl, 1 = trunk forward, 2 = trunk up
  const progress = (t) => {
    if (t < 0.05) return 0;
    if (t < 0.95) return 2 * smooth((t - 0.05) / 0.9);
    if (t < 1.25) return 2;
    return 2 * (1 - smooth((t - 1.25) / 0.95));
  };
  const target = (i, p) => (p <= 1 ? mix(E.hr[i], E.mid.h[i], p) : mix(E.mid.h[i], E.top.h[i], p - 1));
  const len = (p) => (p <= 1 ? mix(E.Lr, E.mid.L, p) : mix(E.mid.L, E.top.L, p - 1));
  const SIG = 2.6;
  const frame = (svg, t) => {
    const p = progress(t);
    const sway = t > 0.85 && t < 1.7 ? Math.sin((t - 0.85) * 2 * Math.PI * 1.4) * Math.exp(-(t - 0.85) * 3) : 0;
    // bone angles: the change from rest grows gently away from the head, and the tip follows a bit later
    const dh = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const pu = Math.max(0, Math.min(2, progress(t - 0.12 * u)));
      const root = smooth(u / 0.25);
      dh[i] = (target(i, pu) - E.hr[i]) * root + 0.07 * Math.pow(u, 1.5) * sway;
    }
    const ds = len(p) / (N - 1);
    const bx = new Float64Array(N);
    const by = new Float64Array(N);
    bx[0] = E.spine[0][0];
    by[0] = E.spine[0][1];
    for (let i = 1; i < N; i++) {
      const a = E.hr[i - 1] + dh[i - 1];
      bx[i] = bx[i - 1] + ds * Math.cos(a);
      by[i] = by[i - 1] + ds * Math.sin(a);
    }
    let d = "";
    for (let k = 0; k < P.length; k += 4) {
      let x = P[k];
      let y = P[k + 1];
      const wt = P[k + 2];
      if (wt > 0) {
        const u = P[k + 3];
        const j0 = Math.max(0, Math.floor(u) - 7);
        const j1 = Math.min(N - 1, Math.floor(u) + 8);
        let sw = 0;
        let nx = 0;
        let ny = 0;
        for (let j = j0; j <= j1; j++) {
          const g = Math.exp(-((j - u) * (j - u)) / (2 * SIG * SIG));
          const c = Math.cos(dh[j]);
          const s = Math.sin(dh[j]);
          const ox = x - E.spine[j][0];
          const oy = y - E.spine[j][1];
          nx += g * (bx[j] + ox * c - oy * s);
          ny += g * (by[j] + ox * s + oy * c);
          sw += g;
        }
        x = mix(x, nx / sw, wt);
        y = mix(y, ny / sw, wt);
      }
      d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    const body = svg.querySelector(".el-body");
    body.setAttribute("d", d + "Z");
    // a hairline of the same colour seals tiny gaps where the outline folds while bending
    if (!body.getAttribute("stroke")) {
      body.setAttribute("stroke", body.getAttribute("fill"));
      body.setAttribute("stroke-width", "2");
      body.setAttribute("stroke-linejoin", "round");
    }
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
    ["stroke", "stroke-width", "stroke-linejoin"].forEach((a) => svg.querySelector(".el-body").removeAttribute(a));
  };
  return { frame, rest, DUR };
})();

document.querySelectorAll("[data-toot]").forEach((stage) => {
  const svg = stage.querySelector("svg");
  const trunk = svg && svg.querySelector(".el-body");
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
