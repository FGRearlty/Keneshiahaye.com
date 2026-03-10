/**
 * SOMS Checkout Proxy — Cloudflare Pages Function
 *
 * Fetches the GHL Client Club checkout page and injects our
 * branded dark-theme CSS so the checkout matches keneshiahaye.com.
 *
 * Route: https://keneshiahaye.com/checkout
 */

const GHL_CHECKOUT_URL =
  'https://bl54fprv9t5btudmrsdb.app.clientclub.net/courses/offers/4a20df40-a216-4433-8111-fae9c47ba927';

const CSS_URL = 'https://keneshiahaye.com/ghl/soms-checkout-inject.css';

export async function onRequest(context) {
  try {
    // Forward the visitor's User-Agent so GHL doesn't block the request
    const response = await fetch(GHL_CHECKOUT_URL, {
      headers: {
        'User-Agent': context.request.headers.get('User-Agent') || 'Mozilla/5.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': context.request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    // If GHL returned a non-HTML response, pass it through
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    let html = await response.text();

    // Inject our dark-theme CSS into <head>
    // Also inject the Google Fonts <link> so they load before the CSS
    const injection = [
      '<!-- SOMS Branded Checkout Theme -->',
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">',
      `<link rel="stylesheet" href="${CSS_URL}">`,
    ].join('\n');

    html = html.replace('</head>', `${injection}\n</head>`);

    // Build response headers — keep most of the original headers
    const headers = new Headers();
    headers.set('content-type', 'text/html;charset=utf-8');
    headers.set('cache-control', 'public, max-age=300, s-maxage=600');
    // Allow GHL scripts/styles/fonts to load
    // (don't set a restrictive CSP that would break the SPA)

    return new Response(html, {
      status: 200,
      headers,
    });
  } catch (err) {
    // On error, redirect to the raw GHL checkout as a fallback
    return Response.redirect(GHL_CHECKOUT_URL, 302);
  }
}
