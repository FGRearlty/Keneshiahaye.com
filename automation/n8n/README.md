# n8n Automation for Keneshia Haye Content System

## Prerequisites
- Docker Desktop installed and running
- Airtable Personal Access Token (from airtable.com/create/tokens)
- GHL API Key (from GoHighLevel settings)

## Quick Start

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Start n8n:
   ```bash
   docker compose up -d
   ```

3. Open n8n at http://localhost:5678

4. Import workflows from the `workflows/` directory

## Workflows

### 1. content-approval-check (Daily at 9 AM)
- Reads Airtable Content Calendar
- Filters for "Ready for Review" items
- Sends summary notification

### 2. post-approved-content (Daily at 10 AM)
- Checks for approved content with today's scheduled date
- Posts to GHL-connected social media accounts
- Updates Airtable status to "Published"

### 3. blog-to-social-repurpose (Webhook trigger)
- Triggered when a new blog post is published
- Reads blog content
- Generates social media posts via Claude API
- Adds to Airtable as "Draft"

### 4. biweekly-newsletter-prep (Every other Monday at 8 AM)
- Pulls latest approved content
- Generates newsletter draft
- Adds to Airtable Newsletter Content as "Ready for Review"

## Stopping
```bash
docker compose down
```

## Viewing Logs
```bash
docker compose logs -f n8n
```
