# Keneshia Haye Real Estate — Project Guide

## About
Static HTML website for Keneshia Haye, veteran-led real estate agent at Florida Gateway Realty, serving Jacksonville, FL and surrounding areas.

- **Live site**: https://keneshiahaye.com
- **Hosting**: Cloudflare Pages (auto-deploys from `main` branch via GitHub Actions)
- **CRM**: GoHighLevel (GHL) — forms submit to Cloudflare Worker endpoint
- **Form endpoint**: `https://keneshia-haye-form-handler.jutsuxx.workers.dev`
- **GTM Container**: GTM-NSFSZWX4
- **No build step** for HTML — pages are static and served directly

## Contact Info (use on all pages)
- **Phone**: (254) 449-5299
- **Email**: keneshia@fgragent.com
- **Office**: 1700 Wells Road, Suite 4, Orange Park, FL 32073
- **Brokerage**: Florida Gateway Realty

## Design System
- **Dark-first** design using Tailwind CSS v4 with class-based dark mode
- **Navy**: `#0a1628` (bg) — Tailwind: `navy-500`
- **Champagne gold**: `#c9a96e` (accent) — Tailwind: `champagne-400`
- **Fonts**: Inter (body), Playfair Display (headings)
- **Rounded corners**: `rounded-xl` for inputs/cards, `rounded-full` for buttons/pills
- **Dark mode toggle**: class-based, stored in `localStorage` key `kh-theme`, defaults to dark

## Navigation Order
Buy, Sell, Veterans, Course, Resources, Blog, About — with Contact as CTA button.

All pages must include: desktop nav, mobile hamburger nav, footer quick links, and mobile bottom nav bar.

## File Structure
```
/                         — Root HTML pages (14 pages, static, no build step)
/areas/                   — Neighborhood pages (8 areas)
/blog/                    — Blog posts (6 articles + index)
/css/                     — Compiled Tailwind CSS output (styles.css)
/src/                     — Tailwind input CSS source (input.css)
/js/                      — Client-side JS modules (dark-mode, form-handler, popup)
/functions/               — Cloudflare Pages Functions (checkout.js)
/images/                  — Keneshia's photos + branding (5 files)
/images/stock/            — Downloaded stock photos (22 files, local only)
/guides/                  — PDF lead magnets (7 PDFs + 1 generator script)
/ghl/                     — GHL embeddable widget snippets & styles (9 files)
/ghl-integration/         — Cloudflare Worker for form handling (worker.js, wrangler.toml, docs)
/email-templates/         — GHL email drip sequences + setup docs
/scripts/                 — PDF generation & image optimization scripts (8 files, not runtime)
/va-resources/            — VA docs, forms, media, PDFs (19 files across docs/media/pdfs)
/tests/unit/              — Vitest unit tests (11 files)
/tests/e2e/               — Playwright E2E tests (18 files)
/.github/workflows/       — Deploy pipeline (deploy.yml)
/.claude/                 — Launch config, commands, and skills library
```

## Pages Overview

### Root Pages (14)
`index.html`, `buy.html`, `sell.html`, `veterans.html`, `va-benefits.html`, `course.html`, `contact.html`, `about.html`, `resources.html`, `free-guide.html`, `review.html`, `privacy-policy.html`, `terms.html`, `404.html`

### Area Pages (8)
`areas/jacksonville.html`, `areas/orange-park.html`, `areas/ponte-vedra.html`, `areas/st-augustine.html`, `areas/green-cove-springs.html`, `areas/fleming-island.html`, `areas/middleburg.html`, `areas/callahan.html`

### Blog Posts (6 articles + index)
`blog/index.html`, `blog/jacksonville-real-estate-market.html`, `blog/jacksonville-neighborhoods-first-time-buyers.html`, `blog/va-loan-guide-jacksonville.html`, `blog/moving-to-jacksonville-military.html`, `blog/sell-your-home-fast-jacksonville.html`, `blog/first-time-homebuyer-mistakes.html`

## JavaScript Modules

| File | Purpose |
|------|---------|
| `js/dark-mode.js` | Class-based dark mode toggle via localStorage (`kh-theme`) |
| `js/form-handler.js` | Form submission to GHL Worker, phone validation (10+ digits) |
| `js/popup.js` | Lead-capture popup (15s timer + 50% scroll trigger, 7-day cooldown) |
| `functions/checkout.js` | Cloudflare Pages Function for SOMS course pre-checkout |
| `ghl-integration/worker.js` | Cloudflare Worker: form proxy, rate limiting (20/hr/IP), sanitization, GHL contact/tag/pipeline management |
| `server.js` | Local Node.js dev server (port 5000, clean URL routing) |

## Key Conventions
- All images are local (`/images/stock/`). **Never use Unsplash CDN hotlinks.**
- Phone fields are **required** on all forms (HTML `required` + JS validation).
- Select dropdowns in dark mode use `dark:bg-[#0f1f38]` (solid color, not transparent).
- Blog pages use `../` relative paths for nav links.
- Area pages are in `/areas/` and use `../` relative paths for nav links.
- `_headers` file controls Cloudflare caching (images: 1yr, CSS: 1wk, PDFs: 1wk) and security headers (CSP, HSTS, X-Frame-Options).
- `_redirects` file handles URL redirects (`/privacy` → `/privacy-policy`). Cloudflare Pages handles clean URLs (no `.html`) natively.
- GHL Worker CORS only allows origin `https://keneshiahaye.com`.
- Form sources map to GHL tags via `FORM_TAG_MAP` in `ghl-integration/worker.js`.
- `manifest.json`, `robots.txt`, `sitemap.xml`, and `sitemap.rss` are maintained at root for PWA/SEO.

## Dev Server
```bash
node server.js   # runs on port 5000
```
Launch config in `.claude/launch.json` as `keneshia-site`.

## Testing
```bash
npm test              # Vitest unit tests
npm run test:watch    # Vitest in watch mode
npm run test:e2e      # Playwright E2E tests (chromium, firefox, webkit)
npm run test:html     # HTML validation (*.html, blog/*.html, areas/*.html)
npm run test:lint     # ESLint (ghl-integration, tests, server, functions)
npm run test:all      # All of the above sequentially (E2E uses chromium only)
```

### Test Coverage
- **Unit tests** (11 files): dark-mode, form-handler, popup, server routing, GHL worker, checkout, SEO metadata, Schema.org, security headers, link integrity, PDF scripts
- **E2E tests** (18 files): navigation, forms, form-submission, accessibility (axe-core), color contrast, blog, areas, mobile, popup, 404, checkout, free-guide, performance, visual regression, redirects, review, va-benefits, js-errors

## Building CSS
```bash
npm run build:css     # Compile & minify Tailwind (src/input.css → css/styles.css)
npm run dev:css       # Watch mode for development
```

## Deploy
Push to `main` branch. GitHub Actions runs `.github/workflows/deploy.yml`:
1. Install dependencies (`npm ci`, Node 20)
2. Run unit tests (`npm test`)
3. Run HTML validation
4. Run linting
5. Build Tailwind CSS
6. Remove non-site directories (va-resources/extracted-zip*, _deploy, ghl-integration, email-templates, .github, .claude, node_modules, src, scripts, tests)
7. Deploy to Cloudflare Pages via Wrangler

## GHL Integration
- **Worker config**: `ghl-integration/wrangler.toml` (location ID: `BL54FprV9T5BTudmrsdB`)
- **API key**: stored as Cloudflare Worker secret (`GHL_API_KEY`)
- **Rate limiting**: KV namespace-backed, 20 submissions/IP/hour
- **Blueprint**: `ghl/GHL-BLUEPRINT.md` has full setup documentation
- **Additional docs**: `ghl-integration/GBP-OPTIMIZATION-GUIDE.md`, `ghl-integration/GHL-AI-WORKFLOW-PROMPT.md`
- **Email sequences**: buyer (4 emails), seller (4 emails), veteran (5 emails) in `email-templates/`
- **Setup checklists**: `email-templates/GHL-COMPLETE-SETUP-CHECKLIST.md`, `email-templates/GHL-WORKFLOW-SETUP.md`

## Scripts (offline tooling, not runtime)
| File | Purpose |
|------|---------|
| `scripts/create-buyers-steps-guide.js` | Generate buyer guide PDF |
| `scripts/create-homebuyer-guide.js` | Generate homebuyer guide PDF |
| `scripts/create-homebuyer-guide.py` | Python homebuyer guide generator |
| `scripts/create-military-guide.js` | Generate military relocation guide PDF |
| `scripts/create-remaining-guides.js` | Generate remaining guide PDFs |
| `scripts/create-sellers-guide.js` | Generate seller guide PDF |
| `scripts/generate-webp.js` | Convert images to WebP format |
| `scripts/optimize-images.js` | Image optimization (sharp) |

## Dependencies
- **Runtime**: mammoth, pdfkit, xlsx (for PDF/document generation scripts)
- **Dev**: Tailwind CSS v4, @tailwindcss/cli, Playwright, @axe-core/playwright, Vitest, ESLint, html-validate, jsdom, sharp

## Claude Skills Library
The `/.claude/skills/` directory contains 129+ skill definition files organized by domain:
- **Design** (8), **Engineering** (22), **Game Dev** (14), **Marketing** (28), **Paid Media** (7), **Product** (4), **Project Management** (6), **Sales** (8), **Spatial Computing** (6), **Specialized** (20), **Strategy** (16), **Support** (6), **Testing** (8)
- Custom command: `.claude/commands/blog-writer.md`
