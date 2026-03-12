/**
 * E2E tests — Navigation, dark mode, and page structure
 *
 * Requires: npx playwright install chromium
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Keneshia Haye/i);
  });

  test('all main nav links are present', async ({ page }) => {
    await page.goto('/');
    const navLinks = ['Buy', 'Sell', 'Veterans', 'Course', 'Resources', 'Blog', 'About'];
    for (const text of navLinks) {
      const link = page.locator(`nav a:has-text("${text}")`).first();
      await expect(link).toBeVisible();
    }
  });

  test('contact CTA button is visible in nav', async ({ page }) => {
    await page.goto('/');
    const contactBtn = page.locator('nav a:has-text("Contact")').first();
    await expect(contactBtn).toBeVisible();
  });

  test('navigating to /buy loads the buy page', async ({ page }) => {
    await page.goto('/buy');
    await expect(page.locator('h1, h2').first()).toContainText(/buy|home|property/i);
  });

  test('navigating to /sell loads the sell page', async ({ page }) => {
    await page.goto('/sell');
    await expect(page.locator('h1, h2').first()).toContainText(/sell|home|property/i);
  });

  test('navigating to /veterans loads the veterans page', async ({ page }) => {
    await page.goto('/veterans');
    await expect(page.locator('h1, h2').first()).toContainText(/veteran|va|military/i);
  });

  test('navigating to /contact loads the contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1, h2').first()).toContainText(/contact|touch|reach/i);
  });

  test('404 page shown for invalid routes', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-xyz');
    expect(res.status()).toBe(404);
  });
});

test.describe('Footer', () => {
  test('footer contains contact information', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText(/254.*449.*5299/);
    await expect(footer).toContainText(/keneshia@fgragent\.com/);
  });

  test('footer contains brokerage info', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText(/Florida Gateway Realty/i);
  });
});

test.describe('Dark mode toggle', () => {
  test('page loads with dark class by default', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('toggle button exists and is visible', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#themeToggle');
    await expect(toggle).toBeVisible();
  });

  test('clicking toggle removes dark class and sets localStorage to light', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('#themeToggle');

    // Default is dark
    await expect(html).toHaveClass(/dark/);

    // Click to switch to light
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);

    const stored = await page.evaluate(() => localStorage.getItem('kh-theme'));
    expect(stored).toBe('light');
  });

  test('clicking toggle twice restores dark mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('#themeToggle');

    await toggle.click(); // -> light
    await toggle.click(); // -> dark
    await expect(html).toHaveClass(/dark/);

    const stored = await page.evaluate(() => localStorage.getItem('kh-theme'));
    expect(stored).toBe('dark');
  });

  test('light mode persists across page loads via localStorage', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#themeToggle');
    await toggle.click(); // -> light

    await page.goto('/contact');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
  });
});

test.describe('Mobile hamburger menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
  });

  test('hamburger button is visible on mobile', async ({ page }) => {
    const menuBtn = page.locator('#mobileMenuBtn');
    await expect(menuBtn).toBeVisible();
  });

  test('mobile menu is initially collapsed', async ({ page }) => {
    const mobileMenu = page.locator('#mobileMenu');
    const maxHeight = await mobileMenu.evaluate(el => el.style.maxHeight);
    expect(maxHeight === '0px' || maxHeight === '').toBeTruthy();
  });

  test('clicking hamburger opens the menu', async ({ page }) => {
    const menuBtn = page.locator('#mobileMenuBtn');
    const mobileMenu = page.locator('#mobileMenu');

    await menuBtn.click();

    // maxHeight should be set to a positive value
    const maxHeight = await mobileMenu.evaluate(el => el.style.maxHeight);
    expect(maxHeight).not.toBe('0px');
    expect(maxHeight).not.toBe('');

    // Nav links should be visible
    const links = page.locator('#mobileMenu .mobile-nav-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking hamburger again closes the menu', async ({ page }) => {
    const menuBtn = page.locator('#mobileMenuBtn');
    const mobileMenu = page.locator('#mobileMenu');

    await menuBtn.click(); // open
    await menuBtn.click(); // close

    const maxHeight = await mobileMenu.evaluate(el => el.style.maxHeight);
    expect(maxHeight).toBe('0px');
  });

  test('hamburger bars animate on open', async ({ page }) => {
    const menuBtn = page.locator('#mobileMenuBtn');
    await menuBtn.click();

    const bar1Transform = await page.locator('#bar1').evaluate(el => el.style.transform);
    const bar2Opacity = await page.locator('#bar2').evaluate(el => el.style.opacity);
    const bar3Transform = await page.locator('#bar3').evaluate(el => el.style.transform);

    expect(bar1Transform).toContain('rotate');
    expect(bar2Opacity).toBe('0');
    expect(bar3Transform).toContain('rotate');
  });

  test('clicking a mobile nav link closes the menu', async ({ page }) => {
    const menuBtn = page.locator('#mobileMenuBtn');
    const mobileMenu = page.locator('#mobileMenu');

    await menuBtn.click();
    const link = page.locator('#mobileMenu .mobile-nav-link').first();
    await link.click();

    // Wait for menu to close
    await page.waitForFunction(() => {
      const menu = document.getElementById('mobileMenu');
      return menu && menu.style.maxHeight === '0px';
    });

    const maxHeight = await mobileMenu.evaluate(el => el.style.maxHeight);
    expect(maxHeight).toBe('0px');
  });
});

test.describe('Meta tags', () => {
  test('homepage has meta description', async ({ page }) => {
    await page.goto('/');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /.+/);
  });

  test('homepage has viewport meta tag', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('homepage has Open Graph title tag', async ({ page }) => {
    await page.goto('/');
    const ogTitle = page.locator('meta[property="og:title"]');
    const count = await ogTitle.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
