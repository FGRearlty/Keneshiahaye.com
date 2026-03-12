/**
 * Form Validation Tests
 *
 * Tests the form handling patterns used across site pages.
 * Since forms are inline in HTML, we test the common patterns:
 * - Phone number requirement
 * - Form data structure sent to the Worker
 * - formSource values match FORM_TAG_MAP keys
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const ROOT = path.resolve(import.meta.dirname, '..');

// Known form sources from worker.js FORM_TAG_MAP
const VALID_FORM_SOURCES = [
  'contact-page', 'buyer-intake', 'seller-valuation', 'va-intake',
  'va-benefits-resource-kit', 'resource-download', 'footer-newsletter',
  'homepage-guide', 'homepage-guide-popup', 'landing-page-guide',
  'review-request', 'blog-lead-capture', 'course-interest',
  'course-enrollment', 'course-gift',
  'area-jacksonville', 'area-orange-park', 'area-st-augustine',
  'area-ponte-vedra', 'area-fleming-island', 'area-callahan',
  'area-middleburg', 'area-green-cove-springs', 'homepage-guide-download',
];

// Collect all site HTML files
const SITE_PAGES = [];

beforeAll(() => {
  function collectPages(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      // Skip non-site directories
      if (['email-templates', 'ghl', 'node_modules', 'va-resources'].includes(entry.name)) continue;
      if (entry.isDirectory()) {
        collectPages(path.join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.html')) {
        SITE_PAGES.push({
          name: `${prefix}${entry.name}`,
          path: path.join(dir, entry.name),
        });
      }
    }
  }
  collectPages(ROOT);
});

describe('Phone fields are required on forms', () => {
  it('all forms with phone inputs have the required attribute', () => {
    const missingRequired = [];

    for (const page of SITE_PAGES) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('input[type="tel"], input[name="phone"]').each((_, el) => {
        const hasRequired = $(el).attr('required') !== undefined;
        const hasAriaRequired = $(el).attr('aria-required') === 'true';
        if (!hasRequired && !hasAriaRequired) {
          missingRequired.push({
            page: page.name,
            input: $(el).attr('name') || $(el).attr('id') || 'phone',
          });
        }
      });
    }

    expect(missingRequired).toEqual([]);
  });
});

describe('formSource values are recognized by the Worker', () => {
  it('all formSource values in HTML match FORM_TAG_MAP keys', () => {
    const unknownSources = [];

    for (const page of SITE_PAGES) {
      const html = fs.readFileSync(page.path, 'utf-8');

      // Match formSource in hidden inputs
      const hiddenMatches = html.matchAll(/name="formSource"\s+value="([^"]+)"/g);
      for (const m of hiddenMatches) {
        if (!VALID_FORM_SOURCES.includes(m[1])) {
          unknownSources.push({ page: page.name, source: m[1], type: 'hidden input' });
        }
      }

      // Match formSource in JS objects
      const jsMatches = html.matchAll(/formSource:\s*['"]([^'"]+)['"]/g);
      for (const m of jsMatches) {
        if (!VALID_FORM_SOURCES.includes(m[1])) {
          unknownSources.push({ page: page.name, source: m[1], type: 'JS object' });
        }
      }
    }

    expect(unknownSources).toEqual([]);
  });
});

describe('Forms submit to the correct endpoint', () => {
  it('all forms use the Cloudflare Worker endpoint (hardcoded or via GHL_FORM_ENDPOINT)', () => {
    const VALID_PATTERNS = [
      'https://keneshia-haye-form-handler.jutsuxx.workers.dev',
      'window.GHL_FORM_ENDPOINT',
    ];

    for (const page of SITE_PAGES) {
      const html = fs.readFileSync(page.path, 'utf-8');

      // Find fetch calls in the page
      const fetchCalls = html.matchAll(/fetch\(([^,)]+)/g);
      for (const m of fetchCalls) {
        const fetchArg = m[1].trim();
        // Skip non-worker fetch calls (e.g., Google Fonts, GTM)
        if (fetchArg.includes('google') || fetchArg.includes('gtm')) continue;
        // The fetch arg should reference our worker URL or the config variable
        if (fetchArg.includes('workers.dev') || fetchArg.includes('GHL_FORM_ENDPOINT')) {
          // Valid pattern — either uses the correct URL or the config variable
          const usesValidUrl = VALID_PATTERNS.some(p => fetchArg.includes(p));
          expect(usesValidUrl).toBe(true);
        }
      }
    }
  });
});

describe('Email inputs have correct type', () => {
  it('all email inputs use type="email" for browser validation', () => {
    const wrongType = [];

    for (const page of SITE_PAGES) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('input[name="email"]').each((_, el) => {
        const type = $(el).attr('type');
        if (type !== 'email') {
          wrongType.push({ page: page.name, type: type || 'text' });
        }
      });
    }

    expect(wrongType).toEqual([]);
  });
});

describe('Forms have required fields', () => {
  it('all email inputs in forms are required', () => {
    const missingRequired = [];

    for (const page of SITE_PAGES) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      // Only check email inputs inside forms (not standalone)
      $('form input[name="email"], form input[type="email"]').each((_, el) => {
        if ($(el).attr('required') === undefined) {
          missingRequired.push({ page: page.name });
        }
      });
    }

    expect(missingRequired).toEqual([]);
  });
});

describe('Dark mode select styling', () => {
  it('select elements in forms use the correct dark mode background', () => {
    const wrongBg = [];

    for (const page of SITE_PAGES) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('select').each((_, el) => {
        const className = $(el).attr('class') || '';
        // If the page uses Tailwind dark mode classes, select should use solid bg
        if (className.includes('dark:')) {
          if (!className.includes('dark:bg-[#0f1f38]') && !className.includes('dark:bg-')) {
            wrongBg.push({ page: page.name, class: className.substring(0, 80) });
          }
        }
      });
    }

    // This is a warning-level check — some selects may not need dark mode
    // Just verify no selects use transparent backgrounds in dark mode
    expect(wrongBg).toEqual([]);
  });
});
