/* ============================================================================
   Cookaki — Cookie consent (GDPR / ePrivacy compliant, Google Consent Mode v2)
   ----------------------------------------------------------------------------
   • Consent defaults to DENIED (set in <head> before tags load).
   • No analytics / advertising storage until the visitor opts in.
   • "Reject all" is as prominent as "Accept all" (ePrivacy requirement).
   • Granular categories: Necessary (locked) · Preferences · Analytics · Marketing.
   • Choice persisted 12 months; re-prompts on expiry or policy version bump.
   • Banner asks at most once per browsing session (not on every page).
   • Exposes window.CookakiConsent.open() so any "Cookie settings" link can reopen.
   ============================================================================ */
(function () {
  "use strict";

  var STORE_KEY    = "cookaki_consent";
  var SESSION_KEY  = "cookaki_consent_prompted";
  var POLICY_VER   = 1;                 // bump to force re-consent after policy changes
  var MAX_AGE_MS   = 365 * 24 * 60 * 60 * 1000;

  // Ensure gtag exists even if the head snippet was skipped.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // ---- Persistence ---------------------------------------------------------
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== POLICY_VER) return null;
      if (Date.now() - (data.ts || 0) > MAX_AGE_MS) return null;
      return data;
    } catch (e) { return null; }
  }

  function save(categories) {
    var data = { version: POLICY_VER, ts: Date.now(), categories: categories };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
    return data;
  }

  // ---- Push consent state to Google ---------------------------------------
  function apply(categories) {
    gtag("consent", "update", {
      analytics_storage:      categories.analytics  ? "granted" : "denied",
      ad_storage:             categories.marketing  ? "granted" : "denied",
      ad_user_data:           categories.marketing  ? "granted" : "denied",
      ad_personalization:     categories.marketing  ? "granted" : "denied",
      functionality_storage:  categories.preferences ? "granted" : "denied",
      personalization_storage:categories.preferences ? "granted" : "denied"
    });
    // Redact ad click identifiers while marketing consent is absent.
    gtag("set", "ads_data_redaction", !categories.marketing);
    window.dataLayer.push({ event: "cookaki_consent_update", consent: categories });
  }

  function persistAndApply(categories) {
    save(categories);
    apply(categories);
  }

  // ---- DOM -----------------------------------------------------------------
  var els = {};

  function build() {
    var root = document.createElement("div");
    root.className = "ck-consent";
    root.innerHTML =
      '<button class="ck-reopen" type="button" aria-label="Cookie settings" data-ck="reopen">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"/>' +
          '<circle cx="9" cy="11" r="1"/><circle cx="14.5" cy="14.5" r="1"/><circle cx="13" cy="8" r="1"/>' +
        '</svg>' +
      '</button>' +

      '<div class="ck-banner" role="dialog" aria-modal="false" aria-labelledby="ck-banner-title" aria-describedby="ck-banner-text" data-ck="banner">' +
        '<h2 class="ck-banner__title" id="ck-banner-title">We value your privacy</h2>' +
        '<p class="ck-banner__text" id="ck-banner-text">We use cookies to run the site and, with your permission, to understand how it is used and to improve it. ' +
          'You can accept all, reject all, or choose what to allow. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '<div class="ck-actions">' +
          '<button class="ck-btn ck-btn--link" type="button" data-ck="customise">Customise</button>' +
          '<button class="ck-btn ck-btn--ghost" type="button" data-ck="reject">Reject all</button>' +
          '<button class="ck-btn ck-btn--primary" type="button" data-ck="accept">Accept all</button>' +
        '</div>' +
      '</div>' +

      '<div class="ck-backdrop" data-ck="backdrop"></div>' +
      '<div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-modal-title" data-ck="modal">' +
        '<h2 class="ck-modal__title" id="ck-modal-title">Cookie preferences</h2>' +
        '<p class="ck-modal__intro">Choose which cookies Cookaki may use. Necessary cookies are always on because the site cannot function without them. You can change this anytime.</p>' +

        cat("necessary",  "Strictly necessary", "Required for core features such as security, navigation and form submission. Always active.", true, true) +
        cat("preferences","Preferences",        "Remember choices you make (e.g. language) to give you a more personal experience.", false, false) +
        cat("analytics",  "Analytics",          "Help us understand how visitors use the site (Google Analytics) so we can improve it. Data is aggregated.", false, false) +
        cat("marketing",  "Marketing",          "Used to measure campaigns and show more relevant content across Google services.", false, false) +

        '<div class="ck-modal__actions">' +
          '<button class="ck-btn ck-btn--ghost" type="button" data-ck="reject">Reject all</button>' +
          '<button class="ck-btn ck-btn--ghost" type="button" data-ck="accept">Accept all</button>' +
          '<button class="ck-btn ck-btn--primary" type="button" data-ck="save">Save preferences</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    els.root      = root;
    els.banner    = root.querySelector('[data-ck="banner"]');
    els.backdrop  = root.querySelector('[data-ck="backdrop"]');
    els.modal     = root.querySelector('[data-ck="modal"]');
    els.toggles   = {
      preferences: root.querySelector("#ck-cat-preferences"),
      analytics:   root.querySelector("#ck-cat-analytics"),
      marketing:   root.querySelector("#ck-cat-marketing")
    };

    // Wire events (delegated by data-ck).
    root.addEventListener("click", onClick);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.modal.classList.contains("is-open")) closeModal();
    });
  }

  function cat(id, name, desc, checked, locked) {
    var inputId = "ck-cat-" + id;
    return '<div class="ck-cat">' +
      '<div class="ck-cat__name">' + name + '</div>' +
      '<label class="ck-switch">' +
        '<input type="checkbox" id="' + inputId + '"' + (checked ? " checked" : "") + (locked ? " disabled" : "") + ' aria-label="' + name + '">' +
        '<span class="ck-switch__track"></span>' +
      '</label>' +
      '<div class="ck-cat__desc">' + desc + '</div>' +
    '</div>';
  }

  // ---- Behaviour -----------------------------------------------------------
  function showBanner()  { requestAnimationFrame(function(){ els.banner.classList.add("is-open"); }); }
  function hideBanner()  { els.banner.classList.remove("is-open"); }
  function showReopen()  { els.root.classList.add("ck-show-reopen"); }

  function openModal(current) {
    var c = current || load();
    var cats = c ? c.categories : { preferences:false, analytics:false, marketing:false };
    els.toggles.preferences.checked = !!cats.preferences;
    els.toggles.analytics.checked   = !!cats.analytics;
    els.toggles.marketing.checked   = !!cats.marketing;
    hideBanner();
    els.backdrop.classList.add("is-open");
    requestAnimationFrame(function(){ els.modal.classList.add("is-open"); });
    els.modal.querySelector("#ck-cat-preferences").focus();
  }
  function closeModal() {
    els.modal.classList.remove("is-open");
    els.backdrop.classList.remove("is-open");
    if (!load()) showReopen();            // no decision yet -> leave the cookie button
  }

  var ALL  = { preferences:true,  analytics:true,  marketing:true  };
  var NONE = { preferences:false, analytics:false, marketing:false };

  function finalise(categories) {
    persistAndApply(categories);
    hideBanner();
    els.modal.classList.remove("is-open");
    els.backdrop.classList.remove("is-open");
    showReopen();
  }

  function onClick(e) {
    var t = e.target.closest("[data-ck]");
    if (!t) return;
    switch (t.getAttribute("data-ck")) {
      case "accept":    finalise(ALL);  break;
      case "reject":    finalise(NONE); break;
      case "customise": openModal();    break;
      case "reopen":    openModal();    break;
      case "save":
        finalise({
          preferences: els.toggles.preferences.checked,
          analytics:   els.toggles.analytics.checked,
          marketing:   els.toggles.marketing.checked
        });
        break;
      case "backdrop":  closeModal();   break;
    }
  }

  // ---- Public API ----------------------------------------------------------
  window.CookakiConsent = {
    open: function () { openModal(); },
    reset: function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      location.reload();
    }
  };

  // ---- Init ----------------------------------------------------------------
  function init() {
    build();
    var saved = load();
    if (saved) { apply(saved.categories); showReopen(); return; }  // honour stored choice

    // No decision yet. Ask at most once per browsing session so the banner does
    // not reappear on every page. GA stays denied until the visitor chooses.
    var prompted = false;
    try { prompted = !!sessionStorage.getItem(SESSION_KEY); } catch (e) {}

    if (prompted) {
      showReopen();        // already asked this session -> leave the cookie button only
    } else {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
      showBanner();        // first page of the session -> ask
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
