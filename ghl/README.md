# GHL Implementation Package — Keneshia Haye Real Estate

## Quick Start

This folder contains everything you need to build the landing page in GoHighLevel.

### Files

| File | What It Is | Where to Paste in GHL |
|------|-----------|----------------------|
| `GHL-BLUEPRINT.md` | Section-by-section builder instructions | Follow step-by-step in the GHL page editor |
| `custom-styles.css` | Global custom CSS | **Settings → Custom CSS** (paste entire file) |
| `featured-properties.html` | Property cards with hover animations | **Custom HTML/JS element** in Section 5 |
| `conversational-search.html` | Search bar with dropdown & chips | **Custom HTML/JS element** in Hero Section |

### Build Order

1. Open `GHL-BLUEPRINT.md` and follow it section by section
2. First, paste `custom-styles.css` into **Funnel Settings → Custom CSS**
3. Build each section using GHL native elements as described
4. When you reach Section 2 (Hero), paste `conversational-search.html` into a Custom HTML block
5. When you reach Section 5 (Properties), paste `featured-properties.html` into a Custom HTML block
6. Set up automations per the checklist at the bottom of the blueprint

### CSS Classes to Remember

Add these classes in GHL element **Advanced → Custom Class Name**:

| Class | Purpose |
|-------|---------|
| `kh-btn-primary` | Gold gradient CTA button |
| `kh-btn-outline` | Ghost/outline button |
| `kh-feature-card` | Card with hover-elevate + glow top border |
| `kh-about-image` | Agent photo with hover border glow |
| `kh-resource-card` | Resource section card styling |
| `kh-label` | Section label (champagne, uppercase, tracked) |
| `kh-accent` | Champagne color text |
| `kh-gradient-text` | Gold gradient text |
| `kh-glass` | Glassmorphism card |
| `kh-glow-border` | Subtle champagne border glow |
| `kh-reveal` | Scroll-reveal animation |
| `kh-hide-mobile` | Hidden below 768px |
| `kh-hide-desktop` | Hidden above 768px |

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#0a1628` | Page background |
| Navy Deep | `#060f1d` | Alternate section bg |
| Surface | `#0f1f38` | Cards |
| Champagne | `#c9a96e` | Primary accent |
| Champagne Light | `#e3d4ab` | Hover accent |
| White | `#ffffff` | Headlines |
| Text | `#94a3b8` | Body copy |
| Text Dim | `#64748b` | Subtle labels |
