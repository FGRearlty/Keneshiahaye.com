# Test Coverage Analysis

_Updated: 2026-03-12_

## Current State

The codebase has ~3,000 lines of test code across 15 test files, with a full CI gate before deployment.

### Test Inventory

| Area | Framework | File | Status |
|------|-----------|------|--------|
| Dark mode module | Vitest | `tests/unit/dark-mode.test.js` | Fully tested |
| Form handler module | Vitest | `tests/unit/form-handler.test.js` | Fully tested |
| Popup module | Vitest | `tests/unit/popup.test.js` | Fully tested |
| Cloudflare Worker | Vitest | `tests/unit/worker.test.js` | Fully tested |
| Checkout function | Vitest | `tests/unit/checkout.test.js` | Content only |
| Dev server | Vitest | `tests/unit/server.test.js` | Fully tested |
| Headers/redirects | Vitest | `tests/unit/headers.test.js` | Config validated |
| Link integrity | Vitest | `tests/unit/links.test.js` | All pages scanned |
| SEO metadata | Vitest | `tests/unit/seo.test.js` | All pages scanned |
| Form rendering (E2E) | Playwright | `tests/e2e/forms.spec.js` | Rendering + validation |
| Form submission (E2E) | Playwright | `tests/e2e/form-submission.spec.js` | UI states |
| Navigation (E2E) | Playwright | `tests/e2e/navigation.spec.js` | Desktop + mobile hamburger |
| Accessibility (E2E) | Playwright + axe | `tests/e2e/accessibility.spec.js` | WCAG 2.1 (8 pages) |
| Blog pages (E2E) | Playwright | `tests/e2e/blog.spec.js` | Content + links |
| Area pages (E2E) | Playwright | `tests/e2e/areas.spec.js` | Content + links |
| HTML validation | html-validate | CI pipeline | All HTML files |
| Linting | ESLint | CI pipeline | All JS files |

**CI pipeline** (`.github/workflows/deploy.yml`): Runs unit tests → HTML validation → ESLint → E2E tests (Chromium) before deploying to Cloudflare Pages.

### Well-Covered Areas

- **Client JS modules** — `form-handler.js`, `dark-mode.js`, `popup.js` all extracted to `/js/` with comprehensive unit tests
- **Cloudflare Worker** — XSS sanitization, CORS, rate limiting (KV + fallback), 24 form tag mappings, GHL API flow with mocked responses
- **E2E navigation** — Desktop nav, mobile hamburger (375px), dark mode toggle with localStorage persistence
- **Accessibility** — axe-core WCAG 2.1 checks, heading hierarchy, alt text, labeled inputs on 8 pages
- **SEO** — Unique titles, meta descriptions, OG tags, canonical URLs across all pages
- **Link integrity** — All images, scripts, stylesheets, PDFs validated to exist on disk

---

## Recommended Improvements

### High Priority

#### 1. Mobile Viewport E2E Tests

**Gap:** Only the hamburger menu is tested at mobile width (375px in `navigation.spec.js`). All form tests, CTA tests, and page layout tests run at desktop viewport only. The required mobile bottom nav bar has no tests.

**Action:** Create `tests/e2e/mobile.spec.js` that tests at 375px and 768px:
- Mobile bottom nav bar renders on all pages with correct links
- Forms are usable (no horizontal overflow, submit button visible without scrolling)
- CTA buttons are tappable (sufficient size)
- Phone number links use `tel:` protocol

#### 2. Checkout Page Behavioral Tests

**Gap:** `tests/unit/checkout.test.js` only asserts that the HTML string contains substrings like `params.get('email')`. The actual JavaScript behavior — URL parameter pre-filling, gift purchase mode, name-splitting for GHL redirect — is untested in a browser.

**Action:** Create `tests/e2e/checkout.spec.js`:
- Load `/checkout?email=test@test.com&name=Jane+Doe` and verify fields are pre-populated
- Load `/checkout?gift=true&recipient=friend@test.com` and verify gift mode UI
- Submit the form and verify the redirect URL contains correct GHL parameters (`first_name`, `last_name`, `email`)

### Medium Priority

#### 3. Color Contrast Accessibility

**Gap:** `accessibility.spec.js:30` disables `color-contrast` with a "test separately" comment, but no separate test exists. The champagne gold on navy palette and `#94a3b8` text could have contrast issues.

**Action:** Add a dedicated test that runs axe-core with only the `color-contrast` rule enabled, targeting critical elements (CTAs, form labels, nav links, body text).

#### 4. Visual Regression / Screenshot Tests

**Gap:** No snapshot or screenshot tests. The dark-first design with custom colors is vulnerable to CSS regressions (e.g., Tailwind CDN updates, accidental class removal) that functional tests won't catch.

**Action:** Add `expect(page).toHaveScreenshot()` for:
- Homepage hero section (desktop + mobile)
- Contact form (dark + light mode)
- Course page pricing section
- Store baselines in `tests/e2e/screenshots/`

#### 5. Full Form Submission Success Flow (E2E)

**Gap:** E2E form tests verify rendering and HTML validation behavior but don't test the full submit → fetch → success message flow in a real browser. The unit test mocks `fetch` at the JS level, but the browser integration path is untested.

**Action:** In `tests/e2e/form-submission.spec.js`, use `page.route()` to intercept the worker endpoint:
```js
await page.route('**/keneshia-haye-form-handler*', route =>
  route.fulfill({ json: { success: true, contactId: 'test-123' } })
);
```
Then fill the form, submit, and verify: success message appears, form resets, button re-enables.

#### 6. Form Payload Structure Verification

**Gap:** No test verifies the actual JSON payload sent from the browser matches what the Worker expects. If form field `name` attributes drift, leads are silently malformed.

**Action:** Use `page.route()` to capture the request body on submission and assert exact field structure (`email`, `name`/`firstName`/`lastName`, `phone`, `formSource`, `message`).

### Low Priority

#### 7. Worker GHL API Error Resilience

**Gap:** Worker tests cover happy path, malformed JSON, and generic network errors. Missing: GHL returning 401 (expired API key), 429 (GHL rate limit), or 500 with valid JSON.

**Action:** Add test cases where mocked `fetch` returns `{ status: 401, json: () => ({error: 'Unauthorized'}) }` etc., and verify the worker returns meaningful errors.

#### 8. Clean URL Redirect E2E Verification

**Gap:** `_redirects` syntax is validated in unit tests, but actual browser redirect behavior isn't tested.

**Action:** Visit `/buy.html` in Playwright and verify it 404s or redirects to `/buy`. Visit `/contact` and verify it resolves.

#### 9. Popup Form Submission Flow

**Gap:** `popup.test.js` tests trigger/dismiss logic but not submitting the lead-capture form inside the popup.

**Action:** Trigger the popup in E2E (set localStorage to clear cooldown, scroll to threshold), fill the form, mock the endpoint, and verify submission.

#### 10. Performance / Lighthouse CI

**Gap:** No automated performance testing. Page load speed impacts lead conversion.

**Action:** Add Lighthouse CI to GitHub Actions with thresholds: Performance > 90, Accessibility > 95, LCP < 3s, CLS < 0.1.

---

## Priority Summary

| # | Gap | Priority | Type | Effort |
|---|-----|----------|------|--------|
| 1 | Mobile viewport E2E | High | E2E | Small |
| 2 | Checkout behavioral tests | High | E2E | Medium |
| 3 | Color contrast testing | Medium | E2E | Small |
| 4 | Visual regression screenshots | Medium | E2E | Medium |
| 5 | Full form submission success flow | Medium | E2E | Small |
| 6 | Form payload structure verification | Medium | E2E | Small |
| 7 | Worker GHL error resilience | Low | Unit | Small |
| 8 | Clean URL redirect E2E | Low | E2E | Small |
| 9 | Popup form submission flow | Low | E2E | Small |
| 10 | Performance / Lighthouse CI | Low | CI | Medium |
