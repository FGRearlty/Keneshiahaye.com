/**
 * E2E tests — Visual regression (screenshot comparison)
 *
 * Captures screenshots of key pages in both dark and light modes.
 * On first run, baseline screenshots are saved to tests/e2e/visual-regression.spec.js-snapshots/.
 * On subsequent runs, new screenshots are compared to baselines.
 *
 * To update baselines after intentional design changes:
 *   npx playwright test visual-regression --update-snapshots
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'homepage', path: '/' },
  { name: 'contact', path: '/contact' },
  { name: 'buy', path: '/buy' },
  { name: 'sell', path: '/sell' },
  { name: 'veterans', path: '/veterans' },
  { name: 'course', path: '/course' },
  { name: 'blog-index', path: '/blog/' },
];

test.describe('Visual regression — dark mode (default)', () => {
  for (const { name, path } of pages) {
    test(`${name} matches dark mode baseline`, async ({ page }) => {
      await page.goto(path);
      // Wait for fonts and images to load
      await page.waitForLoadState('networkidle');

      // Dismiss popup if it appears (homepage only)
      const popup = page.locator('#kh-popup-overlay');
      if (await popup.isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});

test.describe('Visual regression — light mode', () => {
  for (const { name, path } of pages) {
    test(`${name} matches light mode baseline`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Switch to light mode
      const toggle = page.locator('#themeToggle');
      if (await toggle.isVisible().catch(() => false)) {
        await toggle.click();
        await page.waitForTimeout(200);
      }

      // Dismiss popup if it appears
      const popup = page.locator('#kh-popup-overlay');
      if (await popup.isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});

test.describe('Visual regression — mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  const mobilePages = [
    { name: 'homepage', path: '/' },
    { name: 'contact', path: '/contact' },
  ];

  for (const { name, path } of mobilePages) {
    test(`${name} matches mobile baseline`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Dismiss popup if it appears
      const popup = page.locator('#kh-popup-overlay');
      if (await popup.isVisible().catch(() => false)) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
