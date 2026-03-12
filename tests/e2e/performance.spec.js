/**
 * E2E tests — Performance / page weight budget
 *
 * Verifies that key pages stay within size budgets to prevent
 * performance regressions from oversized images or bloated HTML.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

/**
 * Collect total transfer size for a page load.
 * Includes HTML, CSS, JS, images, fonts — everything the browser downloads.
 */
async function measurePageWeight(page, path) {
  const resources = [];

  page.on('response', (response) => {
    const headers = response.headers();
    const contentLength = parseInt(headers['content-length'] || '0', 10);
    resources.push({
      url: response.url(),
      size: contentLength,
      type: headers['content-type'] || 'unknown',
    });
  });

  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const totalBytes = resources.reduce((sum, r) => sum + r.size, 0);
  return {
    totalBytes,
    totalKB: Math.round(totalBytes / 1024),
    resourceCount: resources.length,
    resources,
  };
}

// Page weight budgets (in KB)
const PAGE_BUDGETS = [
  { name: 'Homepage', path: '/', maxKB: 3000 },
  { name: 'Contact', path: '/contact', maxKB: 2000 },
  { name: 'Buy', path: '/buy', maxKB: 2000 },
  { name: 'Sell', path: '/sell', maxKB: 2000 },
  { name: 'Veterans', path: '/veterans', maxKB: 2500 },
  { name: 'Course', path: '/course', maxKB: 2500 },
  { name: 'Blog Index', path: '/blog/', maxKB: 2000 },
  { name: 'About', path: '/about', maxKB: 2000 },
];

test.describe('Page weight budgets', () => {
  for (const { name, path, maxKB } of PAGE_BUDGETS) {
    test(`${name} page is under ${maxKB}KB`, async ({ page }) => {
      const result = await measurePageWeight(page, path);
      expect(
        result.totalKB,
        `${name} page is ${result.totalKB}KB (budget: ${maxKB}KB, ${result.resourceCount} resources)`
      ).toBeLessThanOrEqual(maxKB);
    });
  }
});

test.describe('Individual resource size limits', () => {
  test('no single image exceeds 500KB on homepage', async ({ page }) => {
    const resources = [];
    page.on('response', (response) => {
      const contentType = response.headers()['content-type'] || '';
      const contentLength = parseInt(response.headers()['content-length'] || '0', 10);
      if (contentType.startsWith('image/')) {
        resources.push({
          url: response.url(),
          sizeKB: Math.round(contentLength / 1024),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const img of resources) {
      expect(
        img.sizeKB,
        `Image ${img.url} is ${img.sizeKB}KB (max 500KB)`
      ).toBeLessThanOrEqual(500);
    }
  });

  test('HTML document is under 200KB on each key page', async ({ page }) => {
    const keyPages = ['/', '/contact', '/buy', '/sell', '/veterans'];
    for (const path of keyPages) {
      const response = await page.goto(path);
      const body = await response.body();
      const sizeKB = Math.round(body.length / 1024);
      expect(
        sizeKB,
        `${path} HTML is ${sizeKB}KB (max 200KB)`
      ).toBeLessThanOrEqual(200);
    }
  });
});

test.describe('Resource count limits', () => {
  test('homepage loads fewer than 80 resources', async ({ page }) => {
    let resourceCount = 0;
    page.on('response', () => { resourceCount++; });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(
      resourceCount,
      `Homepage loaded ${resourceCount} resources (max 80)`
    ).toBeLessThanOrEqual(80);
  });
});
