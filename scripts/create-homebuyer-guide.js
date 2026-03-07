const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ─── Color Palette ───────────────────────────────────────────────
const NAVY     = '#0a1628';
const GOLD     = '#c9a96e';
const WHITE    = '#ffffff';
const DARK     = '#333333';
const LIGHT_BG = '#f5f3ef';
const GOLD_BG  = '#faf6ee';
const NAVY_LIGHT = '#132140';

// ─── Page Dimensions ─────────────────────────────────────────────
const W = 612;
const H = 792;
const M = 54;          // margin
const CW = W - 2 * M;  // content width

// ─── Create PDF ──────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'guides');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });
const outPath = path.join(outDir, 'first-time-homebuyer-guide.pdf');
doc.pipe(fs.createWriteStream(outPath));

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function navyBackground() {
  doc.rect(0, 0, W, H).fill(NAVY);
}

function lightBackground() {
  doc.rect(0, 0, W, H).fill(LIGHT_BG);
}

function pageHeader(title, y) {
  // Navy header bar
  const barH = 58;
  y = y || 40;
  doc.rect(0, y, W, barH).fill(NAVY);
  // Gold accent line under bar
  doc.rect(0, y + barH, W, 3).fill(GOLD);
  // Title text
  doc.font('Helvetica-Bold').fontSize(22).fillColor(WHITE);
  doc.text(title, M, y + 17, { width: CW, align: 'center' });
  return y + barH + 3;
}

function sectionHeading(text, x, y, opts) {
  opts = opts || {};
  const color = opts.color || NAVY;
  const size = opts.size || 15;
  doc.font('Helvetica-Bold').fontSize(size).fillColor(color);
  doc.text(text, x, y, { width: opts.width || CW });
  return doc.y + 6;
}

function bodyText(text, x, y, opts) {
  opts = opts || {};
  doc.font(opts.font || 'Helvetica').fontSize(opts.size || 10.5)
     .fillColor(opts.color || DARK);
  doc.text(text, x, y, {
    width: opts.width || CW,
    lineGap: opts.lineGap || 3,
    align: opts.align || 'left'
  });
  return doc.y;
}

function goldTipBox(text, x, y, w, opts) {
  opts = opts || {};
  const padding = 14;
  // Measure text height
  doc.font('Helvetica-Oblique').fontSize(10);
  const textH = doc.heightOfString(text, { width: w - padding * 2 - 10, lineGap: 2 });
  const boxH = textH + padding * 2 + (opts.title ? 18 : 0);

  // Box background
  doc.rect(x, y, w, boxH).fill(GOLD_BG);
  // Left gold accent bar
  doc.rect(x, y, 5, boxH).fill(GOLD);

  let ty = y + padding;
  if (opts.title) {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(GOLD);
    doc.text(opts.title, x + padding + 10, ty, { width: w - padding * 2 - 10 });
    ty = doc.y + 4;
  }
  doc.font('Helvetica-Oblique').fontSize(10).fillColor(DARK);
  doc.text(text, x + padding + 10, ty, { width: w - padding * 2 - 10, lineGap: 2 });
  return y + boxH;
}

function checkbox(x, y, text, opts) {
  opts = opts || {};
  const size = 11;
  doc.rect(x, y, size, size).lineWidth(1).strokeColor(GOLD).stroke();
  doc.font('Helvetica').fontSize(opts.size || 10.5).fillColor(opts.color || DARK);
  doc.text(text, x + size + 7, y - 1, { width: (opts.width || CW) - size - 7, lineGap: 2 });
  return doc.y + 4;
}

function bulletItem(x, y, text, opts) {
  opts = opts || {};
  const bulletR = 3;
  const color = opts.bulletColor || GOLD;
  doc.circle(x + bulletR, y + 5, bulletR).fill(color);
  doc.font(opts.font || 'Helvetica').fontSize(opts.size || 10.5).fillColor(opts.color || DARK);
  doc.text(text, x + bulletR * 2 + 8, y, { width: (opts.width || CW) - bulletR * 2 - 8, lineGap: 2 });
  return doc.y + 3;
}

function pageNumberFooter(num) {
  doc.font('Helvetica').fontSize(8).fillColor('#999999');
  doc.text(String(num), 0, H - 30, { width: W, align: 'center' });
}

function goldDivider(x, y, w) {
  doc.rect(x, y, w, 1.5).fill(GOLD);
  return y + 8;
}

function drawTable(headers, rows, x, y, colWidths) {
  const rowH = 28;
  const headerH = 32;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  // Header row
  doc.rect(x, y, totalW, headerH).fill(NAVY);
  let cx = x;
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(WHITE);
    doc.text(h, cx + 8, y + 9, { width: colWidths[i] - 16, align: 'left' });
    cx += colWidths[i];
  });
  y += headerH;

  // Data rows
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#f0ede6' : WHITE;
    doc.rect(x, y, totalW, rowH).fill(bg);
    cx = x;
    row.forEach((cell, ci) => {
      doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
      doc.text(cell, cx + 8, y + 8, { width: colWidths[ci] - 16, align: 'left' });
      cx += colWidths[ci];
    });
    y += rowH;
  });

  // Border
  doc.rect(x, y - (rows.length * rowH + headerH), totalW, rows.length * rowH + headerH)
     .lineWidth(0.5).strokeColor(GOLD).stroke();

  return y + 6;
}


// ═══════════════════════════════════════════════════════════════════
// PAGE 1 — COVER
// ═══════════════════════════════════════════════════════════════════
(function coverPage() {
  navyBackground();

  // Top gold accent line
  doc.rect(0, 0, W, 6).fill(GOLD);

  // Decorative side accents
  doc.rect(M - 10, 100, 2, 500).fill(GOLD);
  doc.rect(W - M + 8, 100, 2, 500).fill(GOLD);

  // Gold decorative line near top
  doc.rect(M + 60, 130, CW - 120, 1.5).fill(GOLD);

  // Title block
  doc.font('Helvetica-Bold').fontSize(14).fillColor(GOLD);
  doc.text('THE COMPLETE', M, 170, { width: CW, align: 'center', characterSpacing: 6 });

  doc.font('Helvetica-Bold').fontSize(36).fillColor(WHITE);
  doc.text('FIRST-TIME', M, 200, { width: CW, align: 'center', characterSpacing: 2 });
  doc.text('HOMEBUYER', M, 244, { width: CW, align: 'center', characterSpacing: 2 });
  doc.text('GUIDE', M, 288, { width: CW, align: 'center', characterSpacing: 2 });

  // Subtitle
  doc.font('Helvetica-Oblique').fontSize(14).fillColor(GOLD);
  doc.text('Your Complete Roadmap from Dream to Keys', M, 345, { width: CW, align: 'center' });

  // Edition badge
  doc.rect(W / 2 - 95, 380, 190, 30).lineWidth(1).strokeColor(GOLD).stroke();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD);
  doc.text('JACKSONVILLE, FL EDITION', M, 388, { width: CW, align: 'center', characterSpacing: 2 });

  // Divider
  doc.rect(M + 100, 435, CW - 200, 1).fill(GOLD);

  // Agent info
  doc.font('Helvetica').fontSize(12).fillColor(WHITE);
  doc.text('Presented by', M, 460, { width: CW, align: 'center' });

  doc.font('Helvetica-Bold').fontSize(20).fillColor(GOLD);
  doc.text('KENESHIA HAYE', M, 485, { width: CW, align: 'center' });

  doc.font('Helvetica').fontSize(12).fillColor(WHITE);
  doc.text('REALTOR\u00AE & U.S. Military Veteran', M, 518, { width: CW, align: 'center' });

  doc.font('Helvetica').fontSize(11).fillColor('#adb5bd');
  doc.text('Florida Gateway Realty  |  License #BK3450416', M, 540, { width: CW, align: 'center' });

  // Bottom divider
  doc.rect(M + 100, 580, CW - 200, 1).fill(GOLD);

  // Contact info
  doc.font('Helvetica').fontSize(10).fillColor(WHITE);
  const contactY = 600;
  doc.text('(254) 449-5299', M, contactY, { width: CW, align: 'center' });
  doc.text('keneshia@fgragent.com', M, contactY + 16, { width: CW, align: 'center' });
  doc.text('keneshiahaye.com', M, contactY + 32, { width: CW, align: 'center' });

  // Bottom gold bar
  doc.rect(0, H - 6, W, 6).fill(GOLD);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 2 — WELCOME LETTER
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function welcomePage() {
  lightBackground();
  let y = pageHeader('A PERSONAL NOTE FROM KENESHIA');
  y += 25;

  doc.font('Helvetica-Oblique').fontSize(13).fillColor(GOLD);
  doc.text('Dear Future Homeowner,', M, y, { width: CW });
  y = doc.y + 12;

  const letterBody = [
    'Buying your first home is one of the most exciting \u2014 and sometimes overwhelming \u2014 milestones in life. I remember the mix of excitement and uncertainty when I purchased my first home after my military service. That experience is exactly why I created this guide.',
    'As a proud U.S. military veteran and licensed REALTOR\u00AE serving the greater Jacksonville area, I understand what it means to navigate unfamiliar territory. Whether you\'re a fellow veteran using your VA benefits, a young professional ready to stop renting, or a growing family looking for more space \u2014 this guide was written for you.',
    'Inside, you\'ll find everything you need to confidently move from "thinking about buying" to "holding the keys to your new home." I\'ve broken the process into simple, actionable steps so nothing catches you off guard.',
    'And when you\'re ready to take that first step, I\'m here. No pressure, no sales pitch \u2014 just honest guidance from someone who genuinely cares about your success.',
    'Let\'s make your homeownership dream a reality.'
  ];

  letterBody.forEach(para => {
    y = bodyText(para, M, y, { size: 11, lineGap: 3 });
    y += 10;
  });

  y += 4;
  doc.font('Helvetica-Oblique').fontSize(12).fillColor(DARK);
  doc.text('Warmly,', M, y);
  y = doc.y + 6;

  doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY);
  doc.text('Keneshia Haye', M, y);
  y = doc.y + 2;

  doc.font('Helvetica').fontSize(10).fillColor(DARK);
  doc.text('REALTOR\u00AE & U.S. Military Veteran', M, y);
  y = doc.y + 2;
  doc.text('Florida Gateway Realty', M, y);

  // Decorative gold line at bottom
  doc.rect(M + 80, H - 65, CW - 160, 1.5).fill(GOLD);

  pageNumberFooter(2);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 3 — ARE YOU READY TO BUY?
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function readyPage() {
  lightBackground();
  let y = pageHeader('ARE YOU READY TO BUY?');
  y += 18;

  doc.font('Helvetica-Oblique').fontSize(13).fillColor(GOLD);
  doc.text('A Quick Self-Assessment', M, y, { width: CW, align: 'center' });
  y = doc.y + 16;

  y = sectionHeading('Financial Readiness Checklist', M, y, { size: 13 });
  y += 2;

  const financialChecks = [
    'I have stable, verifiable income (2+ years same employer or field)',
    'My credit score is 620 or higher (580+ for VA loans)',
    'My total debt payments are less than 43% of my gross monthly income',
    'I have savings for closing costs (typically 2\u20135% of purchase price)',
    'I have an emergency fund covering 3\u20136 months of expenses',
    'I haven\'t made major credit changes recently (new car, credit cards)'
  ];

  financialChecks.forEach(item => {
    y = checkbox(M + 8, y, item, { width: CW - 16 });
  });

  y += 8;
  y = sectionHeading('Emotional Readiness Signs', M, y, { size: 13 });
  y += 2;

  const emotionalChecks = [
    'I\'m ready to stay in one area for at least 3\u20135 years',
    'I understand homeownership means maintenance responsibilities',
    'I\'m excited about building equity instead of paying rent'
  ];

  emotionalChecks.forEach(item => {
    y = checkbox(M + 8, y, item, { width: CW - 16 });
  });

  y += 12;
  // Result box
  const resultBoxH = 40;
  doc.rect(M, y, CW, resultBoxH).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD);
  doc.text('If you checked 5 or more boxes, you\'re likely ready to start', M + 16, y + 8, { width: CW - 32, align: 'center' });
  doc.text('your home buying journey!', M + 16, doc.y, { width: CW - 32, align: 'center' });
  y += resultBoxH + 16;

  y = goldTipBox(
    'Not quite there yet? That\'s okay! Call me and we\'ll create a personalized plan to get you ready. There\'s no timeline pressure \u2014 let\'s start where you are.',
    M, y, CW, { title: 'KENESHIA\'S TIP' }
  );

  pageNumberFooter(3);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 4 — UNDERSTANDING YOUR BUDGET
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function budgetPage() {
  lightBackground();
  let y = pageHeader('UNDERSTANDING YOUR BUDGET');
  y += 16;

  // 28/36 Rule Section
  y = sectionHeading('The 28/36 Rule', M, y, { size: 14 });
  y += 2;

  // Two boxes side by side
  const boxW = (CW - 16) / 2;
  const boxH = 70;

  // 28% box
  doc.rect(M, y, boxW, boxH).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(28).fillColor(GOLD);
  doc.text('28%', M, y + 8, { width: boxW, align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor(WHITE);
  doc.text('of gross monthly income', M + 10, y + 40, { width: boxW - 20, align: 'center' });
  doc.text('= max housing payment', M + 10, y + 52, { width: boxW - 20, align: 'center' });

  // 36% box
  const box2X = M + boxW + 16;
  doc.rect(box2X, y, boxW, boxH).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(28).fillColor(GOLD);
  doc.text('36%', box2X, y + 8, { width: boxW, align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor(WHITE);
  doc.text('of gross monthly income', box2X + 10, y + 40, { width: boxW - 20, align: 'center' });
  doc.text('= max total debt', box2X + 10, y + 52, { width: boxW - 20, align: 'center' });

  y += boxH + 10;

  // Example
  doc.rect(M, y, CW, 32).fill(GOLD_BG);
  doc.rect(M, y, 4, 32).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK);
  doc.text('Example: ', M + 14, y + 9, { continued: true, width: CW - 28 });
  doc.font('Helvetica').text('$5,000/month gross income \u2192 max housing = $1,400  |  max total debt = $1,800');
  y = doc.y + 12;

  // Hidden costs section
  y = sectionHeading('Hidden Costs Beyond the Mortgage', M, y, { size: 13 });
  y += 2;

  const hiddenCosts = [
    'Property taxes (Jacksonville avg ~1.01% of home value)',
    'Homeowner\'s insurance ($1,500\u2013$3,500/year in FL)',
    'HOA fees ($100\u2013$400/month if applicable)',
    'Maintenance (budget 1\u20132% of home value annually)',
    'Utilities ($200\u2013$400/month in Jacksonville)'
  ];

  hiddenCosts.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 10;

  // Jacksonville prices table
  y = sectionHeading('Jacksonville Home Prices by Area', M, y, { size: 13 });
  y += 4;

  const colWidths = [160, 170, 174];
  y = drawTable(
    ['Area', 'Avg Price', 'Monthly Payment*'],
    [
      ['Jacksonville', '$320,000', '~$2,100'],
      ['Orange Park',  '$285,000', '~$1,870'],
      ['Mandarin',     '$350,000', '~$2,300'],
      ['Ponte Vedra',  '$550,000+', '~$3,600+'],
      ['Fleming Island','$380,000', '~$2,500']
    ],
    M, y, colWidths
  );

  doc.font('Helvetica-Oblique').fontSize(8).fillColor('#888888');
  doc.text('*Estimated at 6.5% rate, 30-year fixed, with taxes & insurance', M, y, { width: CW });

  pageNumberFooter(4);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 5 — GETTING PRE-APPROVED
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function preApprovedPage() {
  lightBackground();
  let y = pageHeader('GETTING PRE-APPROVED');
  y += 16;

  // Pre-qual vs Pre-approval
  y = sectionHeading('Pre-Qualification vs. Pre-Approval', M, y, { size: 13 });
  y += 4;

  // Two comparison boxes
  const compW = (CW - 16) / 2;
  const compH = 100;

  // Pre-Qualification
  doc.rect(M, y, compW, compH).fill('#eae6de');
  doc.rect(M, y, compW, 28).fill('#999');
  doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
  doc.text('PRE-QUALIFICATION', M + 10, y + 7, { width: compW - 20, align: 'center' });
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
  doc.text('Quick estimate based on self-reported info. Not verified by the lender. Useful as a starting point, but doesn\'t carry much weight with sellers.',
    M + 12, y + 36, { width: compW - 24, lineGap: 2 });

  // Pre-Approval
  const comp2X = M + compW + 16;
  doc.rect(comp2X, y, compW, compH).fill(GOLD_BG);
  doc.rect(comp2X, y, compW, 28).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD);
  doc.text('PRE-APPROVAL', comp2X + 10, y + 7, { width: compW - 20, align: 'center' });
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
  doc.text('Formal process with credit check and document verification. Carries real weight with sellers and shows you\'re a serious buyer.',
    comp2X + 12, y + 36, { width: compW - 24, lineGap: 2 });

  y += compH + 16;

  // Documents
  y = sectionHeading('Documents You\'ll Need', M, y, { size: 13 });
  y += 2;

  const documents = [
    'Last 2 years of W-2s or tax returns',
    'Last 2 months of pay stubs',
    'Last 2\u20133 months of bank statements',
    'Government-issued photo ID',
    'Social Security number',
    'List of debts and monthly payments'
  ];

  documents.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 10;

  // Why pre-approval matters
  y = sectionHeading('Why Pre-Approval Gives You an Edge', M, y, { size: 13 });
  y += 2;

  const advantages = [
    'Sellers take your offer seriously',
    'You know exactly what you can afford',
    'Speeds up the closing process',
    'Identifies potential issues early'
  ];

  advantages.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 12;

  y = goldTipBox(
    'Keneshia works with trusted local lenders who offer competitive rates and excellent service. Ask for her recommended lender list!',
    M, y, CW, { title: 'INSIDER TIP' }
  );

  pageNumberFooter(5);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 6 — THE HOME SEARCH
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function searchPage() {
  lightBackground();
  let y = pageHeader('THE HOME SEARCH');
  y += 16;

  // Wish list worksheet
  y = sectionHeading('Your Wish List Worksheet', M, y, { size: 13 });
  y += 4;

  const colW = (CW - 16) / 2;
  const wishH = 130;

  // Must-Haves column
  doc.rect(M, y, colW, wishH).fill(WHITE);
  doc.rect(M, y, colW, 26).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD);
  doc.text('MUST-HAVES', M + 10, y + 7, { width: colW - 20, align: 'center' });

  const mustHaves = ['# of bedrooms: ___', '# of bathrooms: ___', 'Garage (Y / N)', 'Yard size: ___', 'School district: ___', 'Max commute: ___'];
  let my = y + 32;
  mustHaves.forEach(item => {
    doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
    doc.text('\u2022  ' + item, M + 14, my, { width: colW - 28 });
    my = doc.y + 2;
  });

  // Nice-to-Haves column
  const col2X = M + colW + 16;
  doc.rect(col2X, y, colW, wishH).fill(WHITE);
  doc.rect(col2X, y, colW, 26).fill(GOLD);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
  doc.text('NICE-TO-HAVES', col2X + 10, y + 7, { width: colW - 20, align: 'center' });

  const niceHaves = ['Pool', 'Updated kitchen', 'Walk-in closet', 'Covered patio', 'Smart home features', 'Open floor plan'];
  let ny = y + 32;
  niceHaves.forEach(item => {
    doc.font('Helvetica').fontSize(9.5).fillColor(DARK);
    doc.text('\u2022  ' + item, col2X + 14, ny, { width: colW - 28 });
    ny = doc.y + 2;
  });

  y += wishH + 14;

  // Top neighborhoods
  y = sectionHeading('Top Jacksonville Neighborhoods for First-Time Buyers', M, y, { size: 13 });
  y += 4;

  const neighborhoods = [
    { name: 'Westside / Argyle', desc: 'Affordable, family-friendly, near NAS Jax' },
    { name: 'Orange Park', desc: 'Great schools, suburban feel, reasonable prices' },
    { name: 'Mandarin', desc: 'Established neighborhoods, good amenities' },
    { name: 'Arlington', desc: 'Up-and-coming, close to beaches and downtown' },
    { name: 'Middleburg', desc: 'Rural charm, larger lots, great value' }
  ];

  neighborhoods.forEach(n => {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(NAVY);
    doc.text(n.name, M + 14, y, { continued: true, width: CW - 28 });
    doc.font('Helvetica').fillColor(DARK);
    doc.text(' \u2014 ' + n.desc);
    y = doc.y + 4;
  });

  y += 10;

  // How Keneshia helps
  y = sectionHeading('How Keneshia Makes Your Search Easy', M, y, { size: 13 });
  y += 2;

  const searchHelp = [
    'Custom MLS alerts matching your criteria',
    'Neighborhood tours and local insights',
    'Off-market opportunities through her network',
    'Virtual tour options for remote buyers'
  ];

  searchHelp.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  pageNumberFooter(6);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 7 — MAKING AN OFFER
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function offerPage() {
  lightBackground();
  let y = pageHeader('MAKING AN OFFER');
  y += 16;

  // Anatomy of offer
  y = sectionHeading('Anatomy of a Purchase Offer', M, y, { size: 13 });
  y += 2;

  const offerParts = [
    'Offer price',
    'Earnest money deposit (typically 1\u20132% of price)',
    'Financing terms',
    'Inspection contingency',
    'Closing date',
    'Personal property included (appliances, fixtures)'
  ];

  offerParts.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 10;

  // Negotiation
  y = sectionHeading('Negotiation Strategies', M, y, { size: 13 });
  y += 2;

  const strategies = [
    'Know the market (buyer\'s vs. seller\'s market)',
    'Don\'t lowball in a competitive market',
    'Consider an escalation clause',
    'Be flexible on closing date',
    'Write a personal letter to the seller'
  ];

  strategies.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 14;

  // Timeline visual
  y = sectionHeading('What Happens After Your Offer Is Accepted', M, y, { size: 13 });
  y += 10;

  const steps = [
    { label: 'Offer\nAccepted', day: '' },
    { label: 'Inspections', day: 'Day 1\u201310' },
    { label: 'Appraisal', day: 'Day 10\u201321' },
    { label: 'Final\nApproval', day: 'Day 21\u201335' },
    { label: 'Closing!', day: 'Day 30\u201345' }
  ];

  const timelineW = CW - 20;
  const stepW = timelineW / steps.length;
  const tlX = M + 10;
  const tlY = y;

  // Draw connecting line
  doc.rect(tlX + stepW / 2, tlY + 18, timelineW - stepW, 3).fill(GOLD);

  steps.forEach((step, i) => {
    const cx = tlX + i * stepW + stepW / 2;

    // Circle
    doc.circle(cx, tlY + 19, 12).fill(NAVY);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(GOLD);
    doc.text(String(i + 1), cx - 5, tlY + 14, { width: 10, align: 'center' });

    // Label above
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY);
    doc.text(step.label, cx - stepW / 2 + 4, tlY + 36, { width: stepW - 8, align: 'center', lineGap: 1 });

    // Day below
    if (step.day) {
      doc.font('Helvetica').fontSize(7.5).fillColor('#888');
      doc.text(step.day, cx - stepW / 2 + 4, tlY + 58, { width: stepW - 8, align: 'center' });
    }
  });

  y = tlY + 80;

  y += 10;
  y = goldTipBox(
    'In a competitive Jacksonville market, having a pre-approval letter and a skilled REALTOR\u00AE writing your offer can make all the difference. Let Keneshia give you the edge you need!',
    M, y, CW, { title: 'COMPETITIVE EDGE' }
  );

  pageNumberFooter(7);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 8 — INSPECTIONS & APPRAISAL
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function inspectionsPage() {
  lightBackground();
  let y = pageHeader('INSPECTIONS & APPRAISAL');
  y += 16;

  // Inspection checklist
  y = sectionHeading('Home Inspection Checklist', M, y, { size: 13 });
  y += 2;

  bodyText('What the inspector checks:', M, y, { font: 'Helvetica-Oblique', size: 10, color: '#666' });
  y = doc.y + 4;

  const inspectionItems = [
    'Foundation and structural integrity',
    'Roof condition and age',
    'HVAC systems',
    'Plumbing and electrical',
    'Water heater',
    'Windows and doors',
    'Insulation and ventilation',
    'Pest/termite inspection (critical in Florida!)'
  ];

  inspectionItems.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 10;

  // Appraisal section
  y = sectionHeading('Understanding the Appraisal', M, y, { size: 13 });
  y += 2;

  const appraisalPoints = [
    'An independent assessment of the home\'s market value required by your lender',
    'Protects you from overpaying \u2014 ensures the home is worth what you\'re borrowing',
    'If appraisal comes in low, you can: renegotiate the price, pay the difference out of pocket, or walk away'
  ];

  appraisalPoints.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 12;

  // When to walk away
  y = sectionHeading('When to Walk Away', M, y, { size: 13 });
  y += 2;

  // Red-flag style box
  const walkItems = [
    'Major structural issues discovered',
    'Mold or environmental hazards present',
    'Seller refuses reasonable repair requests',
    'Appraisal significantly below offer price'
  ];

  const walkBoxPad = 12;
  doc.font('Helvetica').fontSize(10.5);
  let walkTextH = 0;
  walkItems.forEach(item => {
    walkTextH += doc.heightOfString(item, { width: CW - walkBoxPad * 2 - 20 }) + 8;
  });
  const walkBoxH = walkTextH + walkBoxPad * 2;

  doc.rect(M, y, CW, walkBoxH).fill('#fdf0f0');
  doc.rect(M, y, 5, walkBoxH).fill('#c0392b');

  let wy = y + walkBoxPad;
  walkItems.forEach(item => {
    doc.font('Helvetica').fontSize(10.5).fillColor('#c0392b');
    doc.text('\u26A0  ' + item, M + walkBoxPad + 10, wy, { width: CW - walkBoxPad * 2 - 20 });
    wy = doc.y + 4;
  });

  pageNumberFooter(8);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 9 — CLOSING DAY
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function closingPage() {
  lightBackground();
  let y = pageHeader('CLOSING DAY');
  y += 16;

  // What to bring
  y = sectionHeading('What to Bring', M, y, { size: 13 });
  y += 2;

  const bringItems = [
    'Government-issued photo ID',
    'Cashier\'s check or wire transfer confirmation',
    'Proof of homeowner\'s insurance',
    'Any remaining documents your lender requests'
  ];

  bringItems.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 10;

  // Closing costs breakdown
  y = sectionHeading('Closing Costs Breakdown', M, y, { size: 13 });
  y += 4;

  const costCols = [260, 244];
  y = drawTable(
    ['Fee', 'Typical Range'],
    [
      ['Loan origination fee', '0.5\u20131% of loan amount'],
      ['Appraisal fee', '$300\u2013$500'],
      ['Title insurance', '$1,000\u2013$2,000'],
      ['Attorney / closing agent fees', '$500\u2013$1,500'],
      ['Recording fees', '$50\u2013$200'],
      ['Prepaid items (taxes, insurance)', 'Varies']
    ],
    M, y, costCols
  );

  // Total callout
  doc.rect(M, y, CW, 30).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD);
  doc.text('TOTAL: Typically 2\u20135% of purchase price', M + 16, y + 8, { width: CW - 32, align: 'center' });
  y += 42;

  // Final walkthrough
  y = sectionHeading('Final Walkthrough Tips', M, y, { size: 13 });
  y += 2;

  const walkthrough = [
    'Schedule 24\u201348 hours before closing',
    'Test all appliances and systems',
    'Verify agreed-upon repairs were completed',
    'Confirm all fixtures and personal property are present',
    'Run water, flush toilets, test every electrical outlet'
  ];

  walkthrough.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  pageNumberFooter(9);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 10 — AFTER YOU CLOSE
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function afterClosePage() {
  lightBackground();
  let y = pageHeader('AFTER YOU CLOSE');
  y += 16;

  // First things
  y = sectionHeading('First Things to Do in Your New Home', M, y, { size: 13 });
  y += 2;

  const firstThings = [
    'Change the locks on all exterior doors',
    'Update your address (USPS, DMV, bank, employer)',
    'Set up utilities (JEA for Jacksonville)',
    'Get to know your neighbors',
    'Locate your electrical panel and water shut-off valve'
  ];

  firstThings.forEach(item => {
    y = bulletItem(M + 8, y, item);
  });

  y += 12;

  // Maintenance schedule
  y = sectionHeading('Home Maintenance Schedule', M, y, { size: 13 });
  y += 4;

  const maintHeaders = ['Frequency', 'Tasks'];
  const maintRows = [
    ['Monthly', 'Check HVAC filters, test smoke detectors'],
    ['Quarterly', 'Clean gutters, inspect exterior for damage'],
    ['Annually', 'Service HVAC, check roof, schedule pest inspection'],
    ['As Needed', 'Touch up paint, replace caulk, weather-stripping']
  ];
  y = drawTable(maintHeaders, maintRows, M, y, [140, 364]);

  y += 14;

  // Referral network
  y = sectionHeading('Keneshia\'s Referral Network', M, y, { size: 13 });
  y += 4;

  const refBoxH = 85;
  doc.rect(M, y, CW, refBoxH).fill(GOLD_BG);
  doc.rect(M, y, CW, 3).fill(GOLD);

  let ry = y + 14;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
  doc.text('Need a plumber, electrician, or handyman?', M + 18, ry, { width: CW - 36 });
  ry = doc.y + 6;
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK);
  doc.text('Keneshia maintains a trusted vendor list for all your home needs \u2014 from HVAC technicians to landscapers. One call is all it takes.', M + 18, ry, { width: CW - 36, lineGap: 2 });
  ry = doc.y + 8;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(GOLD);
  doc.text('Call: (254) 449-5299', M + 18, ry, { width: CW - 36 });

  pageNumberFooter(10);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 11 — VA LOAN SPOTLIGHT
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function vaLoanPage() {
  lightBackground();

  // Special champagne header bar for this page
  const barH = 58;
  const barY = 40;
  doc.rect(0, barY, W, barH).fill(GOLD);
  doc.rect(0, barY + barH, W, 3).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(NAVY);
  doc.text('VA LOAN SPOTLIGHT', M, barY + 17, { width: CW, align: 'center' });

  let y = barY + barH + 20;

  doc.font('Helvetica-Bold').fontSize(15).fillColor(NAVY);
  doc.text('Are You a Veteran? You\'ve Earned This.', M, y, { width: CW, align: 'center' });
  y = doc.y + 14;

  // Key benefits
  y = sectionHeading('Key VA Loan Benefits', M, y, { size: 13 });
  y += 4;

  const vaBenefits = [
    { bold: '$0 Down Payment', rest: ' \u2014 100% financing' },
    { bold: 'No Private Mortgage Insurance', rest: ' (PMI)' },
    { bold: 'Competitive interest rates', rest: ' (typically 0.25\u20130.5% lower)' },
    { bold: 'Limited closing costs', rest: ' \u2014 many fees are capped or waived' },
    { bold: 'No prepayment penalty', rest: ' \u2014 pay off early with no extra charge' },
    { bold: 'Reusable benefit', rest: ' \u2014 use it again and again' }
  ];

  vaBenefits.forEach(item => {
    const bx = M + 14;
    doc.circle(bx, y + 5, 3).fill(GOLD);
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(NAVY);
    doc.text(item.bold, bx + 10, y, { continued: true, width: CW - 30 });
    doc.font('Helvetica').fillColor(DARK);
    doc.text(item.rest);
    y = doc.y + 4;
  });

  y += 10;

  // Eligibility
  y = sectionHeading('Quick Eligibility Check', M, y, { size: 13 });
  y += 2;

  const eligibility = [
    '90+ consecutive days of active duty during wartime',
    '181+ consecutive days of active duty during peacetime',
    '6+ years in the National Guard or Reserves',
    'Surviving spouse of a service member (in some cases)'
  ];

  eligibility.forEach(item => {
    y = checkbox(M + 8, y, item, { width: CW - 16 });
  });

  y += 14;

  // Gold highlight box
  const vaBoxH = 90;
  doc.rect(M, y, CW, vaBoxH).fill(GOLD_BG);
  doc.rect(M, y, CW, 4).fill(GOLD);
  doc.rect(M, y + vaBoxH - 4, CW, 4).fill(GOLD);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
  doc.text('As a veteran herself, Keneshia understands VA loans inside and out.', M + 20, y + 18, { width: CW - 40, align: 'center' });
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK);
  doc.text('She\'ll guide you through every step \u2014 from your Certificate of Eligibility to closing day.', M + 20, doc.y + 6, { width: CW - 40, align: 'center', lineGap: 2 });

  doc.font('Helvetica-Bold').fontSize(14).fillColor(GOLD);
  doc.text('Call Keneshia: (254) 449-5299', M + 20, doc.y + 10, { width: CW - 40, align: 'center' });

  pageNumberFooter(11);
})();


// ═══════════════════════════════════════════════════════════════════
// PAGE 12 — BACK COVER / CTA
// ═══════════════════════════════════════════════════════════════════
doc.addPage();
(function backCover() {
  navyBackground();

  // Top gold bar
  doc.rect(0, 0, W, 6).fill(GOLD);

  // Decorative side accents
  doc.rect(M - 10, 120, 2, 480).fill(GOLD);
  doc.rect(W - M + 8, 120, 2, 480).fill(GOLD);

  // CTA
  doc.font('Helvetica-Bold').fontSize(38).fillColor(GOLD);
  doc.text('READY TO', M, 170, { width: CW, align: 'center', characterSpacing: 3 });
  doc.text('START?', M, 218, { width: CW, align: 'center', characterSpacing: 3 });

  doc.font('Helvetica').fontSize(20).fillColor(WHITE);
  doc.text('Let\'s Talk.', M, 275, { width: CW, align: 'center' });

  // Divider
  doc.rect(M + 140, 310, CW - 280, 1.5).fill(GOLD);

  // Contact info
  const infoY = 340;
  const labelX = W / 2 - 120;
  const valX = W / 2 - 10;
  const rowGap = 28;

  const contactInfo = [
    { label: 'Phone:', value: '(254) 449-5299' },
    { label: 'Email:', value: 'keneshia@fgragent.com' },
    { label: 'Web:', value: 'keneshiahaye.com' }
  ];

  contactInfo.forEach((c, i) => {
    const cy = infoY + i * rowGap;
    doc.font('Helvetica').fontSize(11).fillColor(GOLD);
    doc.text(c.label, labelX, cy, { width: 80, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
    doc.text(c.value, valX, cy, { width: 200 });
  });

  // Office address
  doc.font('Helvetica').fontSize(10).fillColor('#adb5bd');
  doc.text('Office: 1700 Wells Road, Suite 4, Orange Park, FL 32073', M, infoY + 3 * rowGap + 5, { width: CW, align: 'center' });

  // Consultation CTA
  const ctaY = 475;
  doc.rect(M + 50, ctaY, CW - 100, 42).lineWidth(1.5).strokeColor(GOLD).stroke();
  doc.font('Helvetica-Bold').fontSize(14).fillColor(GOLD);
  doc.text('Schedule Your Free Consultation Today', M + 50, ctaY + 12, { width: CW - 100, align: 'center' });

  // Closing message
  doc.font('Helvetica').fontSize(10.5).fillColor(WHITE);
  doc.text(
    'Whether you\'re just starting to think about buying or you\'re ready to tour homes this weekend, I\'m here to help \u2014 no obligation, no pressure.',
    M + 30, ctaY + 60, { width: CW - 60, align: 'center', lineGap: 3 }
  );

  // Bottom divider
  doc.rect(M + 140, H - 80, CW - 280, 1).fill(GOLD);

  // Footer
  doc.font('Helvetica').fontSize(8.5).fillColor('#888888');
  doc.text(
    'Equal Housing Opportunity   |   Florida Gateway Realty   |   License #BK3450416',
    M, H - 55, { width: CW, align: 'center' }
  );

  // Bottom gold bar
  doc.rect(0, H - 6, W, 6).fill(GOLD);
})();


// ═══════════════════════════════════════════════════════════════════
// FINALIZE
// ═══════════════════════════════════════════════════════════════════
doc.end();

doc.on('finish', () => {
  const stats = fs.statSync(outPath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`\n  PDF created successfully!`);
  console.log(`  Location: ${outPath}`);
  console.log(`  Size: ${sizeKB} KB`);
  console.log(`  Pages: 12\n`);
});
