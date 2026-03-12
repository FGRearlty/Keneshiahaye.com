/**
 * E2E tests — 404 error page
 *
 * Verifies that the custom 404 page renders with proper branding,
 * navigation, and content for nonexistent URLs.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('404 error page', () => {
  test('serves 404 page for nonexistent URLs', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    // The dev server may return 404 or serve the 404.html content
    // Check that the page has 404-related content
    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/not found|404|page.*not.*exist|doesn.*exist/);
  });

  test('404 page has navigation back to homepage', async ({ page }) => {
    await page.goto('/404');
    const homeLink = page.locator('a[href="/"], a[href="index.html"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('404 page has proper branding', async ({ page }) => {
    await page.goto('/404');
    const content = await page.content();
    expect(content).toContain('Keneshia');
  });

  test('404 page has correct title', async ({ page }) => {
    await page.goto('/404');
    const title = await page.title();
    expect(title.toLowerCase()).toContain('not found');
  });

  test('404 page has dark mode support', async ({ page }) => {
    await page.goto('/404');
    const html = page.locator('html');
    const hasClass = await html.getAttribute('class');
    expect(hasClass).toContain('dark');
  });
});
