/**
 * E2E accessibility tests using axe-core
 *
 * Tests key pages for WCAG 2.1 compliance.
 *
 * Requires: npx playwright install chromium
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Buy', path: '/buy' },
  { name: 'Sell', path: '/sell' },
  { name: 'Contact', path: '/contact' },
  { name: 'Veterans', path: '/veterans' },
  { name: 'Resources', path: '/resources' },
  { name: 'About', path: '/about' },
  { name: 'Course', path: '/course' },
  { name: 'VA Benefits', path: '/va-benefits' },
  { name: 'Review', path: '/review' },
  { name: 'Free Guide', path: '/free-guide' },
];

for (const { name, path } of pages) {
  test.describe(`Accessibility — ${name}`, () => {
    test(`${name} page has no critical accessibility violations`, async ({ page }) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules([
          'color-contrast',  // Often fails on design-heavy sites; test separately
        ])
        .analyze();

      // Filter to critical and serious violations only
      const serious = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      if (serious.length > 0) {
        const summary = serious.map(v =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`
        ).join('\n');
        console.log(`Accessibility issues on ${name}:\n${summary}`);
      }

      expect(
        serious,
        `${name} has ${serious.length} critical/serious accessibility violations`
      ).toHaveLength(0);
    });

    test(`${name} page has proper heading hierarchy`, async ({ page }) => {
      await page.goto(path);

      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els =>
        els.map(el => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent.trim().substring(0, 50),
        }))
      );

      // Should have at least one heading
      expect(headings.length).toBeGreaterThan(0);

      // Should have exactly one h1
      const h1s = headings.filter(h => h.level === 1);
      expect(h1s.length, `${name} should have exactly one h1`).toBe(1);
    });

    test(`${name} page images have alt text`, async ({ page }) => {
      await page.goto(path);

      const imagesWithoutAlt = await page.$$eval('img', imgs =>
        imgs.filter(img => !img.getAttribute('alt') && img.getAttribute('alt') !== '').length
      );

      expect(
        imagesWithoutAlt,
        `${name} has ${imagesWithoutAlt} images without alt attribute`
      ).toBe(0);
    });

    test(`${name} page forms have labeled inputs`, async ({ page }) => {
      await page.goto(path);

      const unlabeled = await page.$$eval(
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
        inputs => inputs.filter(input => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledBy = input.getAttribute('aria-labelledby');
          const placeholder = input.getAttribute('placeholder');
          const title = input.getAttribute('title');
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const parentLabel = input.closest('label');
          return !hasLabel && !parentLabel && !ariaLabel && !ariaLabelledBy && !placeholder && !title;
        }).length
      );

      expect(
        unlabeled,
        `${name} has ${unlabeled} form inputs without labels or accessible names`
      ).toBe(0);
    });
  });
}
