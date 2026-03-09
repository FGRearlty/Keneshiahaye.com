# GHL "Build using AI" Prompt — Homebuyer Guide Nurture Sequence

## How to Use This Prompt

1. Log into GoHighLevel
2. Go to **Automation > Workflows**
3. Click **+ Create Workflow**
4. Select **"Build using AI"** (or "Build Workflow with AI")
5. **Copy and paste the prompt below** into the AI text box
6. Click **Build** / **Generate**
7. Review the generated workflow and make any adjustments
8. After the workflow is generated, go into each email step and replace the body content with the HTML from our email template files (01 through 05)

---

## PROMPT TO COPY/PASTE INTO GHL AI BUILDER

```
Build a 5-email lead nurture workflow called "Homebuyer Guide Nurture Sequence" for a real estate agent. Here are the exact specifications:

TRIGGER:
- Trigger type: Contact Tag Added
- Tag name: website-guide-download
- This triggers when someone downloads a free homebuyer guide from our website

WORKFLOW STEPS (in exact order):

STEP 1 — Send Email (immediately after trigger)
- Action name: "Welcome Guide Email"
- Subject line: Your Free Homebuyer Guide is Here, {{contact.first_name}}!
- From name: Keneshia Haye
- From email: keneshia@fgragent.com
- Email body: Welcome the lead, thank them for downloading the First-Time Homebuyer Guide, provide a backup download link to https://keneshiahaye.com/guides/first-time-homebuyer-guide.pdf, introduce yourself as Keneshia Haye — Broker/Owner of Florida Gateway Realty and a U.S. Army Veteran specializing in first-time buyers and VA loans in Jacksonville FL. Let them know you will be sending helpful tips over the next couple weeks. Sign off warmly. Include P.S. with phone number (254) 449-5299.

STEP 2 — Wait
- Wait for: 2 days

STEP 3 — Send Email (Day 2)
- Action name: "Pre-Approval Tip Email"
- Subject line: The #1 Thing to Do Before House Hunting
- From name: Keneshia Haye
- From email: keneshia@fgragent.com
- Email body: Educate the lead about why getting pre-approved before house hunting is critical. Cover 3 reasons: (1) Know Your Real Budget, (2) Sellers Take Your Offer Seriously, (3) Speeds Up Closing. Include a checklist of what they need for pre-approval: W-2 forms last 2 years, federal tax returns last 2 years, bank statements last 2-3 months, recent pay stubs last 30 days, photo ID. Mention you work with trusted Jacksonville lenders who specialize in first-time buyers and VA loans. CTA button: "Schedule a Free Consultation" linking to https://keneshiahaye.com/contact.html. Include a Pro Tip box: don't make large purchases or open new credit lines while getting pre-approved.

STEP 4 — Wait
- Wait for: 3 days

STEP 5 — Send Email (Day 5)
- Action name: "Neighborhoods Email"
- Subject line: Best Jacksonville Neighborhoods for Your Budget
- From name: Keneshia Haye
- From email: keneshia@fgragent.com
- Email body: Answer the common question "Where should I buy in Jacksonville?" with a neighborhood breakdown by budget: Under $250K = Arlington, Westside; $250K-$350K = Orange Park, Mandarin, Murray Hill; $350K-$500K = San Marco, Riverside/Avondale; $500K+ = Ponte Vedra, Nocatee, Ponte Vedra Beach. Include 4 factors to consider: Commute Time, School Ratings, Flood Zones, Future Development. CTA button: "Read Our Full Neighborhood Guide" linking to https://keneshiahaye.com/blog/jacksonville-neighborhoods-first-time-buyers.html. Offer a personalized neighborhood tour.

STEP 6 — Wait
- Wait for: 3 days

STEP 7 — Send Email (Day 8)
- Action name: "VA Benefits Email"
- Subject line: Are You Leaving Money on the Table? (VA Loan Benefits)
- From name: Keneshia Haye
- From email: keneshia@fgragent.com
- Email body: Educate about VA loan benefits. Highlight 5 key benefits: (1) $0 Down Payment — on a $300K home, that's $15K-$60K saved, (2) No PMI — saves $100-$300/month, (3) Lower Interest Rates, (4) No Prepayment Penalties, (5) Reusable Benefit — can use multiple times. Include a personal note: as a U.S. Military Veteran herself, Keneshia has a special passion for helping fellow service members. List who qualifies: Veterans with honorable discharge, Active-duty 90+ days, National Guard/Reserve 6+ years, Surviving spouses. CTA button: "Learn More About VA Loans" linking to https://keneshiahaye.com/va-benefits.html. Also mention that non-veterans can explore FHA loans and down payment assistance programs.

STEP 8 — Wait
- Wait for: 4 days

STEP 9 — Send Email (Day 12)
- Action name: "Consultation CTA Email"
- Subject line: Ready to Start Your Home Search, {{contact.first_name}}?
- From name: Keneshia Haye
- From email: keneshia@fgragent.com
- Email body: Final email in the nurture sequence. Reference the tips shared over the past couple weeks. Describe what a free consultation looks like: (1) Quick 15-20 minute call or video chat, (2) Discuss goals, timeline and budget, (3) Create a personalized home search plan, (4) No pressure, no obligation. Include a client testimonial quote: "Keneshia made our first home purchase so easy! She was patient, knowledgeable, and always had our best interests at heart." Large CTA button: "Schedule Your Free Consultation" linking to https://keneshiahaye.com/contact.html. Also offer phone: (254) 449-5299. Closing message: whether ready now or a few months away, she is there whenever they need her.

STEP 10 — Add Tag
- Tag name: nurture-complete
- This marks contacts who completed the full 5-email sequence

STOP/EXIT CONDITIONS (apply to entire workflow):
1. If the contact books an appointment (Appointment Status = Booked), stop the workflow and add tag "consultation-booked"
2. If the contact replies to any email, send an internal notification to Keneshia (email and/or SMS) saying "Lead {{contact.first_name}} {{contact.last_name}} replied to the nurture sequence. Check your inbox!" and then stop the workflow
3. If the contact unsubscribes, stop the workflow (GHL handles this automatically)

ALL EMAILS SHOULD INCLUDE:
- Footer with: Keneshia Haye | Florida Gateway Realty, tagline "Dedicated. Determined. Dependable.", License #BK3450416
- Contact info: (254) 449-5299, keneshia@fgragent.com, keneshiahaye.com
- Unsubscribe link (use {{unsubscribe_link}})
- Physical address: Florida Gateway Realty, Jacksonville, FL
- Reason for receiving: "You're receiving this email because you downloaded a homebuyer guide from keneshiahaye.com"

BRANDING for all emails:
- Header: Dark navy background (#0a1628) with gold text (#c9a96e) showing "KENESHIA HAYE" and "FLORIDA GATEWAY REALTY"
- Gold accent line below header (#c9a96e)
- CTA buttons: Gold background (#c9a96e) with dark navy text (#0a1628)
- Pro tip/highlight boxes: Light cream background (#fdf8ee) with gold border
- Dark info boxes: Navy background (#0a1628) with white/gold text
- Clean, professional, mobile-responsive design
```

---

## AFTER THE AI GENERATES THE WORKFLOW

The AI will create the structure, but you'll want to refine the emails. For each email step:

1. Click into the email action
2. Switch to **Code/HTML** view
3. Replace the AI-generated email body with the corresponding HTML template:

| Email Step | Template File to Paste |
|------------|----------------------|
| Welcome Guide Email | `email-templates/01-welcome-guide.html` |
| Pre-Approval Tip Email | `email-templates/02-pre-approval-tip.html` |
| Neighborhoods Email | `email-templates/03-neighborhoods.html` |
| VA Benefits Email | `email-templates/04-va-benefits.html` |
| Consultation CTA Email | `email-templates/05-consultation-cta.html` |

This gives you the AI-built workflow structure with our pixel-perfect custom HTML email designs.

---

## ALTERNATIVE: SHORTER PROMPT (if GHL has character limits)

If the full prompt above is too long for GHL's AI builder, use this shorter version:

```
Create a 5-email lead nurture workflow called "Homebuyer Guide Nurture Sequence" for real estate agent Keneshia Haye of Florida Gateway Realty in Jacksonville, FL.

TRIGGER: Contact Tag Added = "website-guide-download"

SEQUENCE:
1. Email immediately: "Your Free Homebuyer Guide is Here, {{contact.first_name}}!" — Welcome email with guide download link (https://keneshiahaye.com/guides/first-time-homebuyer-guide.pdf). From: Keneshia Haye <keneshia@fgragent.com>
2. Wait 2 days
3. Email: "The #1 Thing to Do Before House Hunting" — Pre-approval tips with checklist. CTA: Schedule consultation at https://keneshiahaye.com/contact.html
4. Wait 3 days
5. Email: "Best Jacksonville Neighborhoods for Your Budget" — Neighborhood breakdown by price range. CTA: Read full guide at https://keneshiahaye.com/blog/jacksonville-neighborhoods-first-time-buyers.html
6. Wait 3 days
7. Email: "Are You Leaving Money on the Table? (VA Loan Benefits)" — VA loan benefits for veterans. CTA: Learn more at https://keneshiahaye.com/va-benefits.html
8. Wait 4 days
9. Email: "Ready to Start Your Home Search, {{contact.first_name}}?" — Final CTA for free consultation with testimonial. CTA: https://keneshiahaye.com/contact.html
10. Add tag: "nurture-complete"

STOP CONDITIONS: Stop workflow if contact books appointment (add tag "consultation-booked"), replies (notify Keneshia internally), or unsubscribes.

BRANDING: Navy (#0a1628) and gold (#c9a96e) color scheme. All emails from Keneshia Haye <keneshia@fgragent.com>. Footer: License #BK3450416, phone (254) 449-5299, website keneshiahaye.com. She is a U.S. Army Veteran and Broker/Owner specializing in first-time buyers and VA loans.
```

---

## TESTING AFTER SETUP

Once the workflow is built (either version):

1. **Temporarily change all wait steps to 1 minute** for testing
2. Create a test contact with your own email
3. Manually add the tag `website-guide-download` to the test contact
4. Verify all 5 emails arrive with correct content
5. **Change wait steps back** to the correct day intervals (2, 3, 3, 4 days)
6. Toggle the workflow to **Published/Active**

## IMPORTANT REMINDERS

- Make sure your sending domain (fgragent.com) is verified with SPF/DKIM/DMARC before going live
- If this is a new sending domain, use GHL's email warm-up feature first
- The website form handler (Cloudflare Worker) is already configured to add the `website-guide-download` tag to new contacts in GHL when they submit the guide download form on keneshiahaye.com
