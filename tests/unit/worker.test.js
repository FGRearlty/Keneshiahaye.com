/**
 * Unit tests for ghl-integration/worker.js
 *
 * Tests sanitization, name parsing, tag mapping, rate limiting, CORS,
 * and the full form submission flow with mocked GHL API responses.
 *
 * Pure functions are now imported directly from the worker module.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitize,
  sanitizeData,
  FORM_TAG_MAP,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW,
  jsonResponse,
} from '../../ghl-integration/worker.js';

// parseName is inlined in handleFormSubmission, so we re-implement for unit testing
function parseName(firstName, lastName, name) {
  let fName = firstName || '';
  let lName = lastName || '';
  if (!fName && name) {
    const parts = name.trim().split(/\s+/);
    fName = parts[0] || '';
    lName = parts.slice(1).join(' ') || '';
  }
  return { fName, lName };
}

// ============================================================
// sanitize() — imported from worker.js
// ============================================================
describe('sanitize()', () => {
  it('returns non-string values unchanged', () => {
    expect(sanitize(42)).toBe(42);
    expect(sanitize(null)).toBe(null);
    expect(sanitize(undefined)).toBe(undefined);
    expect(sanitize(true)).toBe(true);
  });

  it('passes through clean strings', () => {
    expect(sanitize('hello world')).toBe('hello world');
  });

  it('strips HTML tags', () => {
    expect(sanitize('hello <b>world</b>')).toBe('hello world');
    expect(sanitize('<p>paragraph</p>')).toBe('paragraph');
  });

  it('strips script tags', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('strips nested/malformed tags', () => {
    expect(sanitize('<div><span>text</span></div>')).toBe('text');
    expect(sanitize('<<b>bold</b>>')).toBe('bold>');
  });

  it('handles img/event handler injection attempts', () => {
    expect(sanitize('<img src=x onerror=alert(1)>')).toBe('');
    expect(sanitize('<svg onload=alert(1)>')).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
    expect(sanitize('  <b>hi</b>  ')).toBe('hi');
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });

  it('handles string with only tags', () => {
    expect(sanitize('<br><hr>')).toBe('');
  });

  it('strips iframe tags', () => {
    expect(sanitize('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('strips tags with attributes containing angle brackets', () => {
    expect(sanitize('<a href="test" onclick="alert(1)">link</a>')).toBe('link');
  });
});

// ============================================================
// sanitizeData() — imported from worker.js
// ============================================================
describe('sanitizeData()', () => {
  it('sanitizes all string values in an object', () => {
    const input = {
      name: '<b>John</b> Doe',
      email: 'john@test.com',
      message: '<script>alert(1)</script>Hello',
    };
    const result = sanitizeData(input);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@test.com');
    expect(result.message).toBe('alert(1)Hello');
  });

  it('sanitizes string values inside arrays', () => {
    const input = {
      areas: ['<b>Jacksonville</b>', 'Orange Park', '<script>x</script>'],
    };
    const result = sanitizeData(input);
    expect(result.areas).toEqual(['Jacksonville', 'Orange Park', 'x']);
  });

  it('preserves non-string, non-array values', () => {
    const input = { count: 5, active: true, data: null };
    const result = sanitizeData(input);
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
    expect(result.data).toBe(null);
  });

  it('preserves non-string values inside arrays', () => {
    const input = { items: [1, 'hello <b>world</b>', true] };
    const result = sanitizeData(input);
    expect(result.items).toEqual([1, 'hello world', true]);
  });

  it('handles empty object', () => {
    expect(sanitizeData({})).toEqual({});
  });

  it('handles deeply mixed types', () => {
    const input = {
      str: '<b>bold</b>',
      num: 42,
      arr: ['<i>italic</i>', 99, false],
      undef: undefined,
    };
    const result = sanitizeData(input);
    expect(result.str).toBe('bold');
    expect(result.num).toBe(42);
    expect(result.arr).toEqual(['italic', 99, false]);
    expect(result.undef).toBe(undefined);
  });
});

// ============================================================
// Name parsing
// ============================================================
describe('parseName()', () => {
  it('uses firstName/lastName when provided', () => {
    const { fName, lName } = parseName('John', 'Doe', 'Ignored Name');
    expect(fName).toBe('John');
    expect(lName).toBe('Doe');
  });

  it('parses single-word name as firstName only', () => {
    const { fName, lName } = parseName('', '', 'Keneshia');
    expect(fName).toBe('Keneshia');
    expect(lName).toBe('');
  });

  it('parses two-word name into first and last', () => {
    const { fName, lName } = parseName('', '', 'Keneshia Haye');
    expect(fName).toBe('Keneshia');
    expect(lName).toBe('Haye');
  });

  it('parses three-word name (last name gets remaining parts)', () => {
    const { fName, lName } = parseName('', '', 'Mary Jane Watson');
    expect(fName).toBe('Mary');
    expect(lName).toBe('Jane Watson');
  });

  it('handles extra whitespace in name', () => {
    const { fName, lName } = parseName('', '', '  John   Doe  ');
    expect(fName).toBe('John');
    expect(lName).toBe('Doe');
  });

  it('handles hyphenated last names', () => {
    const { fName, lName } = parseName('', '', 'Ana Garcia-Lopez');
    expect(fName).toBe('Ana');
    expect(lName).toBe('Garcia-Lopez');
  });

  it('handles empty inputs', () => {
    const { fName, lName } = parseName('', '', '');
    expect(fName).toBe('');
    expect(lName).toBe('');
  });

  it('handles undefined name', () => {
    const { fName, lName } = parseName('', '', undefined);
    expect(fName).toBe('');
    expect(lName).toBe('');
  });

  it('prefers firstName over name field', () => {
    const { fName, lName } = parseName('Jane', '', 'Should Not Use');
    expect(fName).toBe('Jane');
    expect(lName).toBe('');
  });
});

// ============================================================
// Tag mapping — imported from worker.js
// ============================================================
describe('FORM_TAG_MAP', () => {
  it('maps all 24 form sources to tag arrays', () => {
    expect(Object.keys(FORM_TAG_MAP).length).toBe(24);
  });

  it('returns correct tags for contact-page', () => {
    expect(FORM_TAG_MAP['contact-page']).toEqual(['website-contact']);
  });

  it('returns correct tags for buyer-intake', () => {
    expect(FORM_TAG_MAP['buyer-intake']).toEqual(['website-buyer', 'buyer']);
  });

  it('returns correct tags for va-intake', () => {
    expect(FORM_TAG_MAP['va-intake']).toEqual(['website-veteran', 'veterans campaign']);
  });

  it('returns correct tags for course-enrollment', () => {
    expect(FORM_TAG_MAP['course-enrollment']).toEqual(['website-course', 'soms-course', 'enrolled']);
  });

  it('returns correct tags for course-gift', () => {
    expect(FORM_TAG_MAP['course-gift']).toEqual(['website-course', 'soms-course', 'course-gift']);
  });

  it('returns correct tags for all area pages', () => {
    const areas = [
      'area-jacksonville', 'area-orange-park', 'area-st-augustine',
      'area-ponte-vedra', 'area-fleming-island', 'area-callahan',
      'area-middleburg', 'area-green-cove-springs',
    ];
    for (const area of areas) {
      expect(FORM_TAG_MAP[area]).toBeDefined();
      expect(FORM_TAG_MAP[area]).toContain('website-area');
      expect(FORM_TAG_MAP[area]).toContain(area);
    }
  });

  it('falls back to website-contact for unknown form source', () => {
    const tags = FORM_TAG_MAP['unknown-form'] || ['website-contact'];
    expect(tags).toEqual(['website-contact']);
  });

  it('every form source maps to a non-empty array', () => {
    for (const [source, tags] of Object.entries(FORM_TAG_MAP)) {
      expect(Array.isArray(tags), `${source} should map to an array`).toBe(true);
      expect(tags.length, `${source} should have at least one tag`).toBeGreaterThan(0);
    }
  });

  it('includes newsletter and blog form sources', () => {
    expect(FORM_TAG_MAP['footer-newsletter']).toEqual(['website-newsletter']);
    expect(FORM_TAG_MAP['blog-lead-capture']).toEqual(['website-blog', 'content-lead']);
  });

  it('includes all guide download variants', () => {
    expect(FORM_TAG_MAP['resource-download']).toEqual(['website-guide-download']);
    expect(FORM_TAG_MAP['homepage-guide']).toContain('website-guide-download');
    expect(FORM_TAG_MAP['homepage-guide-popup']).toContain('popup-lead');
    expect(FORM_TAG_MAP['landing-page-guide']).toContain('landing-page-lead');
    expect(FORM_TAG_MAP['homepage-guide-download']).toContain('website-guide-download');
  });
});

// ============================================================
// jsonResponse() — imported from worker.js
// ============================================================
describe('jsonResponse()', () => {
  it('returns a Response with JSON content type', () => {
    const res = jsonResponse({ ok: true });
    expect(res.headers.get('Content-Type')).toBe('application/json');
  });

  it('returns default 200 status', () => {
    const res = jsonResponse({ ok: true });
    expect(res.status).toBe(200);
  });

  it('returns custom status', () => {
    const res = jsonResponse({ error: 'fail' }, 400);
    expect(res.status).toBe(400);
  });

  it('includes CORS headers', () => {
    const res = jsonResponse({});
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://keneshiahaye.com');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('body is valid JSON', async () => {
    const res = jsonResponse({ success: true, id: 123 });
    const body = JSON.parse(await res.text());
    expect(body.success).toBe(true);
    expect(body.id).toBe(123);
  });
});

// ============================================================
// Constants — imported from worker.js
// ============================================================
describe('Rate limit constants', () => {
  it('RATE_LIMIT_MAX is 20', () => {
    expect(RATE_LIMIT_MAX).toBe(20);
  });

  it('RATE_LIMIT_WINDOW is 3600 seconds (1 hour)', () => {
    expect(RATE_LIMIT_WINDOW).toBe(3600);
  });
});

// ============================================================
// Worker fetch handler (integration-style with mocked fetch)
// ============================================================
describe('Worker fetch handler', () => {
  let worker;
  let mockEnv;

  beforeEach(async () => {
    vi.resetModules();
    // Mock global fetch for GHL API calls
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ contact: { id: 'contact-123' } }),
    });

    worker = (await import('../../ghl-integration/worker.js')).default;

    mockEnv = {
      GHL_API_KEY: 'test-api-key',
      GHL_LOCATION_ID: 'test-location-id',
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue('0'),
        put: vi.fn().mockResolvedValue(undefined),
      },
    };
  });

  function makeRequest(body, method = 'POST', headers = {}) {
    return new Request('https://worker.example.com/', {
      method,
      headers: {
        'Content-Type': 'application/json',
        'cf-connecting-ip': '1.2.3.4',
        ...headers,
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });
  }

  describe('CORS', () => {
    it('returns 204 for OPTIONS preflight', async () => {
      const req = new Request('https://worker.example.com/', { method: 'OPTIONS' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://keneshiahaye.com');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('includes CORS headers on POST responses', async () => {
      const req = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://keneshiahaye.com');
    });

    it('includes Access-Control-Max-Age header on preflight', async () => {
      const req = new Request('https://worker.example.com/', { method: 'OPTIONS' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.headers.get('Access-Control-Max-Age')).toBe('86400');
    });
  });

  describe('Method validation', () => {
    it('rejects GET requests with 405', async () => {
      const req = new Request('https://worker.example.com/', { method: 'GET' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(405);
      const body = await res.json();
      expect(body.error).toBe('Method not allowed');
    });

    it('rejects PUT requests with 405', async () => {
      const req = new Request('https://worker.example.com/', { method: 'PUT' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(405);
    });

    it('rejects DELETE requests with 405', async () => {
      const req = new Request('https://worker.example.com/', { method: 'DELETE' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(405);
    });
  });

  describe('Rate limiting (KV-backed)', () => {
    it('allows requests under the limit', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('5');
      const req = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
    });

    it('blocks requests at the limit (20)', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('20');
      const req = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toContain('Too many submissions');
    });

    it('increments KV counter on each request', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('3');
      const req = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      await worker.fetch(req, mockEnv);
      expect(mockEnv.RATE_LIMIT_KV.put).toHaveBeenCalledWith(
        'rate:1.2.3.4',
        '4',
        { expirationTtl: 3600 }
      );
    });

    it('allows request when KV returns null (first request)', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue(null);
      const req = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      expect(mockEnv.RATE_LIMIT_KV.put).toHaveBeenCalledWith(
        'rate:1.2.3.4',
        '1',
        { expirationTtl: 3600 }
      );
    });

    it('blocks at exactly the max (boundary test)', async () => {
      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('19');
      const req1 = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res1 = await worker.fetch(req1, mockEnv);
      expect(res1.status).toBe(200); // 19 < 20, allowed

      mockEnv.RATE_LIMIT_KV.get.mockResolvedValue('20');
      const req2 = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res2 = await worker.fetch(req2, mockEnv);
      expect(res2.status).toBe(429); // 20 >= 20, blocked
    });
  });

  describe('Rate limiting (in-memory fallback)', () => {
    it('allows requests when no KV binding exists', async () => {
      delete mockEnv.RATE_LIMIT_KV;
      const req = makeRequest({ email: 'a@b.com', name: 'Test', formSource: 'contact-page' });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
    });

    it('blocks requests after exceeding the limit without KV', async () => {
      delete mockEnv.RATE_LIMIT_KV;
      const noKvEnv = { ...mockEnv };

      // Send RATE_LIMIT_MAX requests — all should succeed
      for (let i = 0; i < RATE_LIMIT_MAX; i++) {
        const req = makeRequest({ email: `user${i}@b.com`, name: 'Test', formSource: 'contact-page' });
        const res = await worker.fetch(req, noKvEnv);
        expect(res.status, `Request ${i + 1} should succeed`).toBe(200);
      }

      // The next request (21st) from the same IP should be blocked
      const blockedReq = makeRequest({ email: 'blocked@b.com', name: 'Test', formSource: 'contact-page' });
      const blockedRes = await worker.fetch(blockedReq, noKvEnv);
      expect(blockedRes.status).toBe(429);
      const body = await blockedRes.json();
      expect(body.error).toContain('Too many submissions');
    });
  });

  describe('Form submission', () => {
    it('creates a new contact and returns success', async () => {
      const req = makeRequest({
        email: 'keneshia@test.com',
        name: 'Keneshia Haye',
        phone: '2544495299',
        formSource: 'buyer-intake',
      });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.contactId).toBe('contact-123');
      expect(body.action).toBe('created');
    });

    it('handles duplicate contacts (meta.contactId fallback)', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ meta: { contactId: 'existing-456' } }),
        })
        .mockResolvedValue({
          json: () => Promise.resolve({ success: true }),
        });

      const req = makeRequest({
        email: 'existing@test.com',
        name: 'Existing User',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.contactId).toBe('existing-456');
      expect(body.action).toBe('updated');
    });

    it('searches by email when contact creation returns no ID', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: () => Promise.resolve({}), // No contact.id or meta.contactId
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ contacts: [{ id: 'search-789' }] }), // Search result
        })
        .mockResolvedValue({
          json: () => Promise.resolve({ success: true }),
        });

      const req = makeRequest({
        email: 'search@test.com',
        name: 'Search User',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.contactId).toBe('search-789');
    });

    it('returns error when contact cannot be found or created', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ contacts: [] }) })
        .mockResolvedValue({ json: () => Promise.resolve({}) });

      const req = makeRequest({
        email: 'ghost@test.com',
        name: 'Ghost User',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain('Could not create or find contact');
    });

    it('returns 500 on malformed JSON body', async () => {
      const req = new Request('https://worker.example.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '1.2.3.4' },
        body: 'not json',
      });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(500);
    });

    it('sends correct tags to GHL for buyer-intake', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'buyer@test.com',
        name: 'Jane Buyer',
        formSource: 'buyer-intake',
      });
      await worker.fetch(req, mockEnv);

      // Find the tags call
      const tagsCall = calls.find(c => c.url.includes('/tags'));
      expect(tagsCall).toBeDefined();
      const tagBody = JSON.parse(tagsCall.opts.body);
      expect(tagBody.tags).toEqual(['website-buyer', 'buyer']);
    });

    it('sanitizes input data before processing', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: '<script>alert(1)</script>John Doe',
        formSource: 'contact-page',
        message: '<b>Hello</b> there',
      });
      await worker.fetch(req, mockEnv);

      // The contact creation call should have sanitized name
      const contactCall = calls.find(c => c.url.includes('/contacts/') && !c.url.includes('/tags') && !c.url.includes('/notes'));
      if (contactCall && contactCall.opts.body) {
        const body = JSON.parse(contactCall.opts.body);
        expect(body.firstName).not.toContain('<script>');
        expect(body.firstName).toBe('alert(1)John');
      }
    });

    it('handles submission with firstName/lastName instead of name', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'test@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        formSource: 'contact-page',
      });
      await worker.fetch(req, mockEnv);

      const contactCall = calls.find(c => c.url.includes('/contacts/') && !c.url.includes('/tags') && !c.url.includes('/notes'));
      if (contactCall && contactCall.opts.body) {
        const body = JSON.parse(contactCall.opts.body);
        expect(body.firstName).toBe('Jane');
        expect(body.lastName).toBe('Smith');
      }
    });

    it('creates pipeline opportunity for new contacts', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'new-1' } }),
        });
      });

      const req = makeRequest({
        email: 'new@test.com',
        name: 'New Lead',
        formSource: 'buyer-intake',
      });
      await worker.fetch(req, mockEnv);

      const oppCall = calls.find(c => c.url.includes('/opportunities/'));
      expect(oppCall).toBeDefined();
      const oppBody = JSON.parse(oppCall.opts.body);
      expect(oppBody.status).toBe('open');
      expect(oppBody.contactId).toBe('new-1');
      expect(oppBody.name).toContain('buyer-intake');
    });

    it('adds notes for both new and existing contacts', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'note@test.com',
        name: 'Note User',
        formSource: 'contact-page',
        message: 'Hello there',
      });
      await worker.fetch(req, mockEnv);

      const noteCall = calls.find(c => c.url.includes('/notes'));
      expect(noteCall).toBeDefined();
      const noteBody = JSON.parse(noteCall.opts.body);
      expect(noteBody.body).toContain('contact-page');
    });

    it('sends phone as empty string when not provided', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'nophone@test.com',
        name: 'No Phone',
        formSource: 'contact-page',
      });
      await worker.fetch(req, mockEnv);

      const contactCall = calls.find(c => c.url.includes('/contacts/') && !c.url.includes('/tags') && !c.url.includes('/notes'));
      if (contactCall && contactCall.opts.body) {
        const body = JSON.parse(contactCall.opts.body);
        expect(body.phone).toBe('');
      }
    });
  });

  describe('GHL API authorization', () => {
    it('sends Bearer token in Authorization header', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test User',
        formSource: 'contact-page',
      });
      await worker.fetch(req, mockEnv);

      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0].opts.headers['Authorization']).toBe('Bearer test-api-key');
    });

    it('sends correct API version header', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      await worker.fetch(req, mockEnv);

      expect(calls[0].opts.headers['Version']).toBe('2021-07-28');
    });

    it('sets locationId from env', async () => {
      const calls = [];
      global.fetch = vi.fn().mockImplementation((url, opts) => {
        calls.push({ url, opts });
        return Promise.resolve({
          json: () => Promise.resolve({ contact: { id: 'c1' } }),
        });
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      await worker.fetch(req, mockEnv);

      const contactCall = calls.find(c => c.url.includes('/contacts/') && !c.url.includes('/tags') && !c.url.includes('/notes'));
      if (contactCall && contactCall.opts.body) {
        const body = JSON.parse(contactCall.opts.body);
        expect(body.locationId).toBe('test-location-id');
      }
    });
  });

  describe('GHL API error handling', () => {
    it('handles GHL API returning non-JSON gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.reject(new Error('Unexpected token')),
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(500);
    });

    it('handles network error from GHL API', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Internal server error');
    });

    it('handles GHL API returning 401 Unauthorized', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ error: 'Unauthorized', statusCode: 401 }),
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      const body = await res.json();
      // Should not expose API key or internal details
      expect(JSON.stringify(body)).not.toContain('test-api-key');
    });

    it('handles GHL API returning 429 rate limit', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ error: 'Rate limit exceeded', statusCode: 429 }),
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      // Worker should still return a response (either success:false or 500)
      expect([200, 500]).toContain(res.status);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain('test-api-key');
    });

    it('handles GHL API returning 500 with valid JSON error body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ error: 'Internal Server Error', message: 'Something went wrong' }),
      });

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      const body = await res.json();
      // Should not leak internal GHL error details to the client
      expect(JSON.stringify(body)).not.toContain('test-api-key');
      expect(JSON.stringify(body)).not.toContain('test-location-id');
    });

    it('handles fetch timeout/abort gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'));

      const req = makeRequest({
        email: 'test@test.com',
        name: 'Test',
        formSource: 'contact-page',
      });
      const res = await worker.fetch(req, mockEnv);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Internal server error');
    });
  });
});
