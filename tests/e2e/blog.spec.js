/**
 * E2E tests — Blog pages
 *
 * Tests that blog posts render correctly, nav links resolve
 * (no broken ../ paths), and accessibility is maintained.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const blogPosts = [
  { name: 'Blog Index', path: '/blog/' },
  { name: 'Jacksonville Real Estate Market', path: '/blog/jacksonville-real-estate-market' },
  { name: 'First-Time Homebuyer Mistakes', path: '/blog/first-time-homebuyer-mistakes' },
  { name: 'Jacksonville Neighborhoods', path: '/blog/jacksonville-neighborhoods-first-time-buyers' },
  { name: 'Sell Your Home Fast', path: '/blog/sell-your-home-fast-jacksonville' },
  { name: 'VA Loan Guide', path: '/blog/va-loan-guide-jacksonville' },
  { name: 'Moving to Jacksonville Military', path: '/blog/moving-to-jacksonville-military' },
];

test.describe('Blog index', () => {
  test('loads successfully', async ({ page }) => {
    const res = await page.goto('/blog/');
    expect(res.status()).toBe(200);
  });

  test('contains links to blog posts', async ({ page }) => {
    await page.goto('/blog/');
    const links = page.locator('a[href*="blog/"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

for (const { name, path } of blogPosts) {
  test.describe(`Blog — ${name}`, () => {
    test(`loads successfully`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
    });

    test(`has an h1`, async ({ page }) => {
      await page.goto(path);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });

    test(`nav links resolve correctly (no broken ../ paths)`, async ({ page }) => {
      await page.goto(path);

      // Check that key nav links are present and point to valid paths
      const navLinks = page.locator('nav a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);

      // Verify Buy, Sell, Veterans links work from blog pages
      for (const linkText of ['Buy', 'Sell', 'Veterans']) {
        const link = page.locator(`nav a:has-text("${linkText}")`).first();
        const linkCount = await link.count();
        if (linkCount > 0) {
          const href = await link.getAttribute('href');
          expect(href).toBeTruthy();
          // Should not have double dots that fail to resolve
          if (href.startsWith('../')) {
            // Verify the ../path resolves — navigate and check
            const res = await page.goto(new URL(href, page.url()).href);
            expect(res.status()).toBe(200);
            // Navigate back
            await page.goto(path);
          }
        }
      }
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

    test(`has meta description`, async ({ page }) => {
      await page.goto(path);
      const desc = page.locator('meta[name="description"]');
      const count = await desc.count();
      expect(count).toBeGreaterThanOrEqual(1);
      if (count > 0) {
        await expect(desc.first()).toHaveAttribute('content', /.+/);
      }
    });
  });
}
