# GoHighLevel Funnel Blueprint — Keneshia Haye Real Estate

> **Client:** Keneshia Haye | Florida Gateway Realty
> **Page Type:** Single-page lead-capture landing page
> **Goal:** Convert visitors into CRM contacts (buyer leads, seller leads, veteran leads)

---

## Global Settings (Set Before Building)

### In GHL: Sites/Funnels → Settings → General

| Setting              | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| **Page Title**       | Keneshia Haye · Veteran-Led Real Estate · Jacksonville, FL   |
| **Meta Description** | Dedicated, Determined, Dependable. Buy, sell, or invest with confidence in Greater Jacksonville, FL. |
| **Favicon**          | Upload Keneshia logo/icon                                    |
| **Custom Font**      | Add Google Font: `Inter` (weights: 400, 500, 600, 700) and `Playfair Display` (weights: 600, 700, 800) |
| **Body BG Color**    | `#0a1628`                                                    |
| **Custom CSS**       | Paste the contents of `custom-styles.css` here               |

### Color Palette Reference

| Token            | Hex         | Usage                        |
| ---------------- | ----------- | ---------------------------- |
| Navy (BG)        | `#0a1628`   | Page background              |
| Navy Deep        | `#060f1d`   | Darker section alternation   |
| Surface          | `#0f1f38`   | Card backgrounds             |
| Surface Light    | `#142847`   | Hover states, elevated cards |
| Champagne        | `#c9a96e`   | Primary accent (CTAs, icons) |
| Champagne Light  | `#e3d4ab`   | Hover accent                 |
| White            | `#ffffff`   | Headlines                    |
| Text Secondary   | `#94a3b8`   | Body text, labels            |
| Border           | `rgba(255,255,255,0.08)` | Card borders      |

---

## SECTION 1 — HEADER / NAVIGATION

### GHL Builder Steps

1. **Add Section** → Full Width
2. Set Section Background: `#0a1628`
3. Set Section padding: `12px 0`
4. Check **"Make this section sticky"** (in Section Settings → Advanced)
5. Add **Row: 3 Columns** (layout: 25% | 50% | 25%)

#### Column 1 — Logo (Left)

- **Element: Image** → Upload Keneshia logo (or use a Headline element)
- If using Headline: Text = `Keneshia Haye`, Font = Playfair Display, Size = 22px, Color = `#ffffff`
- Alignment: Left
- Add a link to the top of the page (`#`)

#### Column 2 — Nav Links (Center)

- **Element: Headline** (Small / Paragraph style)
- Use an HTML element if you want clickable nav links:

```html
<nav style="display:flex; gap:32px; justify-content:center; align-items:center;">
  <a href="#services" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.5px; transition:color 0.3s;">BUY</a>
  <a href="#about" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.5px;">SELL</a>
  <a href="#veterans" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.5px;">VETERANS</a>
  <a href="#resources" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.5px;">RESOURCES</a>
  <a href="#about" style="color:#94a3b8; text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.5px;">ABOUT</a>
</nav>
```

- **Mobile:** Hide this column on mobile (Column Settings → Visibility → Hide on Mobile)

#### Column 3 — CTA Button (Right)

- **Element: Button**
- Text: `Schedule a Call`
- Button Color: `#c9a96e`
- Text Color: `#0a1628`
- Border Radius: `50px`
- Font Weight: 600
- Font Size: 14px
- Padding: `12px 28px`
- Action: Link to `#calendar` or your GHL calendar booking page
- Alignment: Right
- Add class in Advanced: `kh-btn-primary`

---

## SECTION 2 — HERO (Lead Capture)

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: Upload a hero image (or use video background)
   - For **video**: Section Settings → Background → Video → paste YouTube/Vimeo URL
   - Add overlay: Background Overlay Color = `rgba(10, 22, 40, 0.82)`
3. Minimum Height: `90vh`
4. Padding: `120px 0 80px`
5. Content Alignment: Center (vertically and horizontally)
6. Add **Row: 2 Columns** (layout: 55% | 45%) — stacks on mobile

#### Column 1 — Copy (Left)

**Element 1: Headline (Sub/Badge)**
- Text: `★ VETERAN-LED · JACKSONVILLE, FL`
- Font: Inter
- Size: 13px
- Weight: 600
- Color: `#c9a96e`
- Letter Spacing: 3px
- Margin Bottom: 20px

**Element 2: Headline (H1)**
- Text: `Your Jacksonville Dream Home Awaits.`
- Font: Playfair Display
- Size: 56px (Desktop) / 36px (Mobile — set in responsive settings)
- Weight: 800
- Color: `#ffffff`
- Line Height: 1.1
- Margin Bottom: 20px

**Element 3: Sub-Headline**
- Text: `Veteran-Led. Results-Driven. Expert Guidance Every Step of the Way.`
- Font: Inter
- Size: 18px
- Weight: 400
- Color: `#94a3b8`
- Line Height: 1.6
- Margin Bottom: 32px

**Element 4: Custom HTML Block** (Conversational Search)
- Paste the contents of `conversational-search.html`

#### Column 2 — Lead Capture Form (Right)

**Element: GHL Native Form**

Form Settings:
- Form Name: `Hero Lead Capture`
- Form Style: 1 Column
- Background: `rgba(15, 31, 56, 0.85)`
- Border: `1px solid rgba(255,255,255,0.08)`
- Border Radius: `16px`
- Padding: `32px`
- Add a backdrop-filter blur via Custom CSS (already included in the CSS file)

Form Fields (in order):
1. **Headline Element** (inside form): `Start Your Home Search` — Size 22px, Color `#ffffff`, Font Playfair Display, Center aligned
2. **Paragraph Element** (inside form): `Get a personalized consultation — no obligation.` — Size 14px, Color `#94a3b8`
3. **Full Name** → Text Input, Placeholder: `Your full name`, Required: Yes
4. **Email** → Email Input, Placeholder: `Email address`, Required: Yes
5. **Phone** → Phone Input, Placeholder: `(___) ___-____`, Required: Yes
6. **Custom Field: "I am a Veteran"** → Checkbox
   - In GHL CRM, create a custom contact field: `is_veteran` (checkbox)
   - Map this form field to that custom field
7. **Custom Field: "I'm interested in..."** → Dropdown
   - Options: `Buying a Home`, `Selling My Home`, `VA Loan Guidance`, `Just Exploring`
   - Map to a custom CRM field: `interest_type`
8. **Submit Button**
   - Text: `Get My Free Consultation`
   - Color: `#c9a96e`
   - Text Color: `#0a1628`
   - Border Radius: `50px`
   - Full Width: Yes
   - Font Weight: 700
   - Add class: `kh-btn-primary`

Form Actions (Automation):
- **On Submit:** Add to Pipeline → `New Lead`
- **Redirect:** Show thank-you message or redirect to calendar
- **Tag:** Auto-tag with `website-lead`
- **If "Veteran" checked:** Also tag with `veteran-lead`
- **Internal Notification:** Notify Keneshia via email + SMS

---

## SECTION 3 — TRUST BAR (Social Proof)

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: `#060f1d`
3. Padding: `40px 0`
4. Add **Row: 4 Columns** (equal width 25% each)

Each column contains:
- **Element: Headline** (number) — Size: 42px, Weight: 800, Color: `#c9a96e`, Font: Playfair Display, Center
- **Element: Paragraph** (label) — Size: 13px, Weight: 500, Color: `#94a3b8`, Center, Letter Spacing: 1px

| Column | Number   | Label              |
| ------ | -------- | ------------------ |
| 1      | `100+`   | FAMILIES SERVED    |
| 2      | `15+`    | YEARS EXPERIENCE   |
| 3      | `$50M+`  | IN SALES VOLUME    |
| 4      | `5★`     | CLIENT RATING      |

---

## SECTION 4 — THE 3 D's (Value Proposition)

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: `#0a1628`
3. Padding: `80px 0`
4. Add section label row first:

**Row 1: 1 Column (centered)**
- **Element: Paragraph** → Text: `WHAT DRIVES ME`, Size: 13px, Color: `#c9a96e`, Weight: 600, Letter Spacing: 3px, Center
- **Element: Headline** → Text: `The 3 D's Behind Every Deal`, Size: 38px, Font: Playfair Display, Color: `#ffffff`, Center
- Margin Bottom: 48px

**Row 2: 3 Columns (equal 33.3%)**

Use **GHL Icon/Feature Box** elements or build manually:

#### Column 1 — Dedicated
- **Element: Icon** → Shield or Heart icon, Size: 48px, Color: `#c9a96e`
- **Element: Headline** → `Dedicated`, Size: 24px, Color: `#ffffff`, Font: Playfair Display, Center
- **Element: Paragraph** → `Your goals are my mission. I listen first, strategize second, and execute with precision.`, Size: 15px, Color: `#94a3b8`, Center, Line Height: 1.7
- **Column styling:** Background: `#0f1f38`, Border: `1px solid rgba(255,255,255,0.06)`, Border Radius: `16px`, Padding: `40px 28px`, Add class: `kh-feature-card`

#### Column 2 — Determined
- **Element: Icon** → Target or Flag icon, Size: 48px, Color: `#c9a96e`
- **Element: Headline** → `Determined`, Size: 24px, Color: `#ffffff`
- **Element: Paragraph** → `Obstacles don't stop me — they fuel me. Military discipline meets real estate hustle to get your deal closed.`, Size: 15px, Color: `#94a3b8`
- Same column styling as above

#### Column 3 — Dependable
- **Element: Icon** → Handshake or Check-circle icon, Size: 48px, Color: `#c9a96e`
- **Element: Headline** → `Dependable`, Size: 24px, Color: `#ffffff`
- **Element: Paragraph** → `I show up — every call, every showing, every closing. You'll never wonder where I am or what's next.`, Size: 15px, Color: `#94a3b8`
- Same column styling as above

---

## SECTION 5 — FEATURED PROPERTIES

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: `#060f1d`
3. Padding: `80px 0`

**Row 1: 1 Column (centered)**
- **Element: Paragraph** → `FEATURED LISTINGS`, Size: 13px, Color: `#c9a96e`, Weight: 600, Letter Spacing: 3px, Center
- **Element: Headline** → `Explore Jacksonville Properties`, Size: 38px, Font: Playfair Display, Color: `#ffffff`, Center
- **Element: Paragraph** → `Hand-picked homes in the greater Jacksonville area.`, Size: 16px, Color: `#94a3b8`, Center
- Margin Bottom: 48px

**Row 2: 1 Column**
- **Element: Custom HTML/JS Block**
- Paste the contents of `featured-properties.html`

---

## SECTION 6 — ABOUT KENESHIA

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: `#0a1628`
3. Padding: `80px 0`
4. Add **Row: 2 Columns** (layout: 45% | 55%) — stacks on mobile

#### Column 1 — Photo

- **Element: Image**
- Upload `keneshia-blue-dress.png` (or `keneshia-white-blazer.png`)
- Border Radius: `16px`
- Add a subtle border: `2px solid rgba(201,169,110,0.2)`
- Max Width: 100%
- Add class: `kh-about-image`

#### Column 2 — Bio Copy

**Element 1: Paragraph (Label)**
- Text: `ABOUT YOUR AGENT`
- Size: 13px, Color: `#c9a96e`, Weight: 600, Letter Spacing: 3px

**Element 2: Headline**
- Text: `Meet Keneshia Haye`
- Size: 38px, Font: Playfair Display, Color: `#ffffff`
- Margin Bottom: 16px

**Element 3: Paragraph**
- Text: `As a proud veteran and licensed real estate professional, I bring military discipline and genuine care to every transaction. Serving the greater Jacksonville area, I specialize in helping families find their perfect home — whether it's your first purchase, a strategic investment, or utilizing your hard-earned VA benefits.`
- Size: 16px, Color: `#94a3b8`, Line Height: 1.8

**Element 4: Paragraph**
- Text: `My mission is simple: make the process clear, stress-free, and rewarding. You deserve an agent who listens, advocates, and delivers.`
- Size: 16px, Color: `#94a3b8`, Line Height: 1.8

**Element 5: Button**
- Text: `Work With Me →`
- Color: `#c9a96e`, Text: `#0a1628`
- Border Radius: `50px`, Padding: `14px 32px`
- Action: Link to `#calendar` or contact page
- Add class: `kh-btn-primary`

**Element 6: Row of 2-3 small badges (optional)**
- Use a Custom HTML block for "VA Loan Specialist" / "Licensed FL Broker" badges

---

## SECTION 7 — RESOURCES / LEAD MAGNET

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: `#060f1d`
3. Padding: `80px 0`

**Row 1: 1 Column (centered)**
- Label: `FREE RESOURCES`
- Headline: `Tools to Help You Win`
- Sub: `Download free guides and watch insider tips on Jacksonville real estate.`

**Row 2: 2 Columns** (50% | 50%)

#### Column 1 — YouTube / Video Content

- **Element: Headline** → `Jacksonville Hidden Gems 🎬`, Size: 22px, Color: `#ffffff`
- **Element: Paragraph** → `Insider neighborhood tours, market updates, and homebuyer tips — straight from a local expert.`, Size: 15px, Color: `#94a3b8`
- **Element: Video** → Embed Keneshia's YouTube video (paste YouTube URL)
- OR use **Image** as thumbnail with play button linking to YouTube channel
- **Element: Button** → `Watch on YouTube →`, Color: Outline style, Border: `1px solid #c9a96e`, Text: `#c9a96e`, Border Radius: `50px`
- Column BG: `#0f1f38`, Border: `1px solid rgba(255,255,255,0.06)`, Border Radius: `16px`, Padding: `32px`

#### Column 2 — Downloadable Guide (Lead Magnet)

- **Element: Image** → Upload a mockup image of the guide (e-book cover)
- **Element: Headline** → `Free First-Time Buyer Guide`, Size: 22px, Color: `#ffffff`
- **Element: Paragraph** → `Everything you need to know before buying your first home in Jacksonville. No fluff — just actionable steps.`, Size: 15px, Color: `#94a3b8`

- **Element: GHL Native Form** (Lead Magnet Form)
  - Form Name: `Guide Download`
  - Fields:
    1. First Name — Placeholder: `First name`
    2. Email — Placeholder: `Best email`
  - Submit Button: `Download Free Guide`
  - Button Color: `#c9a96e`, Text: `#0a1628`, Full Width, Border Radius: `50px`

  Form Actions:
  - Tag: `guide-download`
  - Add to Pipeline: `Nurture Sequence`
  - Trigger automation: Send guide PDF via email
  - Internal notification to Keneshia

- Column BG: `#0f1f38`, Border: `1px solid rgba(255,255,255,0.06)`, Border Radius: `16px`, Padding: `32px`

---

## SECTION 8 — CALENDAR BOOKING (Optional Dedicated Section)

### GHL Builder Steps

1. **Add Section** → Full Width, ID: `calendar`
2. Background: `#0a1628`
3. Padding: `80px 0`

**Row 1: 1 Column (centered)**
- Label: `LET'S CONNECT`
- Headline: `Book Your Free Consultation`
- Sub: `Pick a time that works for you. 15-minute no-obligation call.`

**Row 2: 1 Column (max-width 700px centered)**
- **Element: GHL Calendar Widget**
- Calendar Type: Use your GHL Calendar (round-robin or personal)
- Style: The custom CSS will automatically style the calendar widget

---

## SECTION 9 — FOOTER

### GHL Builder Steps

1. **Add Section** → Full Width
2. Background: `#060f1d`
3. Border Top: `1px solid rgba(255,255,255,0.06)`
4. Padding: `60px 0 24px`

**Row 1: 4 Columns** (30% | 20% | 20% | 30%)

#### Column 1 — Brand
- **Headline:** `Keneshia Haye`, Size: 22px, Playfair Display, Color: `#ffffff`
- **Paragraph:** `Veteran-led real estate expert serving the greater Jacksonville, FL area. Dedicated, Determined, Dependable.`, Size: 14px, Color: `#94a3b8`
- **Custom HTML** for social icons (see snippet below)

```html
<div style="display:flex; gap:12px; margin-top:16px;">
  <a href="https://facebook.com" target="_blank" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:14px;transition:all 0.3s;">FB</a>
  <a href="https://instagram.com" target="_blank" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:14px;transition:all 0.3s;">IG</a>
  <a href="https://youtube.com" target="_blank" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:14px;transition:all 0.3s;">YT</a>
  <a href="https://linkedin.com" target="_blank" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:14px;transition:all 0.3s;">LI</a>
</div>
```

#### Column 2 — Quick Links
- **Headline:** `Quick Links`, Size: 15px, Weight: 600, Color: `#ffffff`
- **Custom HTML** with link list:
```html
<ul style="list-style:none;padding:0;margin:8px 0 0;">
  <li style="margin-bottom:10px;"><a href="#services" style="color:#94a3b8;text-decoration:none;font-size:14px;">Buy a Home</a></li>
  <li style="margin-bottom:10px;"><a href="#services" style="color:#94a3b8;text-decoration:none;font-size:14px;">Sell Your Home</a></li>
  <li style="margin-bottom:10px;"><a href="#veterans" style="color:#94a3b8;text-decoration:none;font-size:14px;">Veterans & VA</a></li>
  <li style="margin-bottom:10px;"><a href="#resources" style="color:#94a3b8;text-decoration:none;font-size:14px;">Free Resources</a></li>
  <li style="margin-bottom:10px;"><a href="#calendar" style="color:#94a3b8;text-decoration:none;font-size:14px;">Contact</a></li>
</ul>
```

#### Column 3 — Areas Served
- **Headline:** `Areas Served`, Size: 15px, Weight: 600, Color: `#ffffff`
- **Custom HTML** with location list (same structure as Quick Links): Jacksonville, Orange Park, St. Augustine, Ponte Vedra, Middleburg, Fleming Island

#### Column 4 — Contact + Newsletter
- **Headline:** `Get In Touch`, Size: 15px, Weight: 600, Color: `#ffffff`
- **Paragraphs:** Phone: `(254) 449-5299`, Email: `keneshia@fgragent.com`, Address: `1700 Wells Road, Suite 4, Orange Park, FL 32073`
- **GHL Form** (Newsletter):
  - Fields: Email only
  - Submit: `Subscribe` button
  - Tag: `newsletter-subscriber`

**Row 2: 1 Column — Legal Bar**
- **Divider** → Color: `rgba(255,255,255,0.06)`
- **Paragraph** (centered):
  - Text: `© 2026 Keneshia Haye · Florida Gateway Realty · License: BK3450416`
  - Size: 12px, Color: `#64748b`
  - Additional: `Equal Housing Opportunity. All information deemed reliable but not guaranteed.`

---

## GHL AUTOMATION CHECKLIST

After building the page, set up these automations in GHL:

| Trigger                     | Action                                                    |
| --------------------------- | --------------------------------------------------------- |
| Hero form submitted         | Create contact → Tag `website-lead` → Add to pipeline     |
| Veteran checkbox = true     | Add tag `veteran-lead` → Trigger VA-specific email drip    |
| Guide form submitted        | Tag `guide-download` → Send PDF email → Nurture sequence   |
| Calendar booked             | Tag `consultation-booked` → SMS confirm → Email remind     |
| Newsletter form submitted   | Tag `newsletter` → Add to weekly email list                |
| No response after 24 hours  | Trigger follow-up SMS + email                              |

---

## MOBILE OPTIMIZATION CHECKLIST

In GHL's responsive settings for each element:

- [ ] Hero headline: 36px on mobile (vs 56px desktop)
- [ ] Hero 2-column layout stacks (form goes below copy)
- [ ] Navigation: Use GHL's built-in hamburger menu on mobile
- [ ] 3-column grids (3 D's, properties): Stack to 1 column on mobile
- [ ] About section 2-columns: Stack (image on top, text below)
- [ ] Resources 2-columns: Stack
- [ ] Footer 4-columns: Stack to 2x2 or full-width
- [ ] All buttons: Full width on mobile
- [ ] Padding: Reduce section padding to `48px 16px` on mobile
- [ ] Form fields: Full width, larger touch targets (min 48px height)
