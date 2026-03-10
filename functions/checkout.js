/**
 * SOMS Checkout — Cloudflare Pages Function
 *
 * Serves a branded pre-checkout page at keneshiahaye.com/checkout that
 * collects the visitor's email + name in our dark theme, then redirects
 * them to the GHL Client Club checkout with fields pre-populated.
 *
 * Route: https://keneshiahaye.com/checkout
 */

const GHL_CHECKOUT_URL =
  'https://bl54fprv9t5btudmrsdb.app.clientclub.net/courses/offers/4a20df40-a216-4433-8111-fae9c47ba927';

export async function onRequest(context) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enroll — Stand on My Shoulder | Keneshia Haye</title>
  <meta name="description" content="Enroll in the Stand on My Shoulder (SOMS) course. Build wealth through real estate, credit, and finance.">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a1628;
      color: #94a3b8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(ellipse at 20% 10%, rgba(201,169,110,0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 90%, rgba(201,169,110,0.03) 0%, transparent 50%);
    }

    .checkout-wrapper {
      position: relative;
      width: 100%;
      max-width: 480px;
    }

    /* Top gold line */
    .checkout-wrapper::before {
      content: '';
      display: block;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, transparent, #c9a96e, transparent);
      border-radius: 16px 16px 0 0;
    }

    .card {
      background: rgba(15, 31, 56, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: none;
      border-radius: 0 0 16px 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 40px rgba(201,169,110,0.06);
      overflow: hidden;
    }

    .card-header {
      background: rgba(10, 22, 40, 0.95);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 24px 28px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 50px;
      background: rgba(201,169,110,0.1);
      border: 1px solid rgba(201,169,110,0.2);
      color: #c9a96e;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .course-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 12px;
    }

    .price {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 40px;
      font-weight: 700;
      color: #ffffff;
    }

    .price-note {
      font-size: 14px;
      color: #64748b;
    }

    .card-body {
      padding: 28px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
    }

    .form-group label .required {
      color: #c9a96e;
      margin-left: 2px;
    }

    .form-group input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      color: #ffffff;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      outline: none;
      transition: all 0.3s ease;
      caret-color: #c9a96e;
    }

    .form-group input::placeholder {
      color: #64748b;
    }

    .form-group input:focus {
      border-color: #c9a96e;
      box-shadow: 0 0 0 3px rgba(201,169,110,0.15), 0 0 40px rgba(201,169,110,0.08);
    }

    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 18px 32px;
      background: linear-gradient(135deg, #c9a96e, #e3d4ab);
      color: #0a1628;
      border: none;
      border-radius: 50px;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px rgba(201,169,110,0.3);
      margin-top: 8px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(201,169,110,0.45);
      background: linear-gradient(135deg, #e3d4ab, #c9a96e);
    }

    .submit-btn:active {
      transform: translateY(0);
    }

    .submit-btn svg {
      width: 18px;
      height: 18px;
    }

    .secure-note {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .secure-note svg {
      width: 14px;
      height: 14px;
    }

    .includes {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .includes p {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 10px;
    }

    .includes ul {
      list-style: none;
    }

    .includes li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #94a3b8;
      padding: 4px 0;
    }

    .includes li svg {
      width: 14px;
      height: 14px;
      color: #c9a96e;
      flex-shrink: 0;
    }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: #64748b;
      font-size: 13px;
      text-decoration: none;
      transition: color 0.3s;
    }

    .back-link:hover {
      color: #c9a96e;
    }

    @media (max-width: 480px) {
      body { padding: 16px; }
      .card-header { padding: 20px; }
      .card-body { padding: 20px; }
      .course-title { font-size: 24px; }
      .price { font-size: 32px; }
      .submit-btn { padding: 16px 24px; font-size: 15px; }
    }
  </style>
</head>
<body>
  <div class="checkout-wrapper">
    <div class="card">
      <div class="card-header">
        <div class="badge">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          Online Course
        </div>
        <h1 class="course-title">Stand on My Shoulder</h1>
        <div class="price-row">
          <span class="price">$20</span>
          <span class="price-note">one-time payment</span>
        </div>
      </div>

      <div class="card-body">
        <form id="checkoutForm" method="GET" action="${GHL_CHECKOUT_URL}">
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input type="email" name="email" placeholder="you@example.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label>Full Name <span class="required">*</span></label>
            <input type="text" name="name" placeholder="Your full name" required autocomplete="name">
          </div>
          <button type="submit" class="submit-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Proceed to Checkout
          </button>
        </form>
        <p class="secure-note">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Secure checkout powered by Stripe
        </p>

        <div class="includes">
          <p>What's included</p>
          <ul>
            <li>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              16 video lessons + bonus content
            </li>
            <li>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Downloadable resources & worksheets
            </li>
            <li>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Lifetime access — learn at your pace
            </li>
            <li>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              B.U.I.L.D. framework for generational wealth
            </li>
          </ul>
        </div>
      </div>
    </div>
    <a href="/course" class="back-link">&larr; Back to course details</a>
  </div>

  <script>
    (function() {
      var params = new URLSearchParams(window.location.search);
      var emailInput = document.querySelector('input[name="email"]');
      var nameInput = document.querySelector('input[name="name"]');

      /* Pre-fill from URL params (passed from gift form or enroll button) */
      if (params.get('email') && emailInput) emailInput.value = params.get('email');
      if (params.get('name') && nameInput) nameInput.value = params.get('name');

      /* Show gift badge if this is a gift purchase */
      if (params.get('gift') === '1' && params.get('recipient')) {
        var badge = document.querySelector('.badge');
        if (badge) badge.textContent = '🎁 Gift for ' + params.get('recipient');
      }

      /* On form submit, build GHL URL with the entered info and redirect */
      document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var email = emailInput ? emailInput.value : '';
        var name = nameInput ? nameInput.value : '';
        var ghlParams = new URLSearchParams();
        if (email) ghlParams.set('email', email);
        if (name) {
          ghlParams.set('name', name);
          var parts = name.trim().split(/\\s+/);
          if (parts.length >= 2) {
            ghlParams.set('first_name', parts[0]);
            ghlParams.set('last_name', parts.slice(1).join(' '));
          }
        }
        var ghlUrl = '${GHL_CHECKOUT_URL}' + (ghlParams.toString() ? '?' + ghlParams.toString() : '');
        window.location.href = ghlUrl;
      });
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
