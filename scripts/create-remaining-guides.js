/**
 * create-remaining-guides.js
 * Generates three professional PDF guides for Keneshia Haye Real Estate:
 *   1. VA Loan Benefits Cheat Sheet (4 pages)
 *   2. Buying Sight Unseen Guide (6 pages)
 *   3. Home Prep Checklist (4 pages)
 *
 * Uses PDFKit with built-in fonts only (Helvetica, Helvetica-Bold, Times-Roman).
 * Run: node scripts/create-remaining-guides.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ── Design tokens ──────────────────────────────────────────────────────────────
const NAVY      = '#0a1628';
const CHAMPAGNE = '#c9a96e';
const WHITE     = '#ffffff';
const DARK_GRAY = '#333333';
const LIGHT_BG  = '#f4f1ec';
const ACCENT_BG = '#0d1e3a';

const PAGE_W = 612;   // US Letter
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ── Shared helpers ─────────────────────────────────────────────────────────────

function navyRect(doc, x, y, w, h) {
  doc.save().rect(x, y, w, h).fill(NAVY).restore();
}

function champagneLine(doc, x, y, w, thickness) {
  doc.save()
    .moveTo(x, y)
    .lineTo(x + w, y)
    .lineWidth(thickness || 2)
    .strokeColor(CHAMPAGNE)
    .stroke()
    .restore();
}

function drawCoverPage(doc, title, subtitle) {
  // Full navy background
  navyRect(doc, 0, 0, PAGE_W, PAGE_H);

  // Top champagne accent bar
  doc.save().rect(0, 0, PAGE_W, 6).fill(CHAMPAGNE).restore();

  // Decorative corner accents
  const cornerLen = 60;
  const cornerInset = 40;
  doc.save().strokeColor(CHAMPAGNE).lineWidth(1.5);
  // top-left
  doc.moveTo(cornerInset, cornerInset + cornerLen).lineTo(cornerInset, cornerInset).lineTo(cornerInset + cornerLen, cornerInset).stroke();
  // top-right
  doc.moveTo(PAGE_W - cornerInset - cornerLen, cornerInset).lineTo(PAGE_W - cornerInset, cornerInset).lineTo(PAGE_W - cornerInset, cornerInset + cornerLen).stroke();
  // bottom-left
  doc.moveTo(cornerInset, PAGE_H - cornerInset - cornerLen).lineTo(cornerInset, PAGE_H - cornerInset).lineTo(cornerInset + cornerLen, PAGE_H - cornerInset).stroke();
  // bottom-right
  doc.moveTo(PAGE_W - cornerInset - cornerLen, PAGE_H - cornerInset).lineTo(PAGE_W - cornerInset, PAGE_H - cornerInset).lineTo(PAGE_W - cornerInset, PAGE_H - cornerInset - cornerLen).stroke();
  doc.restore();

  // Title
  const titleY = 240;
  doc.font('Helvetica-Bold').fontSize(32).fillColor(WHITE);
  doc.text(title, MARGIN + 10, titleY, {
    width: CONTENT_W - 20,
    align: 'center',
    lineGap: 6,
  });

  // Champagne divider under title
  const divY = titleY + doc.heightOfString(title, { width: CONTENT_W - 20 }) + 18;
  champagneLine(doc, PAGE_W / 2 - 80, divY, 160, 2);

  // Subtitle
  doc.font('Times-Roman').fontSize(16).fillColor(CHAMPAGNE);
  doc.text(subtitle, MARGIN + 10, divY + 16, {
    width: CONTENT_W - 20,
    align: 'center',
  });

  // Branding block
  const brandY = PAGE_H - 180;
  champagneLine(doc, PAGE_W / 2 - 60, brandY, 120, 1);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(WHITE);
  doc.text('KENESHIA HAYE', 0, brandY + 16, { width: PAGE_W, align: 'center', lineBreak: false });
  doc.font('Helvetica').fontSize(11).fillColor(CHAMPAGNE);
  doc.text('REALTOR\u00AE  |  Military Relocation Specialist', 0, brandY + 38, { width: PAGE_W, align: 'center', lineBreak: false });
  doc.text('Fidelis Realty Group', 0, brandY + 54, { width: PAGE_W, align: 'center', lineBreak: false });

  // Bottom champagne accent bar
  doc.save().rect(0, PAGE_H - 6, PAGE_W, 6).fill(CHAMPAGNE).restore();

  // Reset cursor to prevent PDFKit from auto-creating a blank page
  doc.x = MARGIN;
  doc.y = MARGIN;
}

function drawCtaPage(doc, headline, bodyText) {
  navyRect(doc, 0, 0, PAGE_W, PAGE_H);
  doc.save().rect(0, 0, PAGE_W, 6).fill(CHAMPAGNE).restore();
  doc.save().rect(0, PAGE_H - 6, PAGE_W, 6).fill(CHAMPAGNE).restore();

  // Headline — dynamically measure height
  doc.font('Helvetica-Bold').fontSize(26).fillColor(WHITE);
  const headH = doc.heightOfString(headline, { width: CONTENT_W, align: 'center', lineGap: 4 });
  const headY = 200;
  doc.text(headline, MARGIN, headY, { width: CONTENT_W, align: 'center', lineGap: 4, lineBreak: true });

  let cursorY = headY + headH + 12;

  if (bodyText) {
    doc.font('Times-Roman').fontSize(13).fillColor(CHAMPAGNE);
    const bodyH = doc.heightOfString(bodyText, { width: CONTENT_W - 40, align: 'center', lineGap: 4 });
    doc.text(bodyText, MARGIN + 20, cursorY, { width: CONTENT_W - 40, align: 'center', lineGap: 4 });
    cursorY += bodyH + 16;
  }

  // Divider
  champagneLine(doc, PAGE_W / 2 - 80, cursorY, 160, 2);
  cursorY += 18;

  // Contact block
  doc.font('Helvetica-Bold').fontSize(15).fillColor(WHITE);
  doc.text('Keneshia Haye, REALTOR\u00AE', 0, cursorY, { width: PAGE_W, align: 'center' });

  doc.font('Helvetica').fontSize(12).fillColor(CHAMPAGNE);
  doc.text('(254) 449-5299', 0, cursorY + 26, { width: PAGE_W, align: 'center' });
  doc.text('keneshia@fgragent.com', 0, cursorY + 44, { width: PAGE_W, align: 'center' });
  doc.text('keneshiahaye.com', 0, cursorY + 62, { width: PAGE_W, align: 'center' });

  // Equal Housing
  champagneLine(doc, PAGE_W / 2 - 60, cursorY + 96, 120, 1);
  doc.font('Helvetica').fontSize(9).fillColor('#8899aa');
  doc.text('Equal Housing Opportunity', 0, cursorY + 108, { width: PAGE_W, align: 'center', lineBreak: false });

  // Fidelis branding
  doc.font('Helvetica').fontSize(9).fillColor('#667788');
  doc.text('Fidelis Realty Group', 0, PAGE_H - 50, { width: PAGE_W, align: 'center', lineBreak: false });

  // Reset cursor to prevent PDFKit from auto-creating a blank page
  doc.x = MARGIN;
  doc.y = MARGIN;
}

function pageHeader(doc, text) {
  // Slim navy header bar
  navyRect(doc, 0, 0, PAGE_W, 58);
  doc.save().rect(0, 58, PAGE_W, 3).fill(CHAMPAGNE).restore();
  doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
  doc.text(text, MARGIN, 20, { width: CONTENT_W, align: 'center' });
}

function pageFooter(doc, pageNum) {
  champagneLine(doc, MARGIN, PAGE_H - 40, CONTENT_W, 0.5);
  doc.font('Helvetica').fontSize(8).fillColor('#999999');
  doc.text('Keneshia Haye  |  (254) 449-5299  |  keneshiahaye.com', MARGIN, PAGE_H - 32, { width: CONTENT_W / 2, lineBreak: false });
  doc.text(String(pageNum), MARGIN, PAGE_H - 32, { width: CONTENT_W, align: 'right', lineBreak: false });
  // Reset cursor to prevent PDFKit from auto-creating a blank page
  doc.x = MARGIN;
  doc.y = MARGIN;
}

function sectionTitle(doc, text, x, y) {
  doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY);
  doc.text(text, x, y);
  champagneLine(doc, x, y + 17, 100, 1.5);
  return y + 28;
}

function bulletItem(doc, text, x, y, opts) {
  const w = (opts && opts.width) || (CONTENT_W - (x - MARGIN));
  const bulletR = 2.5;
  doc.save().circle(x + bulletR, y + 6, bulletR).fill(CHAMPAGNE).restore();
  doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
  const h = doc.heightOfString(text, { width: w - 16 });
  doc.text(text, x + 14, y, { width: w - 16, lineGap: 2 });
  return y + Math.max(h, 14) + 4;
}

function checkboxItem(doc, text, x, y, opts) {
  const w = (opts && opts.width) || (CONTENT_W - (x - MARGIN));
  // Draw checkbox square
  doc.save().rect(x, y + 1, 10, 10).lineWidth(1).strokeColor(CHAMPAGNE).stroke().restore();
  doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
  const h = doc.heightOfString(text, { width: w - 20 });
  doc.text(text, x + 16, y, { width: w - 20, lineGap: 2 });
  return y + Math.max(h, 14) + 3;
}

function numberedItem(doc, num, title, desc, x, y, w) {
  // Number circle
  const circR = 12;
  doc.save().circle(x + circR, y + circR, circR).fill(CHAMPAGNE).restore();
  doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
  doc.text(String(num), x + circR - 4, y + 5, { width: 10, align: 'center' });
  // Title
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
  doc.text(title, x + circR * 2 + 10, y + 2, { width: w - circR * 2 - 14 });
  // Description
  doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
  const descH = doc.heightOfString(desc, { width: w - circR * 2 - 14 });
  doc.text(desc, x + circR * 2 + 10, y + 18, { width: w - circR * 2 - 14, lineGap: 2 });
  return y + 22 + descH + 10;
}

function drawRoundedRect(doc, x, y, w, h, r, fillColor) {
  doc.save().roundedRect(x, y, w, h, r).fill(fillColor).restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF 1 — VA LOAN BENEFITS CHEAT SHEET (4 pages)
// ═══════════════════════════════════════════════════════════════════════════════

function createVALoanGuide(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN }, autoFirstPage: false });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ── Page 1: Cover ──────────────────────────────────────────────────────
    doc.addPage();
    drawCoverPage(doc, 'VA LOAN BENEFITS\nCHEAT SHEET', 'Everything You Need to Know in One Place');

    // ── Page 2: Benefits at a Glance ────────────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'VA LOAN BENEFITS AT A GLANCE');

    const colW = (CONTENT_W - 20) / 2;
    const colLeft = MARGIN;
    const colRight = MARGIN + colW + 20;
    let topY = 80;

    // Left column — VA Loan Benefits
    drawRoundedRect(doc, colLeft, topY, colW, 260, 6, '#eef3e8');
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1a5c1a');
    doc.text('VA Loan Benefits', colLeft + 14, topY + 14, { width: colW - 28 });
    champagneLine(doc, colLeft + 14, topY + 32, colW - 40, 1);

    let ly = topY + 44;
    const vaItems = [
      ['$0 Down Payment', 'Buy a home with no money down'],
      ['No PMI Required', 'Save hundreds per month'],
      ['Lower Interest Rates', 'Typically 0.25-0.5% below conventional'],
      ['Limited Closing Costs', 'VA caps what you can be charged'],
      ['No Prepayment Penalty', 'Pay off your loan early with no fees'],
      ['Reusable Benefit', 'Use it again and again throughout your life'],
    ];
    vaItems.forEach(([title, desc]) => {
      doc.save().circle(colLeft + 24, ly + 5, 3).fill('#1a5c1a').restore();
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1a5c1a');
      doc.text(title, colLeft + 34, ly - 1, { width: colW - 52 });
      doc.font('Helvetica').fontSize(8.5).fillColor(DARK_GRAY);
      doc.text(desc, colLeft + 34, ly + 11, { width: colW - 52 });
      ly += 34;
    });

    // Right column — Conventional Comparison
    drawRoundedRect(doc, colRight, topY, colW, 260, 6, '#fdf1f0');
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#9e2b2b');
    doc.text('Conventional Loan', colRight + 14, topY + 14, { width: colW - 28 });
    champagneLine(doc, colRight + 14, topY + 32, colW - 40, 1);

    let ry = topY + 44;
    const convItems = [
      ['3-20% Down Payment', 'Significant upfront cash needed'],
      ['PMI Required Under 20%', 'Added monthly cost until 20% equity'],
      ['Higher Interest Rates', 'Rates typically above VA loan rates'],
      ['Full Closing Costs', 'No caps on lender/origination fees'],
      ['Possible Prepayment Penalties', 'Check loan terms carefully'],
      ['One-Time Use', 'Each loan is an independent transaction'],
    ];
    convItems.forEach(([title, desc]) => {
      doc.save().circle(colRight + 24, ry + 5, 3).fill('#9e2b2b').restore();
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#9e2b2b');
      doc.text(title, colRight + 34, ry - 1, { width: colW - 52 });
      doc.font('Helvetica').fontSize(8.5).fillColor(DARK_GRAY);
      doc.text(desc, colRight + 34, ry + 11, { width: colW - 52 });
      ry += 34;
    });

    // Savings callout box
    const savingsY = topY + 280;
    drawRoundedRect(doc, MARGIN + 40, savingsY, CONTENT_W - 80, 100, 8, NAVY);
    doc.save().rect(MARGIN + 40, savingsY, 5, 100).fill(CHAMPAGNE).restore();
    doc.font('Helvetica-Bold').fontSize(20).fillColor(CHAMPAGNE);
    doc.text('You Could Save $40,000+', MARGIN + 60, savingsY + 16, { width: CONTENT_W - 120, align: 'center' });
    doc.font('Helvetica').fontSize(11).fillColor(WHITE);
    doc.text('On a $300,000 home, VA loan borrowers can save over $40,000 over the', MARGIN + 60, savingsY + 46, { width: CONTENT_W - 120, align: 'center' });
    doc.text('life of their loan compared to a conventional mortgage with PMI.', MARGIN + 60, savingsY + 60, { width: CONTENT_W - 120, align: 'center' });

    // Quick tip
    const tipY = savingsY + 130;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(CHAMPAGNE);
    doc.text('PRO TIP:', MARGIN, tipY);
    doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
    doc.text('VA loans can also be used for refinancing, manufactured homes, and even building a new home. Ask Keneshia about all your options.', MARGIN + 60, tipY, { width: CONTENT_W - 60 });

    pageFooter(doc, 2);

    // ── Page 3: Eligibility & How to Apply ──────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'ELIGIBILITY & HOW TO APPLY');

    let cy = 78;

    // Eligibility Requirements
    cy = sectionTitle(doc, 'Eligibility Requirements', MARGIN, cy);
    const eligItems = [
      'Wartime veterans: 90 consecutive days of active service',
      'Peacetime veterans: 181 consecutive days of active service',
      'National Guard / Reserves: 6 years of service (or 90 days under Title 10)',
      'Surviving spouses of veterans who died in service or from service-connected disability',
    ];
    eligItems.forEach(item => { cy = bulletItem(doc, item, MARGIN, cy); });

    cy += 10;

    // Certificate of Eligibility
    cy = sectionTitle(doc, 'How to Get Your Certificate of Eligibility (COE)', MARGIN, cy);
    const coeItems = [
      'Online: Apply through the eBenefits portal at va.gov',
      'Through your lender: Most VA-approved lenders can pull it instantly',
      'By mail: Submit VA Form 26-1880 to your regional VA office',
    ];
    coeItems.forEach(item => { cy = bulletItem(doc, item, MARGIN, cy); });

    cy += 12;

    // VA Funding Fee Table
    cy = sectionTitle(doc, 'VA Funding Fee Schedule', MARGIN, cy);

    // Table
    const tableX = MARGIN;
    const tableW = CONTENT_W;
    const cols = [tableW * 0.38, tableW * 0.31, tableW * 0.31];
    const rowH = 26;

    // Header row
    drawRoundedRect(doc, tableX, cy, tableW, rowH, 0, NAVY);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE);
    doc.text('Down Payment', tableX + 8, cy + 8, { width: cols[0] - 12 });
    doc.text('First Use', tableX + cols[0] + 8, cy + 8, { width: cols[1] - 12, align: 'center' });
    doc.text('Subsequent Use', tableX + cols[0] + cols[1] + 8, cy + 8, { width: cols[2] - 12, align: 'center' });
    cy += rowH;

    const feeRows = [
      ['$0 Down', '2.15%', '3.3%'],
      ['5% - 9.99% Down', '1.25%', '1.25%'],
      ['10%+ Down', '1.0%', '1.0%'],
    ];
    feeRows.forEach((row, i) => {
      const bg = i % 2 === 0 ? LIGHT_BG : WHITE;
      doc.save().rect(tableX, cy, tableW, rowH).fill(bg).restore();
      doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
      doc.text(row[0], tableX + 8, cy + 8, { width: cols[0] - 12 });
      doc.text(row[1], tableX + cols[0] + 8, cy + 8, { width: cols[1] - 12, align: 'center' });
      doc.text(row[2], tableX + cols[0] + cols[1] + 8, cy + 8, { width: cols[2] - 12, align: 'center' });
      cy += rowH;
    });

    // Exemption note
    cy += 6;
    drawRoundedRect(doc, MARGIN, cy, CONTENT_W, 36, 4, '#eef3e8');
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#1a5c1a');
    doc.text('EXEMPTION:', MARGIN + 10, cy + 6, { width: 80 });
    doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
    doc.text('Veterans with a 10%+ service-connected disability rating are exempt from the VA funding fee entirely.', MARGIN + 92, cy + 6, { width: CONTENT_W - 106 });

    cy += 50;

    // Documents Needed
    cy = sectionTitle(doc, 'Documents Needed to Apply', MARGIN, cy);
    const docItems = [
      'Certificate of Eligibility (COE)',
      'DD-214 (for veterans) or Statement of Service (for active duty)',
      'Last 2 years of W-2s and tax returns',
      'Recent pay stubs (last 30 days)',
      'Bank statements (last 2 months)',
      'Valid government-issued ID',
    ];
    docItems.forEach(item => { cy = bulletItem(doc, item, MARGIN, cy); });

    pageFooter(doc, 3);

    // ── Page 4: CTA ────────────────────────────────────────────────────────
    doc.addPage();
    drawCtaPage(doc, 'Ready to Use Your\nVA Benefits?', 'Let me help you navigate the VA loan process from start to finish.\nWhether you\'re buying your first home or your fifth, your benefits are waiting.');

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF 2 — BUYING SIGHT UNSEEN GUIDE (6 pages)
// ═══════════════════════════════════════════════════════════════════════════════

function createSightUnseenGuide(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN }, autoFirstPage: false });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ── Page 1: Cover ──────────────────────────────────────────────────────
    doc.addPage();
    drawCoverPage(doc, 'HOW TO BUY A HOME\nSIGHT UNSEEN', 'A Guide for Military Families & Remote Buyers');

    // ── Page 2: Why Buy Sight Unseen ────────────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'WHY BUY SIGHT UNSEEN?');

    let y = 82;
    doc.font('Times-Roman').fontSize(12).fillColor(DARK_GRAY);
    doc.text('Military families and remote buyers face unique challenges. PCS orders don\'t wait for the perfect house-hunting trip, and in competitive markets, hesitation means missing out. The good news? Technology and the right agent make buying sight unseen not only possible but safe and successful.', MARGIN, y, { width: CONTENT_W, lineGap: 4 });

    y += 80;

    // Reason cards
    const reasons = [
      { title: 'PCS Timelines Don\'t Wait', desc: 'When you receive orders, you often have weeks, not months, to secure housing at your new duty station. Waiting to visit in person can mean scrambling for temporary housing or settling for less.' },
      { title: 'Competitive Markets Move Fast', desc: 'In markets like Jacksonville, desirable homes sell within days. Being able to act quickly from anywhere gives you a decisive advantage over buyers who can only visit in person.' },
      { title: 'Technology Makes It Possible', desc: 'HD video tours, 3D walkthroughs, drone footage, and live video calls mean you can inspect every corner of a home from thousands of miles away. You see what I see, in real time.' },
      { title: 'Proven Track Record', desc: 'Keneshia has helped dozens of military families purchase homes remotely. With deep local knowledge of Jacksonville and NAS Jacksonville, she knows what to look for and what to avoid on your behalf.' },
    ];

    reasons.forEach((r, i) => {
      drawRoundedRect(doc, MARGIN, y, CONTENT_W, 86, 6, i % 2 === 0 ? LIGHT_BG : '#eef4fa');
      doc.save().rect(MARGIN, y, 4, 86).fill(CHAMPAGNE).restore();
      doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
      doc.text(r.title, MARGIN + 18, y + 12, { width: CONTENT_W - 36 });
      doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
      doc.text(r.desc, MARGIN + 18, y + 30, { width: CONTENT_W - 36, lineGap: 2 });
      y += 98;
    });

    pageFooter(doc, 2);

    // ── Page 3: Virtual Tour Checklist ──────────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'VIRTUAL TOUR CHECKLIST');

    y = 78;
    y = sectionTitle(doc, 'What to Look for in a Video Walkthrough', MARGIN, y);
    const walkItems = [
      'Overall condition of flooring, walls, and ceilings',
      'Water stains or signs of damage on ceilings and around windows',
      'Natural lighting throughout the day (ask agent to note time of video)',
      'Room sizes relative to your furniture (ask agent to measure key rooms)',
      'Storage space: closets, garage, attic, and pantry',
      'Age and condition of major systems (HVAC, water heater, roof)',
    ];
    walkItems.forEach(item => { y = bulletItem(doc, item, MARGIN, y); });

    y += 8;
    y = sectionTitle(doc, 'Questions to Ask Your Agent', MARGIN, y);
    const agentQs = [
      'What does the neighborhood sound like? (Traffic, trains, neighbors)',
      'Are there any odors? (Mold, pets, smoke)',
      'What is the parking situation like?',
      'How close are the nearest grocery stores, hospitals, and schools?',
      'What are the HOA rules and fees, if applicable?',
    ];
    agentQs.forEach(item => { y = bulletItem(doc, item, MARGIN, y); });

    y += 8;
    y = sectionTitle(doc, 'Red Flags to Watch For', MARGIN, y);
    const flags = [
      'Seller reluctant to allow video tours or additional photos',
      'Excessive use of wide-angle lenses that distort room sizes',
      'Rooms or areas not shown in the tour',
      'Fresh paint or new carpet only in certain areas (may hide damage)',
      'Price significantly below comparable homes in the area',
    ];
    flags.forEach(item => { y = bulletItem(doc, item, MARGIN, y); });

    y += 8;
    y = sectionTitle(doc, 'Evaluate the Neighborhood Remotely', MARGIN, y);
    const nbhd = [
      'Google Street View: virtually walk the neighborhood and check surroundings',
      'Crime statistics: use CrimeMapping.com or local sheriff reports',
      'School ratings: GreatSchools.org for ratings and parent reviews',
      'Flood zone check: use FEMA flood maps at msc.fema.gov',
    ];
    nbhd.forEach(item => { y = bulletItem(doc, item, MARGIN, y); });

    pageFooter(doc, 3);

    // ── Page 4: The Remote Buying Process ───────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'THE REMOTE BUYING PROCESS');

    y = 82;
    doc.font('Times-Roman').fontSize(11).fillColor(DARK_GRAY);
    doc.text('Buying a home sight unseen follows a proven process. Here\'s exactly how it works when you work with Keneshia:', MARGIN, y, { width: CONTENT_W, lineGap: 3 });
    y += 40;

    const steps = [
      { t: 'Virtual Consultation & Pre-Approval', d: 'We start with a video call to discuss your needs, budget, timeline, and must-haves. I\'ll connect you with VA-savvy lenders to get pre-approved so we\'re ready to move fast.' },
      { t: 'Custom Property Search with Video Tours', d: 'Based on your criteria, I search for properties and send you detailed videos and photos of each one, including the neighborhood, street, and nearby amenities.' },
      { t: 'Live Video Walkthroughs of Top Picks', d: 'For your favorites, I schedule live video walkthroughs via FaceTime or Zoom. You direct the tour, ask questions in real time, and see every detail.' },
      { t: 'Digital Offer Submission', d: 'When you find the one, we submit your offer digitally with e-signatures. I handle all negotiations and keep you updated at every step.' },
      { t: 'Remote Inspections', d: 'I attend the home inspection in person and video call you in real time. You can ask the inspector questions directly and see any issues firsthand.' },
      { t: 'Remote Closing', d: 'Close from anywhere using a mobile notary service or Power of Attorney. Your keys will be waiting when you arrive at your new duty station.' },
    ];
    steps.forEach((s, i) => {
      y = numberedItem(doc, i + 1, s.t, s.d, MARGIN, y, CONTENT_W);
      if (i < steps.length - 1) {
        // Connector line
        doc.save().moveTo(MARGIN + 12, y - 6).lineTo(MARGIN + 12, y + 2).lineWidth(1).strokeColor(CHAMPAGNE).stroke().restore();
        y += 4;
      }
    });

    pageFooter(doc, 4);

    // ── Page 5: Protecting Yourself ─────────────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'PROTECTING YOURSELF');

    y = 82;
    doc.font('Times-Roman').fontSize(11).fillColor(DARK_GRAY);
    doc.text('Buying sight unseen is safe when you have the right protections in place. Here\'s how to safeguard your investment:', MARGIN, y, { width: CONTENT_W, lineGap: 3 });
    y += 38;

    const protections = [
      {
        title: 'Home Inspection is NON-NEGOTIABLE',
        desc: 'Never skip the home inspection, especially when buying sight unseen. A qualified inspector examines the structure, electrical, plumbing, HVAC, roof, and more. I attend in person and video call you during the entire inspection.',
      },
      {
        title: 'Title Insurance Explained',
        desc: 'Title insurance protects you from claims against the property\'s ownership history. It covers issues like unpaid liens, forged documents, or undisclosed heirs. This is a one-time cost at closing and protects you for as long as you own the home.',
      },
      {
        title: 'Appraisal Protects Your Investment',
        desc: 'The VA appraisal ensures you\'re not overpaying. A VA-assigned appraiser determines the fair market value, and if the home appraises below the purchase price, you can renegotiate or walk away.',
      },
      {
        title: 'Contingencies to Include',
        desc: 'Inspection contingency: Allows you to negotiate repairs or exit the contract. Appraisal contingency: Protects you if the home doesn\'t appraise at purchase price. Financing contingency: Protects you if your loan falls through.',
      },
      {
        title: 'When to Use Power of Attorney',
        desc: 'If you cannot be present for closing, a Power of Attorney (POA) allows a trusted person to sign on your behalf. Your lender must approve the POA in advance, and it must be specific to the transaction.',
      },
    ];

    protections.forEach((p, i) => {
      drawRoundedRect(doc, MARGIN, y, CONTENT_W, 0, 6, LIGHT_BG);
      // Calculate height for background
      doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
      const titleH = doc.heightOfString(p.title, { width: CONTENT_W - 28 });
      doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
      const descH = doc.heightOfString(p.desc, { width: CONTENT_W - 28, lineGap: 2 });
      const boxH = titleH + descH + 24;

      drawRoundedRect(doc, MARGIN, y, CONTENT_W, boxH, 6, i % 2 === 0 ? LIGHT_BG : '#eef4fa');
      doc.save().rect(MARGIN, y, 4, boxH).fill(CHAMPAGNE).restore();

      doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
      doc.text(p.title, MARGIN + 16, y + 10, { width: CONTENT_W - 28 });
      doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
      doc.text(p.desc, MARGIN + 16, y + 10 + titleH + 4, { width: CONTENT_W - 28, lineGap: 2 });

      y += boxH + 8;
    });

    pageFooter(doc, 5);

    // ── Page 6: CTA ────────────────────────────────────────────────────────
    doc.addPage();
    drawCtaPage(doc, 'PCS\'ing to Jacksonville?\nLet\'s Start Your Search\nRemotely.', 'I\'ve helped dozens of military families find their perfect home\nwithout ever stepping foot in Jacksonville until move-in day.');

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF 3 — HOME PREP CHECKLIST (4 pages)
// ═══════════════════════════════════════════════════════════════════════════════

function createHomePrepChecklist(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN }, autoFirstPage: false });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ── Page 1: Cover ──────────────────────────────────────────────────────
    doc.addPage();
    drawCoverPage(doc, 'HOME PREP\nCHECKLIST', 'Get Your Home Ready to Sell for Maximum Value');

    // ── Page 2: Room-by-Room Checklist ──────────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'ROOM-BY-ROOM CHECKLIST');

    let y = 76;
    const halfW = (CONTENT_W - 18) / 2;
    const leftX = MARGIN;
    const rightX = MARGIN + halfW + 18;

    // KITCHEN (left column)
    drawRoundedRect(doc, leftX, y, halfW, 188, 6, LIGHT_BG);
    doc.save().rect(leftX, y, halfW, 28).fill(NAVY).restore();
    doc.save().roundedRect(leftX, y, halfW, 28, 6).clip().rect(leftX, y + 14, halfW, 14).fill(NAVY).restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
    doc.text('KITCHEN', leftX + 12, y + 7, { width: halfW - 24 });
    let ky = y + 38;
    const kitchenItems = [
      'Deep clean countertops & appliances',
      'Declutter counters (store small appliances)',
      'Clean inside cabinets & pantry',
      'Fix leaky faucets',
      'Update hardware if outdated',
    ];
    kitchenItems.forEach(item => { ky = checkboxItem(doc, item, leftX + 12, ky, { width: halfW - 24 }); });

    // BATHROOMS (right column)
    drawRoundedRect(doc, rightX, y, halfW, 188, 6, LIGHT_BG);
    doc.save().rect(rightX, y, halfW, 28).fill(NAVY).restore();
    doc.save().roundedRect(rightX, y, halfW, 28, 6).clip().rect(rightX, y + 14, halfW, 14).fill(NAVY).restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
    doc.text('BATHROOMS', rightX + 12, y + 7, { width: halfW - 24 });
    let by = y + 38;
    const bathroomItems = [
      'Deep clean tub, toilet, tile',
      'Re-caulk if needed',
      'Replace worn towels & bath mat',
      'Fix running toilets',
      'Declutter cabinets',
    ];
    bathroomItems.forEach(item => { by = checkboxItem(doc, item, rightX + 12, by, { width: halfW - 24 }); });

    y += 202;

    // LIVING AREAS (left column)
    drawRoundedRect(doc, leftX, y, halfW, 206, 6, '#eef4fa');
    doc.save().rect(leftX, y, halfW, 28).fill(NAVY).restore();
    doc.save().roundedRect(leftX, y, halfW, 28, 6).clip().rect(leftX, y + 14, halfW, 14).fill(NAVY).restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
    doc.text('LIVING AREAS', leftX + 12, y + 7, { width: halfW - 24 });
    let ly = y + 38;
    const livingItems = [
      'Remove excess furniture',
      'Clean carpets / polish hardwoods',
      'Wash windows inside & out',
      'Repair nail holes, touch up paint',
      'Organize closets (buyers look!)',
    ];
    livingItems.forEach(item => { ly = checkboxItem(doc, item, leftX + 12, ly, { width: halfW - 24 }); });

    // BEDROOMS (right column)
    drawRoundedRect(doc, rightX, y, halfW, 206, 6, '#eef4fa');
    doc.save().rect(rightX, y, halfW, 28).fill(NAVY).restore();
    doc.save().roundedRect(rightX, y, halfW, 28, 6).clip().rect(rightX, y + 14, halfW, 14).fill(NAVY).restore();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
    doc.text('BEDROOMS', rightX + 12, y + 7, { width: halfW - 24 });
    let bry = y + 38;
    const bedroomItems = [
      'Make beds with neutral bedding',
      'Declutter nightstands & dressers',
      'Remove personal photos',
      'Ensure closets look spacious',
      'Clean under beds',
    ];
    bedroomItems.forEach(item => { bry = checkboxItem(doc, item, rightX + 12, bry, { width: halfW - 24 }); });

    // Pro tip at bottom
    y += 222;
    drawRoundedRect(doc, MARGIN, y, CONTENT_W, 46, 6, NAVY);
    doc.save().rect(MARGIN, y, 4, 46).fill(CHAMPAGNE).restore();
    doc.font('Helvetica-Bold').fontSize(10).fillColor(CHAMPAGNE);
    doc.text('PRO TIP:', MARGIN + 16, y + 8, { width: CONTENT_W - 32 });
    doc.font('Helvetica').fontSize(9.5).fillColor(WHITE);
    doc.text('Start decluttering 2-3 weeks before listing photos. Less clutter = rooms look bigger = faster sale at a higher price.', MARGIN + 16, y + 24, { width: CONTENT_W - 32 });

    pageFooter(doc, 2);

    // ── Page 3: Curb Appeal & Exterior ──────────────────────────────────────
    doc.addPage();
    pageHeader(doc, 'CURB APPEAL & EXTERIOR');

    y = 78;
    doc.font('Times-Roman').fontSize(11).fillColor(DARK_GRAY);
    doc.text('First impressions matter. Buyers often decide within seconds of pulling up to a home. Make those seconds count.', MARGIN, y, { width: CONTENT_W, lineGap: 3 });
    y += 36;

    // Exterior checklist card
    drawRoundedRect(doc, MARGIN, y, CONTENT_W, 310, 6, LIGHT_BG);
    doc.save().rect(MARGIN, y, CONTENT_W, 30).fill(NAVY).restore();
    doc.save().roundedRect(MARGIN, y, CONTENT_W, 30, 6).clip().rect(MARGIN, y + 16, CONTENT_W, 14).fill(NAVY).restore();
    doc.font('Helvetica-Bold').fontSize(12).fillColor(WHITE);
    doc.text('EXTERIOR & CURB APPEAL', MARGIN + 14, y + 8, { width: CONTENT_W - 28 });

    let ey = y + 42;
    const extLeftX = MARGIN + 14;
    const extRightX = MARGIN + CONTENT_W / 2 + 8;
    const extW = CONTENT_W / 2 - 22;

    const extLeftItems = [
      'Power wash driveway & walkways',
      'Mow, edge, and mulch landscaping',
      'Paint or stain front door',
      'Clean/replace mailbox',
      'Add potted plants or flowers',
    ];
    const extRightItems = [
      'Repair cracked walkways',
      'Clean gutters',
      'Touch up exterior paint',
      'Replace burned-out light bulbs',
      'Remove personal items from yard',
    ];

    let elY = ey;
    extLeftItems.forEach(item => { elY = checkboxItem(doc, item, extLeftX, elY, { width: extW }); });
    let erY = ey;
    extRightItems.forEach(item => { erY = checkboxItem(doc, item, extRightX, erY, { width: extW }); });

    y += 310 + 16;

    // Garage section
    drawRoundedRect(doc, MARGIN, y, CONTENT_W, 120, 6, '#eef4fa');
    doc.save().rect(MARGIN, y, CONTENT_W, 30).fill(NAVY).restore();
    doc.save().roundedRect(MARGIN, y, CONTENT_W, 30, 6).clip().rect(MARGIN, y + 16, CONTENT_W, 14).fill(NAVY).restore();
    doc.font('Helvetica-Bold').fontSize(12).fillColor(WHITE);
    doc.text('GARAGE', MARGIN + 14, y + 8, { width: CONTENT_W - 28 });

    let gy = y + 42;
    const garageItems = [
      'Organize and declutter',
      'Sweep/power wash floor',
      'Ensure door operates smoothly',
    ];
    garageItems.forEach(item => { gy = checkboxItem(doc, item, MARGIN + 14, gy, { width: CONTENT_W - 28 }); });

    // Did you know box
    y += 136;
    drawRoundedRect(doc, MARGIN, y, CONTENT_W, 56, 6, NAVY);
    doc.save().rect(MARGIN, y, 4, 56).fill(CHAMPAGNE).restore();
    doc.font('Helvetica-Bold').fontSize(10).fillColor(CHAMPAGNE);
    doc.text('DID YOU KNOW?', MARGIN + 16, y + 8, { width: CONTENT_W - 32 });
    doc.font('Helvetica').fontSize(9.5).fillColor(WHITE);
    doc.text('According to the National Association of Realtors, good curb appeal can add 5-11% to a home\'s perceived value. A few hundred dollars in landscaping and paint can yield thousands in return.', MARGIN + 16, y + 24, { width: CONTENT_W - 32, lineGap: 2 });

    pageFooter(doc, 3);

    // ── Page 4: CTA ────────────────────────────────────────────────────────
    doc.addPage();
    drawCtaPage(doc, 'Want a Professional Eye?', 'I offer a free, in-person walkthrough of your home\nwith specific recommendations to maximize your sale price.\nLet\'s get your home show-ready together.');

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Generate all three PDFs
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const guidesDir = path.join(__dirname, '..', 'guides');

  // Ensure guides directory exists
  if (!fs.existsSync(guidesDir)) {
    fs.mkdirSync(guidesDir, { recursive: true });
  }

  console.log('==============================================');
  console.log('  Keneshia Haye - PDF Guide Generator');
  console.log('==============================================\n');

  const guides = [
    {
      name: 'VA Loan Benefits Cheat Sheet',
      file: 'va-loan-benefits-cheat-sheet.pdf',
      fn: createVALoanGuide,
      pages: 4,
    },
    {
      name: 'Buying Sight Unseen Guide',
      file: 'buying-sight-unseen-guide.pdf',
      fn: createSightUnseenGuide,
      pages: 6,
    },
    {
      name: 'Home Prep Checklist',
      file: 'home-prep-checklist.pdf',
      fn: createHomePrepChecklist,
      pages: 4,
    },
  ];

  for (const guide of guides) {
    const outputPath = path.join(guidesDir, guide.file);
    process.stdout.write(`  Creating: ${guide.name} (${guide.pages} pages)... `);
    try {
      await guide.fn(outputPath);
      console.log('OK');
    } catch (err) {
      console.log('FAILED');
      console.error(`    Error: ${err.message}`);
    }
  }

  console.log('\n----------------------------------------------');
  console.log('  All guides created in: guides/');
  console.log('----------------------------------------------\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
