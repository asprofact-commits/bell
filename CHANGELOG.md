# Bell Kitchen · Cookaki — Post-Audit Fix Pass

**Date:** 31 May 2026
**Scope:** Applies the fixable findings from the Cybersecurity / QA / UX / Operations audit (`Cookaki_Bell_Kitchen_Security_QA_UX_Ops_Audit.docx`) and the earlier SEO / GEO audit.

---

## Fixed in this pass (you don't need to do anything for these)

### Critical
- **BUG-01** — Events.html form was silently broken. `main.js` now has a dedicated `event-inquiry` branch that composes a full WhatsApp message with event type, venue, date, guest count, and notes.
- **OPS-01** — Created `privacy.html` and `terms.html`. Both are GDPR-aware drafts, flagged with a note that the owners should have a Greek-qualified lawyer review before publishing.

### High
- **BUG-02** — Form handler now detects pop-up blocking (window.open returning null or closed) and renders a clickable WhatsApp fallback link so the user is never stuck on a "Opening WhatsApp…" message that does nothing.
- **BUG-03** — All `<input type="date">` get `min=today` and `max=today+365d` set by JavaScript on page load. `novalidate` removed from all forms so HTML5 validation also runs.
- **OPS-02** — Opening hours centralised in a single `HOURS` object at the top of `main.js`. The open-now badge now derives correctly per day-of-week with Athens timezone, and handles after-midnight Friday/Saturday spillover. **Still needs your input:** confirm the actual Sunday hours (events.html says "we open earlier on Sundays" — what time?), then update the table on `contact.html` and the JSON-LD `openingHoursSpecification` on `index.html` to match.
- **OPS-05** — The reservations form's "9+" option label updated to "9+ (use Events form)". When selected, the form intercepts the submit and shows an inline message linking to events.html instead of routing to WhatsApp with insufficient context.
- **OPS-06** — All WhatsApp form messages now start with "Hi Bell Kitchen" (was "Hi Cookaki"). Brand voice consistent at the conversion point.
- **BIZ-01** — Fabricated `aggregateRating` block (4.8/5, 850 reviews) removed from the Restaurant JSON-LD on `index.html`. Eliminates the Google manual-action risk.
- **BIZ-02** — All six named suppliers on `ingredients.html` softened to regional descriptors ("Cretan olive grove", "Evia mountain dairy", "Peloponnesian beekeeper", etc.). Removes the reputational landmine. As you confirm real producers and get their permission, add specific names and links back.
- **SEC-04** — `rel="noopener noreferrer"` (was just `noopener`) on all 121 external links. Stops referrer leakage to Wolt, efood, WhatsApp, Instagram, Google Maps.
- **PRF-01** — Google Fonts now load via preload-and-swap pattern with a `<noscript>` fallback. Removes the render-blocking third-party CSS request from the critical path. Should shave ~300-400ms off LCP on mid-grade mobile.

### Medium
- **BUG-04** — Inline SVG legacy favicon replaced sitewide with the Bell Kitchen logo PNG. Brand consistency restored on every tab.
- **BUG-05** — Eleven missing dish/interior image references now point to `bell-kitchen-plaque.jpg` as a placeholder. No more 404s during the launch window. **Still needs your input:** the placeholder is not what those plates actually look like. Replace each one with a real photo using the existing SEO filenames (see `assets/images/README.txt`).
- **BUG-06** — All form inputs got sensible `maxlength` attributes: name=120, email=160, phone=40, textarea=1500. Prevents pasted-payload abuse and oversized WhatsApp URLs that silently fail.
- **SEC-02** — `Content-Security-Policy` meta tag added to every page (including the two new legal pages). Defence-in-depth XSS hardening with a policy tuned for the actual third-party deps (Google Fonts, Maps, wa.me).
- **SEC-05** — Google Maps iframe in `contact.html` now sandboxed (`sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`). Restricts what the embed can do.
- **SEO S01** — Removed the two `Disallow` lines from `robots.txt` that were blocking `/assets/css/` and `/assets/js/`. Also added explicit `Allow` blocks for Googlebot, Google-Extended, GPTBot, ClaudeBot, PerplexityBot, Applebot, Bingbot.
- **SEO S08** — `<lastmod>` added to every URL in `sitemap.xml`. Privacy and Terms pages added to the sitemap. 12 URLs total.
- **SEO S12** — `aria-current="page"` added to active nav links on `reservations.html`, `delivery.html`, and `gallery.html` (mobile-menu lists). Was already present on the other 7.
- **GEO G04** — Three review-aggregator `sameAs` entries added to the Restaurant schema: TripAdvisor, Restaurant Guru, Sluurpy. Wires up external authority signals for AI citation. **Verify the URLs** — they're best-guess paths; confirm against the actual live listing URLs.

### Low
- **PRF-05** — All below-fold images get `loading="lazy" decoding="async"`. Header logos and the hero image were correctly preserved as eager-loaded (LCP protection).

---

## Still needs your action (I can't do these without input)

1. **OPS-04 — Verify Wolt and efood URL slugs.** Visit `https://wolt.com/en/grc/athens/restaurant/cookaki` and `https://www.e-food.gr/delivery/athina/cookaki` in a browser. If either resolves to a 404, tell me the correct slug and I'll search-and-replace site-wide.

2. **OPS-02 (final piece) — Confirm Sunday hours.** The events page mentions "we open earlier on Sundays" — what time? Currently the canonical `HOURS` object in `main.js` says Sunday is 12:00-24:00 like Mon-Thu. If Sunday is actually e.g. 10:00-23:00, edit line 14 of `main.js` and update the `contact.html` table and `index.html` schema to match.

3. **BIZ-03 — Domain reclamation.** cookaki.gr is still expired. Either redeem it from the registrar or commit to a new domain (e.g. bellkitchen.gr). When chosen, run: `cd cookaki-website && find . -name "*.html" -exec sed -i 's|https://cookaki.gr|https://YOUR-DOMAIN|g' {} \;` (also update `sitemap.xml`).

4. **Real dish photographs.** 11 photos still need to be shot. The placeholder is the plaque image — functional but visually wrong for menu/gallery cards. SEO-optimal filenames are in `assets/images/README.txt`.

5. **SEC-01 — Server-side form handler (post-launch upgrade).** The form data still appears briefly in the URL bar before WhatsApp opens. To eliminate this, sign up for Formspree (free tier) or Netlify Forms and replace the wa.me transport with a `<form action="https://formspree.io/f/YOUR_ID" method="POST">`. I can wire this up in 20 minutes once you have an endpoint.

6. **SEC-03 — HTTP security headers.** These come from the hosting platform, not the HTML. Once you pick a host (Netlify, Cloudflare Pages, GitHub Pages, Vercel), I'll add the appropriate `_headers` file or `vercel.json` config for HSTS, X-Frame-Options, etc.

7. **Legal review of `privacy.html` and `terms.html`.** Both are reasonable drafts but need a Greek-qualified lawyer to confirm before publishing. Particularly: cancellation timings, deposit percentages, and consumer-rights references.

---

## Files changed

| File | Change |
|------|--------|
| `assets/js/main.js` | Rewritten — fixes BUG-01, BUG-02, BUG-03, OPS-02, OPS-05, OPS-06 |
| `assets/css/main.css` | Added 17 lines of form-status styles |
| `robots.txt` | Unblocks CSS/JS, welcomes AI bots |
| `sitemap.xml` | Added lastmod + 2 new URLs |
| `index.html` | Removed fake aggregateRating, added 3 sameAs links, applied sitewide fixes |
| `ingredients.html` | Six supplier cards softened to regional descriptors |
| `reservations.html` | 9+ option relabelled, sitewide fixes |
| All other 7 HTML pages | CSP, noreferrer, favicon, font async, maxlength, lazy-load, iframe sandbox |
| `privacy.html` | **NEW** — GDPR-aware policy |
| `terms.html` | **NEW** — Terms of service |
| `CHANGELOG.md` | **NEW** — This file |

---

## Fix pass #2 — 31 May 2026

### Bell Kitchen plaque centering
- `.bell-plaque` converted from text-align-only centering to a flexbox column with `align-items:center`, with explicit `width:100%` on every direct child so the full-width gold rules above and below "70 Years", the dotted divider, and the top/bottom borders all share the exact same horizontal axis as the title, image, and Greek motto. Verified at 0px offset between plaque center and section center.
- Specific size overrides preserved: `.plaque-logo` keeps its `clamp(80px,12vw,110px)` width, `.plaque-explanation` keeps its `max-width:44ch` (with `width:auto` to defeat the 100% inheritance).
- Applies to both `index.html` and `about.html` (the two pages using the plaque section).

### Email change sitewide
- `hello@cookaki.gr` → `info@littlenoe.com` everywhere it appeared: visible mailto links, JSON-LD email property, privacy/terms contact references, hiring CTA, group dinner FAQ, contact list. 12 references updated across 8 pages. No leftover occurrences anywhere in the codebase.

---

## Fix pass #3 — 1 June 2026

### Centered alignment on Ingredients, Events, Pantry (Products), Visit (Contact)
Added ~80 lines of scoped CSS at the bottom of `assets/css/main.css` to bring the four named pages into the same centered editorial tone as the homepage Bell Kitchen plaque:

- **Page hero ledes** now center-aligned with `max-width:60ch` and `margin-inline:auto`. Verified at 0px offset from page midline on all four pages.
- **`.container--narrow` prose** (the "Why we open the pantry" block on ingredients; the bridge quote on events and products; the FAQ entry-line on events) — headings, paragraphs, and list blocks all centered.
- **Supplier cards** (ingredients.html) — card titles, product line, and description body centered inside each card.
- **Product cards** (products.html) — title, origin, body, and price row centered. CTA button kept full-width.
- **Event-type cards** (events.html) — icon, title, body, and detail line centered. Card becomes a flex column with `align-items:center`.
- **Voice cards** (events + products voice section) — quote and 5-star meta line centered.
- **Bridge quote blocks** on events/products — the inline-styled `border-left:4px solid var(--gold)` divs now use a `border-top` instead and center their owner-quote attribution.
- **Two-column "What we bring / Catering styles"** on events and **"Three ways to get the pantry / Bulk & gifts"** on products — column headings centered; ordered/unordered lists inside stay left-aligned (for scannability) but the list block itself is centered as an inline-block.
- **Contact info-blocks** (Address, Talk to us, Opening hours) — all centered; phone/email list inside Talk-to-us kept as left-aligned text inside a centered block. Hours table centered.
- **Getting-here cards** on contact — card titles and bodies centered.
- **Form helper text** and "Prefer to talk?"/"Prefer email?" lines centered.

### Inline-style cleanup on ingredients.html
Removed `text-align:left` from two inline `style=""` attributes ("Why we open the pantry" eyebrow and the "If you can't name it..." H2) that were overriding the new centering rule.

### Leftover supplier names on products.html
Three references missed in fix pass #2 (`The Manousakis Grove · Sitia, Crete` on two olive-oil products, `Yiannis's Beekeeping · Arcadia` on thyme honey) softened to `Cretan olive grove · Sitia` and `Peloponnesian beekeeper · Arcadia`. Brings products.html in line with the ingredients.html softening.

### FAQ open-state preserved for readability
The `<details>` FAQ summaries are now centered (consistent with the heritage-editorial tone) but when opened, the answer paragraph reverts to left-aligned prose with a `max-width:62ch` for readability of long answers.

### Pages NOT changed
- The CSS rules are scoped via specific selectors (`.container--narrow > h2`, `.supplier-card .supplier-body`, etc.) so the homepage, menu, about, gallery, reservations, and delivery pages render identically to before. Delivery's existing `section-title--left` modifier still wins (correctly) over the new centering rules.
