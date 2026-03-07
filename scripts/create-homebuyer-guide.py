#!/usr/bin/env python3
"""
Create a professional 12-page First-Time Homebuyer Guide PDF
for Keneshia Haye / Florida Gateway Realty
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Frame, PageTemplate, BaseDocTemplate
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas

# ─── COLORS ──────────────────────────────────────────────────────────────
NAVY = HexColor("#0a1628")
CHAMPAGNE = HexColor("#c9a96e")
LIGHT_BG = HexColor("#f5f2ed")
DARK_TEXT = HexColor("#1a1a2e")
MEDIUM_GRAY = HexColor("#555555")
LIGHT_GRAY = HexColor("#e0ddd7")
WHITE = white

# ─── OUTPUT PATH ─────────────────────────────────────────────────────────
OUTPUT_DIR = r"C:\Users\Jutsu\Keneshiahayesite\guides"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "first-time-homebuyer-guide.pdf")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PAGE_W, PAGE_H = letter  # 612 x 792


# ═══════════════════════════════════════════════════════════════════════════
# CUSTOM FLOWABLES
# ═══════════════════════════════════════════════════════════════════════════

class GoldLine(Flowable):
    """A horizontal gold accent line."""
    def __init__(self, width, thickness=2):
        Flowable.__init__(self)
        self.width = width
        self.height = thickness
        self.thickness = thickness

    def draw(self):
        self.canv.setStrokeColor(CHAMPAGNE)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)


class ChampagneBulletItem(Flowable):
    """A bullet point with a champagne-colored bullet and text."""
    def __init__(self, text, style, bullet_size=6, indent=20):
        Flowable.__init__(self)
        self.text = text
        self.style = style
        self.bullet_size = bullet_size
        self.indent = indent
        self._para = Paragraph(text, style)
        self.width = style.leading * 20
        self.height = 0

    def wrap(self, availWidth, availHeight):
        text_width = availWidth - self.indent - 10
        w, h = self._para.wrap(text_width, availHeight)
        self.height = max(h, self.bullet_size + 4)
        self.width = availWidth
        return self.width, self.height

    def draw(self):
        # Draw champagne bullet
        self.canv.setFillColor(CHAMPAGNE)
        bullet_y = self.height - self.bullet_size - 3
        self.canv.circle(self.indent - 10, bullet_y, self.bullet_size / 2, fill=1, stroke=0)
        # Draw text
        self._para.drawOn(self.canv, self.indent, 0)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE BACKGROUNDS
# ═══════════════════════════════════════════════════════════════════════════

def cover_page_bg(canvas_obj, doc):
    """Navy background for cover page."""
    canvas_obj.saveState()
    canvas_obj.setFillColor(NAVY)
    canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas_obj.restoreState()


def back_cover_bg(canvas_obj, doc):
    """Navy background for back cover."""
    canvas_obj.saveState()
    canvas_obj.setFillColor(NAVY)
    canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas_obj.restoreState()


def content_page_bg(canvas_obj, doc):
    """Clean white background with subtle header and footer."""
    canvas_obj.saveState()
    # White background
    canvas_obj.setFillColor(WHITE)
    canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Navy header bar
    canvas_obj.setFillColor(NAVY)
    canvas_obj.rect(0, PAGE_H - 35, PAGE_W, 35, fill=1, stroke=0)
    # Header text
    canvas_obj.setFillColor(CHAMPAGNE)
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.drawString(50, PAGE_H - 23, "FIRST-TIME HOMEBUYER GUIDE")
    canvas_obj.drawRightString(PAGE_W - 50, PAGE_H - 23, "Keneshia Haye | Florida Gateway Realty")
    # Gold line under header
    canvas_obj.setStrokeColor(CHAMPAGNE)
    canvas_obj.setLineWidth(1.5)
    canvas_obj.line(0, PAGE_H - 35, PAGE_W, PAGE_H - 35)
    # Footer
    canvas_obj.setFillColor(MEDIUM_GRAY)
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.drawCentredString(PAGE_W / 2, 25, "(904) 866-2860  |  keneshia@fgragent.com  |  keneshiahaye.com")
    # Page number
    canvas_obj.setFillColor(CHAMPAGNE)
    canvas_obj.setFont("Helvetica-Bold", 8)
    canvas_obj.drawCentredString(PAGE_W / 2, 12, str(doc.page))
    canvas_obj.restoreState()


# ═══════════════════════════════════════════════════════════════════════════
# STYLES
# ═══════════════════════════════════════════════════════════════════════════

def build_styles():
    """Create all paragraph styles."""
    styles = {}

    # ── Cover page styles ────────────────────────────────────────────────
    styles["cover_title"] = ParagraphStyle(
        "cover_title",
        fontName="Helvetica-Bold",
        fontSize=36,
        leading=42,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    styles["cover_subtitle"] = ParagraphStyle(
        "cover_subtitle",
        fontName="Helvetica",
        fontSize=20,
        leading=26,
        textColor=CHAMPAGNE,
        alignment=TA_CENTER,
    )
    styles["cover_tagline"] = ParagraphStyle(
        "cover_tagline",
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=HexColor("#c0c8d8"),
        alignment=TA_CENTER,
    )
    styles["cover_info"] = ParagraphStyle(
        "cover_info",
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=HexColor("#a0a8b8"),
        alignment=TA_CENTER,
    )
    styles["cover_contact"] = ParagraphStyle(
        "cover_contact",
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=HexColor("#8890a0"),
        alignment=TA_CENTER,
    )

    # ── Content page styles ──────────────────────────────────────────────
    styles["page_title"] = ParagraphStyle(
        "page_title",
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=32,
        textColor=NAVY,
        spaceBefore=0,
        spaceAfter=4,
    )
    styles["page_subtitle"] = ParagraphStyle(
        "page_subtitle",
        fontName="Helvetica",
        fontSize=14,
        leading=18,
        textColor=CHAMPAGNE,
        spaceBefore=0,
        spaceAfter=12,
    )
    styles["section_heading"] = ParagraphStyle(
        "section_heading",
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=6,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=10,
        leading=14.5,
        textColor=DARK_TEXT,
        alignment=TA_JUSTIFY,
        spaceBefore=2,
        spaceAfter=4,
    )
    styles["body_center"] = ParagraphStyle(
        "body_center",
        fontName="Helvetica",
        fontSize=10,
        leading=14.5,
        textColor=DARK_TEXT,
        alignment=TA_CENTER,
        spaceBefore=2,
        spaceAfter=4,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=24,
        spaceBefore=1,
        spaceAfter=1,
    )
    styles["bullet_bold"] = ParagraphStyle(
        "bullet_bold",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=24,
        spaceBefore=1,
        spaceAfter=1,
    )
    styles["tip_box"] = ParagraphStyle(
        "tip_box",
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=14,
        textColor=NAVY,
        leftIndent=10,
        rightIndent=10,
        spaceBefore=8,
        spaceAfter=8,
        backColor=HexColor("#f0ebe0"),
        borderPadding=(8, 8, 8, 8),
    )
    styles["numbered"] = ParagraphStyle(
        "numbered",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=24,
        spaceBefore=2,
        spaceAfter=2,
    )
    styles["small"] = ParagraphStyle(
        "small",
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=MEDIUM_GRAY,
        spaceBefore=1,
        spaceAfter=1,
    )
    styles["welcome_body"] = ParagraphStyle(
        "welcome_body",
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=DARK_TEXT,
        alignment=TA_JUSTIFY,
        spaceBefore=4,
        spaceAfter=4,
    )
    styles["welcome_sign"] = ParagraphStyle(
        "welcome_sign",
        fontName="Helvetica-Oblique",
        fontSize=11,
        leading=16,
        textColor=DARK_TEXT,
        spaceBefore=4,
        spaceAfter=2,
    )

    # ── Back cover styles ────────────────────────────────────────────────
    styles["back_title"] = ParagraphStyle(
        "back_title",
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=40,
        textColor=WHITE,
        alignment=TA_CENTER,
    )
    styles["back_info"] = ParagraphStyle(
        "back_info",
        fontName="Helvetica",
        fontSize=14,
        leading=22,
        textColor=HexColor("#c0c8d8"),
        alignment=TA_CENTER,
    )
    styles["back_small"] = ParagraphStyle(
        "back_small",
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=HexColor("#8890a0"),
        alignment=TA_CENTER,
    )

    return styles


# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

def gold_bullet(text, styles):
    """Return a paragraph with a champagne bullet prefix."""
    return Paragraph(
        f'<font color="#c9a96e">\u2022</font>  {text}',
        styles["bullet"]
    )


def gold_bullet_bold(label, rest, styles):
    """Return a paragraph with a champagne bullet, bold label, and text."""
    return Paragraph(
        f'<font color="#c9a96e">\u2022</font>  <b>{label}</b> {rest}',
        styles["bullet"]
    )


def section_title(text, styles):
    """Return a section heading paragraph."""
    return Paragraph(text, styles["section_heading"])


def page_header(title, subtitle, styles):
    """Return flowables for a page title + subtitle + gold line."""
    items = [
        Paragraph(title, styles["page_title"]),
    ]
    if subtitle:
        items.append(Paragraph(subtitle, styles["page_subtitle"]))
    items.append(GoldLine(460, 2))
    items.append(Spacer(1, 10))
    return items


def tip_paragraph(text, styles):
    """Return a styled tip/callout paragraph."""
    return Paragraph(text, styles["tip_box"])


# ═══════════════════════════════════════════════════════════════════════════
# PAGE CONTENT BUILDERS
# ═══════════════════════════════════════════════════════════════════════════

def build_cover(styles):
    """Page 1: Cover page."""
    story = []
    story.append(Spacer(1, 140))
    story.append(Paragraph("First-Time<br/>Homebuyer Guide", styles["cover_title"]))
    story.append(Spacer(1, 16))
    story.append(Paragraph("Jacksonville, FL", styles["cover_subtitle"]))
    story.append(Spacer(1, 20))
    story.append(GoldLine(300, 2))
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "Your Complete Roadmap from Dream to Keys",
        styles["cover_tagline"]
    ))
    story.append(Spacer(1, 40))
    story.append(Paragraph(
        "Presented by Keneshia Haye, REALTOR &amp; U.S. Military Veteran",
        styles["cover_info"]
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Florida Gateway Realty  |  License #BK3450416",
        styles["cover_info"]
    ))
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "(904) 866-2860  |  keneshia@fgragent.com  |  keneshiahaye.com",
        styles["cover_contact"]
    ))
    story.append(PageBreak())
    return story


def build_welcome(styles):
    """Page 2: Welcome Letter."""
    story = []
    story.extend(page_header("Welcome, Future Homeowner!", None, styles))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Dear Future Homeowner,", styles["welcome_body"]))
    story.append(Spacer(1, 6))

    paragraphs = [
        "Buying your first home is one of the most exciting milestones in life, "
        "and I am honored to be part of your journey. Whether you are a young "
        "professional, a growing family, or a veteran transitioning to civilian "
        "life, owning a home is a powerful step toward building wealth and stability.",

        "As a U.S. Army Veteran and Broker/Owner of Florida Gateway Realty, I "
        "understand the unique challenges that come with buying your first home. "
        "I have walked this path myself, and I have guided hundreds of families "
        "through the process right here in Jacksonville, Florida.",

        "This guide was created to give you a clear, step-by-step roadmap from "
        "understanding your finances to picking up the keys to your new front "
        "door. No jargon, no confusion, just honest guidance from someone who "
        "genuinely cares about your success.",

        "Let us make your homeownership dream a reality.",
    ]

    for p in paragraphs:
        story.append(Paragraph(p, styles["welcome_body"]))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Warmly,", styles["welcome_sign"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Keneshia Haye</b>", styles["welcome_body"]))
    story.append(Paragraph("Broker/Owner, Florida Gateway Realty", styles["small"]))
    story.append(Paragraph("(904) 866-2860  |  keneshia@fgragent.com", styles["small"]))

    story.append(PageBreak())
    return story


def build_ready_to_buy(styles):
    """Page 3: Are You Ready to Buy?"""
    story = []
    story.extend(page_header("Are You Ready to Buy?", "Financial Readiness Checklist", styles))

    financial_items = [
        "Stable income for at least 2 years",
        "Emergency fund covering 3-6 months of expenses",
        "Debt-to-income ratio under 43%",
        "Credit score of 620 or higher (580 for FHA loans)",
        "Savings for down payment (3-20% of purchase price)",
        "No major credit changes planned (new car, credit cards)",
    ]
    for item in financial_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 12))
    story.append(section_title("Emotional Readiness Signs", styles))

    emotional_items = [
        "You are tired of renting and ready to invest in yourself",
        "You plan to stay in the area for at least 3-5 years",
        "You are ready to take on the responsibilities of homeownership",
    ]
    for item in emotional_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 14))
    story.append(tip_paragraph(
        "If you answered yes to 3 or more of these, you are ready to take the next step!",
        styles
    ))

    story.append(PageBreak())
    return story


def build_budget(styles):
    """Page 4: Understanding Your Budget."""
    story = []
    story.extend(page_header("Understanding Your Budget", None, styles))

    story.append(section_title("How Lenders Determine What You Can Afford", styles))
    items = [
        "Gross monthly income",
        "Existing debts",
        "Credit history",
        "Down payment amount",
    ]
    for item in items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("The 28/36 Rule", styles))
    story.append(gold_bullet(
        "No more than <b>28%</b> of gross monthly income on housing costs",
        styles
    ))
    story.append(gold_bullet(
        "No more than <b>36%</b> of gross monthly income on total debt",
        styles
    ))

    story.append(Spacer(1, 6))
    story.append(section_title("Hidden Costs Beyond the Mortgage", styles))
    hidden_costs = [
        ("Homeowners insurance:", "$1,200-$3,000/year in Florida"),
        ("Property taxes:", "approximately 0.86% of assessed value in Duval County"),
        ("HOA fees:", "$150-$400/month (if applicable)"),
        ("Maintenance:", "budget 1-2% of home value annually"),
        ("Utilities:", "$150-$300/month"),
    ]
    for label, rest in hidden_costs:
        story.append(gold_bullet_bold(label, rest, styles))

    story.append(Spacer(1, 8))
    story.append(section_title("Jacksonville Average Home Prices by Area", styles))

    # Table data
    table_data = [
        ["Area", "Average Price"],
        ["Jacksonville (overall)", "$320,000"],
        ["Orange Park", "$285,000"],
        ["Mandarin", "$350,000"],
        ["Ponte Vedra", "$550,000+"],
        ["Arlington", "$225,000"],
        ["Westside", "$250,000"],
    ]
    t = Table(table_data, colWidths=[240, 160])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), DARK_TEXT),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("BACKGROUND", (0, 1), (-1, -1), HexColor("#f9f7f3")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f9f7f3"), WHITE]),
        ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t)

    story.append(PageBreak())
    return story


def build_preapproval(styles):
    """Page 5: Getting Pre-Approved."""
    story = []
    story.extend(page_header("Getting Pre-Approved", None, styles))

    story.append(section_title("Pre-Qualification vs. Pre-Approval", styles))
    story.append(gold_bullet_bold(
        "Pre-qualification:",
        "Quick estimate based on self-reported info (not verified)",
        styles
    ))
    story.append(gold_bullet_bold(
        "Pre-approval:",
        "Lender verifies your income, assets, and credit (much stronger)",
        styles
    ))

    story.append(Spacer(1, 6))
    story.append(section_title("Documents You Will Need", styles))
    docs = [
        "Last 2 years of W-2s or 1099s",
        "Last 2 years of federal tax returns",
        "Last 2-3 months of bank statements",
        "Last 30 days of pay stubs",
        "Government-issued photo ID",
        "Social Security number",
    ]
    for d in docs:
        story.append(gold_bullet(d, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Why Pre-Approval Gives You an Edge", styles))
    edge_items = [
        "Sellers take your offer more seriously",
        "You know your exact budget",
        "Faster closing process",
        "Stronger negotiating position",
    ]
    for item in edge_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 10))
    story.append(tip_paragraph(
        "Keneshia's Tip: Get pre-approved BEFORE you start house hunting. "
        "It saves time, heartbreak, and puts you in the strongest position to compete.",
        styles
    ))

    story.append(PageBreak())
    return story


def build_home_search(styles):
    """Page 6: The Home Search."""
    story = []
    story.extend(page_header("The Home Search", None, styles))

    story.append(section_title("Making Your Must-Have vs. Nice-to-Have List", styles))
    story.append(Paragraph("<b>Must-Haves (non-negotiable):</b>", styles["body"]))
    for item in ["Number of bedrooms/bathrooms", "Location/commute", "Budget range", "School district"]:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Nice-to-Haves (flexible):</b>", styles["body"]))
    for item in ["Pool", "Garage", "Updated kitchen", "Large yard"]:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Neighborhood Considerations", styles))
    considerations = [
        "Commute time to work",
        "School ratings and proximity",
        "Crime statistics and safety",
        "Access to shopping, dining, healthcare",
        "Future development plans",
        "Flood zone status (important in Florida!)",
    ]
    for c in considerations:
        story.append(gold_bullet(c, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Jacksonville's Top Neighborhoods for First-Time Buyers", styles))
    neighborhoods = [
        ("Mandarin:", "Family-friendly, great schools, established community"),
        ("San Marco:", "Walkable, trendy, close to downtown"),
        ("Riverside/Avondale:", "Historic charm, vibrant dining scene"),
        ("Orange Park:", "Affordable, suburban feel, Clay County schools"),
        ("Nocatee:", "Master-planned community, resort-style amenities"),
    ]
    for label, rest in neighborhoods:
        story.append(gold_bullet_bold(label, rest, styles))

    story.append(Spacer(1, 8))
    story.append(tip_paragraph(
        "How Keneshia Works For You: I curate personalized property matches based on your "
        "exact criteria, schedule viewings around your schedule, and provide honest "
        "assessments of every home we tour.",
        styles
    ))

    story.append(PageBreak())
    return story


def build_making_offer(styles):
    """Page 7: Making an Offer."""
    story = []
    story.extend(page_header("Making an Offer", None, styles))

    story.append(section_title("Anatomy of a Purchase Offer", styles))
    offer_items = [
        "Purchase price",
        "Earnest money deposit (typically 1-3% of purchase price)",
        "Financing terms",
        "Inspection contingency",
        "Appraisal contingency",
        "Closing date preference",
        "Any special conditions",
    ]
    for item in offer_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Earnest Money Explained", styles))
    earnest_items = [
        "Good faith deposit showing you are serious",
        "Held in escrow by the title company",
        "Applied toward your closing costs or down payment",
        "Refundable if you back out within contingency periods",
    ]
    for item in earnest_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Negotiation Strategies", styles))
    story.append(Paragraph("<b>In a seller's market:</b>", styles["body"]))
    for item in [
        "Offer close to or above asking",
        "Minimize contingencies",
        "Be flexible on closing date",
    ]:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>In a buyer's market:</b>", styles["body"]))
    for item in [
        "Offer below asking",
        "Request seller concessions",
        "Ask for repairs or credits",
    ]:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 2))
    story.append(Paragraph(
        "<b>Always:</b> let Keneshia negotiate on your behalf",
        styles["body"]
    ))

    story.append(Spacer(1, 6))
    story.append(section_title("What Happens When Your Offer is Accepted", styles))
    accepted_items = [
        "Signed contract executed",
        "Earnest money deposited within 3 days",
        "Inspection period begins",
        "Lender orders appraisal",
        "Title search initiated",
    ]
    for item in accepted_items:
        story.append(gold_bullet(item, styles))

    story.append(PageBreak())
    return story


def build_inspections(styles):
    """Page 8: Inspections & Appraisal."""
    story = []
    story.extend(page_header("Inspections &amp; Appraisal", None, styles))

    story.append(section_title("Home Inspection Checklist", styles))
    story.append(Paragraph("What the Inspector Evaluates:", styles["body"]))
    inspection_items = [
        "Roof condition and age",
        "Foundation and structural integrity",
        "Electrical systems",
        "Plumbing systems",
        "HVAC system age and condition",
        "Windows and doors",
        "Insulation and ventilation",
        "Pest/termite damage (critical in Florida)",
        "Water damage and mold",
    ]
    for item in inspection_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("What to Expect from the Appraisal", styles))
    appraisal_items = [
        "Ordered by your lender (you pay for it)",
        "Determines fair market value of the property",
        "Compares to recent sales of similar homes",
        "If appraisal comes in low: renegotiate price, make up difference, or walk away",
    ]
    for item in appraisal_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Negotiating Repairs", styles))
    repair_items = [
        ("Major items (roof, HVAC, plumbing):", "always negotiate"),
        ("Minor cosmetic issues:", "usually not worth negotiating"),
        ("Safety hazards:", "non-negotiable, must be fixed"),
    ]
    for label, rest in repair_items:
        story.append(gold_bullet_bold(label, rest, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("When to Walk Away", styles))
    walk_away = [
        "Major structural issues",
        "Environmental hazards (mold, lead, asbestos)",
        "Seller refuses reasonable repair requests",
        "Appraisal significantly below purchase price",
    ]
    for item in walk_away:
        story.append(gold_bullet(item, styles))

    story.append(PageBreak())
    return story


def build_closing_day(styles):
    """Page 9: Closing Day."""
    story = []
    story.extend(page_header("Closing Day", None, styles))

    story.append(section_title("What to Bring to Closing", styles))
    bring_items = [
        "Government-issued photo ID",
        "Cashier's check or wire transfer for closing costs",
        "Proof of homeowners insurance",
        "Any remaining documentation requested by lender",
    ]
    for item in bring_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Closing Costs Breakdown (typically 2-5% of purchase price)", styles))
    cost_items = [
        "Loan origination fees",
        "Title insurance",
        "Attorney fees",
        "Recording fees",
        "Prepaid taxes and insurance",
        "Home warranty (optional but recommended)",
    ]
    for item in cost_items:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Final Walkthrough Tips", styles))
    walkthrough = [
        "Verify all agreed-upon repairs were completed",
        "Test all appliances, lights, and outlets",
        "Check for any new damage since inspection",
        "Confirm all fixtures included in the sale are present",
        "Run water in every sink and flush every toilet",
    ]
    for item in walkthrough:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Timeline: Offer to Closing", styles))
    timeline_data = [
        ["Timeline", "Milestone"],
        ["Day 1-3", "Earnest money deposited"],
        ["Day 1-10", "Home inspection"],
        ["Day 10-15", "Appraisal ordered and completed"],
        ["Day 15-30", "Loan underwriting and processing"],
        ["Day 30-45", "Clear to close, final walkthrough, closing day"],
    ]
    t = Table(timeline_data, colWidths=[100, 300])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 1), (0, -1), CHAMPAGNE),
        ("TEXTCOLOR", (1, 1), (-1, -1), DARK_TEXT),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f9f7f3"), WHITE]),
        ("GRID", (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t)

    story.append(PageBreak())
    return story


def build_after_close(styles):
    """Page 10: After You Close."""
    story = []
    story.extend(page_header("After You Close", None, styles))

    story.append(section_title("First Things to Do in Your New Home", styles))
    first_things = [
        "Change all locks and security codes",
        "Set up utilities (JEA, internet, cable)",
        "Update your address (USPS, DMV, banks, employer)",
        "File for homestead exemption with Duval County Property Appraiser",
        "Review your home warranty coverage",
        "Meet your neighbors",
    ]
    for item in first_things:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Important Contacts", styles))
    contacts = [
        ("JEA (Jacksonville Electric Authority):", "(904) 665-6000"),
        ("City of Jacksonville:", "(904) 630-CITY"),
        ("Duval County Property Appraiser:", "(904) 255-5900"),
        ("FEMA Flood Maps:", "msc.fema.gov"),
        ("Homestead Exemption:", "duvalpa.com"),
    ]
    for label, rest in contacts:
        story.append(gold_bullet_bold(label, rest, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Home Maintenance Schedule", styles))
    maintenance = [
        ("Monthly:", "Test smoke detectors, change HVAC filters"),
        ("Quarterly:", "Clean gutters, check caulking around tubs and windows"),
        ("Annually:", "Service HVAC, inspect roof, clean dryer vent"),
        ("Every 5 years:", "Have plumbing and electrical inspected"),
    ]
    for label, rest in maintenance:
        story.append(gold_bullet_bold(label, rest, styles))

    story.append(Spacer(1, 12))
    story.append(tip_paragraph(
        "Need a contractor, painter, landscaper, or handyman? "
        "Call Keneshia for trusted referrals: (904) 866-2860",
        styles
    ))

    story.append(PageBreak())
    return story


def build_va_loan(styles):
    """Page 11: VA Loan Spotlight."""
    story = []
    story.extend(page_header("VA Loan Spotlight", "Special Benefits for Those Who Served", styles))

    story.append(section_title("If You Are a Veteran, You Have Earned Incredible Benefits", styles))
    benefits = [
        "$0 down payment required",
        "No Private Mortgage Insurance (PMI)",
        "Competitive interest rates (often 0.5-1% lower)",
        "Limited closing costs",
        "No prepayment penalty",
        "Flexible credit requirements",
    ]
    for item in benefits:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("Quick Eligibility Check", styles))
    eligibility = [
        "90 consecutive days of active service during wartime",
        "181 days of active service during peacetime",
        "6 years in the National Guard or Reserves",
        "Surviving spouse of a veteran who died in service or from a service-connected disability",
    ]
    for item in eligibility:
        story.append(gold_bullet(item, styles))

    story.append(Spacer(1, 6))
    story.append(section_title("How to Get Started", styles))
    steps = [
        "Obtain your Certificate of Eligibility (COE) from VA.gov",
        "Get pre-approved with a VA-approved lender",
        "Find a VA-savvy REALTOR (that is Keneshia!)",
        "Find your dream home",
        "Close with confidence",
    ]
    for i, step in enumerate(steps, 1):
        story.append(Paragraph(
            f'<font color="#c9a96e"><b>{i}.</b></font>  {step}',
            styles["numbered"]
        ))

    story.append(Spacer(1, 10))
    story.append(tip_paragraph(
        "Ask Keneshia about VA loans - she is a veteran too! As a U.S. Army Veteran, "
        "Keneshia understands military life and the unique needs of veteran homebuyers.",
        styles
    ))

    # NOTE: No PageBreak here - the build_pdf function handles the template
    # switch and page break for the back cover transition
    return story


def build_back_cover(styles):
    """Page 12: Back Cover / CTA."""
    story = []
    story.append(Spacer(1, 160))
    story.append(Paragraph("Ready to Start?", styles["back_title"]))
    story.append(Paragraph("Let's Talk!", styles["back_title"]))
    story.append(Spacer(1, 24))
    story.append(GoldLine(300, 2))
    story.append(Spacer(1, 30))
    story.append(Paragraph("(904) 866-2860", styles["back_info"]))
    story.append(Paragraph("keneshia@fgragent.com", styles["back_info"]))
    story.append(Paragraph("keneshiahaye.com", styles["back_info"]))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Schedule your free consultation today", styles["back_info"]))
    story.append(Spacer(1, 30))
    story.append(GoldLine(300, 1))
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "Keneshia Haye, REALTOR &amp; U.S. Military Veteran",
        styles["back_small"]
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Florida Gateway Realty  |  License #BK3450416",
        styles["back_small"]
    ))
    story.append(Spacer(1, 20))
    story.append(Paragraph("Equal Housing Opportunity", styles["back_small"]))
    # No PageBreak on last page
    return story


# ═══════════════════════════════════════════════════════════════════════════
# MAIN BUILD
# ═══════════════════════════════════════════════════════════════════════════

def build_pdf():
    """Build the complete 12-page PDF."""

    # ── Create document with custom page templates ───────────────────────
    doc = BaseDocTemplate(
        OUTPUT_FILE,
        pagesize=letter,
        title="First-Time Homebuyer Guide - Jacksonville, FL",
        author="Keneshia Haye - Florida Gateway Realty",
        subject="A comprehensive guide for first-time homebuyers in Jacksonville, Florida",
        creator="Florida Gateway Realty",
    )

    # Frame for cover page (centered, generous margins)
    cover_frame = Frame(
        60, 40, PAGE_W - 120, PAGE_H - 80,
        id="cover_frame",
        showBoundary=0,
    )

    # Frame for content pages
    content_frame = Frame(
        55, 45, PAGE_W - 110, PAGE_H - 100,
        id="content_frame",
        showBoundary=0,
    )

    # Frame for back cover (centered)
    back_frame = Frame(
        60, 40, PAGE_W - 120, PAGE_H - 80,
        id="back_frame",
        showBoundary=0,
    )

    # Page templates
    cover_template = PageTemplate(
        id="cover",
        frames=[cover_frame],
        onPage=cover_page_bg,
    )
    content_template = PageTemplate(
        id="content",
        frames=[content_frame],
        onPage=content_page_bg,
    )
    back_template = PageTemplate(
        id="back",
        frames=[back_frame],
        onPage=back_cover_bg,
    )

    doc.addPageTemplates([cover_template, content_template, back_template])

    # ── Build styles ─────────────────────────────────────────────────────
    styles = build_styles()

    # ── Build story ──────────────────────────────────────────────────────
    story = []

    # Page 1: Cover (uses 'cover' template)
    story.extend(build_cover(styles))

    # Switch to content template for pages 2-11
    from reportlab.platypus.doctemplate import NextPageTemplate
    story.insert(len(story) - 1, NextPageTemplate("content"))

    # Page 2: Welcome
    story.extend(build_welcome(styles))

    # Page 3: Ready to Buy
    story.extend(build_ready_to_buy(styles))

    # Page 4: Budget
    story.extend(build_budget(styles))

    # Page 5: Pre-Approval
    story.extend(build_preapproval(styles))

    # Page 6: Home Search
    story.extend(build_home_search(styles))

    # Page 7: Making an Offer
    story.extend(build_making_offer(styles))

    # Page 8: Inspections
    story.extend(build_inspections(styles))

    # Page 9: Closing Day
    story.extend(build_closing_day(styles))

    # Page 10: After You Close
    story.extend(build_after_close(styles))

    # Page 11: VA Loan Spotlight
    story.extend(build_va_loan(styles))

    # Switch to back cover template BEFORE the PageBreak so it takes effect
    from reportlab.platypus.doctemplate import NextPageTemplate as NPT
    story.append(NPT("back"))
    story.append(PageBreak())

    # Page 12: Back Cover
    story.extend(build_back_cover(styles))

    # ── Build PDF ────────────────────────────────────────────────────────
    doc.build(story)
    print(f"PDF created successfully: {OUTPUT_FILE}")
    print(f"Pages: 12")


if __name__ == "__main__":
    build_pdf()
