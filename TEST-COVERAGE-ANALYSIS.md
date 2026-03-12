# Test Coverage Analysis

_Updated: 2026-03-12_

## Current State

The codebase has **~3,100 lines of test code** across **22 test files** (10 unit, 12 E2E), with **1,349 unit tests passing**. A full CI gate runs before every deployment.

### Test Inventory

| Area | Framework | File | Status |
|------|-----------|------|--------|
| Dark mode module | Vitest | `tests/unit/dark-mode.test.js` | Fully tested |
| Form handler module | Vitest | `tests/unit/form-handler.test.js` | Fully tested |
| Popup module | Vitest | `tests/unit/popup.test.js` | Fully tested |
| Cloudflare Worker | Vitest | `tests/unit/worker.test.js` (805 lines) | Fully tested |
| Checkout function | Vitest | `tests/unit/checkout.test.js` | HTML content assertions only |
| Dev server | Vitest | `tests/unit/server.test.js` | Fully tested |
| Headers/redirects config | Vitest | `tests/unit/headers.test.js` | Config validated |
| Link/asset integrity | Vitest | `tests/unit/links.test.js` | All pages scanned |
| SEO metadata | Vitest | `tests/unit/seo.test.js` | All pages scanned |
| JSON-LD schema | Vitest | `tests/unit/schema.test.js` | Structured data validated |
| Navigation (E2E) | Playwright | `tests/e2e/navigation.spec.js` | Desktop + mobile hamburger |
| Form submission (E2E) | Playwright | `tests/e2e/form-submission.spec.js` | Contact, buy, sell, veterans, 8 areas, newsletter |
| Form rendering (E2E) | Playwright | `tests/e2e/forms.spec.js` | Rendering + HTML validation |
| Accessibility (E2E) | Playwright + axe | `tests/e2e/accessibility.spec.js` | WCAG 2.1 on 8 pages |
| Blog pages (E2E) | Playwright | `tests/e2e/blog.spec.js` | Content + links |
| Area pages (E2E) | Playwright | `tests/e2e/areas.spec.js` | Content + links |
| Checkout (E2E) | Playwright | `tests/e2e/checkout.spec.js` | Checkout flow |
| Popup (E2E) | Playwright | `tests/e2e/popup.spec.js` | Scroll triggers, close handlers |
| Redirects (E2E) | Playwright | `tests/e2e/redirects.spec.js` | URL redirect behavior |
| Performance (E2E) | Playwright | `tests/e2e/performance.spec.js` | Page weight budgets, image/resource limits |
| Visual regression (E2E) | Playwright | `tests/e2e/visual-regression.spec.js` | Dark/light/mobile screenshots |
| Free guide (E2E) | Playwright | `tests/e2e/free-guide.spec.js` | Guide download flow |
| HTML validation | html-validate | CI pipeline | All HTML files |
| Linting | ESLint | CI pipeline | All JS files |

**CI pipeline** (`.github/workflows/deploy.yml`): unit tests → HTML validation → ESLint → E2E (Chromium only) → deploy to Cloudflare Pages.

---

## Recommended Improvements

### High Priority

#### 1. Mobile Viewport E2E Tests

**Gap:** Only the hamburger menu is tested at mobile width (375px). All form submission tests, CTA tests, and layout tests run at desktop viewport. The mobile bottom nav bar — required on all pages per CLAUDE.md — has no tests.

**Impact:** Mobile visitors hitting broken forms, overflowing layouts, or invisible CTAs would go undetected.

**Action:** Add a `test.describe` block with `test.use({ viewport: { width: 375, height: 812 } })`:
- Form submission flows at mobile width (contact, buy, sell, veterans)
- Mobile bottom nav bar renders on all pages with correct links
- CTA buttons are visible and clickable without horizontal scrolling
- `tel:` links work on phone number elements
- No horizontal overflow on any page

**Effort:** Medium

---

#### 2. Checkout Page Behavioral Tests

**Gap:** `tests/unit/checkout.test.js` only asserts that the HTML response body *contains* strings like `params.get('email')` — it verifies the code *exists* as text, not that it *works*. The actual JavaScript behavior (URL parameter pre-filling, gift mode, name-splitting for GHL redirect) is never executed in a browser context.

**Impact:** The course checkout is a revenue-critical funnel. A JS bug in pre-fill or redirect logic would silently break sales.

**Action:** Expand `tests/e2e/checkout.spec.js`:
- Navigate to `/checkout?email=test@example.com&name=Jane+Doe` → verify fields are pre-populated
- Navigate with `?gift=true&recipient=friend@example.com` → verify gift mode UI activates
- Submit the form → verify redirect URL contains correct GHL params (`first_name`, `last_name`, `email`)

**Effort:** Medium

---

### Medium Priority

#### 3. Color Contrast Accessibility

**Gap:** `accessibility.spec.js:30-31` explicitly disables the `color-contrast` axe rule with a comment saying "test separately," but no separate test exists. The design uses champagne gold (#c9a96e) text on navy (#0a1628) and muted gray (#94a3b8) — both potentially failing WCAG AA for normal-sized text.

**Impact:** ADA compliance risk. Real estate sites are increasingly targeted for accessibility lawsuits.

**Action:**
1. Add a dedicated color contrast audit test (non-blocking initially, just logs violations)
2. Fix the worst offenders (small text, form labels, nav links)
3. Then enable the `color-contrast` rule in the main accessibility suite

**Effort:** Low

---

#### 4. Form Payload Schema Validation

**Gap:** E2E form tests assert `formSource` and `email` but don't validate the full payload structure. Fields like `name`, `phone`, and `message` aren't consistently asserted across all form types. If an HTML `name` attribute drifts (e.g., `name` → `fullName`), the Worker would receive an incomplete payload and tests would still pass.

**Impact:** Silent lead data loss — contacts could be created in GHL missing phone numbers or names.

**Action:** In `form-submission.spec.js`, extend assertions on the captured payload:
```js
expect(captured.payload).toMatchObject({
  email: 'jane@example.com',
  name: 'Jane Doe',
  phone: '9045551234',
  formSource: 'contact-page',
});
```

**Effort:** Low

---

#### 5. Worker GHL API Error Resilience

**Gap:** Worker tests cover success paths, malformed input, and sanitization. Missing: GHL API returning HTTP 401 (expired token), 429 (GHL's own rate limit), or 500 with a valid JSON error body. Also no test for network timeouts.

**Impact:** An expired API key could cause the Worker to crash or return an unhelpful error, losing leads without anyone being notified.

**Action:** Add test cases to `worker.test.js`:
- Mock `fetch` returning 401 → verify Worker returns a graceful error (no leaked API keys)
- Mock `fetch` returning 429 → verify retry or meaningful error
- Mock `fetch` throwing a network error → verify timeout handling

**Effort:** Low

---

#### 6. Blog Post SEO Coverage

**Gap:** `seo.test.js` validates SEO metadata for main pages but may not cover all 6 blog posts. Blog pages use `../` relative paths for navigation, which are fragile and could break if directory structure changes.

**Impact:** Blog posts drive organic search traffic. Missing or duplicate meta descriptions, broken canonical URLs, or dead nav links hurt rankings.

**Action:**
- Add all blog post paths to the SEO test loop
- Verify each blog post has a unique meta description (no duplicates across posts)
- Verify blog nav links using `../` paths resolve to valid pages

**Effort:** Low

---

### Low Priority

#### 7. Cross-Browser E2E in CI

**Gap:** `playwright.config.js` defines Chromium, Firefox, and WebKit projects, but CI only runs Chromium. Safari (WebKit) has known quirks with form handling, CSS gradients, and JavaScript execution.

**Action:** Enable at least WebKit in the CI pipeline for the form submission and navigation test suites. Firefox can remain optional.

**Effort:** Low (config change), but adds ~2 min to CI.

---

#### 8. Popup Lead-Capture Form Submission

**Gap:** Popup E2E tests verify visibility and close behavior but don't test filling out and submitting the popup form.

**Action:** In `popup.spec.js`: trigger popup → fill email → submit → verify payload with correct `formSource` → verify popup dismisses after success.

**Effort:** Low

---

#### 9. 404 Page and Error Handling

**Gap:** No test verifies that the custom `404.html` page is served for unknown URLs, or that it contains proper navigation back to the site.

**Action:** Navigate to a nonexistent URL like `/does-not-exist` and verify the 404 page renders with correct branding and nav links.

**Effort:** Low

---

#### 10. PDF Generation Scripts

**Gap:** The 7 scripts in `scripts/` (guide generators, image optimizer, WebP converter) have zero test coverage. These are run manually, not at runtime.

**Impact:** Low risk since they're not in the critical path, but a broken guide generator could produce corrupted PDFs served to leads.

**Action:** Only worth testing if these scripts are run frequently. Basic smoke tests could verify output is valid PDF format.

**Effort:** Medium

---

## Priority Matrix

| # | Gap | Priority | Risk Area | Effort |
|---|-----|----------|-----------|--------|
| 1 | Mobile viewport E2E | **High** | User experience | Medium |
| 2 | Checkout behavioral tests | **High** | Revenue | Medium |
| 3 | Color contrast accessibility | **Medium** | ADA compliance | Low |
| 4 | Form payload schema validation | **Medium** | Lead data integrity | Low |
| 5 | Worker GHL error resilience | **Medium** | Lead loss | Low |
| 6 | Blog post SEO coverage | **Medium** | Organic traffic | Low |
| 7 | Cross-browser E2E in CI | Low | Browser compatibility | Low |
| 8 | Popup form submission | Low | Missed leads | Low |
| 9 | 404 page testing | Low | UX polish | Low |
| 10 | PDF script testing | Low | Build tools | Medium |

---

## How to Run Tests

```bash
npm test              # Unit tests (Vitest) — 1,349 tests
npm run test:e2e      # E2E tests (Playwright, Chromium)
npm run test:html     # HTML validation
npm run test:lint     # ESLint
npm run test:all      # Full suite
```
