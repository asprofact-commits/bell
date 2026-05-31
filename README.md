# COOKaki | Bell Kitchen 1956 — Website

Heritage-led conversion site for **Cookaki Bell Kitchen 1956**, Petméza 5, Koukáki, Athens. Built as a static HTML/CSS/JS bundle — no backend, no build step. Drop it on any host and it works.

---

## What's in the box

**10 HTML pages** wired together with consistent header, footer, and Bell Kitchen brand layer:

| Page | Purpose |
|------|---------|
| `index.html` | Homepage with Bell Plaque, Open Pantry transparency, Customer Voice, and Revenue Triptych (Events / Catering / Pantry) |
| `menu.html` | Full filterable menu — starters, mains, daily specials, desserts |
| `about.html` | The 1956 story, the Little NOE Team, Bell Plaque section |
| `ingredients.html` | **Open Pantry** — what we use, what we don't, named suppliers (Manousakis Grove, Dimitra's Dairy, Yiannis the Beekeeper, etc.) |
| `events.html` | **Private events & catering** — in-venue (birthdays, baptisms, corporate) + off-venue catering, inquiry form, FAQ |
| `products.html` | **Pantry sales** — olive oil, thyme honey, spice kits, gift boxes (WhatsApp ordering) |
| `gallery.html` | Food, room, and team photography |
| `reservations.html` | Table booking with WhatsApp fallback |
| `delivery.html` | Wolt + efood routing, delivery zones |
| `contact.html` | Address, hours, map, all contact channels |

Plus: `assets/css/main.css`, `assets/js/main.js`, `robots.txt`, `sitemap.xml`, JSON-LD Schema.org on every page, OpenGraph + Twitter cards, favicon.

---

## Brand layer (Phase 2)

The Bell Kitchen visual identity sits alongside the original warm taverna palette:

**Heritage (navy + gold)** — used for the Bell Plaque, transparency sections, voice quotes, event eyebrows, footer brand mark:
- Navy `#0F1F3D`, Navy-deep `#081427`, Gold `#B8943E`, Gold-bright `#D4B86A`, Ivory `#F5ECD6`

**Warmth (olive + terracotta)** — kept for food cards, primary CTAs, hospitality sections:
- Olive `#556B52`, Terracotta `#B86B4B`, Cream `#F6F1E7`, Beige `#D8CBB8`, Charcoal `#2A2A2A`

Type: Cormorant Garamond (display) + Inter (body).

**Bell Plaque section** (homepage + about page) recreates your gold-framed brand display in HTML — Bell Kitchen logo, "70 Years", "Honest Home-Cooked Tales", three pillars (Memory Through Taste · Integrity of Ingredients · Metabolic Wisdom), the Greek motto *Εκ Της εἰς Τέχνην / Εκ Τέχνης εἰς Ἀπόλαυσιν*, and the closing line "From Earth. To Table. To Memory. Honest Choices. Richer Life."

---

## Conversion strategy applied

Built directly from the Django Method benchmarks in your strategy brief:

1. **Ingredient visuals** → `ingredients.html` features 6 named-supplier cards with story, origin, and what they grow for you.
2. **Radical transparency** → Two-column "What we use / What we don't use" grid lives on both the homepage and `ingredients.html`. We name palm oil, artificial enhancers, bouillon cubes, and food colourings as things we refuse — same posture as Django's gelato list.
3. **Humanizing the process** → Owner-quote bridge blocks from Mixalis and Vangjel anchor `events.html` and `products.html`. Customer Voice section on the homepage uses real review language.
4. **Navigational prominence** → Catering, Our Story, Ingredients, and Pantry are top-level nav items, not buried in the footer.

**Conversion pathing**: Homepage triptych links dine-in trust → events → catering → products. Every page funnels to Reserve, Order on Wolt, or WhatsApp.

---

## ⚠️ Before you ship — three things you must do

### 1. Drop the dish photos in `assets/images/`
The HTML expects these exact filenames (SEO-optimised, no spaces, descriptive):

```
cookaki-athens-moussaka-traditional-greek.jpg
cookaki-athens-pastitsio-homemade-lasagna.jpg
cookaki-athens-kokkinisto-braised-beef-orzo.jpg
cookaki-athens-pansetakia-grilled-pork-belly.jpg
cookaki-athens-skoumpri-grilled-mackerel.jpg
cookaki-athens-psarosoupa-fish-soup-veloute.jpg
cookaki-athens-grilled-chicken-fillet-rice.jpg
cookaki-athens-sfakiani-pita-honey.jpg
cookaki-athens-tiramisu-traditional-dessert.jpg
cookaki-athens-san-sebastian-burnt-cheesecake.jpg
cookaki-athens-interior-1956-koukaki.jpg
cookaki-athens-wine-glasses-plants-koukaki.jpg
```

Plus product photos for `products.html` — currently the eight pantry cards (olive oil, honey, spice kit, oregano, olive paste, gift box, sea salt) use coloured gradient placeholders. Replace with real product photography when you have it.

The Bell Kitchen logo (`bell-kitchen-logo.png`) and the gold plaque image (`bell-kitchen-plaque.jpg`) are **already included** — you don't need to drop these.

### 2. Verify the delivery URLs
The build currently uses best-guess slugs that must be confirmed against your live listings:
- Wolt: `wolt.com/en/grc/athens/restaurant/cookaki` — verify and replace globally if wrong
- efood: `e-food.gr/delivery/athina/cookaki` — same

Search-and-replace across all HTML files once you have the real URLs.

### 3. Decide on form handling
Inquiry forms (reservations, events, contact) currently route to WhatsApp via `wa.me/306982373505` as a fallback. If you want submissions to come to email instead, plug in Formspree (`https://formspree.io/f/YOUR_ID`) or Netlify Forms — every form already has a `data-form` attribute and a fallback handler in `assets/js/main.js`. Five-minute swap.

---

## Hosting

Works on anything that serves static files: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel, Tiiny.host, or plain Apache/nginx. No Node, no Python, no database.

For a custom domain pointed at GitHub Pages, add a `CNAME` file with `cookaki.gr` (or whichever domain you've chosen) at the root.

---

## File tree

```
cookaki-website/
├── index.html
├── menu.html
├── about.html
├── ingredients.html
├── events.html
├── products.html
├── gallery.html
├── reservations.html
├── delivery.html
├── contact.html
├── robots.txt
├── sitemap.xml
├── README.md
└── assets/
    ├── css/main.css
    ├── js/main.js
    ├── fonts/
    └── images/
        ├── bell-kitchen-logo.png        (already included)
        ├── bell-kitchen-plaque.jpg      (already included)
        └── [your dish + product photos go here]
```

---

*Built for the Little NOE Team — Mixalis, Vangjel, and everyone who's kept the Bell Kitchen ringing since 1956.*
