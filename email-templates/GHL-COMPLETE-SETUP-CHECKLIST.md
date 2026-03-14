# GoHighLevel Complete Setup Checklist
## Keneshia Haye Real Estate — keneshiahaye.com

This is the master checklist for everything that needs to be configured in your GHL account. Work through each section in order.

---

## PHASE 1: Foundation (Do First)

### 1.1 Verify Email Sending Domain
- [ ] Go to **Settings > Email Services**
- [ ] Add sending domain: `fgragent.com`
- [ ] Add SPF record to your DNS
- [ ] Add DKIM record to your DNS
- [ ] Add DMARC record to your DNS
- [ ] Test sending from: `keneshia@fgragent.com`
- [ ] Verify emails are not going to spam (send test to Gmail, Outlook, Yahoo)

### 1.2 Business Profile
- [ ] Go to **Settings > Business Profile**
- [ ] Business Name: `Florida Gateway Realty`
- [ ] Phone: `(254) 449-5299`
- [ ] Email: `keneshia@fgragent.com`
- [ ] Address: `1700 Wells Road, Suite 4, Orange Park, FL 32073`
- [ ] License: `#BK3450416`
- [ ] Website: `https://keneshiahaye.com`
- [ ] Upload logo/headshot

### 1.3 Verify Pipeline Exists
- [ ] Go to **Opportunities > Pipelines**
- [ ] Confirm "Lead Pipeline" exists (ID: `9o7rqOk04PRzfZA44mfv`)
- [ ] Confirm these stages exist:
  - [ ] New Lead (ID: `d733ccd2-1de4-4d9c-b28f-5e35f526f71a`)
  - [ ] Contacted
  - [ ] Qualified
  - [ ] Consultation Booked
  - [ ] Active Client
  - [ ] Closed / Won
  - [ ] Lost / Dead
- [ ] If stages are missing, add them now

### 1.4 Create Tags
Go to **Contacts > Tags** and create these tags if they don't exist:

**Source Tags (auto-applied by website forms):**
- [ ] `website-contact`
- [ ] `website-buyer`
- [ ] `website-seller`
- [ ] `website-veteran`
- [ ] `website-va-benefits`
- [ ] `website-guide-download`
- [ ] `website-newsletter`
- [ ] `website-course`
- [ ] `website-blog`
- [ ] `website-area`
- [ ] `soms-course`
- [ ] `enrolled`
- [ ] `course-gift`

**Workflow Tags (applied by automations):**
- [ ] `nurture-complete`
- [ ] `va-nurture-complete`
- [ ] `buyer-nurture-complete`
- [ ] `seller-nurture-complete`
- [ ] `newsletter-welcome-complete`
- [ ] `consultation-booked`

**Lifecycle Tags:**
- [ ] `hot-lead`
- [ ] `qualified`
- [ ] `contacted`
- [ ] `active-client`
- [ ] `closed-transaction`
- [ ] `past-client`

---

## PHASE 2: Homebuyer Guide Nurture Sequence

> **Trigger:** Tag `website-guide-download` added
> **Template files:** `/email-templates/01-welcome-guide.html` through `05-consultation-cta.html`
> **Full setup guide:** See `GHL-WORKFLOW-SETUP.md` for step-by-step instructions

### 2.1 Create the Workflow
- [ ] Go to **Automation > Workflows**
- [ ] Click **Create Workflow > Start from Scratch**
- [ ] Name: `Homebuyer Guide Nurture Sequence`
- [ ] **Trigger:** Contact Tag > Tag Added > `website-guide-download`

### 2.2 Add Email Steps
| Step | Wait | Subject | Template File |
|------|------|---------|---------------|
| Email 1 | Immediate | Your Free Homebuyer Guide is Here, {{contact.first_name}}! | `01-welcome-guide.html` |
| Wait | 2 days | — | — |
| Email 2 | — | The #1 Thing to Do Before House Hunting | `02-pre-approval-tip.html` |
| Wait | 3 days | — | — |
| Email 3 | — | Best Jacksonville Neighborhoods for Your Budget | `03-neighborhoods.html` |
| Wait | 3 days | — | — |
| Email 4 | — | Are You Leaving Money on the Table? (VA Loan Benefits) | `04-va-benefits.html` |
| Wait | 4 days | — | — |
| Email 5 | — | Ready to Start Your Home Search, {{contact.first_name}}? | `05-consultation-cta.html` |
| Action | — | Add tag: `nurture-complete` | — |

### 2.3 Configure Each Email
For each email step:
- [ ] From Name: `Keneshia Haye`
- [ ] From Email: `keneshia@fgragent.com`
- [ ] Open the email editor, switch to **Code View**
- [ ] Paste the HTML from the corresponding template file
- [ ] Save and preview
- [ ] Verify merge fields render correctly in preview

### 2.4 Add Stop Conditions
- [ ] If tag `consultation-booked` is added → Stop workflow
- [ ] If contact replies to any email → Stop workflow
- [ ] If contact unsubscribes → Stop workflow (auto-handled by GHL)

### 2.5 Test & Activate
- [ ] Change wait times to 1 minute for testing
- [ ] Add yourself as a test contact with tag `website-guide-download`
- [ ] Verify all 5 emails arrive with correct formatting
- [ ] Verify merge fields work (first name appears)
- [ ] Verify CTA links work
- [ ] Verify unsubscribe link works
- [ ] Change wait times back to production values (2, 3, 3, 4 days)
- [ ] **Publish/Activate** the workflow

---

## PHASE 3: VA-Specific Nurture Sequence

> **Trigger:** Tag `website-veteran` added
> **Template files:** `/email-templates/va-sequence/01-va-welcome.html` through `05-va-consultation-cta.html`

### 3.1 Create the Workflow
- [ ] Go to **Automation > Workflows**
- [ ] Click **Create Workflow > Start from Scratch**
- [ ] Name: `VA Home Buyer Nurture Sequence`
- [ ] **Trigger:** Contact Tag > Tag Added > `website-veteran`

### 3.2 Add Email Steps
| Step | Wait | Subject | Template File |
|------|------|---------|---------------|
| Email 1 | Immediate | Welcome, {{contact.first_name}} — Your VA Home Buying Journey Starts Here | `va-sequence/01-va-welcome.html` |
| Wait | 2 days | — | — |
| Email 2 | — | 5 VA Loan Benefits Most Veterans Don't Know About | `va-sequence/02-va-loan-benefits.html` |
| Wait | 3 days | — | — |
| Email 3 | — | Best Jacksonville Neighborhoods for Military Families | `va-sequence/03-va-jacksonville-guide.html` |
| Wait | 3 days | — | — |
| Email 4 | — | Your VA Home Buying Timeline: What to Expect | `va-sequence/04-va-buying-process.html` |
| Wait | 4 days | — | — |
| Email 5 | — | Ready to Use Your VA Benefit, {{contact.first_name}}? | `va-sequence/05-va-consultation-cta.html` |
| Action | — | Add tag: `va-nurture-complete` | — |

### 3.3 Configure, Test & Activate
- [ ] Same email settings as Phase 2 (from name, from email)
- [ ] Paste HTML from each template file into Code View
- [ ] Add stop conditions (consultation-booked, reply, unsubscribe)
- [ ] Test with 1-minute waits, then change to production timing
- [ ] **Publish/Activate**

---

## PHASE 4: Buyer Qualification Sequence

> **Trigger:** Tag `website-buyer` added
> **Template files:** `/email-templates/buyer-sequence/01-buyer-welcome.html` through `04-buyer-consultation-cta.html`

### 4.1 Create the Workflow
- [ ] Name: `Buyer Qualification Sequence`
- [ ] **Trigger:** Contact Tag > Tag Added > `website-buyer`

### 4.2 Add Email Steps
| Step | Wait | Subject | Template File |
|------|------|---------|---------------|
| Email 1 | Immediate | Welcome, {{contact.first_name}} — Let's Find Your Jacksonville Dream Home | `buyer-sequence/01-buyer-welcome.html` |
| Wait | 2 days | — | — |
| Email 2 | — | Step 1: Get Pre-Approved (Here's Exactly How) | `buyer-sequence/02-buyer-pre-approval.html` |
| Wait | 3 days | — | — |
| Email 3 | — | Jacksonville Neighborhoods That Match Your Budget | `buyer-sequence/03-buyer-neighborhoods.html` |
| Wait | 3 days | — | — |
| Email 4 | — | Let's Make Your Home Search Official, {{contact.first_name}} | `buyer-sequence/04-buyer-consultation-cta.html` |
| Action | — | Add tag: `buyer-nurture-complete` | — |

### 4.3 Configure, Test & Activate
- [ ] Same process as Phase 2
- [ ] **Publish/Activate**

---

## PHASE 5: Seller Qualification Sequence

> **Trigger:** Tag `website-seller` added
> **Template files:** `/email-templates/seller-sequence/01-seller-welcome.html` through `04-seller-consultation-cta.html`

### 5.1 Create the Workflow
- [ ] Name: `Seller Qualification Sequence`
- [ ] **Trigger:** Contact Tag > Tag Added > `website-seller`

### 5.2 Add Email Steps
| Step | Wait | Subject | Template File |
|------|------|---------|---------------|
| Email 1 | Immediate | Your Home's Value May Surprise You, {{contact.first_name}} | `seller-sequence/01-seller-welcome.html` |
| Wait | 2 days | — | — |
| Email 2 | — | 5 Things to Do Before Listing Your Jacksonville Home | `seller-sequence/02-seller-preparation.html` |
| Wait | 3 days | — | — |
| Email 3 | — | The #1 Mistake Jacksonville Sellers Make (Pricing) | `seller-sequence/03-seller-pricing-strategy.html` |
| Wait | 3 days | — | — |
| Email 4 | — | Ready to Sell, {{contact.first_name}}? Let's Talk Strategy | `seller-sequence/04-seller-consultation-cta.html` |
| Action | — | Add tag: `seller-nurture-complete` | — |

### 5.3 Configure, Test & Activate
- [ ] Same process as Phase 2
- [ ] **Publish/Activate**

---

## PHASE 6: Course Enrollment Workflows

### 6.1 Course Enrollment Confirmation
- [ ] Create workflow: `Course Enrollment Confirmation`
- [ ] **Trigger:** Contact Tag > Tag Added > `enrolled`
- [ ] **Action 1:** Send email — "Welcome to Standing on Our Shoulders!" (confirmation, what to expect, login details)
- [ ] **Action 2:** Internal notification to Keneshia (email or SMS)
- [ ] **Action 3:** Move to pipeline stage "Active Client"

### 6.2 Course Gift Notification
- [ ] Create workflow: `Course Gift Notification`
- [ ] **Trigger:** Contact Tag > Tag Added > `course-gift`
- [ ] **Action 1:** Send email to recipient — "Someone Gifted You a Course!"
- [ ] **Action 2:** Send confirmation to buyer
- [ ] **Action 3:** Internal notification to Keneshia

---

## PHASE 7: Consultation Booking

### 7.1 Calendar Integration
- [ ] Go to **Settings > Calendars**
- [ ] Create or verify "Free Consultation" calendar
- [ ] Set available hours (e.g., Mon-Fri 9am-5pm EST)
- [ ] Set duration: 30 minutes
- [ ] Add buffer time: 15 minutes between appointments
- [ ] Connect to your Google Calendar for conflict checking

### 7.2 Booking Confirmation Workflow
- [ ] Create workflow: `Consultation Booked`
- [ ] **Trigger:** Appointment Status > Booked
- [ ] **Action 1:** Add tag `consultation-booked` (this stops nurture sequences)
- [ ] **Action 2:** Send confirmation email with meeting details
- [ ] **Action 3:** Send SMS reminder 1 hour before appointment
- [ ] **Action 4:** Internal notification to Keneshia
- [ ] **Action 5:** Move opportunity to "Consultation Booked" stage in pipeline

### 7.3 No-Show Follow-Up
- [ ] Create workflow: `Consultation No-Show`
- [ ] **Trigger:** Appointment Status > No Show
- [ ] **Action 1:** Wait 1 hour
- [ ] **Action 2:** Send email — "We missed you! Want to reschedule?"
- [ ] **Action 3:** Wait 2 days
- [ ] **Action 4:** Send SMS — "Hi {{contact.first_name}}, I'd still love to chat. Here's my calendar link."

---

## PHASE 8: Lead Notifications

### 8.1 New Lead Alert
- [ ] Create workflow: `New Website Lead Alert`
- [ ] **Trigger:** Contact Created (from any website form)
- [ ] **Action 1:** Send internal email to keneshia@fgragent.com with lead details
- [ ] **Action 2:** Send SMS to Keneshia's phone with lead name + source
- [ ] **Action 3:** Add to pipeline as "New Lead"

### 8.2 Hot Lead Alert
- [ ] Create workflow: `Hot Lead Alert`
- [ ] **Trigger:** Contact opens 3+ emails OR clicks 2+ links
- [ ] **Action:** Add tag `hot-lead` + Send SMS alert to Keneshia

---

## PHASE 9: Post-Closing Automation

### 9.1 Review Request
- [ ] Create workflow: `Post-Closing Review Request`
- [ ] **Trigger:** Contact Tag > Tag Added > `closed-transaction`
- [ ] **Action 1:** Wait 7 days
- [ ] **Action 2:** Send email — "How was your experience?" with Google Review link
- [ ] **Action 3:** Wait 14 days
- [ ] **Action 4:** Send SMS — gentle reminder to leave a review
- [ ] **Action 5:** Add tag `review-requested`

### 9.2 Anniversary/Check-In
- [ ] Create workflow: `Annual Client Check-In`
- [ ] **Trigger:** Contact Tag > Tag Added > `past-client`
- [ ] **Action:** Send email on purchase anniversary — "Happy Home Anniversary!"
- [ ] Recurrence: Yearly

---

## PHASE 10: Newsletter Welcome Sequence

> **Trigger:** Tag `website-newsletter` added
> **Template files:** `/email-templates/newsletter-sequence/01-newsletter-welcome.html` through `03-newsletter-toolkit.html`

### 10.1 Create the Workflow
- [ ] Go to **Automation > Workflows**
- [ ] Click **Create Workflow > Start from Scratch**
- [ ] Name: `Newsletter Welcome Sequence`
- [ ] **Trigger:** Contact Tag > Tag Added > `website-newsletter`

### 10.2 Add Email Steps
| Step | Wait | Subject | Template File |
|------|------|---------|---------------|
| Email 1 | Immediate | Welcome to Keneshia's Jacksonville Real Estate Insider! | `newsletter-sequence/01-newsletter-welcome.html` |
| Wait | 3 days | — | — |
| Email 2 | — | What's Happening in Jacksonville Real Estate | `newsletter-sequence/02-newsletter-market-snapshot.html` |
| Wait | 4 days | — | — |
| Email 3 | — | Your Jacksonville Real Estate Toolkit | `newsletter-sequence/03-newsletter-toolkit.html` |
| Action | — | Add tag: `newsletter-welcome-complete` | — |

### 10.3 Configure, Test & Activate
- [ ] Same email settings as Phase 2 (From: Keneshia Haye, keneshia@fgragent.com)
- [ ] Paste HTML from each template file into Code View
- [ ] Add stop conditions (consultation-booked, reply, unsubscribe)
- [ ] Test with 1-minute waits, then change to production timing
- [ ] **Publish/Activate**

### 10.4 Bi-Weekly Newsletter Manual Send Process
After the welcome sequence completes:
1. Pull approved content from **KH Content Scheduler & Approval** Google Sheet ("Newsletter Content" tab)
2. Use bi-weekly template: `/email-templates/newsletter-template/biweekly-newsletter.html`
3. Replace merge fields: `{{newsletter_date}}`, `{{preview_text}}`, `{{market_update_intro}}`, `{{tip_title}}`, `{{tip_content}}`, `{{blog_title}}`, `{{blog_summary}}`, `{{blog_link}}`, `{{featured_listing_title}}`, `{{featured_listing_description}}`, `{{featured_listing_link}}`, `{{community_highlight}}`
4. Send to contacts tagged `newsletter-welcome-complete` (via GHL email broadcast)
5. Update Google Sheet status to "Sent"

**Schedule:** Every other week (bi-weekly)

---

## PHASE 11: Google Business Profile Fixes

### 11.1 Critical Fixes
- [ ] Log into Google Business Profile: https://business.google.com
- [ ] **Change primary website** from calendly.com → `https://keneshiahaye.com`
- [ ] **Set appointment URL** to your Calendly or GHL booking link
- [ ] **Update phone** if needed (decide: (254) 449-5299 or local 904 number)
- [ ] **Post a new update** (Google favors active profiles)

### 11.2 Profile Optimization
- [ ] Add services: Buyer Representation, VA Loans, Seller Representation, Military Relocation, New Construction, First-Time Buyer, Free Consultation
- [ ] Add products: Free Homebuyer Guide, Free VA Consultation, Free Home Valuation
- [ ] Add Q&A: Pre-seed 4 common questions and answers
- [ ] Upload 10+ photos: agent photos, property photos, neighborhood shots
- [ ] Update business description with Jacksonville + veteran keywords

### 11.3 Ongoing GBP Maintenance
- [ ] Post weekly (What's New, Offer, or Event/Update)
- [ ] Respond to all reviews within 48 hours
- [ ] Add new photos monthly
- [ ] Check insights monthly for search performance

---

## Quick Reference: Tag → Workflow Map

| Form Source | Tags Applied | Triggers Workflow |
|-------------|-------------|-------------------|
| `contact-page` | `website-contact` | New Lead Alert |
| `buyer-intake` | `website-buyer`, `buyer` | Buyer Qualification Sequence |
| `seller-valuation` | `website-seller`, `seller` | Seller Qualification Sequence |
| `va-intake` | `website-veteran`, `veterans campaign` | VA Nurture Sequence |
| `va-benefits-resource-kit` | `website-va-benefits`, `veterans campaign` | VA Nurture Sequence |
| `resource-download` | `website-guide-download` | Homebuyer Guide Nurture |
| `footer-newsletter` | `website-newsletter` | Newsletter Welcome Sequence |
| `homepage-guide` | `website-guide-download`, `buyers guide` | Homebuyer Guide Nurture |
| `course-enrollment` | `website-course`, `soms-course`, `enrolled` | Course Enrollment Confirmation |
| `course-gift` | `website-course`, `soms-course`, `course-gift` | Course Gift Notification |
| `area-*` | `website-area`, `area-{name}` | New Lead Alert |

---

## Deployment Status

| Component | Status | Notes |
|-----------|--------|-------|
| Website forms → Worker | ✅ Live | Deployed to `keneshia-haye-form-handler.jutsuxx.workers.dev` |
| Worker → GHL API | ✅ Live | Creates contacts, adds tags, creates opportunities |
| Pipeline | ✅ Exists | ID: `9o7rqOk04PRzfZA44mfv` |
| Email templates | ✅ Created | 5 homebuyer + 5 VA + 4 buyer + 4 seller + 3 newsletter + 1 bi-weekly = 22 templates |
| GHL workflows | ⏳ Pending | Follow Phases 2-10 above to create in GHL |
| Newsletter sequence | ✅ Templates | 3 welcome emails + bi-weekly template (Phase 10) |
| Content scheduler | ✅ Created | Google Sheet with 3 tabs, dropdowns, conditional formatting |
| GBP fixes | ⏳ Pending | Follow Phase 11 above |

---

*Last updated: March 13, 2026*
