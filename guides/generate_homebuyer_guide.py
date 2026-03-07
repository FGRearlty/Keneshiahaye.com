#!/usr/bin/env python3
"""
Generate a professional 12-page First-Time Homebuyer Guide PDF
for Keneshia Haye | Florida Gateway Realty
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
from reportlab.lib import colors

# ── Color Palette ──
NAVY = HexColor("#0a1628")
GOLD = HexColor("#c9a96e")
LIGHT_GOLD = HexColor("#e8d5a8")
DARK_BG = HexColor("#0d1b2a")
WHITE = white
LIGHT_GRAY = HexColor("#f5f5f5")
MED_GRAY = HexColor("#666666")
DARK_TEXT = HexColor("#1a1a2e")

# ── Branding ──
AUTHOR = "Keneshia Haye"
COMPANY = "Florida Gateway Realty"
PHONE = "(254) 449-5299"
EMAIL = "keneshia@fgragent.com"
WEBSITE = "keneshiahaye.com"
LICENSE = "BK3450416"

WIDTH, HEIGHT = letter  # 612 x 792 points


# ════════════════════════════════════════════════════════════════
# Custom Document Template with headers/footers
# ════════════════════════════════════════════════════════════════

class GuideDocTemplate(BaseDocTemplate):
    """Custom doc template that draws headers and footers."""

    def __init__(self, filename, **kwargs):
        self.page_titles = {}  # page_num -> title
        self.cover_pages = {1, 12}  # pages without standard header/footer
        super().__init__(filename, **kwargs)

    def set_page_title(self, page_num, title):
        self.page_titles[page_num] = title

    def afterFlowable(self, flowable):
        pass

    def afterPage(self):
        pass


def draw_header_footer(canvas_obj, doc):
    """Draw consistent header and footer on content pages."""
    page_num = canvas_obj.getPageNumber()

    # Skip header/footer on cover and back cover
    if page_num in (1, 12):
        return

    canvas_obj.saveState()

    # ── Header: Navy bar with gold accent ──
    canvas_obj.setFillColor(NAVY)
    canvas_obj.rect(0, HEIGHT - 50, WIDTH, 50, fill=1, stroke=0)

    # Gold accent line under header
    canvas_obj.setStrokeColor(GOLD)
    canvas_obj.setLineWidth(2)
    canvas_obj.line(36, HEIGHT - 52, WIDTH - 36, HEIGHT - 52)

    # Header text
    title = doc.page_titles.get(page_num, "")
    if title:
        canvas_obj.setFillColor(GOLD)
        canvas_obj.setFont("Helvetica-Bold", 14)
        canvas_obj.drawString(50, HEIGHT - 35, title)

    # ── Footer ──
    canvas_obj.setStrokeColor(GOLD)
    canvas_obj.setLineWidth(1)
    canvas_obj.line(36, 45, WIDTH - 36, 45)

    canvas_obj.setFillColor(MED_GRAY)
    canvas_obj.setFont("Helvetica", 8)
    footer_text = f"{AUTHOR}  |  {COMPANY}  |  {PHONE}"
    canvas_obj.drawString(50, 30, footer_text)

    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.drawRightString(WIDTH - 50, 30, f"Page {page_num} of 12")

    canvas_obj.restoreState()


# ════════════════════════════════════════════════════════════════
# Style definitions
# ════════════════════════════════════════════════════════════════

def create_styles():
    styles = getSampleStyleSheet()

    # Cover title
    styles.add(ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=38,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=12,
    ))

    styles.add(ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=16,
        leading=22,
        textColor=LIGHT_GOLD,
        alignment=TA_CENTER,
        spaceAfter=8,
    ))

    styles.add(ParagraphStyle(
        "CoverDetail",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=4,
    ))

    # Section heading (gold text on white bg)
    styles.add(ParagraphStyle(
        "SectionHead",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=24,
        textColor=NAVY,
        spaceBefore=10,
        spaceAfter=8,
    ))

    # Sub-section heading
    styles.add(ParagraphStyle(
        "SubHead",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=GOLD,
        spaceBefore=10,
        spaceAfter=4,
    ))

    # Body text
    styles.add(ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    ))

    # Bullet text
    styles.add(ParagraphStyle(
        "BulletItem",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=20,
        spaceAfter=3,
        bulletIndent=8,
    ))

    # Checkmark bullet
    styles.add(ParagraphStyle(
        "Check",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=20,
        spaceAfter=3,
        bulletIndent=8,
    ))

    # Quote / callout
    styles.add(ParagraphStyle(
        "Callout",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=14,
        textColor=GOLD,
        alignment=TA_CENTER,
        spaceBefore=8,
        spaceAfter=8,
        leftIndent=30,
        rightIndent=30,
    ))

    # Welcome letter body
    styles.add(ParagraphStyle(
        "Letter",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=DARK_TEXT,
        alignment=TA_LEFT,
        spaceAfter=8,
    ))

    # Letter signature
    styles.add(ParagraphStyle(
        "Signature",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=NAVY,
        alignment=TA_LEFT,
        spaceAfter=2,
    ))

    # Small text
    styles.add(ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=MED_GRAY,
        alignment=TA_CENTER,
        spaceAfter=2,
    ))

    # Table header style
    styles.add(ParagraphStyle(
        "TableHead",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=WHITE,
    ))

    # Table cell style
    styles.add(ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=DARK_TEXT,
    ))

    # CTA heading
    styles.add(ParagraphStyle(
        "CTAHead",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=10,
    ))

    styles.add(ParagraphStyle(
        "CTABody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=14,
        leading=20,
        textColor=LIGHT_GOLD,
        alignment=TA_CENTER,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        "CTADetail",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=4,
    ))

    # Numbered list
    styles.add(ParagraphStyle(
        "NumberedItem",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=20,
        spaceAfter=3,
        bulletIndent=8,
    ))

    return styles


# ════════════════════════════════════════════════════════════════
# Helper functions
# ════════════════════════════════════════════════════════════════

def gold_line():
    """Return a gold horizontal rule."""
    return HRFlowable(
        width="100%", thickness=1.5, color=GOLD,
        spaceBefore=6, spaceAfter=6
    )


def section_spacer(height=6):
    return Spacer(1, height)


def bullet_list(items, style_name="BulletItem", styles=None, bullet_char=None):
    """Create bullet-pointed paragraphs."""
    if bullet_char is None:
        bullet_char = "\u2022"  # bullet character
    elements = []
    for item in items:
        text = f"<font color='#c9a96e'>{bullet_char}</font>  {item}"
        elements.append(Paragraph(text, styles[style_name]))
    return elements


def check_list(items, styles):
    """Create checkmark list items."""
    elements = []
    check = "\u2713"  # checkmark
    for item in items:
        text = f"<font color='#c9a96e'><b>{check}</b></font>  {item}"
        elements.append(Paragraph(text, styles["Check"]))
    return elements


def numbered_list(items, styles):
    """Create numbered list."""
    elements = []
    for i, item in enumerate(items, 1):
        text = f"<font color='#c9a96e'><b>{i}.</b></font>  {item}"
        elements.append(Paragraph(text, styles["NumberedItem"]))
    return elements


# ════════════════════════════════════════════════════════════════
# PAGE BUILDERS
# ════════════════════════════════════════════════════════════════

def build_cover_page(styles):
    """Page 1 - Cover Page (custom background drawn via canvas)."""
    elements = []
    # Spacer to push content down (we draw the background in the canvas callback)
    elements.append(Spacer(1, 120))
    elements.append(Paragraph(
        "First-Time Homebuyer Guide",
        styles["CoverTitle"]
    ))
    elements.append(Paragraph(
        "Jacksonville, FL",
        ParagraphStyle(
            "CoverCity",
            parent=styles["CoverTitle"],
            fontSize=26,
            leading=32,
            spaceAfter=16,
        )
    ))
    elements.append(Spacer(1, 6))

    # Gold accent line (done via HRFlowable)
    elements.append(HRFlowable(
        width="60%", thickness=2, color=GOLD,
        spaceBefore=4, spaceAfter=12
    ))

    elements.append(Paragraph(
        "Your Complete Roadmap from Dream to Keys",
        styles["CoverSubtitle"]
    ))
    elements.append(Spacer(1, 30))

    elements.append(HRFlowable(
        width="40%", thickness=1, color=GOLD,
        spaceBefore=4, spaceAfter=12
    ))

    elements.append(Paragraph(
        "Presented by",
        ParagraphStyle("PresentedBy", parent=styles["CoverDetail"],
                       fontSize=10, textColor=LIGHT_GOLD)
    ))
    elements.append(Paragraph(
        f"<b>Keneshia Haye</b>, REALTOR(R) &amp; U.S. Military Veteran",
        ParagraphStyle("PresenterName", parent=styles["CoverDetail"],
                       fontSize=14, leading=18, textColor=WHITE)
    ))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"{COMPANY}  |  License #{LICENSE}",
        styles["CoverDetail"]
    ))
    elements.append(Spacer(1, 20))

    elements.append(HRFlowable(
        width="30%", thickness=1, color=GOLD,
        spaceBefore=4, spaceAfter=10
    ))

    elements.append(Paragraph(f"Phone: {PHONE}", styles["CoverDetail"]))
    elements.append(Paragraph(f"Email: {EMAIL}", styles["CoverDetail"]))
    elements.append(Paragraph(f"Web: {WEBSITE}", styles["CoverDetail"]))

    elements.append(Spacer(1, 30))
    elements.append(Paragraph(
        "<b>Dedicated. Determined. Dependable.</b>",
        ParagraphStyle("Tagline", parent=styles["CoverDetail"],
                       fontSize=12, textColor=GOLD)
    ))

    elements.append(PageBreak())
    return elements


def build_welcome_letter(styles):
    """Page 2 - Welcome Letter."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Welcome Letter", styles["SectionHead"]))
    elements.append(gold_line())
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("Dear Future Homeowner,", styles["Letter"]))
    elements.append(Spacer(1, 4))

    paragraphs = [
        "Buying your first home is one of the most exciting milestones in life - and I am honored that you are considering me to guide you through this journey.",

        "As a proud U.S. Military Veteran and Broker/Owner of Florida Gateway Realty, I understand that purchasing a home is about more than just a transaction. It is about finding a place where memories are made, families grow, and dreams become reality.",

        "I bring <b>The 3 D's</b> to every client relationship: <font color='#c9a96e'><b>Dedicated, Determined, and Dependable</b></font>. Whether you are a fellow veteran using your VA benefits, a young professional buying your first condo, or a growing family searching for the perfect neighborhood, I am here to make the process as smooth and stress-free as possible.",

        "This guide was created to give you a clear roadmap from start to finish. Inside, you will find practical advice, helpful checklists, and local Jacksonville insights to help you make confident decisions every step of the way.",

        "Let's turn your dream of homeownership into reality - together.",
    ]

    for p in paragraphs:
        elements.append(Paragraph(p, styles["Letter"]))

    elements.append(Spacer(1, 12))
    elements.append(Paragraph("Warm regards,", styles["Letter"]))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph("<b>Keneshia Haye</b>", styles["Signature"]))
    elements.append(Paragraph("Broker/Owner, Florida Gateway Realty", styles["Letter"]))
    elements.append(Paragraph("REALTOR(R) &amp; U.S. Military Veteran", styles["Letter"]))

    elements.append(PageBreak())
    return elements


def build_page3_ready_to_buy(styles):
    """Page 3 - Are You Ready to Buy?"""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Are You Ready to Buy?", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("Financial Readiness Checklist", styles["SubHead"]))
    elements.extend(check_list([
        "Stable employment for at least 2 years",
        "Emergency fund with 3-6 months of expenses saved",
        "Debt-to-income ratio under 43%",
        "Credit score of 620 or higher (580+ for FHA loans)",
        "Consistent savings pattern for down payment",
    ], styles))

    elements.append(section_spacer(8))
    elements.append(Paragraph("Emotional Readiness Signs", styles["SubHead"]))
    elements.extend(check_list([
        "You are ready to stay in one place for 3-5+ years",
        "You are comfortable with the responsibility of home maintenance",
        "You have researched neighborhoods and know where you want to live",
        "You understand that homeownership is a long-term investment",
    ], styles))

    elements.append(section_spacer(12))
    elements.append(Paragraph(
        '"If you answered yes to 3 or more of these, you are ready to take the next step!"',
        styles["Callout"]
    ))

    elements.append(PageBreak())
    return elements


def build_page4_budget(styles):
    """Page 4 - Understanding Your Budget."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Understanding Your Budget", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("How Lenders Determine What You Can Afford", styles["SubHead"]))
    elements.extend(bullet_list([
        "Your gross monthly income",
        "Monthly debt payments (car loans, student loans, credit cards)",
        "Credit history and score",
        "Down payment amount",
        "Current interest rates",
    ], styles=styles))

    elements.append(Paragraph("The 28/36 Rule Explained", styles["SubHead"]))
    elements.extend(bullet_list([
        "<b>28% Rule:</b> Your monthly housing costs should not exceed 28% of your gross monthly income",
        "<b>36% Rule:</b> Your total monthly debt payments should not exceed 36% of your gross monthly income",
        "<b>Example:</b> If you earn $5,000/month, aim for housing costs under $1,400 and total debt under $1,800",
    ], styles=styles))

    elements.append(Paragraph("Hidden Costs Beyond the Mortgage", styles["SubHead"]))
    elements.extend(bullet_list([
        "Homeowner's insurance: $1,200-$3,000/year in Florida",
        "Property taxes: Varies by county (Duval ~0.91%)",
        "HOA fees: $100-$500+/month if applicable",
        "Maintenance: Budget 1-2% of home value annually",
        "Utilities: $200-$400/month average",
    ], styles=styles))

    elements.append(Paragraph("Jacksonville Average Home Prices by Area", styles["SubHead"]))

    # Table of home prices
    table_data = [
        [Paragraph("<b>Area</b>", styles["TableHead"]),
         Paragraph("<b>Average Price</b>", styles["TableHead"])],
        ["Jacksonville (overall)", "~$320,000"],
        ["Orange Park", "~$285,000"],
        ["Ponte Vedra", "$550,000+"],
        ["Mandarin", "~$350,000"],
        ["Arlington", "~$250,000"],
        ["Westside", "~$225,000"],
    ]

    t = Table(table_data, colWidths=[3.2 * inch, 2.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)

    elements.append(PageBreak())
    return elements


def build_page5_preapproval(styles):
    """Page 5 - Getting Pre-Approved."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Getting Pre-Approved", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("Pre-Qualification vs. Pre-Approval", styles["SubHead"]))
    elements.extend(bullet_list([
        "<b>Pre-qualification:</b> Quick estimate based on self-reported info (less weight with sellers)",
        "<b>Pre-approval:</b> Verified by lender with documentation (strong offer advantage)",
    ], styles=styles))

    elements.append(Paragraph("Documents You Will Need", styles["SubHead"]))
    elements.extend(check_list([
        "W-2 forms from the past 2 years",
        "Federal tax returns (2 years)",
        "Recent pay stubs (30 days)",
        "Bank statements (2-3 months)",
        "Government-issued photo ID",
        "Social Security number",
        "List of debts and monthly payments",
    ], styles))

    elements.append(Paragraph("Why Pre-Approval Gives You an Edge", styles["SubHead"]))
    elements.extend(bullet_list([
        "Shows sellers you are a serious, qualified buyer",
        "Speeds up the closing process",
        "Helps you understand your true budget",
        "Gives you negotiating power in competitive markets",
    ], styles=styles))

    elements.append(Paragraph("Keneshia's Recommended Local Lenders", styles["SubHead"]))
    elements.append(Paragraph(
        "Your trusted lender partners will be listed here - contact Keneshia for current recommendations.",
        ParagraphStyle("LenderNote", parent=styles["Body"],
                       fontName="Helvetica-Oblique", textColor=MED_GRAY)
    ))

    elements.append(PageBreak())
    return elements


def build_page6_home_search(styles):
    """Page 6 - The Home Search."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("The Home Search", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("Making Your Must-Have vs. Nice-to-Have List", styles["SubHead"]))

    # Two-column table
    must_haves = "Number of bedrooms/bathrooms\nLocation/commute\nSchool district\nBudget range\nGarage/parking"
    nice_haves = "Updated kitchen\nPool\nLarge yard\nSpecific style\nExtra storage"

    col_data = [
        [Paragraph("<b>Must-Haves (Non-Negotiable)</b>", styles["TableHead"]),
         Paragraph("<b>Nice-to-Haves (Flexible)</b>", styles["TableHead"])],
    ]
    for m, n in zip(must_haves.split("\n"), nice_haves.split("\n")):
        col_data.append([f"  \u2022  {m}", f"  \u2022  {n}"])

    t = Table(col_data, colWidths=[3 * inch, 3 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)
    elements.append(section_spacer(6))

    elements.append(Paragraph("Neighborhood Considerations", styles["SubHead"]))
    elements.extend(bullet_list([
        "Commute time to work",
        "School ratings and proximity",
        "Crime statistics and safety",
        "Nearby amenities (grocery, medical, parks)",
        "Future development plans",
        "Flood zone status (important in Florida!)",
    ], styles=styles))

    elements.append(Paragraph("Jacksonville's Top Neighborhoods for First-Time Buyers", styles["SubHead"]))
    elements.extend(bullet_list([
        "<b>Riverside/Avondale:</b> Historic charm, walkable, vibrant dining scene",
        "<b>San Marco:</b> Boutique shopping, close to downtown, character homes",
        "<b>Mandarin:</b> Family-friendly, great schools, suburban feel",
        "<b>Orange Park:</b> Affordable, growing community, military-friendly",
        "<b>Arlington:</b> Budget-friendly, close to beaches, improving area",
        "<b>Fleming Island:</b> Top-rated schools, safe, community events",
    ], styles=styles))

    elements.append(Paragraph("How Keneshia Curates Personalized Property Matches", styles["SubHead"]))
    elements.append(Paragraph(
        '"I do not just send you automated listings. I take the time to understand your lifestyle, priorities, and goals to handpick properties that truly fit your needs."',
        styles["Callout"]
    ))

    elements.append(PageBreak())
    return elements


def build_page7_making_offer(styles):
    """Page 7 - Making an Offer."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Making an Offer", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("Anatomy of a Purchase Offer", styles["SubHead"]))
    elements.extend(bullet_list([
        "Offered purchase price",
        "Earnest money deposit amount",
        "Financing terms and contingencies",
        "Requested closing date",
        "Inspection contingency period",
        "Items included/excluded (appliances, fixtures)",
        "Deadline for seller response",
    ], styles=styles))

    elements.append(Paragraph("Earnest Money Explained", styles["SubHead"]))
    elements.extend(bullet_list([
        "Typically 1-3% of purchase price in Jacksonville",
        "Shows the seller you are serious",
        "Held in escrow until closing",
        "Applied toward your down payment or closing costs",
        "Protected by contingencies (you can get it back if deal falls through for covered reasons)",
    ], styles=styles))

    elements.append(Paragraph("Negotiation Strategies", styles["SubHead"]))
    elements.extend(bullet_list([
        "Know the comparable sales in the area",
        "Be flexible on closing date if possible",
        "Limit excessive contingencies in competitive markets",
        "Write a personal letter to the seller (can make a difference!)",
        "Have Keneshia negotiate repairs vs. credits strategically",
    ], styles=styles))

    elements.append(Paragraph("What Happens When Your Offer Is Accepted", styles["SubHead"]))
    elements.extend(numbered_list([
        "Earnest money is deposited into escrow",
        "Home inspection is scheduled",
        "Appraisal is ordered by lender",
        "Title search begins",
        "Final loan processing and underwriting",
        "Closing date is confirmed",
    ], styles))

    elements.append(PageBreak())
    return elements


def build_page8_inspections(styles):
    """Page 8 - Inspections & Appraisal."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Inspections &amp; Appraisal", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("Home Inspection Checklist - What Inspectors Look For", styles["SubHead"]))
    elements.extend(check_list([
        "Roof condition and age",
        "Foundation and structural integrity",
        "Electrical system and panel",
        "Plumbing (pipes, water heater, fixtures)",
        "HVAC system (especially important in Florida!)",
        "Windows, doors, and insulation",
        "Attic and crawl space",
        "Pest/termite inspection (critical in Florida)",
        "Mold and moisture issues",
    ], styles))

    elements.append(Paragraph("What to Expect from the Appraisal", styles["SubHead"]))
    elements.extend(bullet_list([
        "Ordered by your lender (not by you)",
        "Determines the fair market value",
        "Compares your home to recent similar sales",
        "Protects you from overpaying",
        "If appraisal comes in low, you have options to negotiate",
    ], styles=styles))

    elements.append(Paragraph("Negotiating Repairs", styles["SubHead"]))
    elements.extend(bullet_list([
        "Prioritize safety and structural issues",
        "Consider asking for credits instead of repairs",
        "Get estimates from licensed contractors",
        "Your agent (Keneshia!) will negotiate on your behalf",
    ], styles=styles))

    elements.append(Paragraph("When to Walk Away", styles["SubHead"]))
    elements.extend(bullet_list([
        "Major foundation or structural issues",
        "Severe mold or environmental hazards",
        "Seller refuses to negotiate on critical repairs",
        "Appraisal comes in significantly below offer price",
        "You discover undisclosed problems",
    ], styles=styles))

    elements.append(PageBreak())
    return elements


def build_page9_closing(styles):
    """Page 9 - Closing Day."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Closing Day", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("What to Bring to Closing", styles["SubHead"]))
    elements.extend(check_list([
        "Government-issued photo ID",
        "Cashier's check or wire transfer for closing costs",
        "Proof of homeowner's insurance",
        "Any remaining documents requested by lender or title company",
    ], styles))

    elements.append(Paragraph("Closing Costs Breakdown (typically 2-5% of purchase price)", styles["SubHead"]))
    elements.extend(bullet_list([
        "Loan origination fees",
        "Title insurance and search fees",
        "Attorney fees",
        "Recording fees",
        "Prepaid property taxes",
        "Prepaid homeowner's insurance",
        "HOA transfer fees (if applicable)",
        "Survey fee",
        "Pest inspection fee",
    ], styles=styles))

    elements.append(Paragraph("Final Walkthrough Tips", styles["SubHead"]))
    elements.extend(check_list([
        "Do this 24-48 hours before closing",
        "Verify all agreed-upon repairs were completed",
        "Test all appliances, lights, and plumbing",
        "Check that nothing was removed that should stay",
        "Confirm the home is in the agreed-upon condition",
    ], styles))

    elements.append(Paragraph("Timeline: Offer to Closing", styles["SubHead"]))
    timeline_data = [
        [Paragraph("<b>Timeline</b>", styles["TableHead"]),
         Paragraph("<b>Milestone</b>", styles["TableHead"])],
        ["Day 1-3", "Offer accepted, earnest money deposited"],
        ["Day 3-10", "Home inspection completed"],
        ["Day 7-21", "Appraisal completed"],
        ["Day 10-30", "Loan processing and underwriting"],
        ["Day 25-40", "Clear to close received"],
        ["Day 30-45", "Closing day! You get your keys!"],
    ]
    t = Table(timeline_data, colWidths=[1.5 * inch, 4 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)

    elements.append(PageBreak())
    return elements


def build_page10_after_close(styles):
    """Page 10 - After You Close."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("After You Close", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph("First Things to Do in Your New Home", styles["SubHead"]))
    elements.extend(check_list([
        "Change all the locks",
        "Set up utilities (JEA for Jacksonville)",
        "Update your address (USPS, DMV, bank, employer)",
        "Locate the main water shut-off and electrical panel",
        "Test smoke detectors and carbon monoxide detectors",
        "Meet your neighbors!",
    ], styles))

    elements.append(Paragraph("Important Contacts", styles["SubHead"]))
    contacts_data = [
        [Paragraph("<b>Service</b>", styles["TableHead"]),
         Paragraph("<b>Contact</b>", styles["TableHead"])],
        ["JEA (Jacksonville Electric Authority)", "(904) 665-6000"],
        ["City of Jacksonville Services", "(904) 630-CITY"],
        ["Duval County Property Appraiser", "(904) 255-5900"],
        ["Homeowner's Insurance Agent", "Your agent's number"],
        ["HOA Management (if applicable)", "See your HOA docs"],
    ]
    t = Table(contacts_data, colWidths=[3.2 * inch, 2.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)

    elements.append(Paragraph("Home Maintenance Schedule", styles["SubHead"]))
    maint_data = [
        [Paragraph("<b>Frequency</b>", styles["TableHead"]),
         Paragraph("<b>Tasks</b>", styles["TableHead"])],
        ["Monthly", "Check HVAC filters, test smoke detectors"],
        ["Quarterly", "Clean gutters, inspect exterior"],
        ["Bi-Annually", "Service HVAC system, check roof"],
        ["Annually", "Flush water heater, pest inspection, deep clean dryer vents"],
    ]
    t2 = Table(maint_data, colWidths=[1.5 * inch, 4.2 * inch])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(t2)

    elements.append(Paragraph("When to Call Keneshia", styles["SubHead"]))
    elements.extend(bullet_list([
        "Need a referral for a trusted contractor, plumber, or electrician",
        "Thinking about refinancing",
        "Curious about your home's current value",
        "Ready to buy your next home or investment property",
        "Know someone who needs a great REALTOR(R)!",
    ], styles=styles))

    elements.append(PageBreak())
    return elements


def build_page11_va_loan(styles):
    """Page 11 - VA Loan Spotlight."""
    elements = []
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("VA Loan Spotlight", styles["SectionHead"]))
    elements.append(gold_line())

    elements.append(Paragraph(
        '"As a proud U.S. Military Veteran, I have a special passion for helping fellow service members achieve homeownership."',
        styles["Callout"]
    ))

    elements.append(Paragraph("VA Loan Benefits", styles["SubHead"]))
    elements.extend(check_list([
        "$0 down payment required",
        "No private mortgage insurance (PMI)",
        "Competitive interest rates",
        "Limited closing costs",
        "No prepayment penalties",
        "Available for active duty, veterans, and surviving spouses",
    ], styles))

    elements.append(Paragraph("Quick Eligibility Check - You May Qualify If You:", styles["SubHead"]))
    elements.extend(check_list([
        "Served 90+ consecutive days during wartime",
        "Served 181+ days during peacetime",
        "Served 6+ years in the National Guard or Reserves",
        "Are the surviving spouse of a veteran who died in service or from a service-connected disability",
    ], styles))

    elements.append(Paragraph("How to Get Started with a VA Loan", styles["SubHead"]))
    elements.extend(numbered_list([
        "Obtain your Certificate of Eligibility (COE)",
        "Get pre-approved with a VA-approved lender",
        "Find your dream home with Keneshia",
        "Make an offer and close with confidence",
    ], styles))

    elements.append(section_spacer(12))
    elements.append(Paragraph(
        '"Ask Keneshia about VA loans - she is a veteran too! She understands the unique needs of military families and can connect you with VA-specialized lenders."',
        styles["Callout"]
    ))

    elements.append(PageBreak())
    return elements


def build_back_cover(styles):
    """Page 12 - Back Cover / CTA."""
    elements = []
    # Lots of spacing to center content vertically (background drawn by canvas)
    elements.append(Spacer(1, 140))

    elements.append(Paragraph(
        "Ready to Start?",
        styles["CTAHead"]
    ))
    elements.append(Paragraph(
        "Let's Talk!",
        ParagraphStyle("CTAHead2", parent=styles["CTAHead"],
                       fontSize=34, leading=40, textColor=GOLD)
    ))

    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(
        width="40%", thickness=2, color=GOLD,
        spaceBefore=4, spaceAfter=16
    ))

    elements.append(Paragraph(f"Phone: {PHONE}", styles["CTADetail"]))
    elements.append(Paragraph(f"Email: {EMAIL}", styles["CTADetail"]))
    elements.append(Paragraph(f"Web: {WEBSITE}", styles["CTADetail"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(
        "<b>Schedule your free consultation today</b>",
        ParagraphStyle("CTASchedule", parent=styles["CTADetail"],
                       fontSize=14, textColor=GOLD)
    ))

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(
        width="50%", thickness=1, color=GOLD,
        spaceBefore=4, spaceAfter=12
    ))

    elements.append(Paragraph(
        '"Whether you are just starting to think about buying or you are ready to make an offer, I am here for you every step of the way."',
        ParagraphStyle("CTAQuote", parent=styles["CTABody"],
                       fontSize=11, leading=16,
                       fontName="Helvetica-Oblique")
    ))

    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<b>Keneshia Haye</b>", ParagraphStyle(
        "CTAName", parent=styles["CTADetail"], fontSize=16,
        fontName="Helvetica-Bold", textColor=WHITE
    )))
    elements.append(Paragraph(
        f"Broker/Owner, {COMPANY}",
        styles["CTADetail"]
    ))
    elements.append(Paragraph(
        "REALTOR(R) &amp; U.S. Military Veteran",
        styles["CTADetail"]
    ))
    elements.append(Paragraph(
        f"License #{LICENSE}",
        ParagraphStyle("CTALicense", parent=styles["CTADetail"],
                       fontSize=10, textColor=LIGHT_GOLD)
    ))

    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Equal Housing Opportunity", ParagraphStyle(
        "EHO", parent=styles["CTADetail"], fontSize=9, textColor=LIGHT_GOLD
    )))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        "<b>Dedicated. Determined. Dependable.</b>",
        ParagraphStyle("FinalTagline", parent=styles["CTADetail"],
                       fontSize=14, textColor=GOLD)
    ))

    return elements


# ════════════════════════════════════════════════════════════════
# Canvas callbacks for cover/back-cover backgrounds
# ════════════════════════════════════════════════════════════════

def draw_cover_background(canvas_obj, doc):
    """Draw navy background and gold accents on page 1."""
    page_num = canvas_obj.getPageNumber()
    if page_num == 1:
        canvas_obj.saveState()

        # Full navy background
        canvas_obj.setFillColor(NAVY)
        canvas_obj.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)

        # Gold border lines
        canvas_obj.setStrokeColor(GOLD)
        canvas_obj.setLineWidth(3)
        margin = 24
        canvas_obj.rect(margin, margin, WIDTH - 2 * margin, HEIGHT - 2 * margin,
                        fill=0, stroke=1)

        # Inner accent line
        canvas_obj.setLineWidth(1)
        inner = 30
        canvas_obj.rect(inner, inner, WIDTH - 2 * inner, HEIGHT - 2 * inner,
                        fill=0, stroke=1)

        # Top decorative gold bar
        canvas_obj.setFillColor(GOLD)
        canvas_obj.rect(60, HEIGHT - 80, WIDTH - 120, 3, fill=1, stroke=0)

        # Bottom decorative gold bar
        canvas_obj.rect(60, 75, WIDTH - 120, 3, fill=1, stroke=0)

        canvas_obj.restoreState()

    elif page_num == 12:
        canvas_obj.saveState()

        # Full navy background
        canvas_obj.setFillColor(NAVY)
        canvas_obj.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)

        # Gold border
        canvas_obj.setStrokeColor(GOLD)
        canvas_obj.setLineWidth(3)
        margin = 24
        canvas_obj.rect(margin, margin, WIDTH - 2 * margin, HEIGHT - 2 * margin,
                        fill=0, stroke=1)

        # Inner line
        canvas_obj.setLineWidth(1)
        inner = 30
        canvas_obj.rect(inner, inner, WIDTH - 2 * inner, HEIGHT - 2 * inner,
                        fill=0, stroke=1)

        canvas_obj.restoreState()


def on_all_pages(canvas_obj, doc):
    """Combined callback: backgrounds + header/footer."""
    draw_cover_background(canvas_obj, doc)
    draw_header_footer(canvas_obj, doc)


# ════════════════════════════════════════════════════════════════
# MAIN - Build the PDF
# ════════════════════════════════════════════════════════════════

def main():
    output_path = os.path.join(
        r"C:\Users\Jutsu\Keneshiahayesite\guides",
        "first-time-homebuyer-guide.pdf"
    )

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    styles = create_styles()

    # Create document
    doc = GuideDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=70,
        bottomMargin=60,
        leftMargin=50,
        rightMargin=50,
        title="First-Time Homebuyer Guide - Jacksonville, FL",
        author=f"{AUTHOR} | {COMPANY}",
        subject="A comprehensive guide for first-time homebuyers in Jacksonville, Florida",
        creator=f"{AUTHOR} | {COMPANY}",
    )

    # Set page titles (mapped to expected page numbers)
    page_titles = {
        2: "Welcome Letter",
        3: "Are You Ready to Buy?",
        4: "Understanding Your Budget",
        5: "Getting Pre-Approved",
        6: "The Home Search",
        7: "Making an Offer",
        8: "Inspections & Appraisal",
        9: "Closing Day",
        10: "After You Close",
        11: "VA Loan Spotlight",
    }
    for pn, title in page_titles.items():
        doc.set_page_title(pn, title)

    # Create frame and page template
    frame = Frame(
        doc.leftMargin, doc.bottomMargin,
        doc.width, doc.height,
        id="main"
    )
    template = PageTemplate(id="AllPages", frames=frame, onPage=on_all_pages)
    doc.addPageTemplates([template])

    # ── Build all page content ──
    story = []
    story.extend(build_cover_page(styles))        # Page 1
    story.extend(build_welcome_letter(styles))     # Page 2
    story.extend(build_page3_ready_to_buy(styles)) # Page 3
    story.extend(build_page4_budget(styles))       # Page 4
    story.extend(build_page5_preapproval(styles))  # Page 5
    story.extend(build_page6_home_search(styles))  # Page 6
    story.extend(build_page7_making_offer(styles)) # Page 7
    story.extend(build_page8_inspections(styles))  # Page 8
    story.extend(build_page9_closing(styles))      # Page 9
    story.extend(build_page10_after_close(styles)) # Page 10
    story.extend(build_page11_va_loan(styles))     # Page 11
    story.extend(build_back_cover(styles))         # Page 12

    # Build PDF
    doc.build(story)
    print(f"PDF generated successfully: {output_path}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")


if __name__ == "__main__":
    main()
