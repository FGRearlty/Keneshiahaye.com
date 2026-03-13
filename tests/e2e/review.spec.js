/**
 * E2E tests — Review page
 *
 * Tests rendering, accessibility, navigation, and meta tags
 * for the review.html page.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Review page', () => {
  test('page loads with 200 status', async ({ page }) => {
    const res = await page.goto('/review');
    expect(res.status()).toBe(200);
  });

  test('has correct title', async ({ page }) => {
    await page.goto('/review');
    await expect(page).toHaveTitle(/review/i);
  });

  test('has exactly one h1', async ({ page }) => {
    await page.goto('/review');
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('has meta description', async ({ page }) => {
    await page.goto('/review');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.{20,}/);
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/review');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute('content', /.+/);
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/review');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /review/);
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/review');
    const nav = page.locator('nav').first();
    await expect(nav.locator('a[href="/buy"], a[href="/buy.html"]').first()).toBeVisible();
  });

  test('no critical accessibility violations', async ({ page }) => {
    await page.goto('/review');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const serious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(
      serious,
      `Review page has ${serious.length} critical/serious a11y violations`
    ).toHaveLength(0);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/review');

    const imagesWithoutAlt = await page.$$eval('img', imgs =>
      imgs.filter(img => !img.getAttribute('alt') && img.getAttribute('alt') !== '').length
    );

    expect(imagesWithoutAlt).toBe(0);
  });
});

test.describe('Review — mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/review');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});
