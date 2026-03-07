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
const FORM_TAG_MAP = {
  'contact-page':           ['website-contact'],
  'buyer-intake':           ['website-buyer', 'buyer'],
  'seller-valuation':       ['website-seller', 'seller'],
  'va-intake':              ['website-veteran', 'veterans campaign'],
  'va-benefits-resource-kit': ['website-va-benefits', 'veterans campaign'],
  'resource-download':      ['website-guide-download'],
  'footer-newsletter':      ['website-newsletter'],
  'homepage-guide':         ['website-guide-download', 'buyers guide'],
};

// CORS headers for browser requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      const data = await request.json();
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
    message,
    formSource,
    // Buyer-specific fields
    priceRange,
    preApproved,
    timeline,
    areas,
    propertyType,
    // Seller-specific fields
    address,
    homeType,
    bedrooms,
    bathrooms,
    condition,
    sellTimeline,
    // VA-specific fields
    branch,
    serviceStatus,
    vaLoanUsed,
    interests,
    // Guide download
    guideName,
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

  // Build contact payload
  const contactPayload = {
    firstName: fName,
    lastName: lName,
    email: email,
    phone: phone || '',
    locationId: env.GHL_LOCATION_ID,
    tags: tags,
    source: 'keneshiahaye.com',
  };

  // Create or update contact in GHL
  const contactResult = await ghlRequest(
    '/contacts/',
    'POST',
    contactPayload,
    env.GHL_API_KEY
  );

  const contactId = contactResult?.contact?.id;

  if (!contactId) {
    // If contact already exists, try to find and update
    const searchResult = await ghlRequest(
      `/contacts/lookup?locationId=${env.GHL_LOCATION_ID}&email=${encodeURIComponent(email)}`,
      'GET',
      null,
      env.GHL_API_KEY
    );

    const existingId = searchResult?.contacts?.[0]?.id;
    if (existingId) {
      // Add tags to existing contact
      await ghlRequest(
        `/contacts/${existingId}/tags`,
        'POST',
        { tags: tags },
        env.GHL_API_KEY
      );

      // Add note with form details
      await addContactNote(existingId, formSource, data, env.GHL_API_KEY);

      return { success: true, contactId: existingId, action: 'updated' };
    }

    return { success: false, error: 'Could not create or find contact' };
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

async function addContactNote(contactId, formSource, data, apiKey) {
  // Build readable note from form data
  const noteLines = [`Website Form Submission: ${formSource}`];
  noteLines.push(`Date: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
  noteLines.push('---');

  const skipFields = ['firstName', 'lastName', 'name', 'email', 'phone', 'formSource'];

  for (const [key, value] of Object.entries(data)) {
    if (skipFields.includes(key) || !value) continue;
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    noteLines.push(`${label}: ${displayValue}`);
  }

  try {
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}
