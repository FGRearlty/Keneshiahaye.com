/**
 * E2E tests — Homepage popup trigger behavior
 *
 * Tests scroll-triggered popup display, 7-day cooldown via localStorage,
 * close handlers (button, overlay click, Escape key), and form submission.
 *
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const WORKER_URL = 'https://keneshia-haye-form-handler.jutsuxx.workers.dev';

test.describe('Homepage popup — scroll trigger', () => {
  test('popup is hidden on initial page load', async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('popup appears after scrolling past 50%', async ({ page }) => {
    await page.goto('/');

    // Scroll to 60% of the page
    await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, docHeight * 0.6);
    });

    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'flex', { timeout: 5000 });
  });

  test('popup does not appear when scrolling less than 50%', async ({ page }) => {
    await page.goto('/');

    // Scroll to 30% of the page
    await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, docHeight * 0.3);
    });

    // Wait a moment to ensure popup doesn't appear
    await page.waitForTimeout(500);

    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'none');
  });
});

test.describe('Homepage popup — close handlers', () => {
  async function triggerPopup(page) {
    await page.goto('/');
    await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, docHeight * 0.6);
    });
    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'flex', { timeout: 5000 });
  }

  test('close button hides the popup', async ({ page }) => {
    await triggerPopup(page);
    await page.click('#kh-popup-close');
    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'none', { timeout: 2000 });
  });

  test('clicking overlay background closes the popup', async ({ page }) => {
    await triggerPopup(page);
    // Click the overlay background (not the card)
    await page.locator('#kh-popup-overlay').click({ position: { x: 10, y: 10 } });
    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'none', { timeout: 2000 });
  });

  test('Escape key closes the popup', async ({ page }) => {
    await triggerPopup(page);
    await page.keyboard.press('Escape');
    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'none', { timeout: 2000 });
  });

  test('closing the popup sets cooldown in localStorage', async ({ page }) => {
    await triggerPopup(page);
    await page.click('#kh-popup-close');

    const stored = await page.evaluate(() => localStorage.getItem('kh_popup_shown'));
    expect(stored).toBeTruthy();
    const timestamp = parseInt(stored, 10);
    expect(timestamp).toBeGreaterThan(Date.now() - 5000);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });
});

test.describe('Homepage popup — cooldown', () => {
  test('popup does not appear when cooldown is active', async ({ page }) => {
    await page.goto('/');

    // Set a recent cooldown timestamp
    await page.evaluate(() => {
      localStorage.setItem('kh_popup_shown', Date.now().toString());
    });

    // Reload and scroll past 50%
    await page.reload();
    await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, docHeight * 0.6);
    });

    await page.waitForTimeout(1000);

    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'none');
  });

  test('popup appears when cooldown has expired', async ({ page }) => {
    await page.goto('/');

    // Set a cooldown timestamp from 8 days ago
    const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
    await page.evaluate((ts) => {
      localStorage.setItem('kh_popup_shown', ts.toString());
    }, eightDaysAgo);

    // Reload and scroll past 50%
    await page.reload();
    await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, docHeight * 0.6);
    });

    const overlay = page.locator('#kh-popup-overlay');
    await expect(overlay).toHaveCSS('display', 'flex', { timeout: 5000 });
  });
});

test.describe('Homepage popup — form submission', () => {
  async function triggerPopup(page) {
    await page.goto('/');
    await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, docHeight * 0.6);
    });
    await expect(page.locator('#kh-popup-overlay')).toHaveCSS('display', 'flex', { timeout: 5000 });
  }

  test('submits with correct formSource and shows success', async ({ page }) => {
    const captured = { payload: null, called: false };
    await page.route(`${WORKER_URL}**`, async (route) => {
      if (route.request().method() === 'POST') {
        captured.payload = route.request().postDataJSON();
        captured.called = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, contactId: 'popup-test-1', action: 'created' }),
        });
      } else {
        await route.continue();
      }
    });

    await triggerPopup(page);

    // Fill the popup form
    const form = page.locator('#kh-popup-form');
    await form.locator('input[name="firstName"]').fill('Jane');
    await form.locator('input[name="lastName"]').fill('Doe');
    await form.locator('input[name="email"]').fill('jane@test.com');
    const phoneField = form.locator('input[name="phone"]');
    if (await phoneField.count() > 0) {
      await phoneField.fill('9045551234');
    }

    await form.locator('button[type="submit"]').click();

    // Verify success state appears
    await expect(page.locator('#kh-popup-success-state')).toBeVisible({ timeout: 5000 });

    // Verify payload
    expect(captured.called).toBe(true);
    expect(captured.payload.formSource).toBe('homepage-guide-popup');
    expect(captured.payload.email).toBe('jane@test.com');
    expect(captured.payload.firstName).toBe('Jane');
    expect(captured.payload.lastName).toBe('Doe');
  });
});
