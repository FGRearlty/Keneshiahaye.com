/**
 * E2E tests — Free guide and resource download flows
 *
 * Tests the free guide landing page form, the resources page form,
 * and verifies that referenced PDF guides exist.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const WORKER_URL = 'https://keneshia-haye-form-handler.jutsuxx.workers.dev';

function interceptFormPost(page) {
  const captured = { payload: null, called: false };
  page.route(`${WORKER_URL}**`, async (route) => {
    if (route.request().method() === 'POST') {
      captured.payload = route.request().postDataJSON();
      captured.called = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, contactId: 'guide-test-1', action: 'created' }),
      });
    } else {
      await route.continue();
    }
  });
  return captured;
}

test.describe('Free guide landing page', () => {
  test('loads successfully', async ({ page }) => {
    const res = await page.goto('/free-guide');
    expect(res.status()).toBe(200);
  });

  test('has a form with email field', async ({ page }) => {
    await page.goto('/free-guide');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailField).toBeVisible();
  });

  test('submits with landing-page-guide formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/free-guide');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Guide Tester');

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('guide@example.com');

    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045556666');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('landing-page-guide');
    expect(captured.payload.email).toBe('guide@example.com');
  });

  test('references a downloadable PDF guide', async ({ page }) => {
    await page.goto('/free-guide');
    const pdfLinks = page.locator('a[href*=".pdf"]');
    const count = await pdfLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Resources page', () => {
  test('loads successfully', async ({ page }) => {
    const res = await page.goto('/resources');
    expect(res.status()).toBe(200);
  });

  test('has a form', async ({ page }) => {
    await page.goto('/resources');
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('submits with resource-download formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/resources');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Resource Tester');

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('resource@example.com');

    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045557777');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('resource-download');
    expect(captured.payload.email).toBe('resource@example.com');
  });
});

test.describe('PDF guide file existence', () => {
  test('homebuyer guide PDF is accessible', async ({ page }) => {
    const res = await page.goto('/guides/first-time-homebuyer-guide.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  });
});
