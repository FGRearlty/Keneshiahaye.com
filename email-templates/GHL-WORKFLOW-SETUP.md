# GoHighLevel Workflow Setup Guide
## Homebuyer Guide Nurture Sequence

This guide walks you through setting up the 5-email nurture sequence in GoHighLevel (GHL) that automatically follows up with leads who download the First-Time Homebuyer Guide from keneshiahaye.com.

---

## Prerequisites

Before setting up the workflow, make sure the following are in place:

### 1. Verify Your Sending Domain
- Go to **Settings > Email Services**
- Add and verify your sending domain (fgragent.com)
- Set up SPF, DKIM, and DMARC records with your domain registrar
- Use `keneshia@fgragent.com` as the sending email address
- **Important:** Unverified domains will cause emails to land in spam or fail to send entirely

### 2. Set Up Your Email Signature
- Go to **Settings > Business Profile**
- Add your business name: Florida Gateway Realty
- Add your physical mailing address (required by CAN-SPAM)
- Add phone: (254) 449-5299
- Add license number: #BK3450416

### 3. CAN-SPAM Compliance Checklist
All commercial emails must include:
- [x] Your physical business address
- [x] A working unsubscribe link (GHL adds `{{unsubscribe_link}}` automatically)
- [x] Accurate "From" name and email address
- [x] Non-deceptive subject lines
- [x] Honor unsubscribe requests within 10 business days

---

## Step 1: Create the Workflow

1. Navigate to **Automation > Workflows**
2. Click **Create Workflow** (or **+ Create Workflow**)
3. Select **Start from Scratch**
4. Name the workflow: `Homebuyer Guide Nurture Sequence`
5. Click **Save**

### Set the Trigger

1. Click **Add New Trigger**
2. Select **Contact Tag** as the trigger type
3. Set condition to: **Tag Added**
4. Tag name: `website-guide-download`
5. Click **Save Trigger**

> **Note:** This tag should be applied automatically when a contact submits the guide download form on your website. Make sure your website form or landing page is configured to add this tag in GHL.

---

## Step 2: Add Email Steps

Build the sequence by adding actions in the following order:

### Email 1: Welcome + Guide Download (Immediately)

1. Click **+** to add an action after the trigger
2. Select **Send Email**
3. Configure:
   - **Name:** Welcome Guide Email
   - **Subject:** `Your Free Homebuyer Guide is Here, {{contact.first_name}}!`
   - **Template:** Paste HTML from `01-welcome-guide.html`
   - **From Name:** Keneshia Haye
   - **From Email:** keneshia@fgragent.com
4. Click **Save Action**

### Wait Step 1: 2 Days

1. Click **+** to add the next action
2. Select **Wait**
3. Set to: **2 days**
4. Click **Save Action**

### Email 2: Pre-Approval Tip (Day 2)

1. Click **+** to add an action
2. Select **Send Email**
3. Configure:
   - **Name:** Pre-Approval Tip Email
   - **Subject:** `The #1 Thing to Do Before House Hunting`
   - **Template:** Paste HTML from `02-pre-approval-tip.html`
   - **From Name:** Keneshia Haye
   - **From Email:** keneshia@fgragent.com
4. Click **Save Action**

### Wait Step 2: 3 Days

1. Click **+** to add the next action
2. Select **Wait**
3. Set to: **3 days**
4. Click **Save Action**

### Email 3: Neighborhoods Guide (Day 5)

1. Click **+** to add an action
2. Select **Send Email**
3. Configure:
   - **Name:** Neighborhoods Email
   - **Subject:** `Best Jacksonville Neighborhoods for Your Budget`
   - **Template:** Paste HTML from `03-neighborhoods.html`
   - **From Name:** Keneshia Haye
   - **From Email:** keneshia@fgragent.com
4. Click **Save Action**

### Wait Step 3: 3 Days

1. Click **+** to add the next action
2. Select **Wait**
3. Set to: **3 days**
4. Click **Save Action**

### Email 4: VA Loan Benefits (Day 8)

1. Click **+** to add an action
2. Select **Send Email**
3. Configure:
   - **Name:** VA Benefits Email
   - **Subject:** `Are You Leaving Money on the Table? (VA Loan Benefits)`
   - **Template:** Paste HTML from `04-va-benefits.html`
   - **From Name:** Keneshia Haye
   - **From Email:** keneshia@fgragent.com
4. Click **Save Action**

### Wait Step 4: 4 Days

1. Click **+** to add the next action
2. Select **Wait**
3. Set to: **4 days**
4. Click **Save Action**

### Email 5: Consultation CTA (Day 12)

1. Click **+** to add an action
2. Select **Send Email**
3. Configure:
   - **Name:** Consultation CTA Email
   - **Subject:** `Ready to Start Your Home Search, {{contact.first_name}}?`
   - **Template:** Paste HTML from `05-consultation-cta.html`
   - **From Name:** Keneshia Haye
   - **From Email:** keneshia@fgragent.com
4. Click **Save Action**

---

## Step 3: Add Stop Conditions

These conditions ensure the sequence stops when a lead takes a desired action or opts out.

### Condition 1: Contact Books an Appointment

1. In the workflow settings, click **Add Workflow Settings** (or the gear icon)
2. Under **Stop on Events**, add:
   - **Event:** Appointment Status Changed
   - **Status:** Booked
3. This will stop the sequence if the contact books a consultation

**Alternative method:**
- Add an **If/Else** branch before each email step
- Condition: Contact has tag `consultation-booked`
- If YES: End workflow
- If NO: Continue to next email

### Condition 2: Contact Replies

1. Add a **Stop on Events** condition:
   - **Event:** Email Reply Received
2. Add an action after stop:
   - **Internal Notification** to Keneshia (email or SMS)
   - Message: `Lead {{contact.first_name}} {{contact.last_name}} replied to the nurture sequence. Check your inbox!`

### Condition 3: Contact Unsubscribes

- GHL handles this automatically. When a contact clicks the unsubscribe link, they are removed from future emails in all workflows.
- No manual configuration needed, but verify unsubscribe links work during testing.

---

## Step 4: Add Tags for Tracking

### After Completing the Sequence

1. At the end of the workflow (after Email 5), add a new action
2. Select **Add Tag**
3. Tag name: `nurture-complete`
4. This tags contacts who received all 5 emails

### After Booking a Consultation

1. In your appointment booking confirmation workflow (or within this workflow's stop condition), add:
2. Select **Add Tag**
3. Tag name: `consultation-booked`

### Recommended Tag Summary

| Tag | When Applied | Purpose |
|-----|-------------|---------|
| `website-guide-download` | Form submission | Triggers this workflow |
| `nurture-complete` | After Email 5 sent | Marks sequence completion |
| `consultation-booked` | Appointment booked | Stops sequence + tracks conversions |

---

## Step 5: Testing

Follow these steps to verify everything works correctly before going live.

### Create a Test Contact

1. Go to **Contacts > Add Contact**
2. Use your own email address
3. First name: `Test`
4. Last name: `Contact`
5. Save the contact

### Trigger the Workflow

1. Open the test contact's profile
2. Go to the **Tags** tab
3. Manually add the tag: `website-guide-download`
4. This will enroll the contact in the workflow

### Verify Each Email

- [ ] Email 1 arrives immediately with correct subject line
- [ ] `{{contact.first_name}}` merge field shows "Test" (not the raw merge tag)
- [ ] PDF download link works: `https://keneshiahaye.com/guides/first-time-homebuyer-guide.pdf`
- [ ] All CTA buttons link to correct pages
- [ ] Emails render correctly on desktop (check Gmail, Outlook)
- [ ] Emails render correctly on mobile
- [ ] Unsubscribe link works
- [ ] From name shows "Keneshia Haye"
- [ ] From email shows "keneshia@fgragent.com"

### Speed Up Testing

- To avoid waiting days between emails, temporarily change wait steps to **1 minute** each
- **Remember to change them back** to the correct day intervals before publishing

### Check Stop Conditions

- [ ] Book a test appointment and verify the workflow stops
- [ ] Reply to a test email and verify notification is sent to Keneshia
- [ ] Click unsubscribe and verify the contact is removed

---

## Step 6: How to Import Email Templates

### Method 1: HTML Code Editor (Recommended)

1. Go to **Marketing > Emails > Templates**
2. Click **+ Create New**
3. Select **HTML Builder** (or **Code Editor** depending on your GHL version)
4. Open the corresponding HTML file from the `email-templates` folder
5. Copy the entire HTML content
6. Paste into the code editor
7. Click **Preview** to verify desktop and mobile rendering
8. Save with the following names:

| File | Template Name |
|------|--------------|
| `01-welcome-guide.html` | Welcome Guide Email |
| `02-pre-approval-tip.html` | Pre-Approval Tip Email |
| `03-neighborhoods.html` | Neighborhoods Email |
| `04-va-benefits.html` | VA Benefits Email |
| `05-consultation-cta.html` | Consultation CTA Email |

### Method 2: Direct Paste in Workflow

1. When adding a Send Email action in the workflow
2. Select **Code/HTML** view in the email editor
3. Paste the HTML directly
4. Preview and save

### Preview Checklist

For each template, verify:
- [ ] Header displays correctly with navy background and gold text
- [ ] Gold accent line appears below header
- [ ] Body text is readable and properly formatted
- [ ] CTA buttons are clickable and properly colored (gold with navy text)
- [ ] Footer shows correct contact info, tagline, and license
- [ ] Unsubscribe link is visible and functional
- [ ] Mobile view: content stacks properly and is readable
- [ ] Images and special characters render correctly

---

## Workflow Overview (Visual Summary)

```
[TRIGGER: Tag "website-guide-download" Added]
    |
    v
[SEND EMAIL: 01 - Welcome Guide] (Immediately)
    |
    v
[WAIT: 2 Days]
    |
    v
[SEND EMAIL: 02 - Pre-Approval Tip] (Day 2)
    |
    v
[WAIT: 3 Days]
    |
    v
[SEND EMAIL: 03 - Neighborhoods] (Day 5)
    |
    v
[WAIT: 3 Days]
    |
    v
[SEND EMAIL: 04 - VA Benefits] (Day 8)
    |
    v
[WAIT: 4 Days]
    |
    v
[SEND EMAIL: 05 - Consultation CTA] (Day 12)
    |
    v
[ADD TAG: "nurture-complete"]
    |
    v
[END]

STOP CONDITIONS (active throughout):
  - Contact books appointment → Stop + Tag "consultation-booked"
  - Contact replies → Notify Keneshia + Pause
  - Contact unsubscribes → Stop (automatic)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails going to spam | Verify domain (SPF/DKIM/DMARC), warm up sending domain, reduce image-to-text ratio |
| Merge fields showing raw tags | Ensure you're using `{{contact.first_name}}` (GHL format), not other CRM formats |
| Workflow not triggering | Check that the tag name matches exactly: `website-guide-download` (case-sensitive) |
| Emails not sending | Verify email service is connected and sending limits haven't been reached |
| Links not working | Double-check all URLs in template files before importing |
| Mobile rendering issues | Test in GHL's preview tool and send test emails to multiple devices |

---

## Notes

- **Sending Limits:** If using GHL's built-in email service (LC Email), be aware of daily sending limits on your plan. For new domains, start with small volumes and gradually increase.
- **Warm-Up Period:** If this is a new sending domain, consider using GHL's email warm-up feature or a third-party warm-up service before launching at full volume.
- **A/B Testing:** Once the basic sequence is running, consider A/B testing subject lines on Email 1 to optimize open rates.
- **Re-engagement:** Contacts tagged `nurture-complete` who didn't book can be added to a separate monthly newsletter or re-engagement campaign later.
