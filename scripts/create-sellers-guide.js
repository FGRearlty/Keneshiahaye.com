/**
 * Seller's Guide to Top Dollar - Professional PDF Generator
 * Keneshia Haye, REALTOR® & U.S. Military Veteran
 * Florida Gateway Realty
 *
 * Run: node scripts/create-sellers-guide.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ─── Color Palette ───────────────────────────────────────────────────────────
const NAVY      = '#0a1628';
const CHAMPAGNE = '#c9a96e';
const WHITE     = '#ffffff';
const DARK_GRAY = '#333333';
const LIGHT_BG  = '#f4f1ec';
const ACCENT_BG = '#0e1e38';

// ─── Page Dimensions (US Letter) ────────────────────────────────────────────
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Output ─────────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, '..', 'guides');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'sellers-guide-top-dollar.pdf');

// ─── Create Document ────────────────────────────────────────────────────────
const doc = new PDFDocument({
  size: 'letter',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  bufferPages: true,
  info: {
    Title: "Seller's Guide to Top Dollar",
    Author: 'Keneshia Haye, REALTOR®',
    Subject: 'How to Sell Your Jacksonville Home for Maximum Value',
    Creator: 'Florida Gateway Realty',
  },
});

const stream = fs.createWriteStream(OUTPUT_PATH);
doc.pipe(stream);

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function navyBackground() {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(NAVY);
}

function whiteBackground() {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(WHITE);
}

/** Decorative champagne line */
function champagneLine(y, width, centered) {
  const x = centered ? (PAGE_W - width) / 2 : MARGIN;
  doc.moveTo(x, y).lineTo(x + width, y).lineWidth(1.5).stroke(CHAMPAGNE);
}

/** Thin gray divider */
function grayLine(y) {
  doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).lineWidth(0.5).strokeOpacity(0.3).stroke(DARK_GRAY).strokeOpacity(1);
}

/** Champagne accent bar on the left */
function accentBar(x, y, height) {
  doc.rect(x, y, 4, height).fill(CHAMPAGNE);
}

/** Section page header with navy banner */
function sectionHeader(pageNum, title, subtitle) {
  // Top navy banner
  doc.rect(0, 0, PAGE_W, 120).fill(NAVY);

  // Champagne accent stripe at bottom of banner
  doc.rect(0, 116, PAGE_W, 4).fill(CHAMPAGNE);

  // Page number circle
  doc.circle(PAGE_W - 46, 30, 16).fill(CHAMPAGNE);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY);
  doc.text(String(pageNum), PAGE_W - 58, 24, { width: 24, align: 'center' });

  // Title
  doc.font('Helvetica-Bold').fontSize(26).fillColor(WHITE);
  doc.text(title, MARGIN, 36, { width: CONTENT_W - 60 });

  // Subtitle
  if (subtitle) {
    doc.font('Helvetica').fontSize(11).fillColor(CHAMPAGNE);
    doc.text(subtitle, MARGIN, 78, { width: CONTENT_W - 60 });
  }

  // Footer
  pageFooter();
}

/** Bottom footer with branding */
function pageFooter() {
  const y = PAGE_H - 36;
  doc.rect(0, y - 4, PAGE_W, 40).fill(NAVY);
  doc.font('Helvetica').fontSize(7).fillColor(CHAMPAGNE);
  doc.text('Keneshia Haye, REALTOR\u00AE  |  Florida Gateway Realty  |  (254) 449-5299  |  keneshiahaye.com', 0, y + 4, { width: PAGE_W, align: 'center' });
}

/** Bullet point with champagne dot */
function bullet(x, y, text, opts = {}) {
  const fontSize = opts.fontSize || 10;
  const color = opts.color || DARK_GRAY;
  const maxW = opts.width || CONTENT_W - (x - MARGIN) - 10;

  doc.circle(x + 3, y + 5, 2.5).fill(CHAMPAGNE);
  doc.font('Helvetica').fontSize(fontSize).fillColor(color);
  doc.text(text, x + 12, y, { width: maxW, lineGap: 2 });
  return doc.y + 4;
}

/** Bold label with regular value */
function labelValue(x, y, label, value, opts = {}) {
  const fontSize = opts.fontSize || 10;
  const maxW = opts.width || CONTENT_W;
  doc.font('Helvetica-Bold').fontSize(fontSize).fillColor(DARK_GRAY);
  doc.text(label, x, y, { continued: true, width: maxW });
  doc.font('Helvetica').text(' ' + value, { width: maxW });
  return doc.y + 2;
}

/** Champagne quote box */
function quoteBox(y, text) {
  const boxH = 44;
  doc.rect(MARGIN, y, CONTENT_W, boxH).fill('#f9f5ee');
  accentBar(MARGIN, y, boxH);
  doc.font('Times-Roman').fontSize(11).fillColor(CHAMPAGNE);
  doc.text(`\u201C${text}\u201D`, MARGIN + 16, y + 14, { width: CONTENT_W - 32 });
  return y + boxH + 14;
}

/** Numbered step */
function numberedStep(num, x, y, title, description) {
  // Number circle
  doc.circle(x + 12, y + 8, 12).fill(CHAMPAGNE);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
  doc.text(String(num), x + 2, y + 2, { width: 20, align: 'center' });

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(DARK_GRAY);
  doc.text(title, x + 30, y, { width: CONTENT_W - 40 });
  doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
  doc.text(description, x + 30, doc.y + 1, { width: CONTENT_W - 40, lineGap: 2 });
  return doc.y + 10;
}

/** Two-column layout helper */
function twoColumns(y, leftContent, rightContent) {
  const colW = (CONTENT_W - 20) / 2;
  leftContent(MARGIN, y, colW);
  rightContent(MARGIN + colW + 20, y, colW);
}

/** Icon-style box with champagne header stripe */
function featureBox(x, y, w, h, title, items) {
  doc.roundedRect(x, y, w, h, 4).lineWidth(1).stroke('#ddd');
  doc.rect(x, y, w, 28).fill(NAVY);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(CHAMPAGNE);
  doc.text(title, x + 10, y + 8, { width: w - 20 });

  let curY = y + 38;
  items.forEach(item => {
    curY = bullet(x + 8, curY, item, { fontSize: 8.5, width: w - 30 });
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════════

navyBackground();

// Top decorative stripe
doc.rect(0, 0, PAGE_W, 6).fill(CHAMPAGNE);

// Subtle geometric accent — top-right corner triangle
doc.save();
doc.moveTo(PAGE_W - 180, 0).lineTo(PAGE_W, 0).lineTo(PAGE_W, 180).closePath().fillOpacity(0.04).fill(CHAMPAGNE);
doc.restore();
doc.fillOpacity(1);

// Bottom-left geometric accent
doc.save();
doc.moveTo(0, PAGE_H - 160).lineTo(160, PAGE_H).lineTo(0, PAGE_H).closePath().fillOpacity(0.04).fill(CHAMPAGNE);
doc.restore();
doc.fillOpacity(1);

// Center diamond ornament
const diaY = 220;
doc.save();
doc.moveTo(PAGE_W / 2, diaY - 20).lineTo(PAGE_W / 2 + 14, diaY).lineTo(PAGE_W / 2, diaY + 20).lineTo(PAGE_W / 2 - 14, diaY).closePath().fill(CHAMPAGNE);
doc.restore();

// Title
doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE);
doc.text("SELLER'S GUIDE", 0, 270, { width: PAGE_W, align: 'center', characterSpacing: 3 });
doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE);
doc.text('TO TOP DOLLAR', 0, 316, { width: PAGE_W, align: 'center', characterSpacing: 3 });

// Champagne divider line
champagneLine(370, 200, true);

// Subtitle
doc.font('Helvetica').fontSize(14).fillColor(CHAMPAGNE);
doc.text('How to Sell Your Jacksonville Home', 0, 390, { width: PAGE_W, align: 'center' });
doc.text('for Maximum Value', 0, 408, { width: PAGE_W, align: 'center' });

// Divider
champagneLine(445, 100, true);

// Presented by
doc.font('Helvetica').fontSize(10).fillColor(WHITE);
doc.text('Presented by', 0, 468, { width: PAGE_W, align: 'center' });

doc.font('Helvetica-Bold').fontSize(16).fillColor(CHAMPAGNE);
doc.text('Keneshia Haye', 0, 490, { width: PAGE_W, align: 'center' });

doc.font('Helvetica').fontSize(11).fillColor(WHITE);
doc.text('REALTOR\u00AE & U.S. Military Veteran', 0, 516, { width: PAGE_W, align: 'center' });

doc.font('Helvetica').fontSize(10).fillColor('#8899aa');
doc.text('Florida Gateway Realty  |  License #BK3450416', 0, 540, { width: PAGE_W, align: 'center' });

// Bottom contact bar
doc.rect(0, PAGE_H - 80, PAGE_W, 80).fill(ACCENT_BG);
champagneLine(PAGE_H - 80, PAGE_W, false);

doc.font('Helvetica').fontSize(10).fillColor(WHITE);
doc.text('(254) 449-5299', 0, PAGE_H - 58, { width: PAGE_W, align: 'center' });
doc.text('keneshia@fgragent.com', 0, PAGE_H - 42, { width: PAGE_W, align: 'center' });
doc.font('Helvetica-Bold').fontSize(10).fillColor(CHAMPAGNE);
doc.text('keneshiahaye.com', 0, PAGE_H - 26, { width: PAGE_W, align: 'center' });


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 2 — WHY THE RIGHT AGENT MATTERS
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(2, 'Why the Right Agent Matters', 'The difference between a good sale and a great one starts with your agent.');

let y = 140;

// FSBO vs Agent stat boxes
const boxW = (CONTENT_W - 16) / 2;
const boxH = 90;

// Box 1 — Agent-Assisted
doc.roundedRect(MARGIN, y, boxW, boxH, 4).fill('#f4f1ec');
accentBar(MARGIN, y, boxH);
doc.font('Helvetica-Bold').fontSize(28).fillColor(CHAMPAGNE);
doc.text('$405,600', MARGIN + 14, y + 12, { width: boxW - 28 });
doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
doc.text('Average agent-assisted sale price', MARGIN + 14, y + 48, { width: boxW - 28 });
doc.font('Helvetica').fontSize(8).fillColor('#888');
doc.text('Source: National Association of REALTORS\u00AE, 2024', MARGIN + 14, y + 66, { width: boxW - 28 });

// Box 2 — FSBO
doc.roundedRect(MARGIN + boxW + 16, y, boxW, boxH, 4).fill('#f4f1ec');
accentBar(MARGIN + boxW + 16, y, boxH);
doc.font('Helvetica-Bold').fontSize(28).fillColor(DARK_GRAY);
doc.text('$310,000', MARGIN + boxW + 30, y + 12, { width: boxW - 28 });
doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
doc.text('Average FSBO sale price', MARGIN + boxW + 30, y + 48, { width: boxW - 28 });
doc.font('Helvetica').fontSize(8).fillColor('#888');
doc.text('That\'s nearly $96K less without an agent', MARGIN + boxW + 30, y + 66, { width: boxW - 28 });

y += boxH + 24;

// What Keneshia brings section
doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY);
doc.text('What I Bring to Every Listing', MARGIN, y);
y = doc.y + 10;
champagneLine(y, CONTENT_W, false);
y += 14;

const services = [
  ['Professional Photography & Videography', 'HDR photos, drone aerials, and cinematic video tours that make your home shine online\u2014where 97% of buyers start their search.'],
  ['Strategic Pricing', 'Data-driven pricing using a detailed Comparative Market Analysis (CMA) to attract qualified buyers and maximize your return.'],
  ['Aggressive Marketing', 'Multi-channel exposure across MLS, Zillow, Realtor.com, social media, email campaigns, and broker networks.'],
  ['Skilled Negotiation', 'Veteran-trained discipline and market expertise to protect your interests and secure the best possible terms.'],
];

services.forEach(([title, desc]) => {
  y = numberedStep(services.indexOf([title, desc]) + 1, MARGIN, y, title, desc);
});

// Re-render with proper numbering
y = doc.y - (services.length * 4);

y = quoteBox(y + 6, 'My sellers average 98% of list price \u2014 because preparation and strategy make all the difference.');


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 3 — PREPARING YOUR HOME
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(3, 'Preparing Your Home to Sell', 'First impressions are everything. Here is how to make yours count.');

y = 140;

// Two-column checklist
const col1X = MARGIN;
const col2X = MARGIN + CONTENT_W / 2 + 10;
const colW = CONTENT_W / 2 - 10;

// Column 1: Interior
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Interior Checklist', col1X, y);
y = doc.y + 6;

const interiorItems = [
  'Declutter every room \u2014 less is more',
  'Deep clean floors, windows, baseboards',
  'Remove personal photos & memorabilia',
  'Fix leaky faucets & running toilets',
  'Touch up scuffed walls & trim paint',
  'Replace dated light fixtures & hardware',
  'Organize closets (buyers will look!)',
  'Steam clean carpets or refinish floors',
  'Neutralize bold wall colors',
];

let yLeft = y;
interiorItems.forEach(item => {
  yLeft = bullet(col1X, yLeft, item, { fontSize: 9, width: colW - 20 });
});

// Column 2: Exterior / Curb Appeal
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Curb Appeal Must-Dos', col2X, y);

let yRight = doc.y + 6;
const exteriorItems = [
  'Power wash driveway, walkways & siding',
  'Mow, edge, and add fresh mulch',
  'Plant colorful flowers at entryway',
  'Paint or replace the front door',
  'Update house numbers & mailbox',
  'Repair any cracked walkways',
  'Clean gutters and exterior windows',
  'Add exterior lighting for evening appeal',
  'Ensure garage door is clean & functional',
];

exteriorItems.forEach(item => {
  yRight = bullet(col2X, yRight, item, { fontSize: 9, width: colW - 20 });
});

y = Math.max(yLeft, yRight) + 12;
grayLine(y);
y += 16;

// Cost-effective upgrades section
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Cost-Effective Upgrades That Boost Value', MARGIN, y);
y = doc.y + 10;

const upgrades = [
  ['Fresh Interior Paint', 'Neutral tones appeal to the widest audience. ROI: up to 107%.'],
  ['Updated Kitchen Hardware', 'New cabinet pulls and knobs modernize the look for under $200.'],
  ['Landscaping', 'A well-maintained yard adds up to 7% to your home\u2019s value.'],
  ['New Light Fixtures', 'Modern fixtures in key rooms signal an updated, move-in-ready home.'],
  ['Deep Professional Cleaning', 'A spotless home photographs beautifully and impresses at showings.'],
];

upgrades.forEach(([title, desc], i) => {
  y = numberedStep(i + 1, MARGIN, y, title, desc);
});

y = quoteBox(y + 4, 'Staged homes sell 73% faster than non-staged homes. \u2014 National Association of REALTORS\u00AE');


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 4 — PRICING STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(4, 'Strategic Pricing', 'Price it right from day one to attract offers and maximize your return.');

y = 140;

// CMA explanation
doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY);
doc.text('How a Comparative Market Analysis Works', MARGIN, y);
y = doc.y + 8;

doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
doc.text('A Comparative Market Analysis (CMA) is the foundation of a smart pricing strategy. I analyze recently sold, active, and expired listings in your neighborhood to determine the optimal list price. Factors include:', MARGIN, y, { width: CONTENT_W, lineGap: 2 });
y = doc.y + 10;

const cmaFactors = [
  'Recent comparable sales within 0.5\u20131 mile radius',
  'Square footage, lot size, bedrooms, and bathrooms',
  'Property condition, upgrades, and unique features',
  'Current market conditions and buyer demand',
  'Days on market for similar properties',
];

cmaFactors.forEach(item => {
  y = bullet(MARGIN, y, item, { fontSize: 9.5 });
});

y += 8;
grayLine(y);
y += 16;

// Danger zones — two columns
const dangerColW = (CONTENT_W - 20) / 2;

// Overpricing box
doc.roundedRect(MARGIN, y, dangerColW, 150, 4).lineWidth(1).stroke('#cc3333');
doc.rect(MARGIN, y, dangerColW, 30).fill('#cc3333');
doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
doc.text('The Danger of Overpricing', MARGIN + 12, y + 8, { width: dangerColW - 24 });

let dY = y + 40;
const overItems = [
  'Fewer showings from qualified buyers',
  'Property becomes "stale" on the market',
  'Price reductions signal desperation',
  'Appraisal issues if priced too high',
  'Ultimately sells for less than market value',
];
overItems.forEach(item => {
  dY = bullet(MARGIN + 8, dY, item, { fontSize: 8.5, width: dangerColW - 30 });
});

// Underpricing box
const upX = MARGIN + dangerColW + 20;
doc.roundedRect(upX, y, dangerColW, 150, 4).lineWidth(1).stroke('#cc8800');
doc.rect(upX, y, dangerColW, 30).fill('#cc8800');
doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE);
doc.text('The Danger of Underpricing', upX + 12, y + 8, { width: dangerColW - 24 });

dY = y + 40;
const underItems = [
  'Leaves money on the table',
  'Attracts investors, not homeowners',
  'May signal hidden problems',
  'Difficult to raise price later',
  'Seller remorse after closing',
];
underItems.forEach(item => {
  dY = bullet(upX + 8, dY, item, { fontSize: 8.5, width: dangerColW - 30 });
});

y += 166;

// Jacksonville market snapshot
doc.roundedRect(MARGIN, y, CONTENT_W, 100, 4).fill('#f4f1ec');
accentBar(MARGIN, y, 100);
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Jacksonville Market Snapshot', MARGIN + 14, y + 10, { width: CONTENT_W - 28 });

doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
const snapY = y + 30;
doc.text('Median Days on Market: 28 days', MARGIN + 14, snapY, { width: (CONTENT_W - 28) / 2 });
doc.text('Median Home Price: $325,000', MARGIN + 14, snapY + 16, { width: (CONTENT_W - 28) / 2 });
doc.text('Avg. Price Per Sq Ft: $195', MARGIN + 14 + (CONTENT_W - 28) / 2, snapY, { width: (CONTENT_W - 28) / 2 });
doc.text('Inventory: 2.8 months supply', MARGIN + 14 + (CONTENT_W - 28) / 2, snapY + 16, { width: (CONTENT_W - 28) / 2 });

doc.font('Helvetica').fontSize(8).fillColor('#888');
doc.text('Data reflects Jacksonville, FL metro area. Updated periodically. Contact me for the latest figures.', MARGIN + 14, snapY + 42, { width: CONTENT_W - 28 });

y += 116;

y = quoteBox(y, 'I provide a free, no-obligation Comparative Market Analysis for your home. Let\u2019s find your number.');


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 5 — MY MARKETING PLAN
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(5, 'My Marketing Plan', 'Maximum exposure to the right buyers through a proven multi-channel strategy.');

y = 140;

doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
doc.text('Every listing I take receives a comprehensive, tailored marketing plan designed to generate maximum interest and top-dollar offers. Here is exactly what I do:', MARGIN, y, { width: CONTENT_W, lineGap: 2 });
y = doc.y + 14;

// Marketing items as feature boxes — 2x3 grid
const fBoxW = (CONTENT_W - 16) / 2;
const fBoxH = 115;
const gap = 14;

const marketingBoxes = [
  {
    title: 'Professional Photography',
    items: ['HDR interior & exterior photos', 'Drone/aerial photography', 'Twilight & lifestyle shots', 'Virtual staging when needed'],
  },
  {
    title: 'Video & Virtual Tours',
    items: ['Cinematic walkthrough videos', '3D Matterport virtual tours', 'Social media reels & stories', 'YouTube property features'],
  },
  {
    title: 'MLS & Online Syndication',
    items: ['Full MLS listing with pro media', 'Syndicated to Zillow, Realtor.com', 'Redfin, Trulia & 50+ sites', 'Featured placement options'],
  },
  {
    title: 'Social Media Advertising',
    items: ['Targeted Facebook & Instagram ads', 'Geo-targeted to likely buyers', 'Retargeting campaigns', 'Engagement-optimized content'],
  },
  {
    title: 'Email Campaigns',
    items: ['Blast to active buyer database', 'Just Listed announcements', 'Agent-to-agent networking', 'Open house invitations'],
  },
  {
    title: 'Open Houses & Networking',
    items: ['Public open houses', 'Broker tours & caravan events', 'Neighborhood door knocking', 'Relocation company outreach'],
  },
];

marketingBoxes.forEach((box, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const bx = MARGIN + col * (fBoxW + 16);
  const by = y + row * (fBoxH + gap);
  featureBox(bx, by, fBoxW, fBoxH, box.title, box.items);
});

const afterBoxes = y + 3 * (fBoxH + gap) + 4;
// Bottom note
doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
doc.text('97% of buyers search online first.', MARGIN, afterBoxes, { width: CONTENT_W, continued: true });
doc.font('Helvetica').fillColor(DARK_GRAY).text(' My marketing ensures your home is front and center where they are looking.', { width: CONTENT_W });


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 6 — SHOWINGS & OPEN HOUSES
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(6, 'Showings & Open Houses', 'Making every visit count. Your home only gets one chance at a first impression.');

y = 140;

// Preparing for showings
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Preparing for Showings', MARGIN, y);
y = doc.y + 8;

const showingPrep = [
  'Keep the home "show-ready" at all times \u2014 tidy, clean, and fresh.',
  'Open blinds and turn on all lights to maximize brightness.',
  'Set the thermostat to a comfortable temperature year-round.',
  'Add subtle pleasant scents (fresh flowers, baked cookies).',
  'Put away all valuables, medications, and personal documents.',
  'Make beds, clear countertops, and empty trash cans daily.',
];

showingPrep.forEach(item => {
  y = bullet(MARGIN, y, item, { fontSize: 9.5 });
});

y += 8;
grayLine(y);
y += 14;

// During a showing
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('During a Showing', MARGIN, y);
y = doc.y + 8;

const duringShowing = [
  'Leave the property \u2014 buyers feel uncomfortable with owners present.',
  'Take a walk, run an errand, or visit a neighbor.',
  'Let your agent handle all questions and feedback.',
  'Leave informational materials on the kitchen counter.',
];

duringShowing.forEach(item => {
  y = bullet(MARGIN, y, item, { fontSize: 9.5 });
});

y += 8;
grayLine(y);
y += 14;

// Pet management
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Pet Management Tips', MARGIN, y);
y = doc.y + 8;

const petTips = [
  'Remove pets from the home during all showings.',
  'Clean pet areas thoroughly \u2014 eliminate odors completely.',
  'Pick up food bowls, litter boxes, and pet toys.',
  'Repair any pet damage (scratched doors, stained carpets).',
  'Note: some buyers have allergies. A clean space is essential.',
];

petTips.forEach(item => {
  y = bullet(MARGIN, y, item, { fontSize: 9.5 });
});

y += 8;
grayLine(y);
y += 14;

// Open house strategy
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Open House Strategy', MARGIN, y);
y = doc.y + 8;

const openHouseStrat = [
  'I promote every open house across social media, MLS, and my buyer network.',
  'Professional signage and directional signs drive neighborhood traffic.',
  'I provide printed materials highlighting your home\u2019s best features.',
  'I follow up with every visitor within 24 hours to gather feedback.',
  'Virtual open houses expand reach to out-of-town and military buyers.',
];

openHouseStrat.forEach(item => {
  y = bullet(MARGIN, y, item, { fontSize: 9.5 });
});

y = quoteBox(y + 10, 'I handle every detail so you can focus on your next chapter.');


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 7 — EVALUATING OFFERS
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(7, 'Evaluating Offers', 'It is not just about the highest price \u2014 it is about the best terms for you.');

y = 140;

// Offer components
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Understanding Offer Components', MARGIN, y);
y = doc.y + 8;

const offerComponents = [
  ['Purchase Price:', 'The amount the buyer is willing to pay for your home.'],
  ['Earnest Money Deposit:', 'A good-faith deposit showing buyer commitment (typically 1\u20133% of price).'],
  ['Financing Type:', 'Conventional, FHA, VA, or cash. Each has different implications.'],
  ['Closing Date:', 'When the buyer wants to finalize the transaction.'],
  ['Contingencies:', 'Conditions that must be met for the sale to proceed.'],
  ['Inclusions/Exclusions:', 'Personal property, appliances, or fixtures included or excluded.'],
];

offerComponents.forEach(([label, desc]) => {
  y = labelValue(MARGIN, y, label, desc, { fontSize: 9.5 });
  y += 2;
});

y += 6;
grayLine(y);
y += 14;

// Contingencies explained
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Common Contingencies Explained', MARGIN, y);
y = doc.y + 8;

const contingencies = [
  ['Inspection Contingency:', 'Buyer can negotiate repairs or withdraw after a professional inspection.'],
  ['Appraisal Contingency:', 'Sale depends on the home appraising at or above the purchase price.'],
  ['Financing Contingency:', 'Buyer must secure mortgage approval within a specified timeframe.'],
  ['Sale of Buyer\'s Home:', 'Buyer needs to sell their current home first. This adds risk.'],
];

contingencies.forEach(([label, desc]) => {
  y = labelValue(MARGIN, y, label, desc, { fontSize: 9.5 });
  y += 2;
});

y += 6;
grayLine(y);
y += 14;

// Multiple offers / Cash vs Financed
doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Handling Multiple Offers', MARGIN, y);
y = doc.y + 6;

doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
doc.text('In a multiple-offer situation, I help you compare not just price, but the overall strength of each offer. Key factors include buyer financing strength, contingencies, flexibility on closing date, and escalation clauses. I present all offers transparently and advise on the best path forward.', MARGIN, y, { width: CONTENT_W, lineGap: 2 });
y = doc.y + 10;

// Cash vs Financed comparison
const compW = (CONTENT_W - 16) / 2;
const compH = 100;

doc.roundedRect(MARGIN, y, compW, compH, 4).fill('#f4f1ec');
accentBar(MARGIN, y, compH);
doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
doc.text('Cash Offers', MARGIN + 14, y + 10, { width: compW - 28 });
doc.font('Helvetica').fontSize(8.5).fillColor(DARK_GRAY);
doc.text('Faster closings (often 2\u20133 weeks)\nNo appraisal contingency risk\nFewer fall-through scenarios\nMay be lower than financed offers', MARGIN + 14, y + 28, { width: compW - 28, lineGap: 3 });

doc.roundedRect(MARGIN + compW + 16, y, compW, compH, 4).fill('#f4f1ec');
accentBar(MARGIN + compW + 16, y, compH);
doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
doc.text('Financed Offers', MARGIN + compW + 30, y + 10, { width: compW - 28 });
doc.font('Helvetica').fontSize(8.5).fillColor(DARK_GRAY);
doc.text('Often higher purchase price\nSubject to appraisal & lender approval\nTypical 30\u201345 day closing timeline\nPre-approval strength matters', MARGIN + compW + 30, y + 28, { width: compW - 28, lineGap: 3 });

y += compH + 14;

y = quoteBox(y, 'I negotiate fiercely to protect your bottom line while keeping the deal on track.');


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 8 — UNDER CONTRACT TO CLOSING
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(8, 'Under Contract to Closing', 'What happens after you accept an offer. I guide you every step of the way.');

y = 140;

// Timeline steps
const steps = [
  {
    title: 'Executed Contract (Day 1)',
    desc: 'Both parties sign the purchase agreement. Earnest money is deposited into escrow. The clock starts on all contingency deadlines.',
  },
  {
    title: 'Home Inspection (Days 5\u201312)',
    desc: 'The buyer hires a licensed inspector to evaluate the property. I help you review findings and negotiate any repair requests or credits strategically.',
  },
  {
    title: 'Appraisal (Days 10\u201320)',
    desc: 'The buyer\'s lender orders an independent appraisal to confirm the home\'s value supports the loan amount. If it comes in low, we negotiate.',
  },
  {
    title: 'Title Search & Insurance (Days 7\u201325)',
    desc: 'A title company researches the property\'s ownership history to ensure a clear title. Title insurance protects both buyer and seller from future claims.',
  },
  {
    title: 'Loan Processing & Underwriting (Days 10\u201335)',
    desc: 'The buyer\'s lender verifies finances, employment, and documents. I stay in close communication with the buyer\'s agent to ensure no surprises.',
  },
  {
    title: 'Final Walk-Through (Day 28\u201344)',
    desc: 'The buyer inspects the property one last time to confirm agreed-upon repairs are completed and the home is in the expected condition.',
  },
  {
    title: 'Closing Day (Day 30\u201345)',
    desc: 'Sign final documents, transfer the title, hand over the keys, and receive your proceeds. I coordinate all parties to ensure a smooth closing.',
  },
];

steps.forEach((step, i) => {
  // Timeline dot and line
  const dotX = MARGIN + 8;
  const dotY = y + 6;

  doc.circle(dotX, dotY, 5).fill(CHAMPAGNE);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(NAVY);
  doc.text(String(i + 1), dotX - 4, dotY - 3.5, { width: 8, align: 'center' });

  if (i < steps.length - 1) {
    doc.moveTo(dotX, dotY + 5).lineTo(dotX, dotY + 56).lineWidth(1).strokeOpacity(0.3).stroke(CHAMPAGNE).strokeOpacity(1);
  }

  doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY);
  doc.text(step.title, MARGIN + 22, y, { width: CONTENT_W - 30 });
  doc.font('Helvetica').fontSize(9).fillColor(DARK_GRAY);
  doc.text(step.desc, MARGIN + 22, doc.y + 2, { width: CONTENT_W - 30, lineGap: 2 });
  y = doc.y + 14;
});

// Bottom note
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NAVY);
doc.text('Average timeline: 30\u201345 days from contract to closing.', MARGIN, y, { width: CONTENT_W, continued: true });
doc.font('Helvetica').fillColor(DARK_GRAY).text(' I keep you informed at every milestone.', { width: CONTENT_W });


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 9 — SELLER COSTS BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
whiteBackground();
sectionHeader(9, 'Seller Costs Breakdown', 'Understanding your expenses so there are no surprises at closing.');

y = 140;

doc.font('Helvetica').fontSize(10).fillColor(DARK_GRAY);
doc.text('When selling your home, there are several costs to plan for. Below is a typical breakdown for a home sale in Florida. I will provide a detailed net proceeds estimate specific to your property.', MARGIN, y, { width: CONTENT_W, lineGap: 2 });
y = doc.y + 16;

// Cost table
const costs = [
  { item: 'Real Estate Agent Commission', typical: '5\u20136% of sale price', note: 'Split between listing and buyer\'s agent' },
  { item: 'Title Insurance (Owner\'s Policy)', typical: '0.5\u20131% of sale price', note: 'Required in Florida; seller typically pays' },
  { item: 'Documentary Stamps (Transfer Tax)', typical: '$0.70 per $100 of sale price', note: 'Florida doc stamps \u2014 seller responsibility' },
  { item: 'Prorated Property Taxes', typical: 'Varies by closing date', note: 'Taxes owed through the day of closing' },
  { item: 'Title Search & Settlement Fees', typical: '$500\u2013$1,200', note: 'Closing agent and title search fees' },
  { item: 'Home Warranty (if offered)', typical: '$350\u2013$600', note: 'Optional; can attract buyers' },
  { item: 'Repair Credits / Concessions', typical: 'Negotiated', note: 'Agreed upon after inspection' },
  { item: 'Outstanding Mortgage Payoff', typical: 'Remaining balance', note: 'Plus any prepayment penalties' },
  { item: 'HOA Fees / Estoppel Letter', typical: '$150\u2013$500', note: 'If applicable to your community' },
];

// Table header
doc.rect(MARGIN, y, CONTENT_W, 24).fill(NAVY);
doc.font('Helvetica-Bold').fontSize(8.5).fillColor(WHITE);
doc.text('Cost Item', MARGIN + 8, y + 7, { width: 180 });
doc.text('Typical Amount', MARGIN + 200, y + 7, { width: 140 });
doc.text('Notes', MARGIN + 348, y + 7, { width: 150 });
y += 24;

costs.forEach((cost, i) => {
  const rowH = 28;
  const bgColor = i % 2 === 0 ? '#f9f7f3' : WHITE;
  doc.rect(MARGIN, y, CONTENT_W, rowH).fill(bgColor);

  doc.font('Helvetica').fontSize(8.5).fillColor(DARK_GRAY);
  doc.text(cost.item, MARGIN + 8, y + 8, { width: 180 });
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(NAVY);
  doc.text(cost.typical, MARGIN + 200, y + 8, { width: 140 });
  doc.font('Helvetica').fontSize(7.5).fillColor('#888');
  doc.text(cost.note, MARGIN + 348, y + 8, { width: 150 });
  y += rowH;
});

// Bottom border
doc.moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).lineWidth(1).stroke(CHAMPAGNE);
y += 16;

// Net proceeds box
doc.roundedRect(MARGIN, y, CONTENT_W, 65, 4).fill('#f4f1ec');
accentBar(MARGIN, y, 65);

doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY);
doc.text('Your Net Proceeds', MARGIN + 14, y + 10, { width: CONTENT_W - 28 });
doc.font('Helvetica').fontSize(9.5).fillColor(DARK_GRAY);
doc.text('Net Proceeds = Sale Price \u2013 Agent Commission \u2013 Mortgage Payoff \u2013 Closing Costs \u2013 Repairs/Credits', MARGIN + 14, y + 28, { width: CONTENT_W - 28, lineGap: 2 });
doc.font('Helvetica-Bold').fontSize(9).fillColor(CHAMPAGNE);
doc.text('I will prepare a detailed net proceeds worksheet customized to your home before we list.', MARGIN + 14, y + 48, { width: CONTENT_W - 28 });


// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE 10 — BACK COVER / CTA
// ═══════════════════════════════════════════════════════════════════════════════

doc.addPage();
navyBackground();

// Top champagne stripe
doc.rect(0, 0, PAGE_W, 6).fill(CHAMPAGNE);

// Geometric accents (matching cover)
doc.save();
doc.moveTo(0, 0).lineTo(200, 0).lineTo(0, 200).closePath().fillOpacity(0.04).fill(CHAMPAGNE);
doc.restore();
doc.fillOpacity(1);

doc.save();
doc.moveTo(PAGE_W, PAGE_H).lineTo(PAGE_W - 200, PAGE_H).lineTo(PAGE_W, PAGE_H - 200).closePath().fillOpacity(0.04).fill(CHAMPAGNE);
doc.restore();
doc.fillOpacity(1);

// Diamond ornament
const dY2 = 180;
doc.save();
doc.moveTo(PAGE_W / 2, dY2 - 16).lineTo(PAGE_W / 2 + 12, dY2).lineTo(PAGE_W / 2, dY2 + 16).lineTo(PAGE_W / 2 - 12, dY2).closePath().fill(CHAMPAGNE);
doc.restore();

// Main CTA text
doc.font('Helvetica').fontSize(14).fillColor(WHITE);
doc.text('THINKING ABOUT', 0, 230, { width: PAGE_W, align: 'center', characterSpacing: 4 });

doc.font('Helvetica-Bold').fontSize(40).fillColor(CHAMPAGNE);
doc.text('SELLING?', 0, 254, { width: PAGE_W, align: 'center', characterSpacing: 5 });

champagneLine(310, 200, true);

doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE);
doc.text('Get Your Free Home Valuation', 0, 340, { width: PAGE_W, align: 'center' });

doc.font('Helvetica').fontSize(11).fillColor('#aabbcc');
doc.text('Find out what your home is worth in today\'s market.', 0, 370, { width: PAGE_W, align: 'center' });

// Contact details
const contactY = 420;
champagneLine(contactY - 10, 160, true);

doc.font('Helvetica-Bold').fontSize(18).fillColor(CHAMPAGNE);
doc.text('(254) 449-5299', 0, contactY + 10, { width: PAGE_W, align: 'center' });

doc.font('Helvetica').fontSize(12).fillColor(WHITE);
doc.text('keneshia@fgragent.com', 0, contactY + 42, { width: PAGE_W, align: 'center' });

doc.font('Helvetica-Bold').fontSize(13).fillColor(CHAMPAGNE);
doc.text('keneshiahaye.com', 0, contactY + 66, { width: PAGE_W, align: 'center' });

champagneLine(contactY + 100, 160, true);

// Promise statement
doc.font('Times-Roman').fontSize(13).fillColor(WHITE);
doc.text('No obligation. No pressure.', 0, contactY + 120, { width: PAGE_W, align: 'center' });
doc.text('Just honest market insight.', 0, contactY + 138, { width: PAGE_W, align: 'center' });

// Agent name
doc.font('Helvetica-Bold').fontSize(14).fillColor(CHAMPAGNE);
doc.text('Keneshia Haye', 0, contactY + 180, { width: PAGE_W, align: 'center' });
doc.font('Helvetica').fontSize(10).fillColor(WHITE);
doc.text('REALTOR\u00AE & U.S. Military Veteran', 0, contactY + 200, { width: PAGE_W, align: 'center' });
doc.font('Helvetica').fontSize(9).fillColor('#8899aa');
doc.text('Florida Gateway Realty  |  License #BK3450416', 0, contactY + 218, { width: PAGE_W, align: 'center' });

// Equal Housing at bottom
doc.font('Helvetica').fontSize(8).fillColor('#667788');
doc.text('Equal Housing Opportunity', 0, PAGE_H - 50, { width: PAGE_W, align: 'center' });

// Bottom champagne stripe
doc.rect(0, PAGE_H - 6, PAGE_W, 6).fill(CHAMPAGNE);


// ═══════════════════════════════════════════════════════════════════════════════
//  FINALIZE
// ═══════════════════════════════════════════════════════════════════════════════

doc.end();

stream.on('finish', () => {
  const stats = fs.statSync(OUTPUT_PATH);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log('');
  console.log('  ========================================');
  console.log("  Seller's Guide PDF Generated Successfully");
  console.log('  ========================================');
  console.log(`  File: ${OUTPUT_PATH}`);
  console.log(`  Size: ${sizeKB} KB`);
  console.log(`  Pages: 10`);
  console.log('');
});
