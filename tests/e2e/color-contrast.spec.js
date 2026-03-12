/**
 * E2E tests — Color contrast accessibility
 *
 * Runs axe-core color-contrast rule separately from the main accessibility
 * suite to audit WCAG AA compliance for the design palette.
 *
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
  { name: 'Course', path: '/course' },
  { name: 'About', path: '/about' },
  { name: 'Resources', path: '/resources' },
];

test.describe('Color contrast — WCAG AA audit', () => {
  for (const { name, path } of pages) {
    test(`${name} page color contrast audit`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      const violations = results.violations.filter(
        v => v.id === 'color-contrast'
      );

      if (violations.length > 0) {
        const summary = violations.flatMap(v =>
          v.nodes.map(n => {
            const el = n.target.join(' > ');
            const text = n.html.substring(0, 80);
            return `  [${n.impact}] ${el}: ${n.message} — ${text}`;
          })
        ).join('\n');
        console.log(`\nColor contrast issues on ${name} (${violations[0]?.nodes?.length || 0} elements):\n${summary}`);
      }

      // Filter to critical/serious only — moderate contrast issues are logged but don't fail
      const serious = violations.flatMap(v =>
        v.nodes.filter(n => n.impact === 'critical' || n.impact === 'serious')
      );

      expect(
        serious.length,
        `${name} has ${serious.length} critical/serious contrast violations`
      ).toBe(0);
    });
  }
});
