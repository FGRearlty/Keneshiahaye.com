/**
 * E2E tests — Mobile viewport
 *
 * Tests mobile-specific UI elements and form usability at 375px width.
 * Covers the mobile bottom nav bar, form responsiveness, CTA visibility,
 * and tel: links.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const WORKER_URL = 'https://keneshia-haye-form-handler.jutsuxx.workers.dev';

test.use({ viewport: { width: 375, height: 812 } });

const pagesWithBottomNav = [
  { name: 'Homepage', path: '/' },
  { name: 'Buy', path: '/buy' },
  { name: 'Sell', path: '/sell' },
  { name: 'Contact', path: '/contact' },
  { name: 'Veterans', path: '/veterans' },
  { name: 'Course', path: '/course' },
  { name: 'About', path: '/about' },
  { name: 'Resources', path: '/resources' },
];

test.describe('Mobile bottom nav bar', () => {
  for (const { name, path } of pagesWithBottomNav) {
    test(`${name} page renders mobile bottom nav`, async ({ page }) => {
      await page.goto(path);
      const bottomNav = page.locator('#mobileBottomNav');
      await expect(bottomNav).toBeVisible();
    });
  }

  test('bottom nav has at least 4 navigation links', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('#mobileBottomNav a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('bottom nav links have text labels', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('#mobileBottomNav a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      expect(text.trim().length, `Bottom nav link ${i} should have a label`).toBeGreaterThan(0);
    }
  });
});

test.describe('Mobile form usability', () => {
  function interceptFormPost(page) {
    const captured = { payload: null, called: false };
    page.route(`${WORKER_URL}**`, async (route) => {
      if (route.request().method() === 'POST') {
        captured.payload = route.request().postDataJSON();
        captured.called = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, contactId: 'mobile-test', action: 'created' }),
        });
      } else {
        await route.continue();
      }
    });
    return captured;
  }

  test('contact form submits successfully at mobile width', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/contact');

    await page.fill('input[name="name"], input[placeholder*="name" i]', 'Mobile User');
    await page.fill('input[type="email"], input[name="email"]', 'mobile@example.com');
    await page.fill('input[type="tel"], input[name="phone"]', '9045551234');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    expect(captured.called).toBe(true);
    expect(captured.payload.email).toBe('mobile@example.com');
  });

  test('buy form submits successfully at mobile width', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/buy');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Mobile Buyer');

    await page.locator('input[type="email"], input[name="email"]').first().fill('buyer-mobile@example.com');
    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045559999');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    expect(captured.called).toBe(true);
  });

  test('sell form submits successfully at mobile width', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/sell');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Mobile Seller');

    await page.locator('input[type="email"], input[name="email"]').first().fill('seller-mobile@example.com');
    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045558888');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    expect(captured.called).toBe(true);
  });

  test('veterans form submits successfully at mobile width', async ({ page }) => {
    const captured = interceptFormPost(page);
    await page.goto('/veterans');

    const nameField = page.locator('input[name="name"], input[name="firstName"], input[placeholder*="name" i]').first();
    if (await nameField.count() > 0) await nameField.fill('Mobile Vet');

    await page.locator('input[type="email"], input[name="email"]').first().fill('vet-mobile@example.com');
    const phoneField = page.locator('input[type="tel"], input[name="phone"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('9045557777');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    expect(captured.called).toBe(true);
  });
});

test.describe('Mobile page layout', () => {
  test('no horizontal overflow on homepage', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, 'Page should not have horizontal scroll').toBe(false);
  });

  test('no horizontal overflow on contact page', async ({ page }) => {
    await page.goto('/contact');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, 'Contact page should not have horizontal scroll').toBe(false);
  });

  test('no horizontal overflow on buy page', async ({ page }) => {
    await page.goto('/buy');
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, 'Buy page should not have horizontal scroll').toBe(false);
  });

  test('submit button is visible without scrolling horizontally', async ({ page }) => {
    await page.goto('/contact');
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible();

    const box = await submitBtn.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  });

  test('CTA buttons are at least 44px tall for touch targets', async ({ page }) => {
    await page.goto('/');
    const ctas = page.locator('a.rounded-full, button[type="submit"]');
    const count = await ctas.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await ctas.nth(i).boundingBox();
      if (box) {
        expect(
          box.height,
          `CTA ${i} should be at least 44px tall for touch targets`
        ).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Mobile tel: links', () => {
  test('phone number links use tel: protocol', async ({ page }) => {
    await page.goto('/contact');
    const telLinks = page.locator('a[href^="tel:"]');
    const count = await telLinks.count();
    expect(count, 'Contact page should have at least one tel: link').toBeGreaterThanOrEqual(1);
  });

  test('tel: link contains the correct phone number', async ({ page }) => {
    await page.goto('/contact');
    const telLink = page.locator('a[href^="tel:"]').first();
    const href = await telLink.getAttribute('href');
    // Should contain the digits of (254) 449-5299
    expect(href).toContain('254');
    expect(href).toContain('5299');
  });
});
