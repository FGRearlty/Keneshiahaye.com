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
});
