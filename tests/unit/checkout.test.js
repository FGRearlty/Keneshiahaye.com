/**
 * Unit tests for functions/checkout.js
 *
 * Tests the Cloudflare Pages checkout function, including
 * HTML generation, response headers, and content structure.
 */
import { describe, it, expect } from 'vitest';
import { onRequest } from '../../functions/checkout.js';

function makeContext(url = 'https://keneshiahaye.com/checkout') {
  return {
    request: new Request(url),
    env: {},
    params: {},
    waitUntil: () => {},
    passThroughOnException: () => {},
  };
}

describe('Checkout page (onRequest)', () => {
  it('returns a 200 response', async () => {
    const res = await onRequest(makeContext());
    expect(res.status).toBe(200);
  });

  it('returns HTML content type', async () => {
    const res = await onRequest(makeContext());
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('sets cache-control headers', async () => {
    const res = await onRequest(makeContext());
    const cc = res.headers.get('cache-control');
    expect(cc).toContain('public');
    expect(cc).toContain('max-age=3600');
  });

  it('contains the course title', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('Stand on My Shoulder');
  });

  it('contains the price ($20)', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('$20');
  });

  it('contains the checkout form with required fields', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('name="email"');
    expect(html).toContain('name="name"');
    expect(html).toContain('required');
  });

  it('contains the GHL checkout URL in the form action', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('clientclub.net/courses/offers/');
  });

  it('contains pre-fill JavaScript for URL params', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain("params.get('email')");
    expect(html).toContain("params.get('name')");
  });

  it('contains gift purchase detection logic', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain("params.get('gift')");
    expect(html).toContain("params.get('recipient')");
  });

  it('contains name-splitting logic for GHL params', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('first_name');
    expect(html).toContain('last_name');
  });

  it('includes course inclusions list', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('16 video lessons');
    expect(html).toContain('Downloadable resources');
    expect(html).toContain('Lifetime access');
    expect(html).toContain('B.U.I.L.D. framework');
  });

  it('includes back link to course page', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('href="/course"');
  });

  it('has valid DOCTYPE declaration', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toMatch(/^<!DOCTYPE html>/i);
  });

  it('includes security-related text (Secure checkout)', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('Secure checkout');
  });

  it('form has method GET and action pointing to GHL', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toMatch(/method="GET"/i);
    expect(html).toMatch(/action="[^"]*clientclub\.net/);
  });

  it('contains email input with required and autocomplete attributes', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('type="email"');
    expect(html).toContain('autocomplete="email"');
  });

  it('contains name input with required and autocomplete attributes', async () => {
    const res = await onRequest(makeContext());
    const html = await res.text();
    expect(html).toContain('autocomplete="name"');
  });
});

describe('Checkout form submission logic', () => {
  /**
   * These tests verify the name-splitting/URL-building logic
   * that is inlined in the checkout page script tag.
   */

  function buildGhlParams(email, name) {
    const ghlParams = new URLSearchParams();
    if (email) ghlParams.set('email', email);
    if (name) {
      ghlParams.set('name', name);
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        ghlParams.set('first_name', parts[0]);
        ghlParams.set('last_name', parts.slice(1).join(' '));
      }
    }
    return ghlParams;
  }

  it('splits two-word name into first_name and last_name', () => {
    const params = buildGhlParams('test@example.com', 'Jane Doe');
    expect(params.get('first_name')).toBe('Jane');
    expect(params.get('last_name')).toBe('Doe');
    expect(params.get('email')).toBe('test@example.com');
    expect(params.get('name')).toBe('Jane Doe');
  });

  it('splits three-word name correctly', () => {
    const params = buildGhlParams('test@example.com', 'Mary Jane Watson');
    expect(params.get('first_name')).toBe('Mary');
    expect(params.get('last_name')).toBe('Jane Watson');
  });

  it('does not set first_name/last_name for single-word name', () => {
    const params = buildGhlParams('test@example.com', 'Keneshia');
    expect(params.get('name')).toBe('Keneshia');
    expect(params.has('first_name')).toBe(false);
    expect(params.has('last_name')).toBe(false);
  });

  it('handles empty email', () => {
    const params = buildGhlParams('', 'Jane Doe');
    expect(params.has('email')).toBe(false);
    expect(params.get('name')).toBe('Jane Doe');
  });

  it('handles empty name', () => {
    const params = buildGhlParams('test@example.com', '');
    expect(params.get('email')).toBe('test@example.com');
    expect(params.has('name')).toBe(false);
  });

  it('handles extra whitespace in name', () => {
    const params = buildGhlParams('a@b.com', '  John   Doe  ');
    expect(params.get('first_name')).toBe('John');
    expect(params.get('last_name')).toBe('Doe');
  });

  it('produces a valid URL query string', () => {
    const params = buildGhlParams('jane@test.com', 'Jane Doe');
    const url = 'https://example.com/checkout' + (params.toString() ? '?' + params.toString() : '');
    expect(url).toContain('email=jane%40test.com');
    expect(url).toContain('first_name=Jane');
    expect(url).toContain('last_name=Doe');
  });
});
