# GHL Newsletter Welcome Sequence — Setup Guide

Trigger: Contact tag `website-newsletter` added → sends 3 welcome emails over 7 days.

---

## Prerequisites
- Sending domain `fgragent.com` verified in GHL (Settings > Email Services)
- CAN-SPAM footer with 1700 Wells Road, Suite 4, Orange Park, FL 32073
- Email templates uploaded (copy HTML from `email-templates/newsletter-sequence/`)

---

## Step 1 — Create the Workflow

1. Go to **Automation > Workflows > + Create Workflow**
2. Select **Start from Scratch**
3. Name: `Newsletter Welcome Sequence`
4. Click **Save**

---

## Step 2 — Set the Trigger

1. Click **Add New Trigger**
2. Type: **Contact Tag**
3. Condition: **Tag Added**
4. Tag: `website-newsletter`
5. **Save Trigger**

> This tag is applied automatically when someone submits the newsletter form on keneshiahaye.com (form source `footer-newsletter` via the Cloudflare Worker).

---

## Step 3 — Add the 3 Email Actions

### Email 1 — Welcome (Send Immediately)

| Field | Value |
|-------|-------|
| Action | Send Email |
| From Name | Keneshia Haye |
| From Email | keneshia@fgragent.com |
| Subject | Welcome to the Jacksonville Real Estate Insider |
| Body | Paste HTML from `01-newsletter-welcome.html` |
| Wait Before | 0 (send immediately) |

---

**Add Wait Step:** 3 days

---

### Email 2 — Market Snapshot (Day 3)

| Field | Value |
|-------|-------|
| Action | Send Email |
| Subject | Jacksonville Market Snapshot: What's Moving Right Now |
| Body | Paste HTML from `02-newsletter-market-snapshot.html` |

---

**Add Wait Step:** 4 days

---

### Email 3 — Resource Toolkit (Day 7)

| Field | Value |
|-------|-------|
| Action | Send Email |
| Subject | Your Jacksonville Home Buying Toolkit |
| Body | Paste HTML from `03-newsletter-toolkit.html` |

---

## Step 4 — Add End Actions

After Email 3, add:

1. **Add Tag:** `newsletter-welcome-complete`
2. **Remove Tag:** `website-newsletter` (prevents re-triggering if they resubscribe)

---

## Step 5 — Publish

1. Click **Save** → **Publish**
2. Set to **Active**
3. Test by manually adding tag `website-newsletter` to a test contact

---

## Bi-Weekly Newsletter (Ongoing)

The bi-weekly newsletter is **not** an automated sequence — it's a one-time broadcast sent manually every 2 weeks.

**Process:**
1. Draft content using `/draft-newsletter` Claude skill
2. Review in Airtable Content Calendar (set status → Approved)
3. In GHL: **Email Marketing > Campaigns > + New Campaign**
4. Select list: contacts with tag `newsletter-welcome-complete` OR `website-newsletter`
5. Paste HTML from `email-templates/newsletter-drafts/newsletter-YYYY-MM-DD.html`
6. Schedule for Tuesday or Thursday morning (9am ET)
7. Send

---

## Tag Map Summary

| Tag | Applied When | Workflow Triggered |
|-----|-------------|-------------------|
| `website-newsletter` | Footer newsletter form submitted | Newsletter Welcome Sequence |
| `newsletter-welcome-complete` | After Email 3 in welcome sequence | None (segment marker) |
| `website-buyer` | Buy page form | Buyer Nurture Sequence |
| `website-seller` | Sell page form | Seller Nurture Sequence |
| `website-veteran` | Veterans page form | VA Nurture Sequence |
| `website-guide-download` | Guide download form | Homebuyer Guide Sequence |

---

## Merge Fields Reference

| Field | GHL Tag |
|-------|---------|
| First name | `{{contact.first_name}}` |
| Unsubscribe | `{{unsubscribe_link}}` |
| Email preferences | `{{preferences_link}}` |
| Newsletter date | Replace manually each send |
