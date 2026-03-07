# GHL Form Integration — Cloudflare Worker

This Cloudflare Worker handles form submissions from keneshiahaye.com and creates contacts in GoHighLevel.

## What It Does

1. Receives form submissions from the website (POST JSON)
2. Creates a new contact in GHL (or updates existing)
3. Tags the contact based on which form they submitted
4. Adds them to the Lead Pipeline as "New Lead"
5. Attaches a note with the full form details

## Tag Mapping

| Form Source | Tags Applied |
|------------|-------------|
| contact-page | website-contact |
| buyer-intake | website-buyer, buyer |
| seller-valuation | website-seller, seller |
| va-intake | website-veteran, veterans campaign |
| va-benefits-resource-kit | website-va-benefits, veterans campaign |
| resource-download | website-guide-download |
| footer-newsletter | website-newsletter |
| homepage-guide | website-guide-download, buyers guide |

## Deployment

### 1. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare
```bash
npx wrangler login
```

### 3. Set Your API Key as a Secret
```bash
cd ghl-integration
npx wrangler secret put GHL_API_KEY
# When prompted, paste: pit-ee837709-0146-4551-801d-a868faf78be9
```

### 4. Deploy
```bash
npx wrangler deploy
```

### 5. Note Your Worker URL
After deployment, you'll get a URL like:
```
https://keneshia-haye-form-handler.<your-subdomain>.workers.dev
```

### 6. Update Website Forms
Replace ALL instances of the placeholder webhook URL in your HTML files with your Worker URL:

Find: `https://services.leadconnectorhq.com/hooks/REPLACE_WITH_YOUR_WEBHOOK_ID`
Replace: `https://keneshia-haye-form-handler.<your-subdomain>.workers.dev`

## Testing Locally
```bash
npx wrangler dev
```

Then send a test POST:
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"Lead","email":"test@example.com","phone":"9045551234","formSource":"contact-page"}'
```

## Cost
Cloudflare Workers Free Tier: 100,000 requests/day — more than enough for a real estate website.
