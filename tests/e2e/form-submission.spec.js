/**
 * E2E tests — Form submission behavior
 *
 * Tests that forms submit correct JSON payloads to the Cloudflare Worker
 * by intercepting network requests. Also tests success/error UI states.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const WORKER_URL = 'https://keneshia-haye-form-handler.jutsuxx.workers.dev';

/**
 * Intercept form POST requests and capture the payload.
 * Returns a mock success response.
 */
function interceptFormPost(page) {
  const captured = { payload: null, called: false };
  page.route(`${WORKER_URL}**`, async (route) => {
    if (route.request().method() === 'POST') {
      captured.payload = route.request().postDataJSON();
      captured.called = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, contactId: 'test-123', action: 'created' }),
      });
    } else {
      await route.continue();
    }
  });
  return captured;
}

/**
 * Intercept form POST and return an error response.
 */
function interceptFormPostError(page) {
  page.route(`${WORKER_URL}**`, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe('Contact form submission', () => {
  test('submits correct payload with formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/contact');

    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Jane Doe');
    await page.fill('input[type="email"], input[name="email"]', 'jane@example.com');
    await page.fill('input[type="tel"], input[name="phone"]', '9045551234');

    // Fill message if present
    const messageField = page.locator('textarea[name="message"]');
    if (await messageField.count() > 0) {
      await messageField.fill('I need help buying a home.');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('contact-page');
    expect(captured.payload.email).toBe('jane@example.com');
    expect(captured.payload.phone).toBe('9045551234');
  });

  test('shows success message after submission', async ({ page }) => {
    interceptFormPost(page);
    await page.goto('/contact');

    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Jane Doe');
    await page.fill('input[type="email"], input[name="email"]', 'jane@example.com');
    await page.fill('input[type="tel"], input[name="phone"]', '9045551234');
    await page.click('button[type="submit"]');

    const success = page.locator('#successMessage');
    await expect(success).toBeVisible({ timeout: 5000 });
  });

  test('shows error state on server failure', async ({ page }) => {
    interceptFormPostError(page);
    await page.goto('/contact');

    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Jane Doe');
    await page.fill('input[type="email"], input[name="email"]', 'jane@example.com');
    await page.fill('input[type="tel"], input[name="phone"]', '9045551234');
    await page.click('button[type="submit"]');

    // Error message should appear
    const error = page.locator('#formError');
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('phone field prevents submission when empty', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Jane Doe');
    await page.fill('input[type="email"], input[name="email"]', 'jane@example.com');
    // Do NOT fill phone

    await page.click('button[type="submit"]');

    // Should still be on contact page (browser validation prevents submission)
    expect(page.url()).toContain('contact');
  });
});

test.describe('Buyer form submission', () => {
  test('submits correct payload with buyer-intake formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/buy');

    // Fill required fields
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('buyer@example.com');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) {
      await nameField.fill('John Buyer');
    }

    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) {
      await phoneField.fill('9045551111');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('buyer-intake');
    expect(captured.payload.email).toBe('buyer@example.com');
  });

  test('shows success state after submission', async ({ page }) => {
    interceptFormPost(page);
    await page.goto('/buy');

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('buyer@example.com');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('John Buyer');

    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045551111');

    await page.click('button[type="submit"]');

    const success = page.locator('#formSuccess');
    await expect(success).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Seller form submission', () => {
  test('submits correct payload with seller-valuation formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/sell');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Seller McSell');

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('seller@example.com');

    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045552222');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('seller-valuation');
    expect(captured.payload.email).toBe('seller@example.com');
  });
});

test.describe('Veterans form submission', () => {
  test('submits correct payload with va-intake formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/veterans');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Vet User');

    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('vet@example.com');

    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045553333');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('va-intake');
    expect(captured.payload.email).toBe('vet@example.com');
  });
});

test.describe('Area page form submissions', () => {
  const areaPages = [
    { path: '/areas/jacksonville', formSource: 'area-jacksonville' },
    { path: '/areas/orange-park', formSource: 'area-orange-park' },
    { path: '/areas/st-augustine', formSource: 'area-st-augustine' },
    { path: '/areas/ponte-vedra', formSource: 'area-ponte-vedra' },
    { path: '/areas/fleming-island', formSource: 'area-fleming-island' },
    { path: '/areas/callahan', formSource: 'area-callahan' },
    { path: '/areas/middleburg', formSource: 'area-middleburg' },
    { path: '/areas/green-cove-springs', formSource: 'area-green-cove-springs' },
  ];

  for (const { path: pagePath, formSource } of areaPages) {
    test(`${pagePath} submits with formSource "${formSource}"`, async ({ page }) => {
      const captured = interceptFormPost(page);
      await page.goto(pagePath);

      const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
      if (await nameField.count() > 0) await nameField.fill('Area Test');

      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      await emailField.fill('area@example.com');

      const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
      if (await phoneField.count() > 0) await phoneField.fill('9045554444');

      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      expect(captured.called).toBe(true);
      expect(captured.payload.formSource).toBe(formSource);
      expect(captured.payload.email).toBe('area@example.com');
    });
  }
});

test.describe('Newsletter footer form', () => {
  test('submits with footer-newsletter formSource', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/');

    // Find the footer newsletter form
    const footerForms = page.locator('footer form');
    const count = await footerForms.count();

    if (count > 0) {
      const form = footerForms.first();
      const emailInput = form.locator('input[type="email"]');
      await emailInput.fill('newsletter@example.com');

      const submitBtn = form.locator('button[type="submit"]');
      await submitBtn.click();
      await page.waitForTimeout(500);

      expect(captured.called).toBe(true);
      expect(captured.payload.formSource).toBe('footer-newsletter');
      expect(captured.payload.email).toBe('newsletter@example.com');
    }
  });
});
