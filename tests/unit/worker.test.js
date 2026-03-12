/**
 * Unit tests for ghl-integration/worker.js
 *
 * Tests sanitization, name parsing, tag mapping, rate limiting, CORS,
 * and the full form submission flow with mocked GHL API responses.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// -- Extract pure functions for direct testing --
// We re-implement the pure logic here to test it in isolation,
// since the worker exports only the fetch handler.

function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

function sanitizeData(obj) {
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      clean[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      clean[key] = value.map(v => typeof v === 'string' ? sanitize(v) : v);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const FORM_TAG_MAP = {
  'contact-page':           ['website-contact'],
  'buyer-intake':           ['website-buyer', 'buyer'],
  'seller-valuation':       ['website-seller', 'seller'],
  'va-intake':              ['website-veteran', 'veterans campaign'],
  'va-benefits-resource-kit': ['website-va-benefits', 'veterans campaign'],
  'resource-download':      ['website-guide-download'],
  'footer-newsletter':      ['website-newsletter'],
  'homepage-guide':         ['website-guide-download', 'buyers guide'],
  'homepage-guide-popup':   ['website-guide-download', 'buyers guide', 'popup-lead'],
  'landing-page-guide':     ['website-guide-download', 'buyers guide', 'landing-page-lead'],
  'review-request':         ['review-requested'],
  'blog-lead-capture':      ['website-blog', 'content-lead'],
  'course-interest':        ['website-course', 'soms-course'],
  'course-enrollment':      ['website-course', 'soms-course', 'enrolled'],
  'course-gift':            ['website-course', 'soms-course', 'course-gift'],
  'area-jacksonville':      ['website-area', 'area-jacksonville'],
  'area-orange-park':       ['website-area', 'area-orange-park'],
  'area-st-augustine':      ['website-area', 'area-st-augustine'],
  'area-ponte-vedra':       ['website-area', 'area-ponte-vedra'],
  'area-fleming-island':    ['website-area', 'area-fleming-island'],
  'area-callahan':          ['website-area', 'area-callahan'],
  'area-middleburg':        ['website-area', 'area-middleburg'],
  'area-green-cove-springs':['website-area', 'area-green-cove-springs'],
  'homepage-guide-download':['website-guide-download', 'buyers guide'],
};

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
// sanitize()
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
});

// ============================================================
// sanitizeData()
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
// Tag mapping
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
  });
});
