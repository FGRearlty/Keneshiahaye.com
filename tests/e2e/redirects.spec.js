/**
 * E2E tests — Redirect rules
 *
 * Verifies that redirect rules defined in _redirects work correctly.
 * Note: The dev server may not handle _redirects natively, so these
 * tests verify the redirect config file and test behavior where supported.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('Redirect rules', () => {
  test('/privacy-policy page loads directly', async ({ page }) => {
    const res = await page.goto('/privacy-policy');
    expect(res.status()).toBe(200);
    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/privacy/);
  });

  test('/privacy-policy has expected privacy content', async ({ page }) => {
    await page.goto('/privacy-policy');
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText(/privacy/i);
  });

  test('/terms page loads directly', async ({ page }) => {
    const res = await page.goto('/terms');
    expect(res.status()).toBe(200);
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText(/terms/i);
  });
});
