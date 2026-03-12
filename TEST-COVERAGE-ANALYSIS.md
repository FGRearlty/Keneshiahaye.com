# Test Coverage Analysis

**Date:** 2026-03-12
**Analyzed by:** Claude Code

## Current Test Inventory

| Area | Framework | Approx. Tests | File |
|------|-----------|---------------|------|
| Worker (form handler) | Vitest | ~80 | `tests/unit/worker.test.js` |
| Dev server | Vitest | 27 | `tests/unit/server.test.js` |
| Checkout function | Vitest | 12 | `tests/unit/checkout.test.js` |
| Headers/redirects | Vitest | 37+ | `tests/unit/headers.test.js` |
| Forms (E2E) | Playwright | ~15 | `tests/e2e/forms.spec.js` |
| Form submission (E2E) | Playwright | ~8 | `tests/e2e/form-submission.spec.js` |
| Navigation (E2E) | Playwright | ~13 | `tests/e2e/navigation.spec.js` |
| Accessibility (E2E) | Axe + Playwright | 32 | `tests/e2e/accessibility.spec.js` |
| Blog pages (E2E) | Playwright | 14 | `tests/e2e/blog.spec.js` |
| Area pages (E2E) | Playwright | 40 | `tests/e2e/areas.spec.js` |
| HTML validation | html-validate | 50 files | CI pipeline |
| Linting | ESLint | All JS | CI pipeline |

**Total: ~200+ test cases across 10 test files, plus HTML validation and linting.**

### Well-Covered Areas

- **Cloudflare Worker** (`ghl-integration/worker.js`) — sanitization, XSS prevention, name parsing, 24 form tag mappings, CORS, rate limiting, GHL API integration (mocked)
- **Dev server** (`server.js`) — routing, MIME types, clean URLs, 404 handling
- **Checkout function** (`functions/checkout.js`) — rendering, URL params, security headers, gift purchase logic
- **Headers/redirects config** — `_headers` security rules, `_redirects` clean URL entries, HTML page existence
- **E2E form rendering** — form presence, required fields, validation attributes across all major pages
- **Navigation** — desktop nav, mobile hamburger, footer links, dark mode toggle
- **Accessibility** — WCAG 2.1 compliance via axe-core on 8 key pages
- **Blog and area pages** — content, links, meta tags across all 15 pages

---

## Recommended Improvements (by priority)

### P0 — Critical

#### 1. Extract & Unit Test Inline JavaScript (~29 HTML files)

Every HTML page has `<script>` blocks handling form submission, phone validation, popup/modal logic, scroll animations, and dark mode toggling. None of this client-side logic is unit-tested because it's embedded in HTML, not importable modules.

**Impact:** High — this is the largest untested surface area and contains core business logic (lead capture).

**Recommendation:**
- Extract shared client-side logic into `/js/` as ES modules:
  - `form-handler.js` — builds JSON payload, POSTs to Worker, handles success/error UI
  - `phone-validation.js` — required phone field validation
  - `popup-controller.js` — guide/CTA popup open/close/timing
  - `dark-mode.js` — toggle logic, localStorage persistence
- Write Vitest unit tests with `jsdom` environment
- Test GTM `dataLayer.push` events fire correctly

#### 2. Add E2E Tests to CI/CD Pipeline

The deploy workflow runs `npm test` (unit) and `npm run test:html` but **not** `npm run test:e2e`. Playwright tests only run locally, meaning navigation regressions, form breakage, and accessibility violations can reach production undetected.

**Impact:** High — regressions ship to production without automated detection.

**Recommendation:**
- Add a CI job that installs Playwright browsers, starts the dev server, runs `npm run test:e2e`, and gates deployment
- Upload test artifacts (screenshots, traces) on failure for debugging

### P1 — High

#### 3. Form Submission Payload Verification

`tests/e2e/form-submission.spec.js` tests form UI states (success/error messages) but doesn't verify the actual JSON payload structure sent to the Worker endpoint. If form field `name` attributes drift from what the Worker expects, nothing catches the mismatch.

**Impact:** Medium — silent form breakage; leads silently lost.

**Recommendation:**
- Add Playwright tests that intercept `fetch()` via `page.route()`, capture request body, and assert exact field names/values
- Cover all 24 form source types to ensure `formSource` → GHL tag mapping stays in sync
- Verify required fields (especially phone) are always included

#### 4. Link & Asset Integrity Testing

50 HTML pages reference images, PDFs, CSS files, and inter-page links. Broken links or missing assets aren't tested.

**Impact:** Medium — broken images/links directly hurt user experience and SEO.

**Recommendation:**
- Add a Vitest test that parses all HTML files, extracts `href`, `src`, and `action` attributes
- Verify every referenced local file exists on disk
- Flag external URLs that return non-200 status (optional, slower)

#### 5. SEO Metadata Testing

Area pages and blog posts are critical for local search visibility. No tests verify `<title>`, `<meta description>`, Open Graph tags, or canonical URLs.

**Impact:** Medium — missing or duplicate metadata directly hurts organic traffic.

**Recommendation:**
- Add tests asserting each page has: unique `<title>`, `<meta name="description">` under 160 chars, `og:title`, `og:description`, `og:image`, and canonical URL
- Verify area pages include location-specific keywords in titles/descriptions

#### 6. Fix Weak Assertions in Existing Tests

Some existing E2E tests contain assertions that always pass:
- **Dark mode toggle** (`navigation.spec.js`): may assert `classList !== null || classList === null` (tautology)
- **Mobile nav**: may assert `count >= 0` (always true)

**Impact:** Medium — false confidence; these tests can never fail.

**Recommendation:**
- Dark mode: verify `dark` class toggles on `<html>` element, verify `localStorage('kh-theme')` value persists across navigation
- Mobile nav: set mobile viewport, click hamburger, verify menu visibility toggles, verify all links present

### P2 — Medium

#### 7. Mobile-Specific E2E Tests

Navigation tests check the hamburger menu, but there are no tests for the **mobile bottom nav bar** (required on all pages per design system) or responsive layout behavior at small viewports.

**Recommendation:**
- Add Playwright tests at mobile viewport (375×667) verifying bottom nav bar renders with correct links
- Test that forms are usable on small screens (no horizontal overflow, submit button visible)

#### 8. `_redirects` Completeness Check

Headers tests check some redirects exist, but don't verify every HTML page has a corresponding clean URL redirect entry.

**Recommendation:**
- Extend `tests/unit/headers.test.js` to programmatically scan all `.html` files
- Assert each has a matching `_redirects` entry (except `index.html` files and `404.html`)

#### 9. Security Header E2E Verification

The Worker enforces CORS, but no E2E test verifies cross-origin requests are actually blocked in a browser context, or that security headers (`X-Frame-Options`, `Content-Security-Policy`, etc.) are served correctly.

**Recommendation:**
- Add tests that make requests to the dev server and verify response headers match expected security policies
- Test that Worker rejects requests from non-allowed origins

### P3 — Nice to Have

#### 10. Visual Regression / Screenshot Testing

The site is design-heavy with a dark theme and responsive layouts. CSS changes could break visual appearance without test detection.

**Recommendation:**
- Add Playwright screenshot comparison tests using `toHaveScreenshot()` for key pages at desktop (1280px) and mobile (375px) viewports
- Store baseline screenshots in the repo

#### 11. Performance / Lighthouse Testing

No testing for page load performance, Core Web Vitals, or Lighthouse scores.

**Recommendation:**
- Add Lighthouse CI to GitHub Actions with budget thresholds (performance > 90, accessibility > 95)
- Track scores over time to catch regressions

---

## Priority Summary

| Priority | Gap | Impact | Effort |
|----------|-----|--------|--------|
| **P0** | Extract & test inline JS | High — untested business logic | Medium |
| **P0** | E2E tests in CI | High — regressions reach prod | Low |
| **P1** | Form payload verification | Medium — silent form breakage | Low |
| **P1** | Link/asset integrity | Medium — broken UX | Low |
| **P1** | SEO metadata testing | Medium — lost organic traffic | Low |
| **P1** | Fix weak assertions | Medium — false confidence | Low |
| **P2** | Mobile-specific E2E | Medium — mobile UX | Low |
| **P2** | Redirects completeness | Low-Medium — 404s | Low |
| **P2** | Security header E2E | Low — defense in depth | Low |
| **P3** | Visual regression | Low — cosmetic issues | Medium |
| **P3** | Lighthouse CI | Low — perf monitoring | Medium |
