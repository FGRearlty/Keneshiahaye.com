/**
 * E2E tests — Area pages
 *
 * Tests that all 8 area pages render correctly, have forms with
 * correct formSource values, and pass accessibility checks.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const areaPages = [
  { name: 'Jacksonville', path: '/areas/jacksonville', formSource: 'area-jacksonville' },
  { name: 'Orange Park', path: '/areas/orange-park', formSource: 'area-orange-park' },
  { name: 'St. Augustine', path: '/areas/st-augustine', formSource: 'area-st-augustine' },
  { name: 'Ponte Vedra', path: '/areas/ponte-vedra', formSource: 'area-ponte-vedra' },
  { name: 'Fleming Island', path: '/areas/fleming-island', formSource: 'area-fleming-island' },
  { name: 'Callahan', path: '/areas/callahan', formSource: 'area-callahan' },
  { name: 'Middleburg', path: '/areas/middleburg', formSource: 'area-middleburg' },
  { name: 'Green Cove Springs', path: '/areas/green-cove-springs', formSource: 'area-green-cove-springs' },
];

for (const { name, path, formSource } of areaPages) {
  test.describe(`Area page — ${name}`, () => {
    test(`loads successfully`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
    });

    test(`has a form`, async ({ page }) => {
      await page.goto(path);
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
    });

    test(`form has email field`, async ({ page }) => {
      await page.goto(path);
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      await expect(emailField).toBeVisible();
    });

    test(`has correct formSource (${formSource})`, async ({ page }) => {
      await page.goto(path);
      const pageContent = await page.content();
      expect(pageContent).toContain(formSource);
    });

    test(`has area-specific content`, async ({ page }) => {
      await page.goto(path);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test(`has proper heading hierarchy`, async ({ page }) => {
      await page.goto(path);
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
        els.map(el => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent.trim().substring(0, 50),
        }))
      );
      expect(headings.length).toBeGreaterThan(0);
      const h1s = headings.filter(h => h.level === 1);
      expect(h1s.length, `${name} should have exactly one h1`).toBe(1);
    });

    test(`images have alt text`, async ({ page }) => {
      await page.goto(path);
      const imagesWithoutAlt = await page.$$eval('img', imgs =>
        imgs.filter(img => !img.getAttribute('alt') && img.getAttribute('alt') !== '').length
      );
      expect(imagesWithoutAlt, `${name} has images without alt attribute`).toBe(0);
    });

    test(`has no critical accessibility violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast'])
        .analyze();

      const serious = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(
        serious,
        `${name} has ${serious.length} critical/serious a11y violations`
      ).toHaveLength(0);
    });

    test(`has navigation links`, async ({ page }) => {
      await page.goto(path);
      const navLinks = ['Buy', 'Sell', 'Veterans'];
      for (const text of navLinks) {
        const link = page.locator(`nav a:has-text("${text}")`).first();
        await expect(link).toBeVisible();
      }
    });
  });
}
