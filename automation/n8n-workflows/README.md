# n8n Workflow Library

Automation workflows for Keneshia Haye content system.

## How to Import

1. Open n8n: http://localhost:5678
2. Go to **Workflows** → **Import from File**
3. Select one of the JSON files below
4. Set up credentials (Airtable token, email SMTP)
5. Toggle workflow **Active**

## Workflows

### 1. `newsletter-reminder.json`
**Trigger:** Every other Tuesday at 9am ET
**What it does:**
- Checks if it's a newsletter week (bi-weekly)
- Emails Keneshia a reminder with checklist
- Creates a draft entry in Airtable Content Calendar
**Credentials needed:** Email (SMTP for fgragent.com), Airtable

### 2. `airtable-content-monitor.json`
**Trigger:** Daily at 8am
**What it does:**
- Checks Airtable for content approved and scheduled for today
- Emails a daily brief with all pieces to post
- Marks those records as "Scheduled"
**Credentials needed:** Airtable, Email (SMTP)

### 3. `weekly-content-report.json`
**Trigger:** Every Monday at 9am
**What it does:**
- Pulls last week's posted content from Airtable
- Pulls upcoming 2 weeks of drafted content
- Emails a weekly content performance + planning report
**Credentials needed:** Airtable, Email (SMTP)

## Credentials Setup in n8n

### Airtable
- **Type:** Airtable Personal Access Token
- **Token:** `patxJj0KykduKm5py...` (your PAT)

### Email (SMTP)
Use GHL's SMTP or Gmail:
- **Gmail:** Settings → Security → App Passwords → generate one
- **Host:** `smtp.gmail.com`, Port: `587`, TLS: yes

## Starting n8n

Double-click `automation/start-n8n.bat` to start.
Or from terminal: `n8n start`

To run on Windows startup:
1. Press `Win+R` → type `shell:startup`
2. Copy `start-n8n.bat` shortcut into that folder
