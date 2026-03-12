/**
 * Cloudflare Worker — GHL Form Submission Proxy
 * Keneshia Haye | Florida Gateway Realty
 *
 * This worker receives form submissions from keneshiahaye.com,
 * creates contacts in GoHighLevel, tags them by source,
 * and adds them to the Lead Pipeline.
 *
 * Deploy: npx wrangler deploy
 * Test:   npx wrangler dev
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

// Pipeline & Stage IDs from your GHL account
const LEAD_PIPELINE_ID = '9o7rqOk04PRzfZA44mfv';
const LEAD_PIPELINE_NEW_LEAD_STAGE = 'd733ccd2-1de4-4d9c-b28f-5e35f526f71a';

// Tag mapping: form source -> GHL tags
export const FORM_TAG_MAP = {
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

// Rate limit: max submissions per IP per hour
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW = 3600; // seconds

// In-memory fallback rate limiter (per isolate instance, resets on cold start)
const memoryRateMap = new Map();

// CORS headers for browser requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://keneshiahaye.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Strip HTML/script tags from input strings
export function sanitize(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

// Recursively sanitize all string values in an object
export function sanitizeData(obj) {
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

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Rate limiting: KV-backed (persistent) or in-memory fallback
    const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
    if (env.RATE_LIMIT_KV) {
      const key = `rate:${clientIP}`;
      const current = parseInt(await env.RATE_LIMIT_KV.get(key) || '0', 10);
      if (current >= RATE_LIMIT_MAX) {
        return jsonResponse({ error: 'Too many submissions. Please try again later.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW });
    } else {
      // In-memory fallback — resets on cold start but prevents burst abuse within an isolate
      const now = Date.now();
      const entry = memoryRateMap.get(clientIP);
      if (entry && now - entry.ts < RATE_LIMIT_WINDOW * 1000) {
        if (entry.count >= RATE_LIMIT_MAX) {
          return jsonResponse({ error: 'Too many submissions. Please try again later.' }, 429);
        }
        entry.count++;
      } else {
        memoryRateMap.set(clientIP, { count: 1, ts: now });
      }
    }

    try {
      const rawData = await request.json();
      const data = sanitizeData(rawData);
      const result = await handleFormSubmission(data, env);
      return jsonResponse(result, 200);
    } catch (err) {
      console.error('Form submission error:', err);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  },
};

async function handleFormSubmission(data, env) {
  const {
    firstName,
    lastName,
    name,
    email,
    phone,
    formSource,
  } = data;

  // Parse name if firstName/lastName not provided separately
  let fName = firstName || '';
  let lName = lastName || '';
  if (!fName && name) {
    const parts = name.trim().split(/\s+/);
    fName = parts[0] || '';
    lName = parts.slice(1).join(' ') || '';
  }

  // Determine tags based on form source
  const tags = FORM_TAG_MAP[formSource] || ['website-contact'];

  // Build contact payload (tags added separately to trigger workflows)
  const contactPayload = {
    firstName: fName,
    lastName: lName,
    email: email,
    phone: phone || '',
    locationId: env.GHL_LOCATION_ID,
    source: 'keneshiahaye.com',
  };

  // Create or update contact in GHL
  const contactResult = await ghlRequest(
    '/contacts/',
    'POST',
    contactPayload,
    env.GHL_API_KEY
  );

  let contactId = contactResult?.contact?.id;
  let isNew = true;

  if (!contactId) {
    // GHL returns existing contact ID in meta.contactId for duplicates
    contactId = contactResult?.meta?.contactId;
    isNew = false;

    if (!contactId) {
      // Last resort: search by email using the search endpoint
      const searchResult = await ghlRequest(
        `/contacts/?locationId=${env.GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`,
        'GET',
        null,
        env.GHL_API_KEY
      );

      contactId = searchResult?.contacts?.[0]?.id;
    }

    if (!contactId) {
      return { success: false, error: 'Could not create or find contact' };
    }
  }

  // Always add tags via the dedicated tags endpoint.
  // This triggers "Tag Added" workflow events in GHL,
  // unlike tags set during contact creation which don't.
  try {
    await ghlRequest(
      `/contacts/${contactId}/tags`,
      'POST',
      { tags: tags },
      env.GHL_API_KEY
    );
  } catch (e) {
    console.error('Tag assignment error (non-fatal):', e);
  }

  // Add note with form details
  if (!isNew) {
    await addContactNote(contactId, formSource, data, env.GHL_API_KEY);
    return { success: true, contactId, action: 'updated' };
  }

  // Add to Lead Pipeline as "New Lead"
  try {
    await ghlRequest(
      '/opportunities/',
      'POST',
      {
        pipelineId: LEAD_PIPELINE_ID,
        pipelineStageId: LEAD_PIPELINE_NEW_LEAD_STAGE,
        locationId: env.GHL_LOCATION_ID,
        contactId: contactId,
        name: `${fName} ${lName} - Website ${formSource}`.trim(),
        status: 'open',
        source: 'keneshiahaye.com',
      },
      env.GHL_API_KEY
    );
  } catch (e) {
    console.error('Pipeline error (non-fatal):', e);
  }

  // Add a note with the full form submission details
  await addContactNote(contactId, formSource, data, env.GHL_API_KEY);

  return { success: true, contactId, action: 'created' };
}

export async function addContactNote(contactId, formSource, data, apiKey) {
  try {
    // Build readable note from form data
    const noteLines = [`Website Form Submission: ${formSource}`];
    noteLines.push(`Date: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
    noteLines.push('---');

    const skipFields = ['firstName', 'lastName', 'name', 'email', 'phone', 'formSource'];

    for (const [key, value] of Object.entries(data)) {
      if (skipFields.includes(key) || !value) continue;
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
      noteLines.push(`${label}: ${displayValue}`);
    }

    await ghlRequest(
      `/contacts/${contactId}/notes`,
      'POST',
      { body: noteLines.join('\n'), userId: null },
      apiKey
    );
  } catch (e) {
    console.error('Note error (non-fatal):', e);
  }
}

async function ghlRequest(path, method, body, apiKey) {
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Version': GHL_API_VERSION,
    },
  };

  if (body && method !== 'GET') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${GHL_API_BASE}${path}`, options);
  return response.json();
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
