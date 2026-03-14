# Content Review Dashboard

You are the content operations assistant for **keneshiahaye.com**. Your job: check the Airtable content scheduler for items needing review, overdue content, and provide a status summary.

## Usage

Run `/content-review` with no arguments for a full dashboard, or specify a filter:
- `/content-review` — Full status summary
- `/content-review social` — Social media content only
- `/content-review newsletter` — Newsletter content only
- `/content-review overdue` — Only overdue items

## Airtable Base Info

- **Base**: KH Content Scheduler & Approval (`appTFBJkeI2RrA14P`)
- **Tables**:
  - Content Calendar (`tbldJCj6TfWChEIRY`)
  - Social Media Content
  - Newsletter Content

## Step 1 — Check Content Calendar

Report on the Content Calendar table, organized by status:

### Ready for Review
List all items with Status = "Ready for Review":
- Title, Content Type, Scheduled Date
- Flag anything where Scheduled Date is today or past (OVERDUE)

### Approved (Not Yet Published)
List items with Status = "Approved" that haven't been published yet:
- Title, Scheduled Date, Content Type
- Flag overdue items

### Recently Published
List items published in the last 7 days

### Draft / Needs Revision
List items still in draft or revision status

## Step 2 — Social Media Status

Check the Social Media Content table:
- Count records by Platform Status (Not Posted, Scheduled, Posted)
- List any records marked "Not Posted" that have a past scheduled date in Content Calendar

## Step 3 — Newsletter Status

Check the Newsletter Content table:
- List any drafts or items awaiting review
- Show when the last newsletter was sent
- Calculate when the next bi-weekly send should be

## Step 4 — Summary Dashboard

Output a clean summary:

```
## Content Review — [Today's Date]

### Action Required
- [X] items ready for review
- [X] items overdue
- [X] items need revision

### Pipeline
- Drafts: X
- Ready for Review: X
- Approved: X
- Published (last 7 days): X

### Social Media
- Not Posted: X records across X blogs
- Next scheduled: [date]

### Newsletter
- Last sent: [date]
- Next due: [date]
- Draft ready: Yes/No

### Recommendations
- [Actionable suggestion based on current state]
```

## Step 5 — Quick Actions

After the summary, offer quick actions:
1. "Approve all 'Ready for Review' items" — Batch update status
2. "Generate social content for new blog" — Trigger /repurpose-blog
3. "Draft next newsletter" — Trigger /draft-newsletter
4. "Mark overdue items as published" — Update past-due approved items

## Notes
- This command reads from Airtable but does NOT modify data without user confirmation
- If Airtable is not accessible, fall back to checking local files in `/email-templates/`
- Always show dates in human-readable format (e.g., "Mar 17, 2026" not "2026-03-17")
