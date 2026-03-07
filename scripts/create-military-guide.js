const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'guides');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, 'military-relocation-guide-jacksonville.pdf');

// Colors
const NAVY = '#0a1628';
const CHAMPAGNE = '#c9a96e';
const WHITE = '#ffffff';
const DARK_GRAY = '#333333';
const LIGHT_BG = '#f4f1ec';
const ACCENT_LIGHT = '#e8dcc8';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const doc = new PDFDocument({
  size: 'letter',
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: 'Military Relocation Guide - Jacksonville, FL',
    Author: 'Keneshia Haye - Florida Gateway Realty',
    Subject: 'PCS Guide to Jacksonville FL for Military Families',
    Keywords: 'military relocation, PCS, Jacksonville FL, VA loan, NAS Jacksonville, NS Mayport',
  },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function navyBackground() {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(NAVY);
}

function whiteBackground() {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(WHITE);
}

function drawHorizontalRule(y, color, width) {
  doc
    .moveTo(MARGIN, y)
    .lineTo(MARGIN + (width || CONTENT_W), y)
    .strokeColor(color || CHAMPAGNE)
    .lineWidth(1.5)
    .stroke();
}

function drawChampagneAccentBar(y, height) {
  doc.rect(MARGIN, y, CONTENT_W, height || 4).fill(CHAMPAGNE);
}

function drawPageHeader(title, subtitle) {
  // Header bar
  doc.rect(0, 0, PAGE_W, 90).fill(NAVY);
  drawChampagneAccentBar(90, 3);

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(WHITE)
    .text(title, MARGIN, 28, { width: CONTENT_W, align: 'left' });

  if (subtitle) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(CHAMPAGNE)
      .text(subtitle, MARGIN, 58, { width: CONTENT_W, align: 'left' });
  }
}

function drawFooter(pageNum) {
  const footerY = PAGE_H - 40;
  doc
    .moveTo(MARGIN, footerY - 8)
    .lineTo(PAGE_W - MARGIN, footerY - 8)
    .strokeColor(ACCENT_LIGHT)
    .lineWidth(0.5)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor('#999999')
    .text('Keneshia Haye | Florida Gateway Realty | (904) 866-2860', MARGIN, footerY, {
      width: CONTENT_W / 2,
      align: 'left',
    });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor('#999999')
    .text(`Page ${pageNum} of 12`, PAGE_W / 2, footerY, {
      width: CONTENT_W / 2,
      align: 'right',
    });
}

function sectionHeading(text, y, options) {
  const opts = options || {};
  const fontSize = opts.fontSize || 14;
  const color = opts.color || NAVY;
  const xPos = opts.x || MARGIN;
  const maxW = opts.width || CONTENT_W;

  doc.font('Helvetica-Bold').fontSize(fontSize).fillColor(color).text(text, xPos, y, { width: maxW });

  const afterText = doc.y + 4;
  doc
    .moveTo(xPos, afterText)
    .lineTo(xPos + 80, afterText)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();

  return afterText + 10;
}

function bodyText(text, y, options) {
  const opts = options || {};
  doc
    .font(opts.font || 'Helvetica')
    .fontSize(opts.fontSize || 10)
    .fillColor(opts.color || DARK_GRAY)
    .text(text, opts.x || MARGIN, y, {
      width: opts.width || CONTENT_W,
      align: opts.align || 'left',
      lineGap: opts.lineGap || 3,
    });
  return doc.y;
}

function bulletPoint(text, y, options) {
  const opts = options || {};
  const indent = opts.indent || 16;
  const xPos = opts.x || MARGIN;
  const bWidth = opts.width || CONTENT_W;

  doc
    .font('Helvetica')
    .fontSize(opts.fontSize || 9.5)
    .fillColor(CHAMPAGNE)
    .text('\u2022', xPos, y, { continued: false });

  doc
    .font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(opts.fontSize || 9.5)
    .fillColor(opts.color || DARK_GRAY)
    .text(text, xPos + indent, y, { width: bWidth - indent, lineGap: 2 });

  return doc.y + 2;
}

function boldLabel(label, value, y, options) {
  const opts = options || {};
  const xPos = opts.x || MARGIN;
  const bWidth = opts.width || CONTENT_W;

  doc
    .font('Helvetica-Bold')
    .fontSize(opts.fontSize || 9.5)
    .fillColor(opts.labelColor || NAVY)
    .text(label, xPos, y, { continued: true, width: bWidth, lineGap: 2 });

  doc
    .font('Helvetica')
    .fillColor(opts.valueColor || DARK_GRAY)
    .text(' ' + value, { lineGap: 2 });

  return doc.y + 1;
}

function drawInfoBox(x, y, w, h, title, lines) {
  // Box background
  doc.roundedRect(x, y, w, h, 4).fill('#f7f4ef');
  doc.roundedRect(x, y, w, h, 4).strokeColor(CHAMPAGNE).lineWidth(1).stroke();

  // Title bar
  doc.rect(x, y, w, 22).fill(NAVY);
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(CHAMPAGNE)
    .text(title, x + 8, y + 6, { width: w - 16 });

  let lineY = y + 30;
  lines.forEach((line) => {
    if (lineY + 12 > y + h) return;
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(DARK_GRAY)
      .text(line, x + 10, lineY, { width: w - 20, lineGap: 1 });
    lineY = doc.y + 3;
  });
}

function drawTwoColumnBox(x, y, w, h, title, leftLines, rightLines) {
  doc.roundedRect(x, y, w, h, 4).fill('#f7f4ef');
  doc.roundedRect(x, y, w, h, 4).strokeColor(CHAMPAGNE).lineWidth(1).stroke();

  doc.rect(x, y, w, 22).fill(NAVY);
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(CHAMPAGNE)
    .text(title, x + 8, y + 6, { width: w - 16 });

  const colW = (w - 30) / 2;
  let lY = y + 30;
  leftLines.forEach((line) => {
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(DARK_GRAY)
      .text(line, x + 10, lY, { width: colW, lineGap: 1 });
    lY = doc.y + 2;
  });

  let rY = y + 30;
  rightLines.forEach((line) => {
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(DARK_GRAY)
      .text(line, x + 10 + colW + 10, rY, { width: colW, lineGap: 1 });
    rY = doc.y + 2;
  });
}

// ============================================================
// PAGE 1 - COVER
// ============================================================
(function page1() {
  navyBackground();

  // Top champagne accent line
  doc.rect(0, 0, PAGE_W, 5).fill(CHAMPAGNE);

  // Decorative corner elements
  doc
    .moveTo(MARGIN, 60)
    .lineTo(MARGIN + 120, 60)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(MARGIN, 60)
    .lineTo(MARGIN, 80)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();

  doc
    .moveTo(PAGE_W - MARGIN, 60)
    .lineTo(PAGE_W - MARGIN - 120, 60)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(PAGE_W - MARGIN, 60)
    .lineTo(PAGE_W - MARGIN, 80)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();

  // Small top label
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(CHAMPAGNE)
    .text('JACKSONVILLE, FLORIDA', 0, 100, { width: PAGE_W, align: 'center' });

  // Decorative rule
  const ruleY = 125;
  const ruleW = 200;
  doc
    .moveTo(PAGE_W / 2 - ruleW / 2, ruleY)
    .lineTo(PAGE_W / 2 + ruleW / 2, ruleY)
    .strokeColor(CHAMPAGNE)
    .lineWidth(1)
    .stroke();

  // Diamond center accent
  const dSize = 5;
  doc
    .save()
    .translate(PAGE_W / 2, ruleY)
    .rotate(45)
    .rect(-dSize / 2, -dSize / 2, dSize, dSize)
    .fill(CHAMPAGNE)
    .restore();

  // Main title
  doc
    .font('Helvetica-Bold')
    .fontSize(38)
    .fillColor(WHITE)
    .text('MILITARY', 0, 170, { width: PAGE_W, align: 'center', characterSpacing: 6 });
  doc
    .font('Helvetica-Bold')
    .fontSize(38)
    .fillColor(WHITE)
    .text('RELOCATION', 0, 218, { width: PAGE_W, align: 'center', characterSpacing: 6 });
  doc
    .font('Helvetica-Bold')
    .fontSize(38)
    .fillColor(WHITE)
    .text('GUIDE', 0, 266, { width: PAGE_W, align: 'center', characterSpacing: 6 });

  // Champagne divider
  doc
    .moveTo(PAGE_W / 2 - 100, 320)
    .lineTo(PAGE_W / 2 + 100, 320)
    .strokeColor(CHAMPAGNE)
    .lineWidth(1.5)
    .stroke();

  // Subtitle
  doc
    .font('Helvetica')
    .fontSize(15)
    .fillColor(CHAMPAGNE)
    .text("Your Complete Guide to PCS'ing", 0, 345, { width: PAGE_W, align: 'center' });
  doc
    .font('Helvetica')
    .fontSize(15)
    .fillColor(CHAMPAGNE)
    .text('to Jacksonville, FL', 0, 365, { width: PAGE_W, align: 'center' });

  // Star divider
  doc
    .font('Helvetica')
    .fontSize(14)
    .fillColor(CHAMPAGNE)
    .text('\u2605  \u2605  \u2605', 0, 405, { width: PAGE_W, align: 'center' });

  // Base icons / installation names
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#8899aa')
    .text('NAS JACKSONVILLE   |   NS MAYPORT   |   CAMP BLANDING', 0, 440, {
      width: PAGE_W,
      align: 'center',
      characterSpacing: 1,
    });

  // Author block
  const authorBoxY = 520;
  doc.rect(PAGE_W / 2 - 160, authorBoxY, 320, 90).fill('#0d1e38');
  doc
    .roundedRect(PAGE_W / 2 - 160, authorBoxY, 320, 90, 3)
    .strokeColor(CHAMPAGNE)
    .lineWidth(1)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#8899aa')
    .text('PREPARED BY', 0, authorBoxY + 12, { width: PAGE_W, align: 'center' });

  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(WHITE)
    .text('Keneshia Haye', 0, authorBoxY + 30, { width: PAGE_W, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(CHAMPAGNE)
    .text('Veteran & REALTOR\u00AE', 0, authorBoxY + 52, { width: PAGE_W, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#8899aa')
    .text('Florida Gateway Realty  |  (904) 866-2860', 0, authorBoxY + 70, {
      width: PAGE_W,
      align: 'center',
    });

  // Bottom champagne line
  doc.rect(0, PAGE_H - 5, PAGE_W, 5).fill(CHAMPAGNE);

  // Bottom corner elements
  doc
    .moveTo(MARGIN, PAGE_H - 60)
    .lineTo(MARGIN + 120, PAGE_H - 60)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(MARGIN, PAGE_H - 60)
    .lineTo(MARGIN, PAGE_H - 80)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();

  doc
    .moveTo(PAGE_W - MARGIN, PAGE_H - 60)
    .lineTo(PAGE_W - MARGIN - 120, PAGE_H - 60)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(PAGE_W - MARGIN, PAGE_H - 60)
    .lineTo(PAGE_W - MARGIN, PAGE_H - 80)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
})();

// ============================================================
// PAGE 2 - WELCOME FROM A FELLOW VETERAN
// ============================================================
doc.addPage();
(function page2() {
  whiteBackground();
  drawPageHeader('WELCOME FROM A FELLOW VETERAN', 'A Personal Note from Keneshia Haye');
  drawFooter(2);

  let y = 115;

  // Decorative quote mark
  doc.font('Helvetica-Bold').fontSize(60).fillColor(ACCENT_LIGHT).text('\u201C', MARGIN, y - 10);

  y += 45;

  doc
    .font('Times-Roman')
    .fontSize(12)
    .fillColor(DARK_GRAY)
    .text('Dear Future Jacksonville Neighbor,', MARGIN + 20, y, { width: CONTENT_W - 40, lineGap: 4 });

  y = doc.y + 14;

  const letter = `I know firsthand the stress and excitement that comes with receiving PCS orders. The uncertainty of moving your family to a new city, finding the right home, choosing schools, and navigating a new community \u2014 it can feel overwhelming. I have been there, and I want you to know that you are not alone in this journey.

As a proud military veteran myself, I understand the unique challenges that come with military life. The late-night conversations about whether to buy or rent. The worry about finding a neighborhood where your family will feel safe and connected. The hope that this next duty station will feel like home.

That is exactly why I created this guide. After going through my own PCS moves and eventually planting roots here in Jacksonville, I realized that our military families deserve more than just a list of houses \u2014 they deserve a trusted advisor who truly understands their needs.

Jacksonville is an incredible city for military families. With two major installations, a thriving veteran community, and endless opportunities for growth and adventure, this city has a special way of becoming home. The beaches are beautiful, the people are welcoming, and the cost of living allows you to build real wealth through homeownership.

Whether you are buying your first home with a VA loan, relocating with a growing family, or transitioning out of active duty, I am here to guide you every step of the way. My commitment to you goes beyond the transaction \u2014 I want to help you build a life you love in Jacksonville.

This guide is packed with everything you need to make your PCS move as smooth as possible. From neighborhood breakdowns and school information to your complete PCS timeline and VA loan guidance, consider this your personal roadmap to Jacksonville.

I look forward to helping you find your perfect home.`;

  doc
    .font('Times-Roman')
    .fontSize(10.5)
    .fillColor(DARK_GRAY)
    .text(letter, MARGIN + 20, y, { width: CONTENT_W - 40, lineGap: 3.5, paragraphGap: 8 });

  y = doc.y + 16;

  doc
    .font('Times-Roman')
    .fontSize(11)
    .fillColor(DARK_GRAY)
    .text('With gratitude and service,', MARGIN + 20, y, { width: CONTENT_W - 40 });

  y = doc.y + 14;

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(NAVY)
    .text('Keneshia Haye', MARGIN + 20, y, { width: CONTENT_W - 40 });

  y = doc.y + 3;

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(CHAMPAGNE)
    .text('Veteran | REALTOR\u00AE | Your Jacksonville Guide', MARGIN + 20, y, { width: CONTENT_W - 40 });
})();

// ============================================================
// PAGE 3 - JACKSONVILLE OVERVIEW
// ============================================================
doc.addPage();
(function page3() {
  whiteBackground();
  drawPageHeader('JACKSONVILLE OVERVIEW', 'Why Military Families Love Jacksonville');
  drawFooter(3);

  let y = 108;
  y = sectionHeading('The Bold New City of the South', y);

  y = bodyText(
    'Jacksonville, Florida is the largest city by land area in the contiguous United States and one of the most military-friendly cities in the nation. Home to over 50,000 active-duty service members, veterans, and their families, Jacksonville offers an unbeatable combination of affordability, opportunity, and quality of life.',
    y,
    { lineGap: 3 }
  );

  y += 12;

  // Quick facts box
  drawInfoBox(MARGIN, y, CONTENT_W, 110, 'QUICK FACTS', [
    'Population: ~1,000,000 (metro area: ~1.6 million)',
    'Average Temperature: 68\u00B0F (mild winters, warm summers)',
    'Cost of Living: 6% below national average',
    'State Income Tax: NONE \u2014 Florida has no state income tax',
    'Average Home Price: $280,000\u2013$370,000 (varies by area)',
    'Annual Sunshine: 265+ sunny days per year',
    'Beaches: 22 miles of Atlantic coastline',
  ]);

  y += 128;
  y = sectionHeading('Why Military Families Choose Jacksonville', y);

  const reasons = [
    'No State Income Tax \u2014 Keep more of your military pay and BAH. Florida is one of the most tax-friendly states for military members.',
    'Affordable Housing \u2014 BAH rates align well with the local housing market, making homeownership achievable for most ranks with a VA loan.',
    'Strong Military Community \u2014 With NAS Jacksonville and NS Mayport, you will find a welcoming community of military families, veteran-owned businesses, and organizations that support your lifestyle.',
    'Year-Round Outdoor Living \u2014 Enjoy beaches, fishing, hiking, kayaking, and more in the mild Florida climate.',
    'Excellent Healthcare \u2014 Access to Naval Hospital Jacksonville, VA outpatient clinics, and world-class civilian medical facilities.',
    'Growing Job Market \u2014 Major employers include Mayo Clinic, Baptist Health, CSX, and a booming logistics and tech sector \u2014 ideal for military spouses and transitioning service members.',
    'Top-Rated Schools \u2014 St. Johns County is consistently ranked among the best school districts in Florida, and Clay County offers excellent options near NAS Jacksonville.',
  ];

  reasons.forEach((reason) => {
    y = bulletPoint(reason, y, { fontSize: 9.5 });
    y += 1;
  });

  y += 8;
  y = sectionHeading('Major Employers', y);
  y = bodyText(
    'Naval Air Station Jacksonville  \u2022  Naval Station Mayport  \u2022  Mayo Clinic  \u2022  Baptist Health  \u2022  UF Health  \u2022  CSX Transportation  \u2022  Johnson & Johnson  \u2022  Bank of America  \u2022  Florida Blue  \u2022  City of Jacksonville  \u2022  Duval County Public Schools',
    y,
    { fontSize: 9, lineGap: 2 }
  );
})();

// ============================================================
// PAGE 4 - MILITARY INSTALLATIONS
// ============================================================
doc.addPage();
(function page4() {
  whiteBackground();
  drawPageHeader('MILITARY INSTALLATIONS', 'Bases Serving the Jacksonville Area');
  drawFooter(4);

  let y = 108;

  // NAS Jacksonville
  y = sectionHeading('Naval Air Station Jacksonville', y, { fontSize: 13 });

  y = bodyText(
    'NAS Jacksonville is the largest Navy base in the Southeast and the third largest in the U.S. Located on the Westside of Jacksonville along the St. Johns River, the installation is home to numerous aviation squadrons and support commands.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );
  y += 8;

  const nasInfo = [
    'Location: Westside Jacksonville, off US-17 (Roosevelt Blvd)',
    'Mission: Fleet Readiness Center Southeast, maritime patrol and reconnaissance squadrons',
    'Main Gate: Yorktown Ave Gate (open 24/7)',
    'Personnel: 25,000+ military and civilian employees',
    'Housing: Over 1,000 on-base family housing units',
    'Amenities: Commissary, NEX, gym, pool, golf course, marina, child development centers',
    'Base Operator: (904) 542-2345',
    'Housing Office: (904) 542-4515',
  ];

  nasInfo.forEach((info) => {
    y = bulletPoint(info, y, { fontSize: 9 });
  });

  y += 14;

  // NS Mayport
  y = sectionHeading('Naval Station Mayport', y, { fontSize: 13 });

  y = bodyText(
    'NS Mayport is the third largest naval fleet concentration area in the U.S. and the only military harbor on the East Coast south of Norfolk capable of accommodating aircraft carriers. Located at the mouth of the St. Johns River on the Atlantic coast.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );
  y += 8;

  const mayportInfo = [
    'Location: Atlantic Beach / Mayport area, at the mouth of the St. Johns River',
    'Mission: Surface warfare, helicopter maritime strike squadrons, carrier operations',
    'Main Gate: Mayport Rd Gate (open 24/7)',
    'Personnel: 15,000+ military and civilian employees',
    'Housing: On-base family housing managed by Balfour Beatty',
    'Amenities: Commissary, NEX, fitness center, beach access, Pelican Roost RV Park',
    'Base Operator: (904) 270-5011',
    'Housing Office: (904) 270-5857',
  ];

  mayportInfo.forEach((info) => {
    y = bulletPoint(info, y, { fontSize: 9 });
  });

  y += 14;

  // Camp Blanding
  y = sectionHeading('Camp Blanding Joint Training Center', y, { fontSize: 13 });

  y = bodyText(
    'Camp Blanding is a Florida National Guard installation located approximately 50 miles southwest of Jacksonville in Starke, FL. It serves as a major training facility for National Guard, Reserve, and active-duty units.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );
  y += 8;

  const campInfo = [
    'Location: Starke, FL (Clay County) \u2014 approx. 50 miles SW of Jacksonville',
    'Mission: Joint training center for National Guard and Reserve components',
    'Facilities: Ranges, maneuver areas, simulations, and support facilities',
    'Camp Blanding Museum & Memorial Park open to visitors',
    'Main Number: (904) 682-3000',
  ];

  campInfo.forEach((info) => {
    y = bulletPoint(info, y, { fontSize: 9 });
  });
})();

// ============================================================
// PAGE 5 - NEIGHBORHOODS BY BASE
// ============================================================
doc.addPage();
(function page5() {
  whiteBackground();
  drawPageHeader('NEIGHBORHOODS BY BASE', 'Where to Live Near Your Installation');
  drawFooter(5);

  let y = 108;

  y = sectionHeading('Near NAS Jacksonville', y, { fontSize: 13 });
  y = bodyText(
    'These neighborhoods offer the best commute times and lifestyle options for families stationed at NAS Jacksonville.',
    y,
    { fontSize: 9.5, lineGap: 2 }
  );
  y += 6;

  const nasNeighborhoods = [
    {
      name: 'Riverside (32204)',
      desc: 'Historic, walkable neighborhood with eclectic dining and arts scene.',
      price: '$250K\u2013$450K',
      commute: '10\u201315 min',
    },
    {
      name: 'Avondale (32205)',
      desc: 'Tree-lined streets, boutique shopping, family-friendly with great parks.',
      price: '$275K\u2013$500K',
      commute: '10\u201312 min',
    },
    {
      name: 'Orange Park (32073)',
      desc: 'Suburban feel, excellent Clay County schools, spacious newer homes.',
      price: '$250K\u2013$400K',
      commute: '15\u201325 min',
    },
    {
      name: 'Westside (32210)',
      desc: 'Closest to the base, most affordable, many military families.',
      price: '$180K\u2013$300K',
      commute: '5\u201310 min',
    },
    {
      name: 'Argyle (32244)',
      desc: 'Newer developments, good schools, suburban community.',
      price: '$230K\u2013$350K',
      commute: '10\u201320 min',
    },
  ];

  nasNeighborhoods.forEach((n) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY).text(n.name, MARGIN, y, { width: CONTENT_W });
    y = doc.y + 1;
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(DARK_GRAY)
      .text(n.desc, MARGIN + 14, y, { width: CONTENT_W - 14, lineGap: 1 });
    y = doc.y + 1;
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(CHAMPAGNE)
      .text(`Price Range: ${n.price}  |  Commute to NAS Jax: ${n.commute}`, MARGIN + 14, y, {
        width: CONTENT_W - 14,
      });
    y = doc.y + 10;
  });

  y += 6;
  y = sectionHeading('Near NS Mayport', y, { fontSize: 13 });
  y = bodyText(
    'Beach communities and coastal neighborhoods with easy access to Naval Station Mayport.',
    y,
    { fontSize: 9.5, lineGap: 2 }
  );
  y += 6;

  const mayportNeighborhoods = [
    {
      name: 'Atlantic Beach (32233)',
      desc: 'Charming coastal town, walkable to beach, close-knit community feel.',
      price: '$350K\u2013$600K',
      commute: '5\u201310 min',
    },
    {
      name: 'Neptune Beach (32266)',
      desc: 'Quiet beach community, great restaurants, family-oriented.',
      price: '$375K\u2013$650K',
      commute: '8\u201312 min',
    },
    {
      name: 'Ponte Vedra (32082)',
      desc: 'Upscale coastal community, top-rated St. Johns County schools.',
      price: '$400K\u2013$800K+',
      commute: '20\u201330 min',
    },
    {
      name: 'Jacksonville Beach (32250)',
      desc: 'Vibrant beach town, dining, nightlife, and outdoor activities.',
      price: '$325K\u2013$550K',
      commute: '10\u201315 min',
    },
  ];

  mayportNeighborhoods.forEach((n) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY).text(n.name, MARGIN, y, { width: CONTENT_W });
    y = doc.y + 1;
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(DARK_GRAY)
      .text(n.desc, MARGIN + 14, y, { width: CONTENT_W - 14, lineGap: 1 });
    y = doc.y + 1;
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(CHAMPAGNE)
      .text(`Price Range: ${n.price}  |  Commute to NS Mayport: ${n.commute}`, MARGIN + 14, y, {
        width: CONTENT_W - 14,
      });
    y = doc.y + 10;
  });

  y += 8;

  // Pro tip box
  doc.roundedRect(MARGIN, y, CONTENT_W, 52, 4).fill('#f7f4ef');
  doc.roundedRect(MARGIN, y, CONTENT_W, 52, 4).strokeColor(CHAMPAGNE).lineWidth(1).stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(NAVY)
    .text('PRO TIP FROM KENESHIA:', MARGIN + 12, y + 10, { width: CONTENT_W - 24 });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(DARK_GRAY)
    .text(
      'If you are stationed at NAS Jacksonville but want beach access on weekends, neighborhoods like Ortega and Murray Hill split the difference beautifully. I can help you find the perfect balance of commute time, lifestyle, and budget.',
      MARGIN + 12,
      y + 24,
      { width: CONTENT_W - 24, lineGap: 2 }
    );
})();

// ============================================================
// PAGE 6 - SCHOOLS & EDUCATION
// ============================================================
doc.addPage();
(function page6() {
  whiteBackground();
  drawPageHeader('SCHOOLS & EDUCATION', 'Giving Your Children the Best Start');
  drawFooter(6);

  let y = 108;

  y = sectionHeading('Top School Districts', y);
  y = bodyText(
    'Jacksonville-area families have access to some of the highest-rated school districts in Florida. Your neighborhood choice will determine your school district, so consider education as a key factor in your home search.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );
  y += 8;

  // St. Johns County
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text('St. Johns County School District', MARGIN, y);
  y = doc.y + 3;
  const sjItems = [
    'Ranked #1 school district in Florida for multiple consecutive years',
    'Serves Ponte Vedra, St. Augustine, and surrounding areas',
    'High school graduation rate above 95%',
    'Exceptional STEM and arts programs',
    'Strong military family support programs',
  ];
  sjItems.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 8;

  // Clay County
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text('Clay County School District', MARGIN, y);
  y = doc.y + 3;
  const clayItems = [
    'Top-rated district serving Orange Park and Fleming Island areas',
    'Ideal for NAS Jacksonville families living south of the base',
    'Strong community involvement and military family programs',
    'Fleming Island High School consistently rated among the best in the state',
    'Excellent special education and gifted programs',
  ];
  clayItems.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 8;

  // Duval County
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text('Duval County Public Schools', MARGIN, y);
  y = doc.y + 3;
  const duvalItems = [
    'Largest district in the area with magnet and choice school programs',
    'Stanton College Prep \u2014 ranked among the best high schools nationally',
    'Douglas Anderson School of the Arts \u2014 nationally renowned arts education',
    'Military-connected schools with dedicated support staff',
    'Multiple A-rated elementary and middle schools across the county',
  ];
  duvalItems.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 10;
  y = sectionHeading('Military-Connected Schools & Resources', y, { fontSize: 12 });

  const milSchool = [
    'Base Child Development Centers (CDC) at both NAS Jax and NS Mayport offer affordable, high-quality childcare',
    'School Liaison Officers at each installation help with enrollment and transitions',
    'Florida Purple Star Schools recognize military-friendly campuses with transition support',
    'Interstate Compact on Educational Opportunity ensures smooth enrollment across state lines',
  ];
  milSchool.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 10;
  y = sectionHeading('Private Schools & Higher Education', y, { fontSize: 12 });

  const pvtSchool = [
    'Bolles School \u2014 prestigious college-preparatory school (Pre-K through 12)',
    'Episcopal School of Jacksonville \u2014 strong academics and character development',
    'University of North Florida (UNF) \u2014 military-friendly university with veteran services',
    'Florida State College at Jacksonville (FSCJ) \u2014 affordable degree programs',
    'Florida Bright Futures Scholarship \u2014 merit-based college scholarships for Florida residents',
    'Post-9/11 GI Bill benefits can be transferred to dependents for college tuition',
  ];
  pvtSchool.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });
})();

// ============================================================
// PAGE 7 - VA LOAN GUIDE
// ============================================================
doc.addPage();
(function page7() {
  whiteBackground();
  drawPageHeader('VA LOAN GUIDE', 'Your Key to Homeownership');
  drawFooter(7);

  let y = 108;

  y = sectionHeading('Understanding Your VA Loan Benefits', y);
  y = bodyText(
    'The VA loan is one of the most powerful benefits available to military service members. It allows you to purchase a home with exceptional terms that no conventional loan can match. As a veteran myself, I have seen firsthand how this benefit can transform lives.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );

  y += 10;

  // Benefits box
  drawInfoBox(MARGIN, y, CONTENT_W, 120, 'TOP VA LOAN BENEFITS', [
    '\u2713  $0 Down Payment \u2014 Purchase a home with no money down',
    '\u2713  No Private Mortgage Insurance (PMI) \u2014 Save $100\u2013$300+/month',
    '\u2713  Competitive Interest Rates \u2014 Typically 0.25\u20130.5% lower than conventional',
    '\u2713  Lenient Credit Requirements \u2014 Minimum score often around 580\u2013620',
    '\u2713  No Prepayment Penalties \u2014 Pay off your loan early without fees',
    '\u2713  Lifetime Benefit \u2014 Use your VA loan multiple times throughout your career',
    '\u2713  Seller Can Pay Closing Costs \u2014 Up to 4% of the purchase price',
    '\u2713  VA Assumable Loans \u2014 Buyers can assume your low rate when you sell',
  ]);

  y += 138;

  y = sectionHeading('Eligibility Requirements', y, { fontSize: 12 });

  const eligibility = [
    '90 consecutive days of active-duty service during wartime',
    '181 consecutive days of active-duty service during peacetime',
    '6+ years of service in the National Guard or Reserves',
    'Surviving spouses of veterans who died in service or from service-connected disabilities',
    'Currently serving active-duty members are eligible after 90 days',
  ];
  eligibility.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 10;

  y = sectionHeading('Certificate of Eligibility (COE)', y, { fontSize: 12 });
  y = bodyText(
    'Your COE verifies your eligibility for the VA loan benefit. You can obtain it through your lender (fastest method), online at VA.gov using eBenefits, or by submitting VA Form 26-1880 by mail. Most lenders can pull your COE electronically within minutes.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );

  y += 10;

  y = sectionHeading('VA Funding Fee', y, { fontSize: 12 });
  y = bodyText(
    'The VA funding fee is a one-time fee paid to the VA to help sustain the loan program. It ranges from 1.25% to 3.3% of the loan amount depending on your down payment and whether it is your first use. This fee can be rolled into your loan. Important exemptions include veterans receiving VA disability compensation, surviving spouses, and Purple Heart recipients on active duty.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );

  y += 10;

  y = sectionHeading('Using BAH to Qualify', y, { fontSize: 12 });
  y = bodyText(
    'Your Basic Allowance for Housing (BAH) counts as qualifying income for your VA loan. Jacksonville BAH rates are competitive and align well with the local housing market. For example, an E-5 with dependents receives approximately $1,800\u2013$2,000/month in BAH, which can support a home purchase in the $280K\u2013$350K range with a VA loan.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );

  y += 8;

  // Pro tip
  doc.roundedRect(MARGIN, y, CONTENT_W, 40, 4).fill('#f7f4ef');
  doc.roundedRect(MARGIN, y, CONTENT_W, 40, 4).strokeColor(CHAMPAGNE).lineWidth(1).stroke();
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(NAVY)
    .text('KENESHIA\u2019S TIP:', MARGIN + 12, y + 8, { continued: true, width: CONTENT_W - 24 });
  doc
    .font('Helvetica')
    .fillColor(DARK_GRAY)
    .text(
      ' I work with VA-savvy lenders who understand military income, BAH, and the unique aspects of military finances. I will connect you with the right lender to maximize your buying power.'
    );
})();

// ============================================================
// PAGE 8 - BUYING SIGHT UNSEEN
// ============================================================
doc.addPage();
(function page8() {
  whiteBackground();
  drawPageHeader('BUYING SIGHT UNSEEN', 'How to Purchase Your Home from Anywhere');
  drawFooter(8);

  let y = 108;

  y = sectionHeading('Buying a Home Before You Arrive', y);
  y = bodyText(
    'Many military families need to purchase a home before they PCS to Jacksonville. With today\u2019s technology and my proven remote-buying process, you can confidently purchase your home from anywhere in the world. I have helped numerous military families buy sight unseen, and I will guide you through every step.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );

  y += 12;

  // Step-by-step process
  const steps = [
    {
      title: '1. Virtual Tour Technology',
      desc: 'I use high-definition video walkthroughs, 3D Matterport tours, and live FaceTime/Zoom tours so you can explore every room, closet, and corner of a property in real time. I walk through the home as if you were there beside me, answering questions and pointing out details you would want to see in person.',
    },
    {
      title: '2. Video Walkthrough Protocol',
      desc: 'My detailed video walkthroughs cover the entire property inside and out, including the neighborhood, street, nearby amenities, and commute route to your base. I film at your convenience and can schedule multiple property tours in a single session so you can compare homes side by side.',
    },
    {
      title: '3. Remote Closing Process',
      desc: 'Florida supports remote notarization (RON), which allows you to complete your closing entirely online using a secure video platform. Your documents are signed electronically, witnessed by a certified remote notary, and recorded digitally. No need to fly in for closing day.',
    },
    {
      title: '4. Power of Attorney Options',
      desc: 'If remote notarization is not available or preferred, a Power of Attorney (POA) can be used. Your base JAG office can help you prepare a specific POA for your real estate transaction. This allows a trusted person to sign closing documents on your behalf.',
    },
    {
      title: '5. Comprehensive Inspections',
      desc: 'I coordinate and attend all inspections on your behalf \u2014 home inspection, termite/WDO inspection, roof, HVAC, and any specialty inspections. You receive detailed reports, photos, and my professional assessment so you can make informed decisions from anywhere.',
    },
  ];

  steps.forEach((step) => {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(NAVY).text(step.title, MARGIN, y, { width: CONTENT_W });
    y = doc.y + 3;
    y = bodyText(step.desc, y, { fontSize: 9.5, lineGap: 2.5, x: MARGIN + 14, width: CONTENT_W - 14 });
    y += 10;
  });

  y += 4;

  // Support box
  doc.roundedRect(MARGIN, y, CONTENT_W, 70, 4).fill(NAVY);
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(CHAMPAGNE)
    .text('HOW KENESHIA SUPPORTS REMOTE BUYERS', MARGIN + 16, y + 10, { width: CONTENT_W - 32 });

  const supportItems = [
    'Personalized property search based on your needs, budget, and lifestyle',
    'Neighborhood reconnaissance videos showing schools, parks, and amenities',
    'Dedicated communication on YOUR schedule \u2014 time zones and deployments accommodated',
    'Complete transaction management from offer through keys in hand',
  ];

  let sy = y + 28;
  supportItems.forEach((item) => {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(WHITE)
      .text('\u2713  ' + item, MARGIN + 16, sy, { width: CONTENT_W - 32, lineGap: 1 });
    sy = doc.y + 3;
  });
})();

// ============================================================
// PAGE 9 - PCS TIMELINE & CHECKLIST
// ============================================================
doc.addPage();
(function page9() {
  whiteBackground();
  drawPageHeader('PCS TIMELINE & CHECKLIST', 'Your Step-by-Step Moving Plan');
  drawFooter(9);

  let y = 108;

  y = sectionHeading('Your PCS Move at a Glance', y);
  y = bodyText(
    'A well-organized PCS move reduces stress and ensures nothing falls through the cracks. Use this timeline as your personal checklist from the moment you receive orders to settling into your new Jacksonville home.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );

  y += 12;

  const phases = [
    {
      title: '90 DAYS OUT \u2014 PLANNING & PREPARATION',
      color: NAVY,
      items: [
        'Contact Keneshia Haye to start your Jacksonville home search',
        'Get pre-approved with a VA-savvy lender (I can recommend trusted partners)',
        'Research neighborhoods and schools using this guide',
        'Begin virtual tours and narrow down your preferred areas',
        'Set up a TLE (Temporary Lodging Expense) plan if needed',
        'Start decluttering and organizing for your move',
        'Obtain copies of your children\u2019s school records',
        'Request your PCS orders and review your entitlements',
      ],
    },
    {
      title: '60 DAYS OUT \u2014 ACTIVE HOME SEARCH',
      color: NAVY,
      items: [
        'Schedule live virtual tours of your top property choices',
        'Review neighborhood walkthrough videos from Keneshia',
        'Narrow your choices to 2\u20133 finalist homes',
        'Schedule TMO briefing and coordinate your move',
        'Begin transferring medical and dental records',
        'Notify your children\u2019s current school of withdrawal',
        'Research and compare homeowner\u2019s insurance quotes',
      ],
    },
    {
      title: '30 DAYS OUT \u2014 MAKING IT OFFICIAL',
      color: NAVY,
      items: [
        'Submit your offer on your chosen home',
        'Complete VA appraisal and home inspection (Keneshia coordinates this)',
        'Confirm your moving dates with TMO',
        'Arrange temporary lodging if needed',
        'Begin packing and organizing your household goods',
        'Update your address with banks, insurance, and subscriptions',
        'Set up mail forwarding through USPS',
      ],
    },
    {
      title: '2 WEEKS OUT \u2014 FINAL PREPARATIONS',
      color: NAVY,
      items: [
        'Confirm closing date and review closing disclosure',
        'Set up utilities at your new Jacksonville home (JEA, internet, etc.)',
        'Pack essential items for travel (important documents, medications)',
        'Confirm HHG pickup dates and delivery window',
        'Complete final walkthrough (virtual or in-person)',
        'Prepare a welcome binder with local contacts and resources',
      ],
    },
    {
      title: 'ARRIVAL IN JACKSONVILLE \u2014 WELCOME HOME!',
      color: CHAMPAGNE,
      items: [
        'Meet Keneshia and receive your keys!',
        'Complete final walk-through and move into your new home',
        'Register your vehicle and update your driver\u2019s license (Florida has 30-day requirement)',
        'Enroll children in their new school',
        'Check in at your new command',
        'Explore your neighborhood and meet your new community',
        'Settle in and enjoy your new Jacksonville home!',
      ],
    },
  ];

  phases.forEach((phase) => {
    // Phase header
    doc.rect(MARGIN, y, CONTENT_W, 20).fill(phase.color === CHAMPAGNE ? CHAMPAGNE : NAVY);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(phase.color === CHAMPAGNE ? NAVY : WHITE)
      .text(phase.title, MARGIN + 10, y + 5, { width: CONTENT_W - 20 });
    y += 24;

    phase.items.forEach((item) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(DARK_GRAY)
        .text('\u2610  ' + item, MARGIN + 12, y, { width: CONTENT_W - 24, lineGap: 1 });
      y = doc.y + 2;
    });

    y += 6;
  });
})();

// ============================================================
// PAGE 10 - LIVING IN JACKSONVILLE
// ============================================================
doc.addPage();
(function page10() {
  whiteBackground();
  drawPageHeader('LIVING IN JACKSONVILLE', 'Everything You Need to Know About Your New City');
  drawFooter(10);

  let y = 108;

  y = sectionHeading('Beaches & Outdoor Recreation', y, { fontSize: 12 });
  const outdoor = [
    '22 miles of Atlantic coastline \u2014 surf, swim, and sunbathe year-round at Jacksonville Beach, Neptune Beach, and Atlantic Beach',
    'St. Johns River \u2014 kayaking, paddleboarding, fishing, and scenic river cruises through the heart of downtown',
    'Hanna Park (Kathryn Abbey Hanna Park) \u2014 500 acres of beachfront, hiking trails, mountain biking, and camping',
    'Timucuan Ecological Preserve \u2014 46,000 acres of coastal wetlands, nature trails, and kayak launches',
    'Guana Tolomato Matanzas Reserve \u2014 pristine beaches, fishing, and birdwatching south of Ponte Vedra',
    'World-class fishing \u2014 inshore, offshore, and freshwater fishing opportunities year-round',
  ];
  outdoor.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 8;

  y = sectionHeading('Family-Friendly Attractions', y, { fontSize: 12 });
  const family = [
    'Jacksonville Zoo and Gardens \u2014 one of the top zoos in the Southeast with over 2,000 animals',
    'Museum of Science & History (MOSH) \u2014 interactive exhibits, planetarium, and special events',
    'Cummer Museum of Art and Gardens \u2014 stunning gardens on the St. Johns River',
    'Jacksonville Arboretum & Botanical Gardens \u2014 free nature trails and outdoor classrooms',
    'Adventure Landing \u2014 water park, go-karts, laser tag, and family fun',
    'St. Augustine (35 min south) \u2014 America\u2019s oldest city with forts, museums, and beaches',
  ];
  family.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 8;

  y = sectionHeading('Sports & Entertainment', y, { fontSize: 12 });
  const sports = [
    'Jacksonville Jaguars (NFL) \u2014 catch a game at TIAA Bank Field, military appreciation events',
    'Jacksonville Jumbo Shrimp (MiLB) \u2014 affordable family-friendly minor league baseball',
    'TPC Sawgrass (Ponte Vedra) \u2014 home of THE PLAYERS Championship, one of golf\u2019s biggest events',
    'Jacksonville Icemen (ECHL) \u2014 professional hockey at VyStar Veterans Memorial Arena',
    'Downtown and Five Points nightlife, live music, and craft brewery scene',
    'San Marco and Riverside dining districts with locally-owned restaurants',
  ];
  sports.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 8;

  y = sectionHeading('Military Discounts & Perks', y, { fontSize: 12 });
  const discounts = [
    'Many local restaurants, shops, and services offer military discounts \u2014 always ask!',
    'Free or discounted admission to state parks, museums, and attractions with military ID',
    'MOAA (Military Officers Association) Jacksonville chapter hosts networking events',
    'Veterans of Foreign Wars (VFW) and American Legion posts throughout the area',
    'Military Appreciation Night events at Jaguars, Jumbo Shrimp, and Icemen games',
    'Local farmers markets and festivals celebrate the military community year-round',
  ];
  discounts.forEach((item) => {
    y = bulletPoint(item, y, { fontSize: 9 });
  });

  y += 8;
  y = sectionHeading('Food Scene Highlights', y, { fontSize: 12 });
  y = bodyText(
    'Jacksonville\u2019s food scene is booming. From fresh seafood at the beaches to international cuisine downtown, you will never run out of new places to try. Popular areas include the Five Points district in Riverside, the San Marco restaurant row, the Town Center dining hub, and the beachside taco and seafood joints. Do not miss local favorites for Southern comfort food, craft BBQ, and fresh-off-the-boat shrimp.',
    y,
    { fontSize: 9.5, lineGap: 3 }
  );
})();

// ============================================================
// PAGE 11 - IMPORTANT RESOURCES
// ============================================================
doc.addPage();
(function page11() {
  whiteBackground();
  drawPageHeader('IMPORTANT RESOURCES', 'Key Contacts for Military Families');
  drawFooter(11);

  let y = 108;

  y = sectionHeading('Military Support Services', y, { fontSize: 12 });

  const milResources = [
    { label: 'Military OneSource:', value: '1-800-342-9647 | militaryonesource.mil (24/7 confidential support)' },
    {
      label: 'NAS Jax Fleet & Family Support:',
      value: '(904) 542-5745 | Financial counseling, relocation assistance, family programs',
    },
    {
      label: 'NS Mayport Fleet & Family Support:',
      value: '(904) 270-6600 | Same services for Mayport-area families',
    },
    { label: 'NAS Jax Housing Office:', value: '(904) 542-4515 | On-base housing, privatized housing assistance' },
    { label: 'NS Mayport Housing Office:', value: '(904) 270-5857 | Base housing information and waitlists' },
    { label: 'Armed Forces Legal Assistance:', value: 'JAG offices on both NAS Jax and NS Mayport' },
  ];
  milResources.forEach((r) => {
    y = boldLabel(r.label, r.value, y, { fontSize: 9 });
    y += 2;
  });

  y += 8;
  y = sectionHeading('Veterans Affairs', y, { fontSize: 12 });

  const vaResources = [
    {
      label: 'VA Regional Office Jacksonville:',
      value: '1833 Boulevard St, Jacksonville, FL 32206 | (800) 827-1000',
    },
    {
      label: 'VA Outpatient Clinic Jacksonville:',
      value: '2081 Palmetto St, Jacksonville, FL 32206 | (904) 232-2751',
    },
    {
      label: 'Gainesville VA Medical Center:',
      value: '1601 SW Archer Rd, Gainesville, FL 32608 | (352) 376-1611',
    },
    { label: 'VA Crisis Line:', value: '988 (then press 1) | 24/7 confidential support for veterans in crisis' },
    { label: 'VA Benefits Hotline:', value: '(800) 827-1000 | Claims, disability, education benefits' },
    { label: 'eBenefits Portal:', value: 'ebenefits.va.gov | Manage your VA benefits online' },
  ];
  vaResources.forEach((r) => {
    y = boldLabel(r.label, r.value, y, { fontSize: 9 });
    y += 2;
  });

  y += 8;
  y = sectionHeading('USO & Community Support', y, { fontSize: 12 });

  const usoResources = [
    {
      label: 'USO Jacksonville:',
      value: 'Locations at NAS Jacksonville and Jacksonville International Airport',
    },
    {
      label: 'USO Mayport:',
      value: 'On-base support center with programs, events, and family support',
    },
    {
      label: 'K9s For Warriors:',
      value: 'Ponte Vedra Beach \u2014 service dogs for veterans with PTSD (k9sforwarriors.org)',
    },
    {
      label: 'Wounded Warrior Project HQ:',
      value: 'Jacksonville, FL \u2014 national headquarters for veteran support',
    },
    {
      label: 'Team Red White & Blue:',
      value: 'Active Jacksonville chapter with fitness and social events for veterans',
    },
  ];
  usoResources.forEach((r) => {
    y = boldLabel(r.label, r.value, y, { fontSize: 9 });
    y += 2;
  });

  y += 8;
  y = sectionHeading('Military Spouse Employment', y, { fontSize: 12 });

  const spouseResources = [
    {
      label: 'MyCAA (Military Spouse Career Advancement):',
      value: 'Up to $4,000 for education and career training',
    },
    {
      label: 'Hire Heroes USA:',
      value: 'Free career coaching and job placement for military spouses',
    },
    {
      label: 'Blue Star Families:',
      value: 'Career development, networking, and community connection programs',
    },
    {
      label: 'USAA Careers:',
      value: 'Military spouse-friendly employer with remote work opportunities',
    },
    {
      label: 'Florida Dept. of Economic Opportunity:',
      value: 'floridajobs.org \u2014 state job search and career resources',
    },
    {
      label: 'MOAA Spouse Programs:',
      value: 'Scholarship, career, and mentoring programs for military spouses',
    },
  ];
  spouseResources.forEach((r) => {
    y = boldLabel(r.label, r.value, y, { fontSize: 9 });
    y += 2;
  });

  y += 8;

  y = sectionHeading('Essential Local Services', y, { fontSize: 12 });
  const localServices = [
    { label: 'JEA (Jacksonville Electric Authority):', value: '(904) 665-6000 | Electric, water, sewer, gas' },
    { label: 'Comcast/Xfinity:', value: '1-800-934-6489 | Internet and cable service' },
    { label: 'AT&T Fiber:', value: '1-800-288-2020 | Fiber internet available in many areas' },
    { label: 'Duval County Tax Collector:', value: 'Vehicle registration and driver\u2019s license services' },
    { label: 'Emergency:', value: '911 | Non-Emergency Police: (904) 630-0500' },
  ];
  localServices.forEach((r) => {
    y = boldLabel(r.label, r.value, y, { fontSize: 9 });
    y += 2;
  });
})();

// ============================================================
// PAGE 12 - BACK COVER / CTA
// ============================================================
doc.addPage();
(function page12() {
  navyBackground();

  // Top champagne accent
  doc.rect(0, 0, PAGE_W, 5).fill(CHAMPAGNE);

  // Decorative corners (top)
  doc.moveTo(MARGIN, 50).lineTo(MARGIN + 100, 50).strokeColor(CHAMPAGNE).lineWidth(2).stroke();
  doc.moveTo(MARGIN, 50).lineTo(MARGIN, 70).strokeColor(CHAMPAGNE).lineWidth(2).stroke();
  doc.moveTo(PAGE_W - MARGIN, 50).lineTo(PAGE_W - MARGIN - 100, 50).strokeColor(CHAMPAGNE).lineWidth(2).stroke();
  doc.moveTo(PAGE_W - MARGIN, 50).lineTo(PAGE_W - MARGIN, 70).strokeColor(CHAMPAGNE).lineWidth(2).stroke();

  // Stars
  doc
    .font('Helvetica')
    .fontSize(16)
    .fillColor(CHAMPAGNE)
    .text('\u2605  \u2605  \u2605  \u2605  \u2605', 0, 100, { width: PAGE_W, align: 'center' });

  // Main headline
  doc
    .font('Helvetica-Bold')
    .fontSize(34)
    .fillColor(CHAMPAGNE)
    .text('WELCOME TO', 0, 150, { width: PAGE_W, align: 'center', characterSpacing: 4 });
  doc
    .font('Helvetica-Bold')
    .fontSize(34)
    .fillColor(WHITE)
    .text('JACKSONVILLE', 0, 192, { width: PAGE_W, align: 'center', characterSpacing: 4 });

  // Divider
  doc
    .moveTo(PAGE_W / 2 - 100, 245)
    .lineTo(PAGE_W / 2 + 100, 245)
    .strokeColor(CHAMPAGNE)
    .lineWidth(1.5)
    .stroke();

  // Subheadline
  doc
    .font('Helvetica')
    .fontSize(16)
    .fillColor(WHITE)
    .text('Let a Fellow Veteran Guide', 0, 270, { width: PAGE_W, align: 'center' });
  doc
    .font('Helvetica')
    .fontSize(16)
    .fillColor(WHITE)
    .text('Your PCS Move', 0, 292, { width: PAGE_W, align: 'center' });

  // Contact card
  const cardY = 345;
  const cardW = 340;
  const cardX = PAGE_W / 2 - cardW / 2;
  doc.roundedRect(cardX, cardY, cardW, 200, 6).fill('#0d1e38');
  doc.roundedRect(cardX, cardY, cardW, 200, 6).strokeColor(CHAMPAGNE).lineWidth(1.5).stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(WHITE)
    .text('Keneshia Haye', 0, cardY + 20, { width: PAGE_W, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(CHAMPAGNE)
    .text('Veteran & Licensed REALTOR\u00AE', 0, cardY + 48, { width: PAGE_W, align: 'center' });

  doc
    .moveTo(cardX + 40, cardY + 70)
    .lineTo(cardX + cardW - 40, cardY + 70)
    .strokeColor(CHAMPAGNE)
    .lineWidth(0.5)
    .stroke();

  const contactLines = [
    { icon: '\u260E', text: '(904) 866-2860' },
    { icon: '\u2709', text: 'keneshia@floridagatewayrealty.com' },
    { icon: '\u2302', text: 'Florida Gateway Realty' },
    { icon: '\u2316', text: 'Jacksonville, FL' },
  ];

  let cy = cardY + 84;
  contactLines.forEach((line) => {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(CHAMPAGNE)
      .text(line.icon, cardX + 50, cy, { continued: true });
    doc.font('Helvetica').fontSize(11).fillColor(WHITE).text('   ' + line.text);
    cy = doc.y + 6;
  });

  // Free consultation box
  const ctaY = 570;
  doc.roundedRect(MARGIN + 40, ctaY, CONTENT_W - 80, 60, 4).fill(CHAMPAGNE);

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(NAVY)
    .text('FREE PCS CONSULTATION', 0, ctaY + 12, { width: PAGE_W, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(NAVY)
    .text('Call or text today to start planning your move to Jacksonville.', 0, ctaY + 32, {
      width: PAGE_W,
      align: 'center',
    });

  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(NAVY)
    .text('No obligation. Just a veteran helping fellow military families.', 0, ctaY + 46, {
      width: PAGE_W,
      align: 'center',
    });

  // Equal Housing
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#667788')
    .text('Equal Housing Opportunity', 0, 670, { width: PAGE_W, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#556677')
    .text(
      'Each office is independently owned and operated. Information deemed reliable but not guaranteed.',
      0,
      685,
      { width: PAGE_W, align: 'center' }
    );

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#556677')
    .text('\u00A9 2026 Keneshia Haye. All rights reserved.', 0, 698, { width: PAGE_W, align: 'center' });

  // Bottom corners
  doc
    .moveTo(MARGIN, PAGE_H - 50)
    .lineTo(MARGIN + 100, PAGE_H - 50)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(MARGIN, PAGE_H - 50)
    .lineTo(MARGIN, PAGE_H - 70)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(PAGE_W - MARGIN, PAGE_H - 50)
    .lineTo(PAGE_W - MARGIN - 100, PAGE_H - 50)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();
  doc
    .moveTo(PAGE_W - MARGIN, PAGE_H - 50)
    .lineTo(PAGE_W - MARGIN, PAGE_H - 70)
    .strokeColor(CHAMPAGNE)
    .lineWidth(2)
    .stroke();

  // Bottom accent bar
  doc.rect(0, PAGE_H - 5, PAGE_W, 5).fill(CHAMPAGNE);
})();

// ============================================================
// FINALIZE
// ============================================================
doc.end();

stream.on('finish', () => {
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log('===========================================');
  console.log('  Military Relocation Guide - COMPLETE');
  console.log('===========================================');
  console.log(`  Output: ${outputPath}`);
  console.log(`  Size:   ${sizeMB} MB`);
  console.log(`  Pages:  12`);
  console.log('===========================================');
});
