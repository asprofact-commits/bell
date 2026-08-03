# Google Tag Manager — Cookaki / Bell Kitchen

Container: **GTM-K6C53VGR** · GA4 property: **G-VCL4K7HGYJ**

This file documents the tracking architecture after the August 2026 consolidation.
Code changes are already deployed in this repo. The container work below must be
done by hand in the GTM UI.

---

## ⚠️ Do this first, or analytics goes dark

The hardcoded `gtag('config','G-VCL4K7HGYJ')` was removed from all 117 pages so
that GA4 is loaded **once**, by GTM. Until you create the Google tag described in
step 1 below, **no GA4 data will be collected.** Everything else can wait; that
one cannot.

---

## 1. What changed in the code

| Change | Scope |
|---|---|
| Removed `gtag('config','G-VCL4K7HGYJ')` and the `gtag/js` loader | all 117 pages |
| Added the GTM container snippet (head + `<noscript>`) | 76 pages — `de/`, `fr/`, `es/`, `zh/` |
| Added `dataLayer.push({page_language})` before the container loads | all 117 pages |
| Extended CSP for GTM, Google Ads conversion + remarketing | all 117 pages |
| Added `reservation_complete` dataLayer event | 6 × `reservations.html` |
| Added `form_submit` dataLayer event | `assets/js/main.js` |

Consent Mode v2 was left untouched — the inline defaults in `<head>` still run
before any tag, and GTM reads consent state straight from `dataLayer`. It does
not need `gtag.js` to be present.

### dataLayer events now emitted by the site

`reservation_complete` — fires only on a confirmed booking, after the API returns `ok`.

```js
{
  event: 'reservation_complete',
  reservation_id:       payload.cid,   // unique, use for GA4 deduplication
  reservation_party:    S.party,
  reservation_date:     S.date,        // YYYY-MM-DD
  reservation_time:     S.time,        // HH:MM
  reservation_language: LANG
}
```

`form_submit` — fires when the contact or events form hands off to WhatsApp.

```js
{
  event: "form_submit",
  form_type: "contact" | "event-inquiry",
  page_language: "en" | "el" | "de" | "fr" | "es" | "zh"
}
```

`cookaki_consent_update` — already existed, fires when the visitor sets consent.

---

## 2. Variables to create

**Enable these built-ins** (Variables → Configure): Click URL, Click Text,
Click Classes, Click ID, Page Path, Page Hostname, Page URL.

**Create these Data Layer Variables** (Variable type: Data Layer Variable,
version 2):

| Variable name | Data layer key |
|---|---|
| `DLV - page_language` | `page_language` |
| `DLV - form_type` | `form_type` |
| `DLV - reservation_id` | `reservation_id` |
| `DLV - reservation_party` | `reservation_party` |
| `DLV - reservation_date` | `reservation_date` |
| `DLV - reservation_time` | `reservation_time` |

---

## 3. Triggers to create

All click triggers use **Click - Just Links**, with *Wait for Tags* off and
*Check Validation* off, firing on **Some Link Clicks**.

Match on **Click URL only** — never on Click Text. Button labels are translated
into six languages; the URLs are identical everywhere, which is what makes one
set of triggers cover the whole site.

| Trigger name | Type | Condition |
|---|---|---|
| `Click - Order Online` | Just Links | Click URL contains `noe.bfwqr.com` |
| `Click - WhatsApp` | Just Links | Click URL contains `wa.me/306982373505` |
| `Click - Phone` | Just Links | Click URL contains `tel:+302109219818` |
| `Click - Directions` | Just Links | Click URL contains `maps.google.com` |
| `Click - Reserve CTA` | Just Links | Click URL contains `reservations.html` |
| `Click - Social` | Just Links | Click URL matches RegEx `instagram\.com\|tiktok\.com` |
| `Event - Reservation Complete` | Custom Event | Event name `reservation_complete` |
| `Event - Form Submit` | Custom Event | Event name `form_submit` |

---

## 4. Tags to create

### 4.1 Google tag (GA4) — required

- Tag type: **Google Tag**
- Tag ID: `G-VCL4K7HGYJ`
- Configuration parameter: `page_language` = `{{DLV - page_language}}`
- Trigger: **Initialization - All Pages**
- Consent Settings → Additional consent checks: require `analytics_storage`

This tag alone sends `page_view`. Nothing else on the site does, so there is no
double counting. Leave GA4 Enhanced Measurement on — its automatic `click`
events use a different event name than the custom events below and will not
collide.

### 4.2 GA4 event tags

All are tag type **GA4 Event**, Measurement ID `G-VCL4K7HGYJ`, with Additional
consent checks set to `analytics_storage`.

| Tag name | Event name | Parameters | Trigger |
|---|---|---|---|
| `GA4 - Order Online Click` | `order_online_click` | `page_language` | Click - Order Online |
| `GA4 - WhatsApp Click` | `whatsapp_click` | `page_language`, `link_url` = `{{Click URL}}` | Click - WhatsApp |
| `GA4 - Phone Click` | `phone_click` | `page_language` | Click - Phone |
| `GA4 - Directions Click` | `directions_click` | `page_language` | Click - Directions |
| `GA4 - Reserve CTA Click` | `reserve_cta_click` | `page_language` | Click - Reserve CTA |
| `GA4 - Social Click` | `social_click` | `page_language`, `link_url` | Click - Social |
| `GA4 - Form Submit` | `form_submit` | `form_type`, `page_language` | Event - Form Submit |
| `GA4 - Reservation Complete` | `reservation_complete` | `reservation_id`, `reservation_party`, `reservation_date`, `reservation_time`, `page_language` | Event - Reservation Complete |

### 4.3 Google Ads conversions

Only build these once the Ads account is linked and you have the Conversion ID
and Label for each action.

| Tag name | Trigger | Notes |
|---|---|---|
| `Ads - Reservation` | Event - Reservation Complete | Set Transaction ID = `{{DLV - reservation_id}}` so retries do not double-count |
| `Ads - WhatsApp Click` | Click - WhatsApp | Secondary conversion |
| `Ads - Order Online Click` | Click - Order Online | Secondary conversion |
| `Ads - Remarketing` | Initialization - All Pages | Google Ads Remarketing tag |

Set Additional consent checks to `ad_storage` **and** `ad_user_data` on every Ads
tag. The CSP now permits `googleadservices.com`, `googleads.g.doubleclick.net`,
`td.doubleclick.net` and `bid.g.doubleclick.net`, so these will not be blocked.

---

## 5. Mark conversions in GA4

Admin → Data display → Events → toggle **Mark as key event** for:

- `reservation_complete` — the real conversion
- `whatsapp_click`
- `order_online_click`
- `form_submit`

---

## 6. Adding anything else later

The Content Security Policy is declared as a `<meta http-equiv>` tag in each
page's `<head>`. Any new third-party tag has to be added there, on all 117
pages, or it will fail silently.

Meta Pixel, for example, is currently **blocked**. It would need:

- `script-src` … `https://connect.facebook.net`
- `img-src` … `https://www.facebook.com`
- `connect-src` … `https://www.facebook.com`

---

## 7. Testing checklist

After deploying, run GTM **Preview** against `https://www.bellacropolis.gr` and
confirm, on at least one English and one non-English page:

- [ ] Container loads; `page_language` shows the correct locale
- [ ] Accept cookies → `analytics_storage` flips to granted, Google tag fires
- [ ] Before accepting → GA4 tags show as blocked by consent
- [ ] Exactly **one** `page_view` per page load
- [ ] Order / WhatsApp / phone / directions / reserve clicks each fire once
- [ ] Complete a test booking → `reservation_complete` fires with the `cid`
- [ ] Submit the contact form → `form_submit` fires with `form_type: contact`
- [ ] Browser console shows **no** Content Security Policy violations
- [ ] GA4 DebugView receives the events

Test the Chinese pages specifically — they were never tagged before this change.
