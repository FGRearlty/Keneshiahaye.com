# Keneshia Haye Real Estate — Project Guide

## About
Static HTML website for Keneshia Haye, veteran-led real estate agent at Florida Gateway Realty, serving Jacksonville, FL and surrounding areas.

- **Live site**: https://keneshiahaye.com
- **Hosting**: Cloudflare Pages (auto-deploys from `main` branch via GitHub Actions)
- **CRM**: GoHighLevel (GHL) — forms submit to Cloudflare Worker endpoint
- **Form endpoint**: `https://keneshia-haye-form-handler.jutsuxx.workers.dev`
- **GTM Container**: GTM-NSFSZWX4

## Contact Info (use on all pages)
- **Phone**: (254) 449-5299
- **Email**: keneshia@fgragent.com
- **Office**: 1700 Wells Road, Suite 4, Orange Park, FL 32073
- **Brokerage**: Florida Gateway Realty

## Design System
- **Dark-first** design using Tailwind CSS CDN with `darkMode: 'class'`
- **Navy**: `#0a1628` (bg) — Tailwind: `navy-500`
- **Champagne gold**: `#c9a96e` (accent) — Tailwind: `champagne-400`
- **Fonts**: Inter (body), Playfair Display (headings)
- **Rounded corners**: `rounded-xl` for inputs/cards, `rounded-full` for buttons/pills
- **Dark mode toggle**: class-based, stored in `localStorage` key `kh-theme`

## Navigation Order
Buy, Sell, Veterans, Course, Resources, Blog, About — with Contact as CTA button.

All pages must include: desktop nav, mobile hamburger nav, footer quick links, and mobile bottom nav bar.

## File Structure
```
/                     — HTML pages (static, no build step)
/blog/                — Blog posts
/images/              — Keneshia's photos
/images/stock/        — Downloaded stock photos (local, no CDN)
/guides/              — PDF lead magnets
/ghl/                 — GHL embeddable widgets
/ghl-integration/     — Cloudflare Worker for form handling
/email-templates/     — GHL email drip sequences
/scripts/             — PDF generation scripts (not runtime)
/va-resources/        — VA docs, media, PDFs
/.github/workflows/   — Deploy pipeline
```

## Key Conventions
- All images are local (`/images/stock/`). **Never use Unsplash CDN hotlinks.**
- Phone fields are **required** on all forms (HTML `required` + JS validation).
- Select dropdowns in dark mode use `dark:bg-[#0f1f38]` (solid color, not transparent).
- Blog pages use `../` relative paths for nav links.
- `_headers` file controls Cloudflare caching and security headers.
- `_redirects` file handles clean URLs (no `.html` extensions).

## Dev Server
```bash
node server.js   # runs on port 5000
```
Launch config in `.claude/launch.json` as `keneshia-site`.

## Deploy
Push to `main` branch. GitHub Actions runs `.github/workflows/deploy.yml` which deploys to Cloudflare Pages. Non-site directories (va-resources/extracted-zip*, _deploy, ghl-integration, email-templates) are stripped before deploy.
