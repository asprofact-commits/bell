/* =============================================================================
   Bell Kitchen · Cookaki — main.js
   Vanilla JS · No dependencies · Accessible · Respects prefers-reduced-motion
   ============================================================================= */
(function () {
  "use strict";

  /* ---------- Helpers ------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- i18n: localized UI strings (driven by <html lang>) ------------ */
  /* Root main.js is shared by every language mirror (/, /el/, /de/, /fr/, /es/,
     /zh/). Strings that JS renders at runtime are localized here so no mirror
     needs its own copy of this file. Falls back to English for unknown langs. */
  const LANG = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
  const I18N = {
    en: { waOpening: "Opening WhatsApp — tap Send in WhatsApp to confirm.",
          openNow: (t) => `Open now · Until ${t}`,
          closedOpens: (t) => `Closed · Opens ${t}`,
          closedOpensDay: (d, t) => `Closed · Opens ${d} ${t}`,
          closed: "Closed", days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    el: { waOpening: "Άνοιγμα WhatsApp — πατήστε Αποστολή στο WhatsApp για επιβεβαίωση.",
          openNow: (t) => `Ανοιχτά τώρα · Έως ${t}`,
          closedOpens: (t) => `Κλειστά · Ανοίγει ${t}`,
          closedOpensDay: (d, t) => `Κλειστά · Ανοίγει ${d} ${t}`,
          closed: "Κλειστά", days: ["Κυρ", "Δευ", "Τρί", "Τετ", "Πέμ", "Παρ", "Σάβ"] },
    de: { waOpening: "WhatsApp wird geöffnet — tippen Sie in WhatsApp auf Senden, um zu bestätigen.",
          openNow: (t) => `Jetzt geöffnet · bis ${t}`,
          closedOpens: (t) => `Geschlossen · öffnet ${t}`,
          closedOpensDay: (d, t) => `Geschlossen · öffnet ${d} ${t}`,
          closed: "Geschlossen", days: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] },
    fr: { waOpening: "Ouverture de WhatsApp — appuyez sur Envoyer dans WhatsApp pour confirmer.",
          openNow: (t) => `Ouvert · jusqu'à ${t}`,
          closedOpens: (t) => `Fermé · ouvre à ${t}`,
          closedOpensDay: (d, t) => `Fermé · ouvre ${d} ${t}`,
          closed: "Fermé", days: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."] },
    es: { waOpening: "Abriendo WhatsApp — pulse Enviar en WhatsApp para confirmar.",
          openNow: (t) => `Abierto ahora · hasta ${t}`,
          closedOpens: (t) => `Cerrado · abre ${t}`,
          closedOpensDay: (d, t) => `Cerrado · abre ${d} ${t}`,
          closed: "Cerrado", days: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"] },
    zh: { waOpening: "正在打开 WhatsApp — 请在 WhatsApp 中点击发送以确认。",
          openNow: (t) => `营业中 · 至 ${t}`,
          closedOpens: (t) => `已打烊 · ${t} 开门`,
          closedOpensDay: (d, t) => `已打烊 · ${d} ${t} 开门`,
          closed: "已打烊", days: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] }
  };
  const T = I18N[LANG] || I18N.en;

  /* ---------- SINGLE SOURCE OF TRUTH: opening hours ------------------------ */
  /* This object is the canonical schedule referenced by the open-now badge
     AND should be reflected in the JSON-LD schema on index.html and in
     contact.html's hours table. If you change hours, update all three.
     Each day holds one or more service sessions (split shifts supported). */
  const HOURS = {
    /* day index per JS Date#getDay(): 0=Sunday, 1=Monday, ... 6=Saturday */
    0: { sessions: [{ open: 10, close: 18 }], label: "10:00 – 18:00" },                 // Sunday
    1: { sessions: [{ open: 9, close: 16 }, { open: 19, close: 22 }], label: "09:00 – 16:00 · 19:00 – 22:00" }, // Monday
    2: { sessions: [{ open: 9, close: 16 }, { open: 19, close: 22 }], label: "09:00 – 16:00 · 19:00 – 22:00" }, // Tuesday
    3: { sessions: [{ open: 9, close: 16 }, { open: 19, close: 22 }], label: "09:00 – 16:00 · 19:00 – 22:00" }, // Wednesday
    4: { sessions: [{ open: 9, close: 16 }, { open: 19, close: 22 }], label: "09:00 – 16:00 · 19:00 – 22:00" }, // Thursday
    5: { sessions: [{ open: 9, close: 16 }, { open: 19, close: 22 }], label: "09:00 – 16:00 · 19:00 – 22:00" }, // Friday
    6: { sessions: [{ open: 9, close: 16 }, { open: 19, close: 22 }], label: "09:00 – 16:00 · 19:00 – 22:00" }  // Saturday
  };

  /* ---------- 1. Mobile menu toggle ---------------------------------------- */
  const navToggle = $(".nav-toggle");
  const mobileMenu = $(".mobile-menu");
  if (navToggle && mobileMenu) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", open);
      mobileMenu.setAttribute("data-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });
    $$(".mobile-menu a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") setOpen(false);
    });
  }

  /* ---------- 2. Menu filters ---------------------------------------------- */
  const filterBtns = $$(".filter-btn");
  const menuItems = $$(".menu-item");
  if (filterBtns.length && menuItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        const filter = btn.dataset.filter;
        menuItems.forEach((item) => {
          const tags = (item.dataset.tags || "").split(" ");
          const show = filter === "all" || tags.includes(filter);
          item.classList.toggle("hidden", !show);
        });
        $$(".menu-section").forEach((section) => {
          const visible = $$(".menu-item:not(.hidden)", section).length;
          section.style.display = visible ? "" : "none";
        });
      });
    });
  }

  /* ---------- 3. Reveal on scroll ------------------------------------------ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = $$(".reveal");
  if (reveals.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
      );
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ---------- 4. Lightbox (gallery) ---------------------------------------- */
  const lightbox = $(".lightbox");
  if (lightbox) {
    const lbImg = $("img", lightbox);
    const lbClose = $(".lightbox-close", lightbox);
    const open = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || "";
      lightbox.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lightbox.setAttribute("data-open", "false");
      lbImg.src = "";
      document.body.style.overflow = "";
    };
    $$(".gallery-item").forEach((item) => {
      const img = $("img", item);
      if (!img) return;
      item.addEventListener("click", () => open(img.dataset.full || img.src, img.alt));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(img.dataset.full || img.src, img.alt);
        }
      });
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
    });
    lbClose && lbClose.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---------- 5. Header shadow on scroll ----------------------------------- */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 8 ? "0 2px 12px rgba(42,42,42,0.06)" : "";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 6. Date input minimums --------------------------------------- */
  /* Prevent past-date bookings on reservations and event-inquiry forms.
     Uses the restaurant's timezone (Europe/Athens), not the visitor's UTC
     offset, so "today" is correct for guests browsing from any timezone. */
  const athensToday = (() => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Athens", year: "numeric", month: "2-digit", day: "2-digit"
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      return `${get("year")}-${get("month")}-${get("day")}`;
    } catch (e) {
      return new Date().toISOString().split("T")[0];
    }
  })();
  const todayStr = athensToday;
  const maxAhead = new Date(new Date(athensToday + "T00:00:00Z").getTime() + 365 * 24 * 60 * 60 * 1000);
  const maxAheadStr = maxAhead.toISOString().split("T")[0];
  $$('input[type="date"]').forEach((input) => {
    if (!input.hasAttribute("min")) input.min = todayStr;
    if (!input.hasAttribute("max")) input.max = maxAheadStr;
  });

  /* ---------- 7. Form submission handler ----------------------------------- */
  /* Composes a WhatsApp message from the form data. Detects pop-up blocking
     and falls back to an in-page link so the user is never stuck. */
  const PHONE = "306982373505";

  const MESSAGE_TEMPLATES = {
    reservation: (d) =>
      `Hi Bell Kitchen, I'd like to book a table.\n` +
      `Name: ${d.name || "-"}\n` +
      `Date: ${d.date || "-"}\n` +
      `Time: ${d.time || "-"}\n` +
      `Guests: ${d.guests || "-"}\n` +
      `Phone: ${d.phone || "-"}\n` +
      `Email: ${d.email || "-"}\n` +
      `Notes: ${d.notes || "-"}`,
    contact: (d) =>
      `Hi Bell Kitchen, this is ${d.name || "(no name)"}.\n` +
      `${d.message || "(no message)"}\n` +
      `Reply to: ${d.email || d.phone || "(no contact provided)"}`,
    "event-inquiry": (d) =>
      `Hi Bell Kitchen, I'd like to inquire about an event.\n` +
      `Name: ${d.name || "-"}\n` +
      `Event type: ${d.event_type || "-"}\n` +
      `Venue: ${d.venue || "-"}\n` +
      `Date: ${d.date || "-"}\n` +
      `Guests: ${d.guests || "-"}\n` +
      `Email: ${d.email || "-"}\n` +
      `Phone: ${d.phone || "-"}\n` +
      `Notes: ${d.notes || "-"}`
  };

  function getOrCreateStatus(form) {
    let status = $(".form-status", form);
    if (!status) {
      status = document.createElement("div");
      status.className = "form-status form-note";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.appendChild(status);
    }
    return status;
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  }

  $$("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formType = form.dataset.form;
      const builder = MESSAGE_TEMPLATES[formType] || MESSAGE_TEMPLATES.contact;
      const data = Object.fromEntries(new FormData(form));

      // Steer 9+ groups on the reservation form to the events flow
      if (formType === "reservation" && /^9\+/.test(String(data.guests || ""))) {
        const status = getOrCreateStatus(form);
        status.innerHTML =
          'For groups of 9 or more, our <a href="events.html">Events &amp; Catering form</a> ' +
          "gives us what we need to set the right table and menu. Or WhatsApp us directly at " +
          '<a href="https://wa.me/' + PHONE + '" target="_blank" rel="noopener noreferrer">' +
          "+30 698 237 3505</a>.";
        status.classList.add("form-status--info");
        return;
      }

      const message = builder(data);
      const url = buildWhatsAppUrl(message);

      /* GTM: WhatsApp enquiry submitted (contact / event-inquiry forms). */
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submit",
        form_type: formType,
        page_language: (document.documentElement.lang || "en").toLowerCase()
      });
      const status = getOrCreateStatus(form);

      // Attempt to open WhatsApp in a new tab
      let opened = null;
      try {
        opened = window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) { opened = null; }

      if (opened && !opened.closed) {
        status.textContent = T.waOpening;
        status.classList.remove("form-status--error");
        status.classList.add("form-status--success");
      } else {
        // Pop-up was blocked. Render a manual fallback link so the user is never stuck.
        status.innerHTML =
          'Your browser blocked the new tab. ' +
          '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="btn btn--whatsapp btn--small">' +
          "Tap here to send via WhatsApp</a>";
        status.classList.remove("form-status--success");
        status.classList.add("form-status--error");
      }
    });
  });

  /* ---------- 7b. Universal click tracking (GTM `ui_click`) ----------------- */
  /* One delegated listener covers every <a> and <button> on all 117 pages in
     all six languages. Everything reported is derived from the DESTINATION,
     never the visible label — button text is translated, so keying on it would
     split one action into six rows in GA4. `click_action` is therefore stable
     across locales: the Greek and Chinese "Order Online" buttons both report
     `order_online`. Raw label is passed separately for debugging only. */
  (function trackClicks() {
    /* Destination → stable action id. First match wins, so order matters. */
    const RULES = [
      [/noe\.bfwqr\.com/i,                    "order_online",  "conversion"],
      [/^https?:\/\/wa\.me\//i,               "whatsapp",      "conversion"],
      [/^tel:/i,                              "phone",         "conversion"],
      [/^mailto:/i,                           "email",         "conversion"],
      [/maps\.google\.|google\.[a-z.]+\/maps/i, "directions",  "conversion"],
      [/reservations\.html/i,                 "reserve",       "conversion"],
      [/instagram\.com/i,                     "social_instagram", "social"],
      [/tiktok\.com/i,                        "social_tiktok",    "social"],
      [/facebook\.com/i,                      "social_facebook",  "social"]
    ];

    /* Where on the page the click happened. */
    function placement(el) {
      if (el.closest(".site-header, .nav")) return "header";
      if (el.closest(".mobile-menu")) return "mobile_menu";
      if (el.closest(".mobile-dock, .mobile-cta, .desk-dock")) return "sticky_bar";
      if (el.closest(".site-footer")) return "footer";
      if (el.closest(".hero")) return "hero";
      if (el.closest(".final-cta")) return "final_cta";
      const sec = el.closest("section[class]");
      if (sec) return (sec.className.split(/\s+/)[0] || "section").replace(/-/g, "_");
      return "body";
    }

    /* Internal page slug, locale prefix stripped: /el/moussaka.html -> moussaka */
    function slug(pathname) {
      const last = (pathname || "").split("/").pop() || "index.html";
      return last.replace(/\.html?$/i, "").toLowerCase() || "index";
    }

    function classify(href, el) {
      if (!href) {
        return [(el.getAttribute("data-ck") || el.type || "ui_control").toLowerCase(), "ui"];
      }
      for (const [re, action, category] of RULES) {
        if (re.test(href)) return [action, category];
      }
      if (/^#/.test(href)) return ["anchor_" + href.slice(1).toLowerCase(), "anchor"];
      try {
        const u = new URL(href, location.href);
        if (u.hostname !== location.hostname) return ["outbound_" + u.hostname, "outbound"];
        return ["page_" + slug(u.pathname), "navigation"];
      } catch (e) {
        return ["unknown", "other"];
      }
    }

    document.addEventListener("click", (e) => {
      const el = e.target.closest("a, button");
      if (!el) return;
      /* Forms already emit their own `form_submit`; don't double-report. */
      if (el.type === "submit" && el.closest("form[data-form]")) return;

      const href = el.getAttribute("href");
      const [action, category] = classify(href, el);
      let resolved = href || "";
      try { if (href && !/^(tel:|mailto:|#)/i.test(href)) resolved = new URL(href, location.href).href; }
      catch (err) { /* keep raw */ }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "ui_click",
        click_action: action,                        // stable, language-independent
        click_category: category,                    // conversion | navigation | social | …
        click_placement: placement(el),              // header | hero | footer | sticky_bar | …
        click_url: resolved,
        click_text: (el.innerText || el.getAttribute("aria-label") || "")
          .replace(/\s+/g, " ").trim().slice(0, 100), // debugging only — translated
        click_element: el.tagName.toLowerCase(),
        page_language: LANG
      });
    }, true); /* capture phase: fires even if a handler calls stopPropagation */
  })();

  /* ---------- 8. Year stamp in footer -------------------------------------- */
  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 9. Open-today badge ----------------------------------------- */
  /* Uses the canonical HOURS object above. Athens timezone aware. */
  const openBadge = $("[data-open-badge]");
  if (openBadge) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      weekday: "short", hour: "2-digit", minute: "2-digit",
      hour12: false, timeZone: "Europe/Athens"
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const day = weekdayMap[get("weekday")];
    const hour = parseInt(get("hour"), 10);
    const minute = parseInt(get("minute"), 10);
    const nowHr = hour + minute / 60;

    const today = HOURS[day] || { sessions: [], label: "" };
    const hhmm = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

    let isOpen = false;
    let label = "";

    // Currently inside a session today?
    const current = today.sessions.find((s) => nowHr >= s.open && nowHr < s.close);
    // Next session still to come today?
    const next = today.sessions.find((s) => nowHr < s.open);

    if (current) {
      isOpen = true;
      label = T.openNow(hhmm(current.close));
    } else if (next) {
      label = T.closedOpens(hhmm(next.open));
    } else {

      // No more sessions today - find next opening day
      let daysAhead = 1;
      while (daysAhead <= 7) {
        const nextDay = HOURS[(day + daysAhead) % 7];
        if (nextDay && nextDay.sessions.length) {
          label = T.closedOpensDay(T.days[(day + daysAhead) % 7], hhmm(nextDay.sessions[0].open));
          break;
        }
        daysAhead++;
      }
      if (!label) label = T.closed;
    }

    openBadge.textContent = label;
    openBadge.setAttribute("data-open", isOpen ? "true" : "false");
  }

})();

/* ===========================================================================
   BELL JOURNEY — live sticky-header offset
   The primary nav wraps at some widths (77px … 125px tall), so the journey
   sub-nav and every #act-… deep link need a measured offset, not a guess.
   Publishes --bj-header-h on :root and keeps it current on resize.
   =========================================================================== */
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  if (!header) return;
  var raf = 0;
  function apply() {
    raf = 0;
    var h = Math.round(header.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty("--bj-header-h", h + "px");
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(apply); }
  apply();
  if (typeof ResizeObserver === "function") new ResizeObserver(schedule).observe(header);
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
})();


/* ===========================================================================
   BELL JOURNEY — dietary / journey filtering
   A secondary control under the journey nav. Filters every [data-diet] item,
   then collapses any Main Act or section left with nothing visible, so the
   page never shows an empty heading. Falls back to showing everything.
   =========================================================================== */
(function () {
  "use strict";
  var bar = document.querySelector(".bj-filters");
  if (!bar) return;
  var chips = bar.querySelectorAll(".bj-filter");
  var items = document.querySelectorAll("[data-diet]");
  var empty = document.getElementById("bjFilterEmpty");
  var groups = document.querySelectorAll(".bj-act, .bj-sec");

  function matches(el, f) {
    if (f === "all") return true;
    var d = (el.getAttribute("data-diet") || "").split(/\s+/);
    return d.indexOf(f) > -1;
  }
  function apply(f) {
    var shown = 0;
    items.forEach(function (el) {
      var ok = matches(el, f);
      el.hidden = !ok;
      if (ok) shown++;
    });
    /* collapse a container whose filterable children are all hidden */
    groups.forEach(function (g) {
      var kids = g.querySelectorAll("[data-diet]");
      if (!kids.length) { g.hidden = f !== "all"; return; }
      var any = false;
      kids.forEach(function (k) { if (!k.hidden) any = true; });
      g.hidden = !any;
    });
    if (empty) empty.hidden = !(shown === 0 && f !== "all");
    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-filter") === f ? "true" : "false");
    });
  }
  chips.forEach(function (c) {
    c.addEventListener("click", function () { apply(c.getAttribute("data-filter")); });
  });
  apply("all");
})();
