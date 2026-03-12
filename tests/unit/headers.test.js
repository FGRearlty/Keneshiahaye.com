/**
 * Unit tests for _headers and _redirects files
 *
 * Validates that Cloudflare Pages config files contain
 * required security headers and redirect rules.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const headersContent = fs.readFileSync(path.join(ROOT, '_headers'), 'utf-8');
const redirectsContent = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf-8');

describe('_headers file', () => {
  it('exists and is non-empty', () => {
    expect(headersContent.length).toBeGreaterThan(0);
  });

  it('sets X-Frame-Options to DENY', () => {
    expect(headersContent).toContain('X-Frame-Options: DENY');
  });

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');
  });

  it('sets Referrer-Policy', () => {
    expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
  });

  it('sets Permissions-Policy', () => {
    expect(headersContent).toContain('Permissions-Policy:');
    expect(headersContent).toContain('geolocation=()');
    expect(headersContent).toContain('microphone=()');
    expect(headersContent).toContain('camera=()');
  });

  it('sets Strict-Transport-Security with long max-age', () => {
    expect(headersContent).toContain('Strict-Transport-Security:');
    expect(headersContent).toContain('includeSubDomains');
    expect(headersContent).toContain('preload');
    // max-age should be at least 1 year (31536000)
    const match = headersContent.match(/max-age=(\d+)/);
    expect(match).toBeTruthy();
    expect(parseInt(match[1])).toBeGreaterThanOrEqual(31536000);
  });

  it('sets Content-Security-Policy', () => {
    expect(headersContent).toContain('Content-Security-Policy:');
    expect(headersContent).toContain("default-src 'self'");
  });

  it('CSP allows Google Tag Manager', () => {
    expect(headersContent).toContain('https://www.googletagmanager.com');
  });

  it('CSP allows Google Fonts', () => {
    expect(headersContent).toContain('https://fonts.googleapis.com');
    expect(headersContent).toContain('https://fonts.gstatic.com');
  });

  it('CSP allows Cloudflare Worker endpoint for form submissions', () => {
    expect(headersContent).toContain('https://keneshia-haye-form-handler.jutsuxx.workers.dev');
  });

  it('applies headers to all routes (/*)', () => {
    expect(headersContent).toContain('/*');
  });

  it('sets long cache for images', () => {
    expect(headersContent).toContain('/images/*');
    expect(headersContent).toContain('/images/stock/*');
    // Should have immutable + long max-age for images
    const imageSection = headersContent.split('/images/*')[1];
    expect(imageSection).toContain('max-age=31536000');
    expect(imageSection).toContain('immutable');
  });

  it('sets cache for CSS', () => {
    expect(headersContent).toContain('/css/styles.css');
  });

  it('sets cache for guides/PDFs', () => {
    expect(headersContent).toContain('/guides/*');
  });
});

describe('_redirects file', () => {
  it('exists and is non-empty', () => {
    expect(redirectsContent.length).toBeGreaterThan(0);
  });

  it('has /privacy -> /privacy-policy redirect', () => {
    expect(redirectsContent).toContain('/privacy');
    expect(redirectsContent).toContain('/privacy-policy');
    expect(redirectsContent).toContain('301');
  });
});

describe('HTML pages exist for all expected routes', () => {
  const expectedPages = [
    'index.html',
    'buy.html',
    'sell.html',
    'contact.html',
    'veterans.html',
    'course.html',
    'resources.html',
    'about.html',
    'free-guide.html',
    'review.html',
    'va-benefits.html',
    'privacy-policy.html',
    'terms.html',
    '404.html',
  ];

  for (const page of expectedPages) {
    it(`${page} exists`, () => {
      const exists = fs.existsSync(path.join(ROOT, page));
      expect(exists, `Missing expected page: ${page}`).toBe(true);
    });
  }

  const expectedAreaPages = [
    'areas/jacksonville.html',
    'areas/orange-park.html',
    'areas/st-augustine.html',
    'areas/ponte-vedra.html',
    'areas/fleming-island.html',
    'areas/callahan.html',
    'areas/middleburg.html',
    'areas/green-cove-springs.html',
  ];

  for (const page of expectedAreaPages) {
    it(`${page} exists`, () => {
      const exists = fs.existsSync(path.join(ROOT, page));
      expect(exists, `Missing expected area page: ${page}`).toBe(true);
    });
  }

  const expectedBlogPages = [
    'blog/index.html',
    'blog/jacksonville-real-estate-market.html',
    'blog/first-time-homebuyer-mistakes.html',
    'blog/jacksonville-neighborhoods-first-time-buyers.html',
    'blog/sell-your-home-fast-jacksonville.html',
    'blog/va-loan-guide-jacksonville.html',
    'blog/moving-to-jacksonville-military.html',
  ];

  for (const page of expectedBlogPages) {
    it(`${page} exists`, () => {
      const exists = fs.existsSync(path.join(ROOT, page));
      expect(exists, `Missing expected blog page: ${page}`).toBe(true);
    });
  }
});
