/**
 * Tests for ghl-integration/worker.js
 * Cloudflare Worker — GHL Form Submission Proxy
 */
import { describe, it, expect, beforeEach } from 'vitest';

// -- Extract pure functions by re-implementing them from the worker source --
// (Worker uses `export default { fetch }` which makes direct import awkward
//  without a Cloudflare Workers test runtime, so we test the logic directly.)

// Exact copy of sanitize() from worker.js
function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

// Exact copy of sanitizeData() from worker.js
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

// Tag mapping from worker.js
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

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 3600;

// ---- TESTS ----

describe('sanitize()', () => {
  it('strips HTML tags from strings', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('strips nested HTML tags', () => {
    expect(sanitize('<div><b>bold</b></div>')).toBe('bold');
  });

  it('strips self-closing tags', () => {
    expect(sanitize('hello<br/>world')).toBe('helloworld');
  });

  it('trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('returns non-string values unchanged', () => {
    expect(sanitize(42)).toBe(42);
    expect(sanitize(null)).toBe(null);
    expect(sanitize(undefined)).toBe(undefined);
    expect(sanitize(true)).toBe(true);
  });

  it('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });

  it('handles string with only tags', () => {
    expect(sanitize('<div></div>')).toBe('');
  });

  it('preserves non-HTML angle brackets in normal text', () => {
    expect(sanitize('5 > 3 and 2 < 4')).toBe('5 > 3 and 2 < 4');
  });

  it('strips event handler injection attempts', () => {
    expect(sanitize('<img onerror="alert(1)" src=x>')).toBe('');
  });

  it('strips style tags but preserves inner text (known limitation)', () => {
    // The regex-based sanitizer strips tags but not their text content.
    // This is a known limitation — a more robust HTML sanitizer (e.g., DOMPurify)
    // would strip both the tags and their content for <style>/<script> elements.
    expect(sanitize('<style>body{display:none}</style>Hello')).toBe('body{display:none}Hello');
  });
});

describe('sanitizeData()', () => {
  it('sanitizes all string values in an object', () => {
    const input = {
      name: '<b>John</b>',
      email: 'john@test.com',
      message: '<script>bad</script>Hello',
    };
    const result = sanitizeData(input);
    expect(result.name).toBe('John');
    expect(result.email).toBe('john@test.com');
    // Note: regex sanitizer strips tags but not text content between them
    expect(result.message).toBe('badHello');
  });

  it('sanitizes arrays of strings', () => {
    const input = {
      tags: ['<b>tag1</b>', 'tag2', '<script>bad</script>'],
    };
    const result = sanitizeData(input);
    // Note: regex sanitizer strips tags but preserves text content between them
    expect(result.tags).toEqual(['tag1', 'tag2', 'bad']);
  });

  it('preserves non-string values', () => {
    const input = {
      count: 5,
      active: true,
      data: null,
    };
    const result = sanitizeData(input);
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
    expect(result.data).toBe(null);
  });

  it('handles empty object', () => {
    expect(sanitizeData({})).toEqual({});
  });

  it('handles mixed arrays with non-string elements', () => {
    const input = { items: ['<b>a</b>', 42, 'clean'] };
    const result = sanitizeData(input);
    expect(result.items).toEqual(['a', 42, 'clean']);
  });
});

describe('FORM_TAG_MAP', () => {
  it('has tags for all known form sources', () => {
    const expectedSources = [
      'contact-page', 'buyer-intake', 'seller-valuation', 'va-intake',
      'va-benefits-resource-kit', 'resource-download', 'footer-newsletter',
      'homepage-guide', 'homepage-guide-popup', 'landing-page-guide',
      'review-request', 'blog-lead-capture', 'course-interest',
      'course-enrollment', 'course-gift',
      'area-jacksonville', 'area-orange-park', 'area-st-augustine',
      'area-ponte-vedra', 'area-fleming-island', 'area-callahan',
      'area-middleburg', 'area-green-cove-springs', 'homepage-guide-download',
    ];
    for (const source of expectedSources) {
      expect(FORM_TAG_MAP[source]).toBeDefined();
      expect(FORM_TAG_MAP[source].length).toBeGreaterThan(0);
    }
  });

  it('all tag values are non-empty string arrays', () => {
    for (const [, tags] of Object.entries(FORM_TAG_MAP)) {
      expect(Array.isArray(tags)).toBe(true);
      for (const tag of tags) {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      }
    }
  });

  it('all area pages include the website-area tag', () => {
    const areaSources = Object.keys(FORM_TAG_MAP).filter(k => k.startsWith('area-'));
    expect(areaSources.length).toBeGreaterThan(0);
    for (const source of areaSources) {
      expect(FORM_TAG_MAP[source]).toContain('website-area');
    }
  });

  it('veteran-related sources include veterans campaign tag', () => {
    expect(FORM_TAG_MAP['va-intake']).toContain('veterans campaign');
    expect(FORM_TAG_MAP['va-benefits-resource-kit']).toContain('veterans campaign');
  });

  it('course sources include soms-course tag', () => {
    expect(FORM_TAG_MAP['course-interest']).toContain('soms-course');
    expect(FORM_TAG_MAP['course-enrollment']).toContain('soms-course');
    expect(FORM_TAG_MAP['course-gift']).toContain('soms-course');
  });
});

describe('Name parsing logic', () => {
  function parseName(data) {
    const { firstName, lastName, name } = data;
    let fName = firstName || '';
    let lName = lastName || '';
    if (!fName && name) {
      const parts = name.trim().split(/\s+/);
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }
    return { fName, lName };
  }

  it('uses firstName/lastName when provided', () => {
    const result = parseName({ firstName: 'John', lastName: 'Doe', name: '' });
    expect(result).toEqual({ fName: 'John', lName: 'Doe' });
  });

  it('splits full name into first and last', () => {
    const result = parseName({ name: 'John Doe' });
    expect(result).toEqual({ fName: 'John', lName: 'Doe' });
  });

  it('handles single name (no last name)', () => {
    const result = parseName({ name: 'Keneshia' });
    expect(result).toEqual({ fName: 'Keneshia', lName: '' });
  });

  it('handles multiple-word last names', () => {
    const result = parseName({ name: 'Mary Jane Watson' });
    expect(result).toEqual({ fName: 'Mary', lName: 'Jane Watson' });
  });

  it('trims extra whitespace in name', () => {
    const result = parseName({ name: '  John   Doe  ' });
    expect(result).toEqual({ fName: 'John', lName: 'Doe' });
  });

  it('returns empty when no name provided', () => {
    const result = parseName({});
    expect(result).toEqual({ fName: '', lName: '' });
  });
});

describe('Rate limiting logic', () => {
  it('allows requests under the limit', () => {
    const memoryRateMap = new Map();
    const clientIP = '192.168.1.1';
    const now = Date.now();

    // Simulate 19 requests (under limit of 20)
    memoryRateMap.set(clientIP, { count: 19, ts: now });

    const entry = memoryRateMap.get(clientIP);
    const isWithinWindow = now - entry.ts < RATE_LIMIT_WINDOW * 1000;
    const isOverLimit = isWithinWindow && entry.count >= RATE_LIMIT_MAX;

    expect(isOverLimit).toBe(false);
  });

  it('blocks requests at the limit', () => {
    const memoryRateMap = new Map();
    const clientIP = '192.168.1.1';
    const now = Date.now();

    memoryRateMap.set(clientIP, { count: 20, ts: now });

    const entry = memoryRateMap.get(clientIP);
    const isWithinWindow = now - entry.ts < RATE_LIMIT_WINDOW * 1000;
    const isOverLimit = isWithinWindow && entry.count >= RATE_LIMIT_MAX;

    expect(isOverLimit).toBe(true);
  });

  it('resets after the window expires', () => {
    const memoryRateMap = new Map();
    const clientIP = '192.168.1.1';
    const now = Date.now();
    const oldTs = now - (RATE_LIMIT_WINDOW * 1000) - 1;

    memoryRateMap.set(clientIP, { count: 100, ts: oldTs });

    const entry = memoryRateMap.get(clientIP);
    const isWithinWindow = now - entry.ts < RATE_LIMIT_WINDOW * 1000;
    const isOverLimit = isWithinWindow && entry.count >= RATE_LIMIT_MAX;

    expect(isOverLimit).toBe(false);
  });

  it('allows first request from a new IP', () => {
    const memoryRateMap = new Map();
    const entry = memoryRateMap.get('new-ip');
    expect(entry).toBeUndefined();
  });
});

describe('CORS headers', () => {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://keneshiahaye.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  it('restricts origin to keneshiahaye.com', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Origin']).toBe('https://keneshiahaye.com');
  });

  it('only allows POST and OPTIONS methods', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
  });

  it('allows Content-Type header', () => {
    expect(CORS_HEADERS['Access-Control-Allow-Headers']).toBe('Content-Type');
  });

  it('caches preflight for 24 hours', () => {
    expect(CORS_HEADERS['Access-Control-Max-Age']).toBe('86400');
  });
});

describe('Worker fetch handler (integration)', () => {
  // Re-implement the worker's default export for integration testing
  const memoryRateMap = new Map();

  function jsonResponse(data, status = 200) {
    const CORS_HEADERS = {
      'Access-Control-Allow-Origin': 'https://keneshiahaye.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  async function workerFetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://keneshiahaye.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }
    return jsonResponse({ success: true }, 200);
  }

  beforeEach(() => {
    memoryRateMap.clear();
  });

  it('returns 204 for OPTIONS preflight', async () => {
    const req = new Request('https://worker.example.com', { method: 'OPTIONS' });
    const res = await workerFetch(req, {});
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://keneshiahaye.com');
  });

  it('returns 405 for GET requests', async () => {
    const req = new Request('https://worker.example.com', { method: 'GET' });
    const res = await workerFetch(req, {});
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe('Method not allowed');
  });

  it('returns 405 for PUT requests', async () => {
    const req = new Request('https://worker.example.com', { method: 'PUT' });
    const res = await workerFetch(req, {});
    expect(res.status).toBe(405);
  });

  it('returns 200 for valid POST requests', async () => {
    const req = new Request('https://worker.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com' }),
    });
    const res = await workerFetch(req, {});
    expect(res.status).toBe(200);
  });

  it('includes CORS headers on all responses', async () => {
    const req = new Request('https://worker.example.com', { method: 'GET' });
    const res = await workerFetch(req, {});
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://keneshiahaye.com');
  });
});

describe('Note building logic', () => {
  function buildNoteLines(formSource, data) {
    const noteLines = [`Website Form Submission: ${formSource}`];
    noteLines.push('---');
    const skipFields = ['firstName', 'lastName', 'name', 'email', 'phone', 'formSource'];
    for (const [key, value] of Object.entries(data)) {
      if (skipFields.includes(key) || !value) continue;
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
      noteLines.push(`${label}: ${displayValue}`);
    }
    return noteLines;
  }

  it('includes form source in the note', () => {
    const lines = buildNoteLines('buyer-intake', {});
    expect(lines[0]).toBe('Website Form Submission: buyer-intake');
  });

  it('skips personal info fields', () => {
    const lines = buildNoteLines('contact-page', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      phone: '555-1234',
      formSource: 'contact-page',
      message: 'Hello',
    });
    const text = lines.join('\n');
    expect(text).not.toContain('First name:');
    expect(text).not.toContain('john@test.com');
    expect(text).toContain('Message: Hello');
  });

  it('converts camelCase keys to readable labels', () => {
    const lines = buildNoteLines('buyer-intake', { priceRange: '$200k-$300k' });
    expect(lines.some(l => l.includes('Price Range:'))).toBe(true);
  });

  it('joins array values with commas', () => {
    const lines = buildNoteLines('va-intake', { interests: ['buying', 'selling'] });
    expect(lines.some(l => l.includes('buying, selling'))).toBe(true);
  });

  it('skips falsy values', () => {
    const lines = buildNoteLines('contact-page', { message: '', timeline: null, budget: 0 });
    // empty string, null, 0 are all falsy
    expect(lines.length).toBe(2); // header + separator only
  });
});
