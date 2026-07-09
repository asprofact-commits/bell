/* =============================================================================
   Bell Kitchen · Cookaki — main.js
   Vanilla JS · No dependencies · Accessible · Respects prefers-reduced-motion
   ============================================================================= */
(function () {
  "use strict";

  /* ---------- Helpers ------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

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
  /* Prevent past-date bookings on reservations and event-inquiry forms */
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const maxAhead = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
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
      const status = getOrCreateStatus(form);

      // Attempt to open WhatsApp in a new tab
      let opened = null;
      try {
        opened = window.open(url, "_blank", "noopener,noreferrer");
      } catch (err) { opened = null; }

      if (opened && !opened.closed) {
        status.textContent = "Άνοιγμα WhatsApp — πατήστε Αποστολή στο WhatsApp για επιβεβαίωση.";
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

    const today = HOURS[day];
    const hhmm = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

    let isOpen = false;
    let label = "";

    // Currently inside a session today?
    const current = today.sessions.find((s) => nowHr >= s.open && nowHr < s.close);
    // Next session still to come today?
    const next = today.sessions.find((s) => nowHr < s.open);

    if (current) {
      isOpen = true;
      label = `Ανοιχτά τώρα · Έως ${hhmm(current.close)}`;
    } else if (next) {
      label = `Κλειστά · Ανοίγει ${hhmm(next.open)}`;
    } else {

      // No more sessions today - find next opening day
      let daysAhead = 1;
      while (daysAhead <= 7) {
        const nextDay = HOURS[(day + daysAhead) % 7];
        if (nextDay && nextDay.sessions.length) {
          const dayNames = ["Κυρ", "Δευ", "Τρί", "Τετ", "Πέμ", "Παρ", "Σάβ"];
          label = "Κλειστά · Ανοίγει " + dayNames[(day + daysAhead) % 7] + " " + hhmm(nextDay.sessions[0].open);
          break;
        }
        daysAhead++;
      }
      if (!label) label = "Κλειστά";
    }

    openBadge.textContent = label;
    openBadge.setAttribute("data-open", isOpen ? "true" : "false");
  }

})();
