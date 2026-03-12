# Test Coverage Analysis

## Current State

**All 1,204 unit tests pass** across 9 test files. The project also has 6 E2E test files using Playwright.

### What's Covered

| Area | Test File | Coverage Level |
|------|-----------|---------------|
| Form data collection & validation | `tests/unit/form-handler.test.js` | Good — collectFormData, validatePhone, showFormError, submitForm |
| Cloudflare Worker (GHL integration) | `tests/unit/worker.test.js` | Strong — sanitization, CORS, rate limiting, tag mapping, contact CRUD, error handling |
| Dark mode toggle | `tests/unit/dark-mode.test.js` | Thorough — storage, class toggling, persistence, init |
| Popup / lead capture | `tests/unit/popup.test.js` | Good — cooldown logic, show/hide overlay |
| Checkout page | `tests/unit/checkout.test.js` | Good — response shape, HTML content, pre-fill logic |
| Dev server | `tests/unit/server.test.js` | Good — routing, MIME types, 404, clean URLs |
| SEO metadata | `tests/unit/seo.test.js` | Strong — title, description, OG tags across all HTML files |
| Security headers | `tests/unit/headers.test.js` | Good — CSP, HSTS, X-Frame-Options, redirects, page existence |
| Link / asset integrity | `tests/unit/links.test.js` | Strong — validates every local href/src reference across all HTML |
| E2E navigation | `tests/e2e/navigation.spec.js` | Good — nav links, footer, dark mode, hamburger menu, meta tags |
| E2E forms | `tests/e2e/forms.spec.js` | Basic — form visibility and required fields on key pages |
| E2E form submissions | `tests/e2e/form-submission.spec.js` | Strong — payload capture, success/error states, all area pages |
| E2E accessibility | `tests/e2e/accessibility.spec.js` | Good — axe-core on 8 pages, heading hierarchy, alt text, labeled inputs |
| E2E blog | `tests/e2e/blog.spec.js` | Present |
| E2E areas | `tests/e2e/areas.spec.js` | Present |

### CI Pipeline Coverage

The deploy workflow (`deploy.yml`) runs on push to `main`:
1. Unit tests (`npm test`) — **blocks deploy on failure**
2. HTML validation (`html-validate`) — **blocks deploy on failure**
3. ESLint — **blocks deploy on failure**
4. E2E tests — **NOT run in CI** (only available locally via `npm run test:e2e`)

---

## Gaps and Recommendations

### 1. E2E Tests Are Not Run in CI (High Priority)

**Gap**: Playwright E2E tests exist but only run locally. The deploy pipeline skips them entirely.

**Risk**: Broken navigation, form submissions, or accessibility regressions could ship to production without detection.

**Recommendation**: Add a CI step that installs Playwright browsers and runs `npm run test:e2e` before deployment. This would catch:
- Broken form submission flows
- Navigation failures
- Accessibility regressions (axe-core violations)
- Dark mode / hamburger menu breakage

---

### 2. No Popup Trigger E2E Tests (Medium Priority)

**Gap**: The popup unit tests (`popup.test.js`) cover cooldown logic and show/hide, but there are no E2E tests verifying the actual popup triggers (scroll percentage, timer-based activation).

**Risk**: The popup could fail to appear or appear at the wrong time without detection.

**Recommendation**: Add E2E tests that:
- Scroll past the trigger threshold and verify the popup appears
- Verify the popup respects the 7-day cooldown in localStorage
- Verify closing the popup sets the cooldown timestamp
- Verify the popup's form submits correctly with the right `formSource`

---

### 3. No Course Enrollment E2E Tests (Medium Priority)

**Gap**: The checkout page has unit tests for HTML content, but there are no E2E tests for the course enrollment flow or the gift purchase flow.

**Risk**: The checkout pre-fill from URL params, name-splitting for GHL, and gift-purchase detection could break silently.

**Recommendation**: Add E2E tests that:
- Navigate to `/checkout` and verify the form renders
- Navigate to `/checkout?email=test@test.com&name=Jane+Doe` and verify fields pre-fill
- Navigate to `/checkout?gift=true&recipient=Friend` and verify the gift UI appears
- Verify the form action URL includes the correct GHL course offer link

---

### 4. No Blog Post Content or Internal Link E2E Tests (Medium Priority)

**Gap**: Blog E2E tests (`blog.spec.js`) and the unit-level link checker (`links.test.js`) verify structure and that files exist on disk, but there's no E2E verification that blog internal links actually navigate correctly in the browser or that blog pages render properly with their relative `../` paths.

**Risk**: Blog pages use `../` relative paths for nav links (noted in CLAUDE.md). A path error would break navigation but pass the link file-existence check.

**Recommendation**: Add E2E tests that:
- Navigate to each blog post and verify the nav links work (click "Buy" from a blog page and confirm it loads `/buy`)
- Verify blog post pages have the correct heading, article content, and related posts section
- Verify the blog lead-capture popup/CTA renders and submits correctly

---

### 5. No Free Guide / Resource Download E2E Tests (Medium Priority)

**Gap**: The `/free-guide` page has a form but no dedicated E2E tests for the guide download flow. No tests verify that PDF files referenced in guide download links actually exist.

**Recommendation**: Add E2E tests that:
- Visit `/free-guide`, fill the form, and verify the correct `formSource` (`resource-download`)
- Verify guide download links on `/resources` point to valid PDF files in `/guides/`
- Verify the homepage guide download popup submits with `homepage-guide-popup` formSource

---

### 6. No Visual Regression / Screenshot Tests (Low Priority)

**Gap**: No visual regression testing. The site's design system (navy + champagne gold, dark-first, rounded corners) could regress without detection.

**Recommendation**: Add Playwright screenshot comparison tests for key pages in both dark and light modes. Even lightweight visual snapshot tests for the homepage, contact page, and a blog page would catch major layout breaks.

---

### 7. No Performance / Lighthouse Smoke Tests (Low Priority)

**Gap**: No automated performance checks. The site serves local images (no CDN), so image optimization and load times could degrade over time.

**Recommendation**: Add a lightweight CI check that:
- Verifies total page weight stays under a budget (e.g., 2MB for homepage)
- Runs Lighthouse CI on the homepage with minimum score thresholds

---

### 8. Worker Rate Limiting Integration Test Gap (Low Priority)

**Gap**: The worker rate limiting tests mock KV storage. There's no test verifying the in-memory fallback rate limiter actually blocks after the limit is reached (only tests that it "allows" when no KV exists).

**Recommendation**: Add a unit test that exercises the in-memory fallback path by sending >20 requests without KV and verifying the 21st is blocked.

---

### 9. No `_redirects` Rule Verification in E2E (Low Priority)

**Gap**: The `_headers` test file checks that redirect rules exist in the file, but no E2E test verifies that `/privacy` actually redirects to `/privacy-policy` in the running server.

**Recommendation**: Add an E2E test that navigates to `/privacy` and confirms it arrives at `/privacy-policy`. (Note: this may require the dev server to support redirects, or it can be tested post-deploy.)

---

### 10. Missing `test:all` in CI (Low Priority)

**Gap**: The `test:all` script in `package.json` runs unit tests + HTML validation + linting, but the CI pipeline calls each separately. E2E tests are excluded from both.

**Recommendation**: Update `test:all` to include E2E, and consider using it in CI for a single source of truth on what "all tests pass" means.

---

## Summary by Priority

| Priority | Recommendation | Effort |
|----------|---------------|--------|
| High | Add E2E tests to CI pipeline | Small |
| Medium | Popup trigger E2E tests | Small |
| Medium | Course/checkout E2E tests | Small |
| Medium | Blog navigation E2E tests | Small |
| Medium | Free guide / resource download E2E tests | Small |
| Low | Visual regression tests | Medium |
| Low | Performance / Lighthouse CI | Medium |
| Low | Worker in-memory rate limit test | Small |
| Low | Redirect verification E2E | Small |
| Low | Unify `test:all` with CI | Small |
