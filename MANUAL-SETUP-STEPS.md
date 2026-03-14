# Manual Setup Steps — Keneshia Haye Website + GHL + Google Business

**Created:** March 10, 2026
**Status:** Ready for you to complete step-by-step

Everything below requires manual action in GBP, GHL, or GTM dashboards.
Copy-paste content is provided for each step.

---

## STEP 1: Fix Google Business Profile (5 minutes)

### 1A. Change Primary Website

1. Google search "Keneshia Haye Realtor"
2. Click **Edit profile** on your business listing
3. Go to **Contact** → **Website**
4. Change primary website to: `https://keneshiahaye.com`
5. Move the Calendly link to the **Appointment URL** field: `https://calendly.com/keneshiahaye`
6. Save

### 1B. Verify Phone Number

Your GBP and website both show **(254) 449-5299**. This is consistent.
However, a local (904) number would help local SEO. If you have a (904) number:
- Update GBP phone to match
- Let me know and I'll update the website + schema across all pages

### 1C. Update Business Description

In GBP → Edit profile → About → Business description, paste this (749 chars):

```
Keneshia Haye is a licensed REALTOR, U.S. Army Veteran, and Broker/Owner of Florida Gateway Realty, serving Jacksonville, FL and surrounding areas. Specializing in first-time homebuyers and VA loan transactions, Keneshia brings firsthand military experience to help Veterans, Active Duty service members, and their families achieve homeownership — often with little to no money out of pocket.

Whether you're PCSing to NAS Jacksonville, NS Mayport, or buying your first home anywhere in Northeast Florida, Keneshia provides personalized guidance from pre-approval through closing day.

Services include buyer & seller representation, VA loan expertise, military relocation (PCS) assistance, and new construction guidance.

Call (254) 449-5299 or visit keneshiahaye.com to schedule your free consultation.
```

---

## STEP 2: Add GBP Services (10 minutes)

In GBP → Edit profile → Services, add each of these:

**Service 1: Buyer Representation**
> Full-service buyer representation for first-time and experienced homebuyers in Jacksonville, FL and surrounding areas.

**Service 2: VA Loan Home Buying**
> Specialized assistance for Veterans and Active Duty military using VA home loan benefits. As a U.S. Army Veteran, Keneshia understands the unique needs of military buyers.

**Service 3: Seller Representation**
> Strategic home selling services including market analysis, staging guidance, and expert negotiation to get top dollar for your property.

**Service 4: Military Relocation (PCS)**
> Comprehensive relocation assistance for military families PCSing to or from Jacksonville, FL, including NAS Jacksonville, NS Mayport, and Camp Blanding.

**Service 5: New Construction Home Buying**
> Expert guidance through the new construction purchase process, including builder negotiations and construction monitoring.

**Service 6: First-Time Homebuyer Guidance**
> Step-by-step support for first-time homebuyers, from pre-approval through closing day.

**Service 7: Free Home Buyer Consultation**
> No-obligation consultation to discuss your home buying goals, timeline, and budget. Book at keneshiahaye.com/contact

---

## STEP 3: Add GBP Products (5 minutes)

In GBP → Edit profile → Products, add:

**Product 1: Free First-Time Homebuyer Guide**
- Price: Free
- Description: Download our comprehensive guide covering everything from budgeting to closing day. Get yours at keneshiahaye.com/free-guide
- Link: https://keneshiahaye.com/free-guide

**Product 2: Free VA Homebuyer Consultation**
- Price: Free
- Description: Veterans and Active Duty — learn how to buy a home with $0 down and no PMI. Book your free consultation today.
- Link: https://keneshiahaye.com/veterans

**Product 3: Free Home Valuation**
- Price: Free
- Description: Thinking of selling? Get a free market analysis of your Jacksonville home.
- Link: https://keneshiahaye.com/sell

---

## STEP 4: Publish GBP Posts (5 minutes each)

Go to GBP → Create post. Publish one now, schedule the rest weekly.

### Post 1 — Publish NOW

**Type:** What's New
**Text:**
```
Thinking about buying your first home in Jacksonville? Download our free guide covering everything from budgeting to closing day — written specifically for the Jacksonville, FL market. Get yours now at keneshiahaye.com/free-guide
```
**Button:** Learn More → https://keneshiahaye.com/free-guide

### Post 2 — Publish Next Week

**Type:** What's New
**Text:**
```
Veterans — did you know VA loans offer $0 down payment, no PMI, and competitive rates? As a U.S. Army Veteran myself, I specialize in helping fellow service members navigate the VA home buying process. Let's talk about your options at keneshiahaye.com/veterans
```
**Button:** Book Now → https://keneshiahaye.com/veterans

### Post 3 — Publish Week 3

**Type:** What's New
**Text:**
```
The Jacksonville housing market continues to offer opportunities for buyers. With new construction incentives and favorable VA loan rates, now is a great time to explore homeownership. Read our latest market insights on the blog at keneshiahaye.com/blog
```
**Button:** Learn More → https://keneshiahaye.com/blog/jacksonville-real-estate-market

### Post 4 — Publish Week 4

**Type:** What's New
**Text:**
```
From Mandarin's family-friendly streets to the affordability of Orange Park, Jacksonville has something for every budget. Check out our neighborhood guide to find the perfect area for your first home at keneshiahaye.com/blog/jacksonville-neighborhoods-first-time-buyers
```
**Button:** Learn More → https://keneshiahaye.com/blog/jacksonville-neighborhoods-first-time-buyers

---

## STEP 5: Seed GBP Q&A (5 minutes)

In Google Maps, find your listing and go to Q&A. Post these as questions FROM your Google account, then answer them:

**Q1:** Do you help Veterans buy homes with VA loans?
**A1:** Absolutely! As a U.S. Army Veteran myself, I specialize in VA loan transactions. Veterans can purchase a home with $0 down payment and no PMI. I'd love to walk you through the process — book a free consultation at keneshiahaye.com/veterans

**Q2:** What areas do you serve in Jacksonville?
**A2:** I serve all of Jacksonville, FL and surrounding areas including Orange Park, Mandarin, Ponte Vedra, St. Augustine, Fleming Island, Middleburg, and Clay County. I also help military families relocating to NAS Jacksonville, NS Mayport, and Camp Blanding.

**Q3:** Do you work with first-time homebuyers?
**A3:** Yes! First-time buyers are one of my specialties. I guide you through every step from getting pre-approved to closing day. Download my free First-Time Homebuyer Guide at keneshiahaye.com/free-guide to get started.

**Q4:** How much does it cost to work with a buyer's agent?
**A4:** For buyers, my services typically come at no direct cost to you — the seller usually pays the buyer agent's commission. Let's set up a free consultation to discuss your specific situation: keneshiahaye.com/contact

---

## STEP 6: Create GHL Automation Workflows (30-45 minutes)

Open GHL → Automation → Workflows → Create Workflow

For each workflow below, create it using the GHL workflow builder.
Full detailed instructions are in: `email-templates/GHL-WORKFLOW-SETUP.md`
AI builder prompt to paste: `ghl-integration/GHL-AI-WORKFLOW-PROMPT.md`

### Workflow 1: Homebuyer Guide Nurture (5 emails)

**Trigger:** Contact gets tag `website-guide-download`
**Sequence:**
1. Immediately → Send email `01-welcome-guide.html`
2. Wait 2 days → Send email `02-jacksonville-market.html`
3. Wait 3 days → Send email `03-mortgage-readiness.html`
4. Wait 3 days → Send email `04-neighborhood-guide.html`
5. Wait 4 days → Send email `05-consultation-cta.html`
6. Add tag `nurture-complete`

### Workflow 2: VA Home Buyer Nurture (5 emails)

**Trigger:** Contact gets tag `website-veteran`
**Sequence:**
1. Immediately → Send email `va-sequence/01-va-welcome.html`
2. Wait 2 days → Send email `va-sequence/02-va-benefits-deep-dive.html`
3. Wait 3 days → Send email `va-sequence/03-va-buying-process.html`
4. Wait 3 days → Send email `va-sequence/04-va-jacksonville-guide.html`
5. Wait 4 days → Send email `va-sequence/05-va-consultation-cta.html`
6. Add tag `va-nurture-complete`

### Workflow 3: Buyer Qualification (4 emails)

**Trigger:** Contact gets tag `website-buyer`
**Sequence:**
1. Immediately → Send email `buyer-sequence/01-buyer-welcome.html`
2. Wait 2 days → Send email `buyer-sequence/02-buyer-pre-approval.html`
3. Wait 3 days → Send email `buyer-sequence/03-buyer-what-to-expect.html`
4. Wait 4 days → Send email `buyer-sequence/04-buyer-consultation-cta.html`
5. Add tag `buyer-nurture-complete`

### Workflow 4: Seller Qualification (4 emails)

**Trigger:** Contact gets tag `website-seller`
**Sequence:**
1. Immediately → Send email `seller-sequence/01-seller-welcome.html`
2. Wait 2 days → Send email `seller-sequence/02-seller-pricing-strategy.html`
3. Wait 3 days → Send email `seller-sequence/03-seller-prep-checklist.html`
4. Wait 4 days → Send email `seller-sequence/04-seller-consultation-cta.html`
5. Add tag `seller-nurture-complete`

### Workflow 5: Lead Notification (to you)

**Trigger:** Contact enters pipeline stage "New Lead"
**Action:** Send internal notification (email/SMS to you) with contact name, phone, email, and form source tag

### Workflow 6: Review Request (post-closing)

**Trigger:** Contact gets tag `closed-transaction`
**Sequence:**
1. Wait 3 days → Send email with review link: https://keneshiahaye.com/review
2. Wait 7 days → Send reminder if no review tag added

---

## STEP 7: Test Everything (15 minutes)

After completing Steps 1-6, test the full flow:

1. **Test a website form** — Submit a test entry on keneshiahaye.com/contact
2. **Check GHL** — Verify contact was created with correct tags
3. **Check pipeline** — Verify contact appears in Lead Pipeline as "New Lead"
4. **Check email** — If workflows are active, verify you receive lead notification
5. **Test GBP** — Verify your website link goes to keneshiahaye.com (not Calendly)
6. **Test GTM** — In GTM Preview mode, submit a form and verify the `form_submission` event fires

---

## STEP 8: Ongoing Weekly Checklist

- [ ] Post to GBP at least once per week
- [ ] Respond to any new Google reviews within 48 hours
- [ ] Add 2-3 new photos to GBP monthly
- [ ] Check GHL pipeline for new leads
- [ ] Review GTM analytics for form submission tracking
- [ ] Share a blog post from keneshiahaye.com on GBP

---

## What Was Already Fixed (Code Changes — This Session)

These changes are ready to deploy on your next push to `main`:

1. **Schema.org latitude standardized** — Fixed inconsistent geo coordinates across index.html, about.html, resources.html (changed from 30.1741 to 30.1628 to match all other pages)

2. **AggregateRating added to all 5 area pages** — Jacksonville, Orange Park, St. Augustine, Ponte Vedra, and Fleming Island now all include the 5.0/29 review rating in structured data (previously only main pages had it)

3. **Geo coordinates added to all 5 area pages** — All area pages now have proper GeoCoordinates in schema (previously missing)

### What's Already Working (No Changes Needed)
- All 18+ forms submit to Cloudflare Worker → GHL correctly
- GTM (GTM-NSFSZWX4) is on all 26+ pages
- All form endpoints are consistent
- Phone number is consistent across all pages
- Email templates are ready in `/email-templates/`
