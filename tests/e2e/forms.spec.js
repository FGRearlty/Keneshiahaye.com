/**
 * E2E tests — Form rendering and validation
 *
 * Verifies that critical forms render correctly, have required fields,
 * and display proper validation states.
 *
 * Requires: npx playwright install chromium
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('Contact page form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('form is visible on page', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('has required name/email/phone fields', async ({ page }) => {
    const nameField = page.locator('input[name*="name"], input[placeholder*="name" i]').first();
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    const phoneField = page.locator('input[type="tel"], input[name*="phone"]').first();

    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(phoneField).toBeVisible();
  });

  test('phone field is required', async ({ page }) => {
    const phoneField = page.locator('input[type="tel"], input[name*="phone"]').first();
    await expect(phoneField).toHaveAttribute('required', '');
  });

  test('has a submit button', async ({ page }) => {
    const btn = page.locator('button[type="submit"], input[type="submit"]').first();
    await expect(btn).toBeVisible();
  });
});

test.describe('Buy page form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/buy');
  });

  test('form is visible on page', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('has buyer-specific fields', async ({ page }) => {
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    await expect(emailField).toBeVisible();
  });

  test('has a submit button', async ({ page }) => {
    const btn = page.locator('button[type="submit"], input[type="submit"]').first();
    await expect(btn).toBeVisible();
  });
});

test.describe('Sell page form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sell');
  });

  test('form is visible on page', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('has seller-specific fields (address)', async ({ page }) => {
    const addressField = page.locator('input[name*="address"], textarea[name*="address"], input[placeholder*="address" i]').first();
    await expect(addressField).toBeVisible();
  });
});

test.describe('Veterans page form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/veterans');
  });

  test('form is visible on page', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('has veteran-specific fields', async ({ page }) => {
    // VA forms typically include branch of service
    const page_content = await page.content();
    expect(page_content.toLowerCase()).toMatch(/branch|service|veteran|military/);
  });
});

test.describe('Homepage forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage has at least one form', async ({ page }) => {
    const forms = page.locator('form');
    const count = await forms.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('newsletter/guide form has email field', async ({ page }) => {
    const emailFields = page.locator('input[type="email"]');
    const count = await emailFields.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Form validation behavior', () => {
  test('empty form submission triggers browser validation', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form').first();
    const submitBtn = form.locator('button[type="submit"], input[type="submit"]').first();

    // Click submit without filling anything — should not navigate away
    await submitBtn.click();

    // Page should still be on /contact (browser validation prevents submission)
    expect(page.url()).toContain('contact');
  });
});
