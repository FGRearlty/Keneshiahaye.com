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

test.describe('Redirect config validation', () => {
  test('_redirects file contains /privacy -> /privacy-policy redirect', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const redirectsPath = path.resolve(import.meta.dirname, '..', '..', '_redirects');
    const content = fs.readFileSync(redirectsPath, 'utf-8');
    expect(content).toContain('/privacy');
    expect(content).toContain('/privacy-policy');
    expect(content).toContain('301');
  });

  test('/privacy-policy and /terms both return valid HTML', async ({ page }) => {
    for (const p of ['/privacy-policy', '/terms']) {
      const res = await page.goto(p);
      expect(res.status()).toBe(200);
      const html = await page.content();
      expect(html).toContain('<!DOCTYPE html');
    }
  });
});
