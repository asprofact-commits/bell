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

  // ---- i18n (driven by <html lang>; consent must be understandable) --------
  var LANG = (document.documentElement.getAttribute("lang") || "en").slice(0, 2).toLowerCase();
  var I18N = {
    en: { bannerTitle: "We value your privacy",
          bannerText: 'We use cookies to run the site and, with your permission, to understand how it is used and to improve it. You can accept all, reject all, or choose what to allow. See our <a href="privacy.html">Privacy Policy</a>.',
          customise: "Customise", reject: "Reject all", accept: "Accept all", save: "Save preferences",
          modalTitle: "Cookie preferences",
          modalIntro: "Choose which cookies Cookaki may use. Necessary cookies are always on because the site cannot function without them. You can change this anytime.",
          reopenLabel: "Cookie settings",
          cats: { necessary: ["Strictly necessary", "Required for core features such as security, navigation and form submission. Always active."],
                  preferences: ["Preferences", "Remember choices you make (e.g. language) to give you a more personal experience."],
                  analytics: ["Analytics", "Help us understand how visitors use the site (Google Analytics) so we can improve it. Data is aggregated."],
                  marketing: ["Marketing", "Used to measure campaigns and show more relevant content across Google services."] } },
    el: { bannerTitle: "Σεβόμαστε το απόρρητό σας",
          bannerText: 'Χρησιμοποιούμε cookies για τη λειτουργία του site και, με την άδειά σας, για να κατανοούμε τη χρήση του και να το βελτιώνουμε. Μπορείτε να τα αποδεχθείτε όλα, να τα απορρίψετε όλα ή να επιλέξετε τι επιτρέπετε. Δείτε την <a href="privacy.html">Πολιτική Απορρήτου</a>.',
          customise: "Προσαρμογή", reject: "Απόρριψη όλων", accept: "Αποδοχή όλων", save: "Αποθήκευση προτιμήσεων",
          modalTitle: "Προτιμήσεις cookies",
          modalIntro: "Επιλέξτε ποια cookies μπορεί να χρησιμοποιεί το Cookaki. Τα απαραίτητα cookies είναι πάντα ενεργά γιατί χωρίς αυτά το site δεν λειτουργεί. Μπορείτε να αλλάξετε την επιλογή σας οποιαδήποτε στιγμή.",
          reopenLabel: "Ρυθμίσεις cookies",
          cats: { necessary: ["Απολύτως απαραίτητα", "Απαιτούνται για βασικές λειτουργίες όπως ασφάλεια, πλοήγηση και υποβολή φορμών. Πάντα ενεργά."],
                  preferences: ["Προτιμήσεις", "Θυμούνται επιλογές σας (π.χ. γλώσσα) για πιο προσωπική εμπειρία."],
                  analytics: ["Στατιστικά", "Μας βοηθούν να κατανοούμε πώς χρησιμοποιείται το site (Google Analytics) ώστε να το βελτιώνουμε. Τα δεδομένα είναι συγκεντρωτικά."],
                  marketing: ["Μάρκετινγκ", "Χρησιμοποιούνται για μέτρηση καμπανιών και πιο σχετικό περιεχόμενο στις υπηρεσίες Google."] } },
    de: { bannerTitle: "Wir respektieren Ihre Privatsphäre",
          bannerText: 'Wir verwenden Cookies für den Betrieb der Website und — mit Ihrer Erlaubnis — um ihre Nutzung zu verstehen und sie zu verbessern. Sie können alle akzeptieren, alle ablehnen oder auswählen, was Sie erlauben. Siehe unsere <a href="privacy.html">Datenschutzerklärung</a>.',
          customise: "Anpassen", reject: "Alle ablehnen", accept: "Alle akzeptieren", save: "Einstellungen speichern",
          modalTitle: "Cookie-Einstellungen",
          modalIntro: "Wählen Sie, welche Cookies Cookaki verwenden darf. Notwendige Cookies sind immer aktiv, da die Website ohne sie nicht funktioniert. Sie können dies jederzeit ändern.",
          reopenLabel: "Cookie-Einstellungen",
          cats: { necessary: ["Unbedingt erforderlich", "Erforderlich für Kernfunktionen wie Sicherheit, Navigation und Formularversand. Immer aktiv."],
                  preferences: ["Präferenzen", "Merken sich Ihre Auswahl (z. B. Sprache) für ein persönlicheres Erlebnis."],
                  analytics: ["Analyse", "Helfen uns zu verstehen, wie Besucher die Website nutzen (Google Analytics), damit wir sie verbessern können. Daten werden aggregiert."],
                  marketing: ["Marketing", "Dienen der Kampagnenmessung und relevanteren Inhalten in Google-Diensten."] } },
    fr: { bannerTitle: "Nous respectons votre vie privée",
          bannerText: 'Nous utilisons des cookies pour faire fonctionner le site et, avec votre permission, pour comprendre son utilisation et l\'améliorer. Vous pouvez tout accepter, tout refuser ou choisir ce que vous autorisez. Consultez notre <a href="privacy.html">Politique de confidentialité</a>.',
          customise: "Personnaliser", reject: "Tout refuser", accept: "Tout accepter", save: "Enregistrer les préférences",
          modalTitle: "Préférences de cookies",
          modalIntro: "Choisissez les cookies que Cookaki peut utiliser. Les cookies nécessaires sont toujours actifs car le site ne peut pas fonctionner sans eux. Vous pouvez modifier ce choix à tout moment.",
          reopenLabel: "Paramètres des cookies",
          cats: { necessary: ["Strictement nécessaires", "Requis pour les fonctions essentielles : sécurité, navigation, envoi de formulaires. Toujours actifs."],
                  preferences: ["Préférences", "Mémorisent vos choix (p. ex. la langue) pour une expérience plus personnelle."],
                  analytics: ["Statistiques", "Nous aident à comprendre l'utilisation du site (Google Analytics) afin de l'améliorer. Données agrégées."],
                  marketing: ["Marketing", "Servent à mesurer les campagnes et à proposer des contenus plus pertinents dans les services Google."] } },
    es: { bannerTitle: "Valoramos su privacidad",
          bannerText: 'Usamos cookies para el funcionamiento del sitio y, con su permiso, para entender cómo se usa y mejorarlo. Puede aceptarlas todas, rechazarlas todas o elegir qué permitir. Consulte nuestra <a href="privacy.html">Política de privacidad</a>.',
          customise: "Personalizar", reject: "Rechazar todo", accept: "Aceptar todo", save: "Guardar preferencias",
          modalTitle: "Preferencias de cookies",
          modalIntro: "Elija qué cookies puede usar Cookaki. Las cookies necesarias están siempre activas porque el sitio no puede funcionar sin ellas. Puede cambiar su elección en cualquier momento.",
          reopenLabel: "Configuración de cookies",
          cats: { necessary: ["Estrictamente necesarias", "Necesarias para funciones básicas como seguridad, navegación y envío de formularios. Siempre activas."],
                  preferences: ["Preferencias", "Recuerdan sus elecciones (p. ej. el idioma) para una experiencia más personal."],
                  analytics: ["Analítica", "Nos ayudan a entender cómo se usa el sitio (Google Analytics) para mejorarlo. Datos agregados."],
                  marketing: ["Marketing", "Se usan para medir campañas y mostrar contenido más relevante en los servicios de Google."] } },
    zh: { bannerTitle: "我们重视您的隐私",
          bannerText: '我们使用 Cookie 来运行本网站，并在征得您同意后了解网站的使用情况以便改进。您可以全部接受、全部拒绝，或选择允许的类别。请参阅我们的<a href="privacy.html">隐私政策</a>。',
          customise: "自定义", reject: "全部拒绝", accept: "全部接受", save: "保存偏好",
          modalTitle: "Cookie 偏好设置",
          modalIntro: "请选择 Cookaki 可以使用哪些 Cookie。必要的 Cookie 始终启用，因为没有它们网站无法运行。您可以随时更改选择。",
          reopenLabel: "Cookie 设置",
          cats: { necessary: ["绝对必要", "用于安全、导航和表单提交等核心功能。始终启用。"],
                  preferences: ["偏好", "记住您的选择（例如语言），提供更个性化的体验。"],
                  analytics: ["统计分析", "帮助我们了解访客如何使用网站（Google Analytics）以便改进。数据为汇总数据。"],
                  marketing: ["营销", "用于衡量营销活动，并在 Google 服务中展示更相关的内容。"] } }
  };
  var T = I18N[LANG] || I18N.en;

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
      '<button class="ck-reopen" type="button" aria-label="' + T.reopenLabel + '" data-ck="reopen">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"/>' +
          '<circle cx="9" cy="11" r="1"/><circle cx="14.5" cy="14.5" r="1"/><circle cx="13" cy="8" r="1"/>' +
        '</svg>' +
      '</button>' +

      '<div class="ck-banner" role="dialog" aria-modal="false" aria-labelledby="ck-banner-title" aria-describedby="ck-banner-text" data-ck="banner">' +
        '<h2 class="ck-banner__title" id="ck-banner-title">' + T.bannerTitle + '</h2>' +
        '<p class="ck-banner__text" id="ck-banner-text">' + T.bannerText + '</p>' +
        '<div class="ck-actions">' +
          '<button class="ck-btn ck-btn--link" type="button" data-ck="customise">' + T.customise + '</button>' +
          '<button class="ck-btn ck-btn--ghost" type="button" data-ck="reject">' + T.reject + '</button>' +
          '<button class="ck-btn ck-btn--primary" type="button" data-ck="accept">' + T.accept + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="ck-backdrop" data-ck="backdrop"></div>' +
      '<div class="ck-modal" role="dialog" aria-modal="true" aria-labelledby="ck-modal-title" data-ck="modal">' +
        '<h2 class="ck-modal__title" id="ck-modal-title">' + T.modalTitle + '</h2>' +
        '<p class="ck-modal__intro">' + T.modalIntro + '</p>' +

        cat("necessary",  T.cats.necessary[0],   T.cats.necessary[1],   true,  true) +
        cat("preferences",T.cats.preferences[0], T.cats.preferences[1], false, false) +
        cat("analytics",  T.cats.analytics[0],   T.cats.analytics[1],   false, false) +
        cat("marketing",  T.cats.marketing[0],   T.cats.marketing[1],   false, false) +

        '<div class="ck-modal__actions">' +
          '<button class="ck-btn ck-btn--ghost" type="button" data-ck="reject">' + T.reject + '</button>' +
          '<button class="ck-btn ck-btn--ghost" type="button" data-ck="accept">' + T.accept + '</button>' +
          '<button class="ck-btn ck-btn--primary" type="button" data-ck="save">' + T.save + '</button>' +
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
