/**
 * E2E tests — Checkout page
 *
 * Tests the SOMS course checkout flow including page rendering,
 * URL param pre-fill, gift purchase detection, and form submission
 * redirect to the GHL Client Club checkout.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const GHL_CHECKOUT_HOST = 'clientclub.net';

test.describe('Checkout page rendering', () => {
  test('loads successfully', async ({ page }) => {
    const res = await page.goto('/checkout');
    expect(res.status()).toBe(200);
  });

  test('shows course title "Stand on My Shoulder"', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('.course-title')).toContainText('Stand on My Shoulder');
  });

  test('shows price of $20', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('.price')).toContainText('$20');
  });

  test('has email and name input fields', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('has a submit button', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(/Proceed|Checkout/i);
  });

  test('shows course inclusions', async ({ page }) => {
    await page.goto('/checkout');
    const includes = page.locator('.includes');
    await expect(includes).toContainText('16 video lessons');
    await expect(includes).toContainText('Downloadable resources');
    await expect(includes).toContainText('Lifetime access');
    await expect(includes).toContainText('B.U.I.L.D. framework');
  });

  test('has back link to course page', async ({ page }) => {
    await page.goto('/checkout');
    const backLink = page.locator('a[href="/course"]');
    await expect(backLink).toBeVisible();
  });

  test('shows secure checkout note', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('.secure-note')).toContainText('Secure checkout');
  });
});

test.describe('Checkout — URL param pre-fill', () => {
  test('pre-fills email from URL params', async ({ page }) => {
    await page.goto('/checkout?email=jane@example.com');
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveValue('jane@example.com');
  });

  test('pre-fills name from URL params', async ({ page }) => {
    await page.goto('/checkout?name=Jane+Doe');
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveValue('Jane Doe');
  });

  test('pre-fills both email and name from URL params', async ({ page }) => {
    await page.goto('/checkout?email=jane@example.com&name=Jane+Doe');
    await expect(page.locator('input[name="email"]')).toHaveValue('jane@example.com');
    await expect(page.locator('input[name="name"]')).toHaveValue('Jane Doe');
  });

  test('fields are empty when no URL params provided', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('input[name="name"]')).toHaveValue('');
  });
});

test.describe('Checkout — gift purchase', () => {
  test('shows gift badge when gift=1 and recipient param present', async ({ page }) => {
    await page.goto('/checkout?gift=1&recipient=Mom');
    const badge = page.locator('.badge');
    await expect(badge).toContainText('Gift for Mom');
  });

  test('shows default badge when no gift params', async ({ page }) => {
    await page.goto('/checkout');
    const badge = page.locator('.badge');
    await expect(badge).toContainText('Online Course');
  });
});

test.describe('Checkout — form submission redirect', () => {
  test('form action points to GHL Client Club', async ({ page }) => {
    await page.goto('/checkout');
    const form = page.locator('#checkoutForm');
    const action = await form.getAttribute('action');
    expect(action).toContain(GHL_CHECKOUT_HOST);
  });

  test('form submission redirects to GHL with email and name params', async ({ page }) => {
    await page.goto('/checkout');

    // Intercept navigation to GHL
    const [request] = await Promise.all([
      page.waitForEvent('request', req => req.url().includes(GHL_CHECKOUT_HOST)),
      (async () => {
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="name"]', 'Jane Doe');
        await page.click('button[type="submit"]');
      })(),
    ]);

    const url = new URL(request.url());
    expect(url.searchParams.get('email')).toBe('test@example.com');
    expect(url.searchParams.get('name')).toBe('Jane Doe');
    expect(url.searchParams.get('first_name')).toBe('Jane');
    expect(url.searchParams.get('last_name')).toBe('Doe');
  });
});
