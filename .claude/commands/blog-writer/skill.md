---
name: Blog Writer
description: Write a new SEO-optimized blog post as a complete HTML file for keneshiahaye.com. Use when the user provides a blog topic, keyword, or asks to write a new blog post for the Jacksonville real estate site.
tools: WebSearch, WebFetch, Read, Write, Edit
---

# Blog Writer — Geo SEO + AEO + Social Intelligence

## Usage
`/blog-writer [topic]` — Write a new blog post about the given topic.

If no topic is provided, research and suggest 3 trending topics before proceeding.

## Before Writing — Load Context
Read all four reference files before starting:
1. `.claude/references/brand-voice.md` — Keneshia's voice, tone, and style rules
2. `.claude/references/audience-personas.md` — Who you're writing for
3. `.claude/references/banned-phrases.md` — What NOT to use
4. `.claude/references/jacksonville-context.md` — Local market knowledge

## Step 1 — Research (run all searches in parallel)
1. `site:reddit.com "{topic}" Jacksonville OR Florida real estate` — real questions and pain points
2. `"{topic}" Jacksonville FL real estate 2026` — trending social + news angles
3. `"{topic}" real estate podcast 2026` — expert quotes and angles
4. `"{topic}" Jacksonville FL` — People Also Ask questions for AEO
5. `"{topic}" Jacksonville FL Duval County statistics data 2026` — local data and stats
6. `"{topic}" Jacksonville real estate blog` — competitor content gaps

Compile:
- 3–5 real Reddit questions (paraphrase, do not copy verbatim)
- Key statistics with approximate sources
- Podcast angles or expert perspectives
- People Also Ask questions Google is surfacing
- Content gaps competitors are missing

## Step 2 — Content Strategy

**Geo SEO targeting:**
- Primary keyword: [topic] + Jacksonville FL (or relevant area)
- Secondary keywords: Orange Park, Fleming Island, St. Augustine, Clay County, Duval County, NE Florida
- Local entities: Reference neighborhoods, military bases, schools from `jacksonville-context.md`
- NAP: Keneshia Haye | Florida Gateway Realty | 1700 Wells Road Suite 4, Orange Park FL 32073 | (254) 449-5299

**AEO structure:**
- First paragraph = 40–60 word direct answer optimized for AI snippet extraction
- FAQ section: 4–6 questions from People Also Ask + Reddit, each answered in 2–3 sentences
- Conversational tone (voice search ready)

**Content architecture:**
- Word count: 1,200–1,800 words
- H2/H3 headers: question-based, match search intent
- Internal links: at least 3 existing pages (buy.html, sell.html, veterans.html, contact.html, area pages, other blog posts)
- CTAs: mid-article + end-of-article, both pointing to contact.html

## Step 3 — Write the HTML File

Read an existing post (`/blog/jacksonville-real-estate-market.html`) for the full template before writing. The file must include:

**In `<head>`:**
- `<title>{Primary Keyword} | Keneshia Haye</title>` (under 60 chars)
- Meta description (150–160 chars, keyword-rich, compelling)
- Full OG + Twitter card tags
- Canonical: `https://keneshiahaye.com/blog/{slug}`
- Favicon + apple-touch-icon
- Google Fonts (Inter + Playfair Display)
- `/css/styles.css`
- Inline styles (copy `.reveal`, `.hero-overlay`, `.glass` from existing posts)
- JSON-LD: Article schema, BreadcrumbList, FAQPage
- GTM: `GTM-NSFSZWX4`

**In `<body>`:**
- GTM noscript
- Skip to main content link
- Header navbar (use `../` relative paths for blog subdirectory)
- Mobile menu
- `<main id="main-content">`: hero, article prose, mid-CTA, FAQ, end-CTA, author bio card
- Footer (copy from existing post)
- Mobile bottom nav
- Dark mode script, scroll reveal script, mobile menu script

**Hero image:** Use a placeholder comment:
`<!-- TODO: Add hero image at /images/stock/{slug}.jpg (1200x630) -->`

**OG image:** `/images/keneshia-blue-dress.png?v=2026031101`

## Step 4 — Update Blog Index
Add a new card to the TOP of the article grid in `/blog/index.html`. Match existing card format: image placeholder, category tag(s), title with link, excerpt, read time, date.

## Step 5 — Update Redirects
Add to `/_redirects`:
```
/blog/{slug}    /blog/{slug}.html    200
```

## Step 6 — Final Checklist
Before finishing, verify every item:
- [ ] HTML has no unclosed tags or improper nesting
- [ ] All nav links use `../` relative paths
- [ ] JSON-LD schemas are valid JSON
- [ ] Meta description is 150–160 characters
- [ ] Title tag is under 60 characters
- [ ] Canonical URL matches the clean URL
- [ ] At least 3 internal links to other site pages
- [ ] FAQ section has 4–6 questions with concise answers
- [ ] Mid-article AND end-of-article CTAs present
- [ ] Dark mode classes applied correctly
- [ ] Mobile bottom nav padding preserved
- [ ] Phone number is (254) 449-5299 everywhere it appears
- [ ] Email is keneshia@fgragent.com everywhere it appears
- [ ] No banned phrases from `banned-phrases.md`
- [ ] No Unsplash or external CDN image links
- [ ] Blog index updated with new card at top
- [ ] Date in schema matches today or the specified date

## Output Report
After writing, report:
1. **File created**: `/blog/{slug}.html`
2. **Primary keyword**: target keyword
3. **Word count**: approximate
4. **FAQ questions**: list them
5. **Internal links**: list pages linked
6. **Social sources used**: Reddit threads, podcast topics, trending discussions
7. **AEO**: confirm direct answer paragraph + FAQ schema present
