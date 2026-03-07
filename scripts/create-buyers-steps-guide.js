/**
 * Buyer's Step-by-Step Guide PDF Generator
 * Creates a professional 8-page guide for Keneshia Haye — REALTOR
 * Uses PDFKit with built-in fonts only
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Output path
const outputDir = path.join(__dirname, '..', 'guides');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'buyers-step-by-step-guide.pdf');

// Colors
const NAVY = '#0a1628';
const CHAMPAGNE = '#c9a96e';
const WHITE = '#ffffff';
const DARK_GRAY = '#333333';
const LIGHT_BG = '#f4f1ec';
const CHAMPAGNE_LIGHT = '#e8dcc8';
const NAVY_LIGHT = '#1a2a45';
const ACCENT_BLUE = '#1e3a5f';

// Page dimensions (US Letter)
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const doc = new PDFDocument({
  size: 'letter',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  info: {
    Title: "Buyer's Step-by-Step Guide",
    Author: 'Keneshia Haye — REALTOR',
    Subject: 'The Complete Home Buying Journey in Jacksonville, FL',
    Creator: 'Florida Gateway Realty',
  },
  autoFirstPage: false,
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ─── Helper Functions ───────────────────────────────────────────────

function drawNavyBackground() {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(NAVY);
}

function drawWhiteBackground() {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(WHITE);
}

function drawTopBanner(height = 120) {
  doc.rect(0, 0, PAGE_W, height).fill(NAVY);
}

function drawChampagneLine(x, y, width, thickness = 2) {
  doc.rect(x, y, width, thickness).fill(CHAMPAGNE);
}

function drawChampagneDiamond(cx, cy, size = 6) {
  doc.save();
  doc.translate(cx, cy);
  doc.rotate(45);
  doc.rect(-size / 2, -size / 2, size, size).fill(CHAMPAGNE);
  doc.restore();
}

function drawStepBadge(x, y, stepNum) {
  // Circle background
  doc.circle(x, y, 22).fill(CHAMPAGNE);
  doc.circle(x, y, 18).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
  doc.text(String(stepNum), x - 8, y - 7, { width: 16, align: 'center' });
}

function drawCheckbox(x, y, size = 10) {
  doc.rect(x, y, size, size).lineWidth(1.2).strokeColor(CHAMPAGNE).stroke();
}

function drawBullet(x, y, radius = 3) {
  doc.circle(x + radius, y + radius, radius).fill(CHAMPAGNE);
}

function drawBulletItem(x, y, text, opts = {}) {
  const fontSize = opts.fontSize || 10.5;
  const maxWidth = opts.maxWidth || CONTENT_W - 30;
  drawBullet(x, y + 2, 3);
  doc.font('Helvetica').fontSize(fontSize).fillColor(DARK_GRAY);
  doc.text(text, x + 14, y, { width: maxWidth, lineGap: 2 });
  return doc.y + 4;
}

function drawSubBulletItem(x, y, text, opts = {}) {
  const fontSize = opts.fontSize || 10;
  const maxWidth = opts.maxWidth || CONTENT_W - 50;
  doc.fontSize(8).fillColor(CHAMPAGNE).text('\u2013', x + 6, y + 1, { continued: false });
  doc.font('Helvetica').fontSize(fontSize).fillColor(DARK_GRAY);
  doc.text(text, x + 20, y, { width: maxWidth, lineGap: 2 });
  return doc.y + 3;
}

function drawSectionTitle(y, title) {
  doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY);
  doc.text(title, MARGIN, y, { width: CONTENT_W });
  const titleBottom = doc.y + 2;
  drawChampagneLine(MARGIN, titleBottom, 60, 2);
  return titleBottom + 10;
}

function drawQuoteBox(y, quoteText) {
  const boxH = 52;
  const boxY = y;
  // Light background with champagne left border
  doc.roundedRect(MARGIN, boxY, CONTENT_W, boxH, 4).fill(LIGHT_BG);
  doc.rect(MARGIN, boxY, 4, boxH).fill(CHAMPAGNE);
  // Quote text
  doc.font('Times-Roman').fontSize(11).fillColor(NAVY);
  doc.text(`"${quoteText}"`, MARGIN + 18, boxY + 10, {
    width: CONTENT_W - 36,
    align: 'left',
  });
  // Attribution
  doc.font('Helvetica').fontSize(8.5).fillColor(CHAMPAGNE);
  doc.text('— Keneshia Haye', MARGIN + 18, doc.y + 2, { width: CONTENT_W - 36 });
  return boxY + boxH + 12;
}

function drawPageFooter(pageNum) {
  const footerY = PAGE_H - 36;
  drawChampagneLine(MARGIN, footerY, CONTENT_W, 0.5);
  doc.font('Helvetica').fontSize(7.5).fillColor('#999999');
  doc.text('Keneshia Haye | Florida Gateway Realty | (254) 449-5299', MARGIN, footerY + 6, {
    width: CONTENT_W / 2,
    align: 'left',
  });
  doc.text(`${pageNum}`, MARGIN + CONTENT_W / 2, footerY + 6, {
    width: CONTENT_W / 2,
    align: 'right',
  });
}

function drawPageHeader(stepNum, stepTitle) {
  drawTopBanner(88);
  // Step badge in banner
  drawStepBadge(MARGIN + 22, 44, stepNum);
  // Step label
  doc.font('Helvetica').fontSize(10).fillColor(CHAMPAGNE);
  doc.text(`STEP ${stepNum}`, MARGIN + 52, 28);
  // Title
  doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE);
  doc.text(stepTitle, MARGIN + 52, 44, { width: CONTENT_W - 60 });
  // Champagne accent line at bottom of banner
  drawChampagneLine(0, 88, PAGE_W, 3);
  return 106;
}

// ─── PAGE 1: Cover ──────────────────────────────────────────────────

function createCoverPage() {
  doc.addPage();
  drawNavyBackground();

  // Top decorative champagne line
  drawChampagneLine(0, 0, PAGE_W, 4);

  // Decorative corner accents (top-left)
  doc.moveTo(MARGIN, 30).lineTo(MARGIN, 60).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(MARGIN, 30).lineTo(MARGIN + 30, 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();

  // Decorative corner accents (top-right)
  doc.moveTo(PAGE_W - MARGIN, 30).lineTo(PAGE_W - MARGIN, 60).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, 30).lineTo(PAGE_W - MARGIN - 30, 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();

  // Top subtitle
  doc.font('Helvetica').fontSize(10).fillColor(CHAMPAGNE);
  doc.text('FLORIDA GATEWAY REALTY', 0, 100, { width: PAGE_W, align: 'center', characterSpacing: 4 });

  // Champagne decorative line
  drawChampagneLine(PAGE_W / 2 - 80, 125, 160, 1);
  drawChampagneDiamond(PAGE_W / 2, 125.5, 5);

  // Main title
  doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE);
  doc.text("BUYER'S", 0, 170, { width: PAGE_W, align: 'center', characterSpacing: 6 });
  doc.text('STEP-BY-STEP', 0, 218, { width: PAGE_W, align: 'center', characterSpacing: 6 });
  doc.text('GUIDE', 0, 266, { width: PAGE_W, align: 'center', characterSpacing: 6 });

  // Champagne decorative line
  drawChampagneLine(PAGE_W / 2 - 100, 320, 200, 1.5);
  drawChampagneDiamond(PAGE_W / 2, 320.75, 5);

  // Subtitle
  doc.font('Times-Roman').fontSize(16).fillColor(CHAMPAGNE);
  doc.text('The Complete Home Buying Journey', 0, 350, { width: PAGE_W, align: 'center' });
  doc.text('in Jacksonville, FL', 0, 372, { width: PAGE_W, align: 'center' });

  // Decorative box around author section
  const boxY = 430;
  const boxH = 100;
  const boxW = 360;
  const boxX = (PAGE_W - boxW) / 2;
  doc.roundedRect(boxX, boxY, boxW, boxH, 2).lineWidth(0.8).strokeColor(CHAMPAGNE).stroke();

  // Author info
  doc.font('Helvetica-Bold').fontSize(13).fillColor(WHITE);
  doc.text('By Keneshia Haye', 0, boxY + 18, { width: PAGE_W, align: 'center' });
  doc.font('Helvetica').fontSize(10.5).fillColor(CHAMPAGNE);
  doc.text('REALTOR\u00AE & U.S. Military Veteran', 0, boxY + 40, { width: PAGE_W, align: 'center' });

  drawChampagneLine(boxX + 40, boxY + 60, boxW - 80, 0.5);

  doc.font('Helvetica').fontSize(10).fillColor(WHITE);
  doc.text('Florida Gateway Realty | (254) 449-5299', 0, boxY + 72, { width: PAGE_W, align: 'center' });

  // Bottom section - six step preview
  const stepsY = 575;
  doc.font('Helvetica').fontSize(8).fillColor(CHAMPAGNE);
  doc.text('YOUR 6-STEP ROADMAP', 0, stepsY - 20, { width: PAGE_W, align: 'center', characterSpacing: 3 });
  drawChampagneLine(PAGE_W / 2 - 60, stepsY - 6, 120, 0.5);

  const stepLabels = ['Define Goals', 'Get Finances Ready', 'Search & Tour', 'Offer & Negotiate', 'Due Diligence', 'Close & Keys!'];
  const stepStartX = 68;
  const stepSpacing = 82;
  for (let i = 0; i < 6; i++) {
    const sx = stepStartX + i * stepSpacing;
    // Small circle with number
    doc.circle(sx, stepsY + 14, 14).lineWidth(1).strokeColor(CHAMPAGNE).stroke();
    doc.font('Helvetica-Bold').fontSize(11).fillColor(CHAMPAGNE);
    doc.text(String(i + 1), sx - 5, stepsY + 8, { width: 10, align: 'center' });
    // Label
    doc.font('Helvetica').fontSize(7).fillColor('#aaaaaa');
    doc.text(stepLabels[i], sx - 28, stepsY + 34, { width: 56, align: 'center' });
    // Connecting line
    if (i < 5) {
      doc.moveTo(sx + 15, stepsY + 14).lineTo(sx + stepSpacing - 15, stepsY + 14)
        .lineWidth(0.5).strokeColor('#3a5070').stroke();
    }
  }

  // Bottom decorative corners
  const bCornerY = PAGE_H - 50;
  doc.moveTo(MARGIN, bCornerY).lineTo(MARGIN, bCornerY - 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(MARGIN, bCornerY).lineTo(MARGIN + 30, bCornerY).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, bCornerY).lineTo(PAGE_W - MARGIN, bCornerY - 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, bCornerY).lineTo(PAGE_W - MARGIN - 30, bCornerY).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();

  // Bottom champagne line
  drawChampagneLine(0, PAGE_H - 4, PAGE_W, 4);
}

// ─── PAGE 2: Step 1 — Define Your Goals ─────────────────────────────

function createPage2() {
  doc.addPage();
  drawWhiteBackground();
  let y = drawPageHeader(1, 'Define Your Goals');

  // Intro text
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'Before you begin your home search, it is essential to clearly define what you are looking for. This foundation ensures we find the right property faster and avoid wasting your time.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 14;

  // Section: What kind of home?
  y = drawSectionTitle(y, 'What Kind of Home Are You Looking For?');
  const homeTypes = ['Single-Family Home', 'Townhouse', 'Condominium', 'Multi-Family / Investment Property'];
  homeTypes.forEach((type) => {
    drawCheckbox(MARGIN + 8, y + 1);
    doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
    doc.text(type, MARGIN + 26, y, { width: CONTENT_W - 40 });
    y = doc.y + 6;
  });
  y += 6;

  // Neighborhoods
  y = drawSectionTitle(y, 'What Neighborhoods Interest You?');
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'Jacksonville offers diverse communities. Consider proximity to work, schools, dining, and lifestyle. We will explore options that match your priorities.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 10;

  // Two blank lines for writing
  for (let i = 0; i < 2; i++) {
    doc.moveTo(MARGIN + 8, y).lineTo(PAGE_W - MARGIN - 8, y)
      .lineWidth(0.5).strokeColor('#cccccc').stroke();
    y += 22;
  }
  y += 4;

  // Timeline
  y = drawSectionTitle(y, 'Your Timeline & Budget');
  y = drawBulletItem(MARGIN + 8, y, 'When do you want to move in? (Immediately / 1-3 months / 3-6 months / 6+ months)');
  y = drawBulletItem(MARGIN + 8, y, 'What is your comfortable monthly payment range?');
  y = drawBulletItem(MARGIN + 8, y, 'Have you started saving for a down payment and closing costs?');
  y += 10;

  // Must-haves vs. Nice-to-haves
  y = drawSectionTitle(y, 'Must-Haves vs. Nice-to-Haves Worksheet');

  // Two column headers
  const col1X = MARGIN;
  const col2X = MARGIN + CONTENT_W / 2 + 8;
  const colW = CONTENT_W / 2 - 8;

  // Column backgrounds
  doc.roundedRect(col1X, y, colW, 150, 4).fill(LIGHT_BG);
  doc.roundedRect(col2X, y, colW, 150, 4).fill('#faf8f5');

  // Column headers
  doc.rect(col1X, y, colW, 26).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE);
  doc.text('MUST-HAVES', col1X + 10, y + 7, { width: colW - 20 });

  doc.rect(col2X, y, colW, 26).fill(ACCENT_BLUE);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE);
  doc.text('NICE-TO-HAVES', col2X + 10, y + 7, { width: colW - 20 });

  // Checkboxes in each column
  const mustHaves = ['Bedrooms: ____', 'Bathrooms: ____', 'Garage / Parking', 'Yard / Outdoor space', 'Updated kitchen'];
  const niceToHaves = ['Pool', 'Home office / bonus room', 'Walk-in closets', 'Screened porch', 'Smart home features'];

  let rowY = y + 34;
  for (let i = 0; i < 5; i++) {
    drawCheckbox(col1X + 10, rowY);
    doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
    doc.text(mustHaves[i], col1X + 28, rowY, { width: colW - 40 });

    drawCheckbox(col2X + 10, rowY);
    doc.text(niceToHaves[i], col2X + 28, rowY, { width: colW - 40 });
    rowY += 22;
  }

  y = y + 150 + 14;

  // Quote
  drawQuoteBox(y, 'This is where we start our first conversation together.');

  drawPageFooter(2);
}

// ─── PAGE 3: Step 2 — Get Financially Ready ─────────────────────────

function createPage3() {
  doc.addPage();
  drawWhiteBackground();
  let y = drawPageHeader(2, 'Get Financially Ready');

  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'Getting your finances in order is one of the most important steps. A strong financial position gives you confidence and negotiating power.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 14;

  // Credit Score
  y = drawSectionTitle(y, 'Check Your Credit Score');
  y = drawBulletItem(MARGIN + 8, y, 'Get your free annual report at annualcreditreport.com');
  y = drawBulletItem(MARGIN + 8, y, 'Review all three bureaus: Equifax, Experian, TransUnion');
  y = drawBulletItem(MARGIN + 8, y, 'Dispute any errors before applying for a mortgage');
  y = drawBulletItem(MARGIN + 8, y, 'Aim for 620+ (conventional) or 580+ (FHA)');
  y += 8;

  // DTI
  y = drawSectionTitle(y, 'Calculate Your Debt-to-Income Ratio');
  y = drawBulletItem(MARGIN + 8, y, 'Add up all monthly debts (car, student loans, credit cards)');
  y = drawBulletItem(MARGIN + 8, y, 'Divide total debts by gross monthly income');
  y = drawBulletItem(MARGIN + 8, y, 'Target: 43% or less for most loan programs');
  y += 8;

  // Down Payment
  y = drawSectionTitle(y, 'Save for Down Payment & Closing Costs');

  // Loan type comparison box
  const boxY = y;
  const boxH = 118;
  doc.roundedRect(MARGIN, boxY, CONTENT_W, boxH, 6).fill(LIGHT_BG);
  doc.rect(MARGIN, boxY, CONTENT_W, 24).fill(NAVY);
  doc.roundedRect(MARGIN, boxY, CONTENT_W, 24, 6).fill(NAVY);
  // Fix bottom corners of header
  doc.rect(MARGIN, boxY + 12, CONTENT_W, 12).fill(NAVY);

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(WHITE);
  doc.text('LOAN TYPE', MARGIN + 12, boxY + 6);
  doc.text('DOWN PAYMENT', MARGIN + 160, boxY + 6);
  doc.text('BEST FOR', MARGIN + 320, boxY + 6);

  const loanData = [
    ['Conventional', '3 \u2013 20%', 'Buyers with good credit & savings'],
    ['FHA', '3.5%', 'First-time buyers, lower credit scores'],
    ['VA', '$0 down', 'Veterans & active military'],
    ['USDA', '$0 down', 'Rural area homebuyers'],
  ];

  let loanY = boxY + 30;
  loanData.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.rect(MARGIN + 2, loanY - 2, CONTENT_W - 4, 20).fill('#ece7de');
    }
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NAVY);
    doc.text(row[0], MARGIN + 12, loanY + 2);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(CHAMPAGNE);
    doc.text(row[1], MARGIN + 160, loanY + 2);
    doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
    doc.text(row[2], MARGIN + 320, loanY + 2);
    loanY += 22;
  });

  y = boxY + boxH + 14;

  // Pre-approval
  y = drawSectionTitle(y, 'Get Pre-Approved');
  y = drawBulletItem(MARGIN + 8, y, 'Gather documents: pay stubs, W-2s, tax returns, bank statements');
  y = drawBulletItem(MARGIN + 8, y, 'Apply with a reputable local lender (I have trusted recommendations)');
  y = drawBulletItem(MARGIN + 8, y, 'Pre-approval is typically valid for 60-90 days');
  y += 8;

  // Quote
  drawQuoteBox(y, 'Pre-approval letter = your golden ticket in a competitive market.');

  drawPageFooter(3);
}

// ─── PAGE 4: Step 3 — Search & Tour Homes ───────────────────────────

function createPage4() {
  doc.addPage();
  drawWhiteBackground();
  let y = drawPageHeader(3, 'Search & Tour Homes');

  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'Now the fun begins! With your pre-approval in hand, we can start searching for your dream home. Here is how I make the process seamless.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 12;

  // How I search
  y = drawSectionTitle(y, 'How Keneshia Searches on Your Behalf');
  y = drawBulletItem(MARGIN + 8, y, 'Custom MLS alerts set specifically to your criteria');
  y = drawBulletItem(MARGIN + 8, y, 'Daily monitoring for new listings, price drops, and back-on-market homes');
  y = drawBulletItem(MARGIN + 8, y, 'Off-market and coming-soon opportunities through my network');
  y += 6;

  // Touring tips
  y = drawSectionTitle(y, 'Touring Tips: What to Look For');
  y = drawBulletItem(MARGIN + 8, y, 'Structural integrity: walls, ceilings, foundation cracks');
  y = drawBulletItem(MARGIN + 8, y, 'Water pressure, plumbing, and electrical panel condition');
  y = drawBulletItem(MARGIN + 8, y, 'Natural light, layout flow, and storage space');
  y = drawBulletItem(MARGIN + 8, y, 'Neighborhood feel: drive by at different times of day');
  y = drawBulletItem(MARGIN + 8, y, 'Take notes and photos during every tour for easy comparison');
  y += 6;

  // Jacksonville Neighborhoods
  y = drawSectionTitle(y, 'Jacksonville Neighborhoods Spotlight');

  const neighborhoods = [
    ['Riverside / Avondale', '$250K \u2013 $500K+', 'Historic charm, walkable, restaurants & arts'],
    ['Orange Park', '$200K \u2013 $400K', 'Family-friendly, suburban, great schools'],
    ['Mandarin', '$250K \u2013 $450K', 'Established community, parks, top-rated schools'],
    ['Ponte Vedra', '$400K \u2013 $1M+', 'Luxury coastal living, golf, beaches'],
    ['Arlington', '$150K \u2013 $300K', 'Affordable, revitalizing area, close to downtown'],
    ['Westside', '$175K \u2013 $350K', 'Growing area, new construction, NAS Jax access'],
  ];

  // Table
  const tableY = y;
  const rowH = 22;
  const tableH = 24 + neighborhoods.length * rowH + 4;

  doc.roundedRect(MARGIN, tableY, CONTENT_W, tableH, 4).fill(LIGHT_BG);

  // Header row
  doc.rect(MARGIN, tableY, CONTENT_W, 24).fill(NAVY);
  doc.roundedRect(MARGIN, tableY, CONTENT_W, 24, 4).fill(NAVY);
  doc.rect(MARGIN, tableY + 10, CONTENT_W, 14).fill(NAVY);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE);
  doc.text('NEIGHBORHOOD', MARGIN + 10, tableY + 7);
  doc.text('PRICE RANGE', MARGIN + 180, tableY + 7);
  doc.text('HIGHLIGHTS', MARGIN + 320, tableY + 7);

  let tY = tableY + 28;
  neighborhoods.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.rect(MARGIN + 2, tY - 3, CONTENT_W - 4, rowH).fill('#ece7de');
    }
    doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY);
    doc.text(row[0], MARGIN + 10, tY + 1);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(CHAMPAGNE);
    doc.text(row[1], MARGIN + 180, tY + 1);
    doc.font('Helvetica').fontSize(8.5).fillColor(DARK_GRAY);
    doc.text(row[2], MARGIN + 320, tY + 1, { width: CONTENT_W - 330 });
    tY += rowH;
  });

  y = tableY + tableH + 8;

  doc.font('Helvetica').fontSize(9).fillColor('#777777');
  doc.text('* Price ranges are approximate and based on recent market data. Actual prices vary.', MARGIN, y, { width: CONTENT_W });
  y = doc.y + 10;

  drawPageFooter(4);
}

// ─── PAGE 5: Step 4 — Make an Offer & Negotiate ─────────────────────

function createPage5() {
  doc.addPage();
  drawWhiteBackground();
  let y = drawPageHeader(4, 'Make an Offer & Negotiate');

  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'When you find the right home, it is time to act strategically. I will guide you through every detail to craft a winning offer.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 14;

  // Competitive offer
  y = drawSectionTitle(y, 'How to Write a Competitive Offer');
  y = drawBulletItem(MARGIN + 8, y, 'I run a comparative market analysis (CMA) to determine fair value');
  y = drawBulletItem(MARGIN + 8, y, 'Offer price strategy based on market conditions and seller motivation');
  y = drawBulletItem(MARGIN + 8, y, 'Include your pre-approval letter to show you are a serious buyer');
  y = drawBulletItem(MARGIN + 8, y, 'Clean terms and flexible closing date can make your offer stand out');
  y += 8;

  // Earnest money
  y = drawSectionTitle(y, 'Understanding Earnest Money');

  // Info box
  const emBoxY = y;
  doc.roundedRect(MARGIN, emBoxY, CONTENT_W, 54, 4).fill(LIGHT_BG);
  doc.rect(MARGIN, emBoxY, 4, 54).fill(CHAMPAGNE);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
  doc.text('Earnest Money Deposit (EMD)', MARGIN + 16, emBoxY + 8, { width: CONTENT_W - 30 });
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
  doc.text(
    'Typically 1\u20132% of the purchase price. This deposit shows the seller you are serious and is held in escrow. It is applied toward your closing costs or down payment at closing.',
    MARGIN + 16, emBoxY + 24, { width: CONTENT_W - 30, lineGap: 2 }
  );
  y = emBoxY + 62;

  // Escalation clauses
  y = drawSectionTitle(y, 'Escalation Clauses & Competitive Markets');
  y = drawBulletItem(MARGIN + 8, y, 'An escalation clause automatically raises your offer in set increments above competing bids');
  y = drawBulletItem(MARGIN + 8, y, 'Set a maximum cap so you never pay more than you are comfortable with');
  y = drawBulletItem(MARGIN + 8, y, 'I advise when escalation clauses are appropriate for the situation');
  y += 8;

  // Negotiation strategies
  y = drawSectionTitle(y, 'Negotiation Strategies That Win');
  y = drawBulletItem(MARGIN + 8, y, 'Request seller concessions: closing cost credits, home warranty, repairs');
  y = drawBulletItem(MARGIN + 8, y, 'Strategic contingency management (inspection, financing, appraisal)');
  y = drawBulletItem(MARGIN + 8, y, 'Personal appeal: sometimes a thoughtful letter makes the difference');
  y = drawBulletItem(MARGIN + 8, y, 'Know when to walk away \u2014 there is always another house');
  y += 10;

  // Quote
  drawQuoteBox(y, 'I have negotiated savings averaging $12K for my buyers.');

  drawPageFooter(5);
}

// ─── PAGE 6: Step 5 — Due Diligence ─────────────────────────────────

function createPage6() {
  doc.addPage();
  drawWhiteBackground();
  let y = drawPageHeader(5, 'Due Diligence');

  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'Once your offer is accepted, we enter due diligence \u2014 the critical period to verify the condition and value of the property before you commit.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 12;

  // Home Inspection
  y = drawSectionTitle(y, 'Home Inspection');
  y = drawBulletItem(MARGIN + 8, y, 'A licensed inspector examines the entire property (typically $300\u2013$500)');
  y = drawBulletItem(MARGIN + 8, y, 'Areas checked: roof, HVAC, plumbing, electrical, foundation, appliances');
  y = drawBulletItem(MARGIN + 8, y, 'You receive a detailed report with photos and recommendations');
  y = drawBulletItem(MARGIN + 8, y, 'We can negotiate repairs or credits based on findings');
  y += 6;

  // Appraisal
  y = drawSectionTitle(y, 'Appraisal');
  y = drawBulletItem(MARGIN + 8, y, 'Required by your lender to confirm the home is worth the purchase price');
  y = drawBulletItem(MARGIN + 8, y, 'If the appraisal comes in low, we have options:');
  y = drawSubBulletItem(MARGIN + 20, y, 'Negotiate a lower price with the seller');
  y = drawSubBulletItem(MARGIN + 20, y, 'Make up the difference in cash');
  y = drawSubBulletItem(MARGIN + 20, y, 'Challenge the appraisal with comparable sales data');
  y += 6;

  // Title & Insurance
  y = drawSectionTitle(y, 'Title Search, Survey & Insurance');
  y = drawBulletItem(MARGIN + 8, y, 'Title search ensures there are no liens, disputes, or ownership issues');
  y = drawBulletItem(MARGIN + 8, y, 'Title insurance protects you against future claims');
  y = drawBulletItem(MARGIN + 8, y, 'Survey confirms property boundaries (may be required by lender)');
  y += 6;

  // Florida-specific insurance
  y = drawSectionTitle(y, 'Florida-Specific Insurance Considerations');

  // Warning-style box
  const insBoxY = y;
  const insBoxH = 70;
  doc.roundedRect(MARGIN, insBoxY, CONTENT_W, insBoxH, 4).fill('#fff8ee');
  doc.rect(MARGIN, insBoxY, 4, insBoxH).fill('#e8a020');

  doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
  doc.text('Important for Florida Buyers', MARGIN + 16, insBoxY + 8);
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
  doc.text(
    'Florida requires special insurance considerations. Get quotes early for homeowners insurance, windstorm coverage, and flood insurance (if in a flood zone). Rates vary significantly by location, so factor these into your budget.',
    MARGIN + 16, insBoxY + 24, { width: CONTENT_W - 30, lineGap: 2 }
  );
  y = insBoxY + insBoxH + 14;

  // Quote
  drawQuoteBox(y, 'I attend every inspection and protect your interests.');

  drawPageFooter(6);
}

// ─── PAGE 7: Step 6 — Close & Get Your Keys! ────────────────────────

function createPage7() {
  doc.addPage();
  drawWhiteBackground();
  let y = drawPageHeader(6, 'Close & Get Your Keys!');

  doc.font('Helvetica').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(
    'You have made it to the finish line! Here is everything you need to know about the closing process and what to expect.',
    MARGIN, y, { width: CONTENT_W, lineGap: 3 }
  );
  y = doc.y + 12;

  // Final Walkthrough
  y = drawSectionTitle(y, 'Final Walkthrough Checklist');
  const walkthroughItems = [
    'All agreed-upon repairs have been completed',
    'Appliances and systems are working properly',
    'No new damage since the inspection',
    'All personal property per contract is present',
    'Utilities are functioning (lights, water, HVAC)',
  ];
  walkthroughItems.forEach((item) => {
    drawCheckbox(MARGIN + 8, y + 1);
    doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
    doc.text(item, MARGIN + 26, y, { width: CONTENT_W - 40 });
    y = doc.y + 5;
  });
  y += 6;

  // What to bring
  y = drawSectionTitle(y, 'What to Bring to Closing');
  y = drawBulletItem(MARGIN + 8, y, 'Valid government-issued photo ID');
  y = drawBulletItem(MARGIN + 8, y, 'Cashier\'s check or proof of wire transfer for closing funds');
  y = drawBulletItem(MARGIN + 8, y, 'Proof of homeowners insurance');
  y += 6;

  // Closing Cost Breakdown
  y = drawSectionTitle(y, 'Closing Cost Breakdown');
  const closingCosts = [
    ['Loan origination fees', '0.5 \u2013 1% of loan'],
    ['Appraisal fee', '$300 \u2013 $600'],
    ['Title insurance & search', '$1,000 \u2013 $2,500'],
    ['Home inspection', '$300 \u2013 $500'],
    ['Prepaid taxes & insurance', 'Varies'],
    ['Recording fees', '$50 \u2013 $250'],
  ];

  const ccBoxY = y;
  const ccRowH = 20;
  const ccBoxH = 24 + closingCosts.length * ccRowH + 4;
  doc.roundedRect(MARGIN, ccBoxY, CONTENT_W, ccBoxH, 4).fill(LIGHT_BG);

  doc.rect(MARGIN, ccBoxY, CONTENT_W, 24).fill(NAVY);
  doc.roundedRect(MARGIN, ccBoxY, CONTENT_W, 24, 4).fill(NAVY);
  doc.rect(MARGIN, ccBoxY + 10, CONTENT_W, 14).fill(NAVY);

  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE);
  doc.text('CLOSING COST ITEM', MARGIN + 10, ccBoxY + 7);
  doc.text('TYPICAL RANGE', MARGIN + 320, ccBoxY + 7);

  let ccY = ccBoxY + 28;
  closingCosts.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.rect(MARGIN + 2, ccY - 2, CONTENT_W - 4, ccRowH).fill('#ece7de');
    }
    doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
    doc.text(row[0], MARGIN + 10, ccY + 2);
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(CHAMPAGNE);
    doc.text(row[1], MARGIN + 320, ccY + 2);
    ccY += ccRowH;
  });
  y = ccBoxY + ccBoxH + 10;

  // Wire Fraud Warning
  const wfBoxY = y;
  const wfBoxH = 52;
  doc.roundedRect(MARGIN, wfBoxY, CONTENT_W, wfBoxH, 4).fill('#fdedef');
  doc.rect(MARGIN, wfBoxY, 4, wfBoxH).fill('#cc3333');

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#cc3333');
  doc.text('WIRE FRAUD WARNING', MARGIN + 16, wfBoxY + 8);
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
  doc.text(
    'Always verify wiring instructions by calling your title company directly using a known phone number. Never wire money based on email instructions alone!',
    MARGIN + 16, wfBoxY + 24, { width: CONTENT_W - 30, lineGap: 2 }
  );
  y = wfBoxY + wfBoxH + 10;

  // Timeline recap
  doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
  doc.text('Timeline Recap: ', MARGIN, y, { continued: true });
  doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
  doc.text('Typically 30\u201345 days from accepted offer to closing day.', { continued: false });
  y = doc.y + 10;

  // Quote
  drawQuoteBox(y, 'The best part of my job \u2014 handing you the keys.');

  drawPageFooter(7);
}

// ─── PAGE 8: Back Cover / CTA ───────────────────────────────────────

function createPage8() {
  doc.addPage();
  drawNavyBackground();

  // Top champagne line
  drawChampagneLine(0, 0, PAGE_W, 4);

  // Decorative corner accents
  doc.moveTo(MARGIN, 30).lineTo(MARGIN, 60).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(MARGIN, 30).lineTo(MARGIN + 30, 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, 30).lineTo(PAGE_W - MARGIN, 60).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, 30).lineTo(PAGE_W - MARGIN - 30, 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();

  // Main CTA headline
  drawChampagneLine(PAGE_W / 2 - 100, 170, 200, 1);
  drawChampagneDiamond(PAGE_W / 2, 170.5, 5);

  doc.font('Helvetica-Bold').fontSize(28).fillColor(CHAMPAGNE);
  doc.text('YOUR JOURNEY STARTS', 0, 200, { width: PAGE_W, align: 'center', characterSpacing: 3 });
  doc.text('WITH ONE CALL', 0, 238, { width: PAGE_W, align: 'center', characterSpacing: 3 });

  drawChampagneLine(PAGE_W / 2 - 100, 280, 200, 1);
  drawChampagneDiamond(PAGE_W / 2, 280.5, 5);

  // Contact info box
  const boxW = 380;
  const boxH = 160;
  const boxX = (PAGE_W - boxW) / 2;
  const boxY = 310;

  doc.roundedRect(boxX, boxY, boxW, boxH, 4).lineWidth(1).strokeColor(CHAMPAGNE).stroke();

  // Contact details
  let cy = boxY + 20;

  doc.font('Helvetica-Bold').fontSize(16).fillColor(WHITE);
  doc.text('Keneshia Haye', 0, cy, { width: PAGE_W, align: 'center' });
  cy += 24;

  doc.font('Helvetica').fontSize(10).fillColor(CHAMPAGNE);
  doc.text('REALTOR\u00AE & U.S. Military Veteran', 0, cy, { width: PAGE_W, align: 'center' });
  cy += 22;

  drawChampagneLine(boxX + 40, cy, boxW - 80, 0.5);
  cy += 14;

  // Phone
  doc.font('Helvetica-Bold').fontSize(12).fillColor(WHITE);
  doc.text('(254) 449-5299', 0, cy, { width: PAGE_W, align: 'center' });
  cy += 20;

  // Email
  doc.font('Helvetica').fontSize(11).fillColor(CHAMPAGNE);
  doc.text('keneshia@fgragent.com', 0, cy, { width: PAGE_W, align: 'center' });
  cy += 18;

  // Website
  doc.font('Helvetica').fontSize(11).fillColor(WHITE);
  doc.text('keneshiahaye.com', 0, cy, { width: PAGE_W, align: 'center' });

  // Free consultation banner
  const bannerY = boxY + boxH + 30;
  const bannerH = 44;
  doc.roundedRect(boxX, bannerY, boxW, bannerH, 4).fill(CHAMPAGNE);

  doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY);
  doc.text('Free Buyer Consultation', 0, bannerY + 6, { width: PAGE_W, align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(NAVY);
  doc.text('No obligation \u2014 let\u2019s find your dream home together', 0, bannerY + 26, { width: PAGE_W, align: 'center' });

  // Equal Housing & License
  const footerY = 620;

  // Equal Housing Opportunity - text based symbol
  doc.font('Helvetica-Bold').fontSize(9).fillColor(CHAMPAGNE);
  doc.text('EQUAL HOUSING OPPORTUNITY', 0, footerY, { width: PAGE_W, align: 'center', characterSpacing: 2 });

  drawChampagneLine(PAGE_W / 2 - 60, footerY + 16, 120, 0.5);

  doc.font('Helvetica').fontSize(9).fillColor('#8899aa');
  doc.text('Florida Gateway Realty', 0, footerY + 26, { width: PAGE_W, align: 'center' });
  doc.text('License #BK3450416', 0, footerY + 42, { width: PAGE_W, align: 'center' });

  // Disclaimer
  doc.font('Helvetica').fontSize(7).fillColor('#556677');
  doc.text(
    'This guide is for informational purposes only and does not constitute legal or financial advice. Consult with qualified professionals for your specific situation.',
    MARGIN + 20, footerY + 68, { width: CONTENT_W - 40, align: 'center', lineGap: 2 }
  );

  // Bottom decorative corners
  const bCornerY = PAGE_H - 50;
  doc.moveTo(MARGIN, bCornerY).lineTo(MARGIN, bCornerY - 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(MARGIN, bCornerY).lineTo(MARGIN + 30, bCornerY).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, bCornerY).lineTo(PAGE_W - MARGIN, bCornerY - 30).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();
  doc.moveTo(PAGE_W - MARGIN, bCornerY).lineTo(PAGE_W - MARGIN - 30, bCornerY).lineWidth(1.5).strokeColor(CHAMPAGNE).stroke();

  // Bottom champagne line
  drawChampagneLine(0, PAGE_H - 4, PAGE_W, 4);
}

// ─── Generate All Pages ─────────────────────────────────────────────

console.log("Generating Buyer's Step-by-Step Guide...");

createCoverPage();
console.log('  Page 1: Cover - done');

createPage2();
console.log('  Page 2: Step 1 - Define Your Goals - done');

createPage3();
console.log('  Page 3: Step 2 - Get Financially Ready - done');

createPage4();
console.log('  Page 4: Step 3 - Search & Tour Homes - done');

createPage5();
console.log('  Page 5: Step 4 - Make an Offer & Negotiate - done');

createPage6();
console.log('  Page 6: Step 5 - Due Diligence - done');

createPage7();
console.log('  Page 7: Step 6 - Close & Get Your Keys! - done');

createPage8();
console.log('  Page 8: Back Cover / CTA - done');

doc.end();

stream.on('finish', () => {
  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`\nPDF generated successfully!`);
  console.log(`  Location: ${outputPath}`);
  console.log(`  File size: ${sizeKB} KB`);
  console.log(`  Pages: 8`);
});

stream.on('error', (err) => {
  console.error('Error writing PDF:', err);
  process.exit(1);
});
