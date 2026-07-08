# HTTPS & Security Headers — Cookaki / Bell Kitchen

The site is hosted on **GitHub Pages**, which serves everything over HTTPS
automatically but **cannot set custom HTTP response headers** (HSTS,
X-Frame-Options, Referrer-Policy, Permissions-Policy, etc.). This is a
platform limitation, not a site bug.

## What is already done in the HTML
Every page now carries, as `<meta>` tags, the headers that *can* live in HTML:
- `Content-Security-Policy` (with `frame-ancestors 'self'` = clickjacking defence)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

GitHub Pages also lets you tick **Settings → Pages → "Enforce HTTPS"** — turn it on.

## To get the full header set (recommended)
Put the domain behind **Cloudflare** (free plan) as a proxy in front of GitHub Pages:
1. Add `bellacropolis.gr` to Cloudflare, point the nameservers.
2. Cloudflare → SSL/TLS → set to **Full**; enable **Always Use HTTPS** and **HSTS**.
3. Cloudflare → Rules → **Transform Rules → Modify Response Header**, add:
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

The included `_headers` file means that if you ever move to **Netlify** or
**Cloudflare Pages**, the full header set applies with zero extra work.

## Files
- `CNAME` — custom domain for GitHub Pages (`www.bellacropolis.gr`)
- `.nojekyll` — tells GitHub Pages to serve files as-is (no Jekyll processing)
- `_headers` — header rules for Netlify / Cloudflare Pages
