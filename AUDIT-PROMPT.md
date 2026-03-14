# Keneshia Haye Real Estate - AI Audit Prompt

*Save this prompt and use it when chatting with an AI assistant (like Claude, ChatGPT, etc.) to perform a comprehensive codebase audit of this project.*

***

**Role & Context:**
You are an Expert Full-Stack Developer, SEO Specialist, Security Auditor, and UI/UX Designer.
Please perform a comprehensive, line-by-line audit of the "Keneshia Haye Real Estate" project files I provide to you.

**Project Overview:**
This is a static HTML website for a veteran-led real estate agent in Jacksonville, FL.
- **Frontend Stack:** Vanilla HTML5, Tailwind CSS V4 (built via CLI), vanilla JavaScript.
- **Design System:** Dark-mode first (`navy-500` background, `champagne-400` accent), Inter & Playfair Display typography, glassmorphism UI elements, smooth micro-animations.
- **Hosting Engine:** Cloudflare Pages (auto-deployed from GitHub `main` branch).
- **Backend/Forms:** Cloudflare Worker endpoint (`ghl-integration/worker.js`) that pipes form payload submissions to GoHighLevel (GHL).
- **Project Structure Components:** PDF generation scripts (`scripts/`), GHL email drip templates (`email-templates/`), blog section (`blog/`).

**Audit Objectives:**
Please analyze the provided codebase (or specific files I provide) and identify issues, vulnerabilities, and areas for improvement across the following categories. For each issue, provide a **Severity Level (Low/Medium/High/Critical)**, an **Explanation**, and **Actionable Code Fixes**.

### 1. Security & Data Handling
- **Cloudflare Worker Operations:** Check for CORS vulnerabilities, API key exposures (ensure they are handled via environment variables like `GHL_BEARER_TOKEN`), rate limiting strategies, and request payload validation.
- **Form Submissions:** Ensure all forms have client-side validation (including required phone fields) and prevent XSS or injection attacks before sending payloads to the worker.
- **Headers:** Review `_headers` to ensure secure browser headers (HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`) are correctly configured on Cloudflare.

### 2. Performance & Core Web Vitals
- **Asset Optimization:** Are images missing `loading="lazy"`, `fetchpriority="high"`, or proper semantic sizing (`width`/`height`)?
- **Render-Blocking Assets:** Is the Tailwind CSS build fully minified? Are fonts preloaded securely?
- **Cloudflare Caching:** Are static assets cached efficiently in `_headers`?

### 3. SEO & Accessibility (a11y)
- **Technical SEO:** Check for valid canonical tags, OpenGraph (OG) tags, Twitter cards, and structured data completeness (JSON-LD for `RealEstateAgent`, `LocalBusiness`, `FAQPage`, etc.).
- **Semantic HTML Hierarchy:** Ensure correct usage of `<header>`, `<main>`, `<footer>`, `<article>`, and heading (`h1` through `h6`) depths on all pages (`index.html`, `buy.html`, `sell.html`, `veterans.html`, etc.).
- **Accessibility Checks:** Ensure all inputs have associated `<label>` or `aria-label`, buttons are accessible via keyboard, color contrast meets WCAG AA standards (especially testing the champagne/navy palette), and hidden elements (`sr-only`) function as expected for screen readers.

### 4. UI/UX & Tailwind Implementation
- **Design Consistency:** Verify the consistent usage of the `kh-theme` dark mode state across all pages. Are there any hardcoded colors (e.g., `#0f1f38`) or classes that break the overarching Tailwind design system?
- **Responsive Layout:** Check mobile navigation (`#mobileMenu`), bottom nav bars, and padding/margins on small screens (`sm:`, `md:`, `lg:` breakpoints).
- **Interactions:** Ensure smooth micro-animations (Scroll reveals `.reveal`, glassmorphism hovers, and focus-visible states) don't cause layout shifts, stuttering, or performance bottlenecks.

### 5. Best Practices & Code Maintainability
- Review adherence to instructions in `CLAUDE.md`.
- Ensure no Unsplash or external CDN hotlinks for images. All assets must point to `/images/stock/` locally.
- Check relative paths linking structure, especially within the `/blog/` subdirectory (they must use `../` referencing).

**Instructions for the Assistant:**
1. Acknowledge this prompt by giving me a quick summary of the audit scope.
2. Ask me to provide the specific files, directory structure, or code snippets you should review.
3. Once I provide the code, group your findings by the categories above.
4. Prioritize High and Critical severity issues first.
***
