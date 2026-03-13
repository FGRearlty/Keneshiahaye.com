/**
 * E2E tests — VA Benefits page
 *
 * Tests rendering, accessibility, forms, navigation, and meta tags
 * for the va-benefits.html page.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('VA Benefits page', () => {
  test('page loads with 200 status', async ({ page }) => {
    const res = await page.goto('/va-benefits');
    expect(res.status()).toBe(200);
  });

  test('has correct title', async ({ page }) => {
    await page.goto('/va-benefits');
    await expect(page).toHaveTitle(/VA Benefits/i);
  });

  test('has exactly one h1', async ({ page }) => {
    await page.goto('/va-benefits');
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
  });

  test('has meta description', async ({ page }) => {
    await page.goto('/va-benefits');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.{20,}/);
  });

  test('has Open Graph tags', async ({ page }) => {
    await page.goto('/va-benefits');
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute('content', /.+/);
  });

  test('has canonical URL', async ({ page }) => {
    await page.goto('/va-benefits');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /va-benefits/);
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/va-benefits');
    // Desktop nav should have key links
    const nav = page.locator('nav').first();
    await expect(nav.locator('a[href="/buy"], a[href="/buy.html"]').first()).toBeVisible();
  });

  test('no critical accessibility violations', async ({ page }) => {
    await page.goto('/va-benefits');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const serious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(
      serious,
      `VA Benefits has ${serious.length} critical/serious a11y violations`
    ).toHaveLength(0);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/va-benefits');

    const imagesWithoutAlt = await page.$$eval('img', imgs =>
      imgs.filter(img => !img.getAttribute('alt') && img.getAttribute('alt') !== '').length
    );

    expect(imagesWithoutAlt).toBe(0);
  });

  test('proper heading hierarchy', async ({ page }) => {
    await page.goto('/va-benefits');

    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
      els.map(el => parseInt(el.tagName[1]))
    );

    expect(headings.length).toBeGreaterThan(0);
    // No heading should skip more than one level
    for (let i = 1; i < headings.length; i++) {
      expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('VA Benefits — mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('page renders without horizontal overflow', async ({ page }) => {
    await page.goto('/va-benefits');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});
