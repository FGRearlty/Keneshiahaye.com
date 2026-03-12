/**
 * Unit tests for JSON-LD structured data
 *
 * Validates that all site pages have correct structured data:
 * - Main pages have RealEstateAgent or relevant schema
 * - Blog posts have Article schema with required fields
 * - Area pages have RealEstateAgent + areaServed
 * - All pages with breadcrumbs have BreadcrumbList schema
 * - All JSON-LD blocks are valid JSON
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

function getHtmlFiles(dir) {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
}

const mainPages = getHtmlFiles('');
const blogPages = getHtmlFiles('blog');
const areaPages = getHtmlFiles('areas');
const allPages = [...mainPages, ...blogPages, ...areaPages];

/**
 * Extract all JSON-LD blocks from HTML content.
 */
function extractJsonLd(html) {
  const blocks = [];
  const regex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

describe('JSON-LD structured data — validity', () => {
  for (const htmlFile of allPages) {
    const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
    const blocks = extractJsonLd(content);

    if (blocks.length === 0) continue;

    for (let i = 0; i < blocks.length; i++) {
      it(`${htmlFile} — JSON-LD block ${i + 1} is valid JSON`, () => {
        let parsed;
        try {
          parsed = JSON.parse(blocks[i]);
        } catch (e) {
          expect.fail(`Invalid JSON-LD in ${htmlFile} block ${i + 1}: ${e.message}`);
        }
        expect(parsed['@context']).toBe('https://schema.org');
        expect(parsed['@type']).toBeTruthy();
      });
    }
  }
});

describe('JSON-LD structured data — main pages', () => {
  const mainPagesWithSchema = ['index.html', 'about.html', 'contact.html'];

  for (const htmlFile of mainPagesWithSchema) {
    it(`${htmlFile} has RealEstateAgent or Person schema`, () => {
      const filePath = path.join(ROOT, htmlFile);
      if (!fs.existsSync(filePath)) return;
      const content = fs.readFileSync(filePath, 'utf-8');
      const blocks = extractJsonLd(content);
      const types = blocks.map(b => {
        try { return JSON.parse(b)['@type']; } catch { return null; }
      });
      const hasAgent = types.some(t => t === 'RealEstateAgent' || t === 'Person');
      expect(hasAgent, `${htmlFile} should have RealEstateAgent or Person schema`).toBe(true);
    });
  }

  it('index.html has WebSite schema', () => {
    const content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
    const blocks = extractJsonLd(content);
    const types = blocks.map(b => {
      try { return JSON.parse(b)['@type']; } catch { return null; }
    });
    expect(types).toContain('WebSite');
  });

  it('index.html has FAQPage schema', () => {
    const content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
    const blocks = extractJsonLd(content);
    const types = blocks.map(b => {
      try { return JSON.parse(b)['@type']; } catch { return null; }
    });
    expect(types).toContain('FAQPage');
  });

  const pagesWithFaq = ['buy.html', 'sell.html', 'veterans.html', 'course.html', 'contact.html'];
  for (const htmlFile of pagesWithFaq) {
    it(`${htmlFile} has FAQPage schema`, () => {
      const filePath = path.join(ROOT, htmlFile);
      if (!fs.existsSync(filePath)) return;
      const content = fs.readFileSync(filePath, 'utf-8');
      const blocks = extractJsonLd(content);
      const types = blocks.map(b => {
        try { return JSON.parse(b)['@type']; } catch { return null; }
      });
      expect(types, `${htmlFile} should have FAQPage schema`).toContain('FAQPage');
    });
  }
});

describe('JSON-LD structured data — blog posts', () => {
  const posts = blogPages.filter(f => f !== 'blog/index.html');

  for (const htmlFile of posts) {
    describe(htmlFile, () => {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
      const blocks = extractJsonLd(content);
      const schemas = blocks.map(b => {
        try { return JSON.parse(b); } catch { return null; }
      }).filter(Boolean);

      it('has Article schema', () => {
        const article = schemas.find(s => s['@type'] === 'Article');
        expect(article, `${htmlFile} should have Article schema`).toBeTruthy();
      });

      it('Article schema has required fields', () => {
        const article = schemas.find(s => s['@type'] === 'Article');
        if (!article) return;
        expect(article.headline).toBeTruthy();
        expect(article.datePublished).toBeTruthy();
        expect(article.author).toBeTruthy();
        expect(article.publisher).toBeTruthy();
      });

      it('has BreadcrumbList schema', () => {
        const breadcrumb = schemas.find(s => s['@type'] === 'BreadcrumbList');
        expect(breadcrumb, `${htmlFile} should have BreadcrumbList schema`).toBeTruthy();
      });

      it('BreadcrumbList has at least 2 items', () => {
        const breadcrumb = schemas.find(s => s['@type'] === 'BreadcrumbList');
        if (!breadcrumb) return;
        expect(breadcrumb.itemListElement.length).toBeGreaterThanOrEqual(2);
      });
    });
  }
});

describe('JSON-LD structured data — area pages', () => {
  for (const htmlFile of areaPages) {
    describe(htmlFile, () => {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
      const blocks = extractJsonLd(content);
      const schemas = blocks.map(b => {
        try { return JSON.parse(b); } catch { return null; }
      }).filter(Boolean);

      it('has RealEstateAgent schema', () => {
        const agent = schemas.find(s => s['@type'] === 'RealEstateAgent');
        expect(agent, `${htmlFile} should have RealEstateAgent schema`).toBeTruthy();
      });

      it('RealEstateAgent has areaServed', () => {
        const agent = schemas.find(s => s['@type'] === 'RealEstateAgent');
        if (!agent) return;
        expect(agent.areaServed).toBeTruthy();
      });

      it('has BreadcrumbList schema', () => {
        const breadcrumb = schemas.find(s => s['@type'] === 'BreadcrumbList');
        expect(breadcrumb, `${htmlFile} should have BreadcrumbList schema`).toBeTruthy();
      });

      it('has correct NAP info', () => {
        const agent = schemas.find(s => s['@type'] === 'RealEstateAgent');
        if (!agent) return;
        expect(agent.telephone).toBe('+1-254-449-5299');
        expect(agent.email).toBe('keneshia@fgragent.com');
        expect(agent.address).toBeTruthy();
        expect(agent.address.addressLocality).toBe('Orange Park');
        expect(agent.address.addressRegion).toBe('FL');
      });
    });
  }
});

describe('JSON-LD structured data — NAP consistency', () => {
  it('all RealEstateAgent schemas use the same phone number', () => {
    const phones = new Set();
    for (const htmlFile of allPages) {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
      const blocks = extractJsonLd(content);
      for (const block of blocks) {
        try {
          const schema = JSON.parse(block);
          if (schema['@type'] === 'RealEstateAgent' && schema.telephone) {
            phones.add(schema.telephone);
          }
        } catch { /* skip invalid */ }
      }
    }
    expect(phones.size, `Found inconsistent phone numbers: ${[...phones].join(', ')}`).toBeLessThanOrEqual(1);
  });

  it('all RealEstateAgent schemas use the same email', () => {
    const emails = new Set();
    for (const htmlFile of allPages) {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
      const blocks = extractJsonLd(content);
      for (const block of blocks) {
        try {
          const schema = JSON.parse(block);
          if (schema['@type'] === 'RealEstateAgent' && schema.email) {
            emails.add(schema.email);
          }
        } catch { /* skip invalid */ }
      }
    }
    expect(emails.size, `Found inconsistent emails: ${[...emails].join(', ')}`).toBeLessThanOrEqual(1);
  });
});
