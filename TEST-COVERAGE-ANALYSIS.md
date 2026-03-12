# Test Coverage Analysis

**Date:** 2026-03-12
**Analyzed by:** Claude Code

## Current Test Inventory

| Area | Framework | Test Count | File |
|------|-----------|------------|------|
| Worker (form handler) | Vitest | ~30 | `tests/unit/worker.test.js` |
| Dev server | Vitest | 6 | `tests/unit/server.test.js` |
| Checkout function | Vitest | 12 | `tests/unit/checkout.test.js` |
| Forms (E2E) | Playwright | ~15 | `tests/e2e/forms.spec.js` |
| Navigation (E2E) | Playwright | ~13 | `tests/e2e/navigation.spec.js` |
| Accessibility (E2E) | Axe + Playwright | 32 | `tests/e2e/accessibility.spec.js` |
| HTML validation | html-validate | 37 files | CI pipeline |

## Recommended Improvements (by priority)

### P0 — Critical

#### 1. Form Submission E2E Tests
E2E form tests only verify forms **render** — they never test submission behavior. Client-side JS that builds JSON payloads and POSTs to the Cloudflare Worker is completely untested.

**Add:**
- Intercept network requests (`page.route()`) and verify JSON payload shape, `formSource` value, required fields
- Test success/error UI states after submission
- Test phone validation (required on all forms)
- Test popup/modal guide forms on homepage

#### 2. Fix No-Op Tests
Two existing E2E test suites contain assertions that always pass:

- **Dark mode toggle** (`navigation.spec.js:72-88`): asserts `classList !== null || classList === null` (always true)
- **Mobile nav** (`navigation.spec.js:90-99`): asserts `count >= 0` (always true)

**Fix:**
- Dark mode: verify `dark` class toggles on `<html>`, verify `localStorage('kh-theme')` persists
- Mobile nav: set mobile viewport, click hamburger, verify menu opens/closes

### P1 — High

#### 3. Inline JavaScript Unit Tests
29 HTML files contain inline `<script>` blocks with form submission handlers, popup controllers, scroll animations, and GTM integration — none unit-tested.

**Add:**
- Extract shared JS (form submission handler, phone validation, popup controller) into importable modules
- Unit test payload builder, validation, error handling
- Test GTM `dataLayer.push` events

#### 4. Worker Pure Function Exports
Worker unit tests re-implement `sanitize()`, `parseName()`, and `FORM_TAG_MAP` instead of importing from `worker.js`. Tests can pass while real code diverges.

**Add:**
- Refactor `worker.js` to export pure functions
- Test in-memory rate limiter fallback (only KV-backed is tested)
- Test `addContactNote()` formatting and error handling
- Test GHL API error responses (non-JSON, timeout, 401/403)
- Test all form-specific field handling (buyer, seller, VA fields)

### P2 — Medium

#### 5. Area & Blog Page Coverage
15 pages (8 area pages, 7 blog posts) have zero E2E test coverage.

**Add:**
- Verify area page forms have correct `formSource` values
- Verify blog nav links resolve (no broken `../` paths)
- Verify blog lead-capture forms render
- Add area + blog pages to accessibility test loop

#### 6. `_redirects` & `_headers` Validation
Production routing and security rules have no tests.

**Add:**
- Parse `_redirects`, verify every HTML page has a clean URL rule
- Parse `_headers`, verify security headers are set (CSP, X-Frame-Options)

### P3 — Low

#### 7. Cross-Browser Testing
Playwright configured for Chromium only.

**Add:**
- Firefox and/or WebKit in `playwright.config.js`
- Viewport breakpoint tests (375px, 768px, 1280px)

#### 8. Static Analysis
No ESLint, Prettier, or EditorConfig configured.

**Add:**
- ESLint with recommended rules
- Prettier for formatting consistency
- Add to CI pipeline as a gate
