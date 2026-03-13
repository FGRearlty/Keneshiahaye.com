/**
 * E2E tests — JavaScript error monitoring
 *
 * Verifies that key pages load without JavaScript errors in the console.
 * Catches silent runtime errors that could otherwise go undetected.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Buy', path: '/buy' },
  { name: 'Sell', path: '/sell' },
  { name: 'Contact', path: '/contact' },
  { name: 'Veterans', path: '/veterans' },
  { name: 'VA Benefits', path: '/va-benefits' },
  { name: 'Course', path: '/course' },
  { name: 'About', path: '/about' },
  { name: 'Resources', path: '/resources' },
  { name: 'Free Guide', path: '/free-guide' },
  { name: 'Review', path: '/review' },
  { name: 'Blog Index', path: '/blog/' },
  { name: 'Blog Post', path: '/blog/va-loan-guide-jacksonville' },
  { name: 'Area Page', path: '/areas/jacksonville' },
];

for (const { name, path } of pages) {
  test(`${name} loads without JavaScript errors`, async ({ page }) => {
    const errors = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    expect(
      errors,
      `${name} had JS errors: ${errors.join('; ')}`
    ).toHaveLength(0);
  });
}
