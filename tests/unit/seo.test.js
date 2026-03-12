/**
 * Unit tests for SEO metadata
 *
 * Verifies that all site pages have required SEO elements:
 * unique titles, meta descriptions, Open Graph tags, and canonical URLs.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

const SITE_DIRS = ['', 'blog', 'areas'];
const htmlFiles = SITE_DIRS.flatMap((dir) => {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(dir, f));
});

// 404 and terms/privacy are less SEO-critical — test them but with lighter rules
const SKIP_OG = new Set(['404.html', 'terms.html', 'privacy-policy.html']);

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractMetaContent(html, attr, value) {
  // Match content="..." where the content may contain single quotes
  const regex = new RegExp(
    `<meta[^>]+${attr}="${value}"[^>]+content="([^"]+)"`,
    'i',
  );
  const match = html.match(regex);
  if (match) return match[1];

  // Also try reversed attribute order: content before name/property
  const regex2 = new RegExp(
    `<meta[^>]+content="([^"]+)"[^>]+${attr}="${value}"`,
    'i',
  );
  const match2 = html.match(regex2);
  return match2 ? match2[1] : null;
}

describe('SEO metadata', () => {
  const titles = new Map();

  for (const htmlFile of htmlFiles) {
    describe(htmlFile, () => {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');

      it('has a <title> tag', () => {
        const title = extractTag(content, /<title>([^<]+)<\/title>/i);
        expect(title, `Missing <title> in ${htmlFile}`).toBeTruthy();
        expect(title.trim().length).toBeGreaterThan(0);
      });

      it('title is under 60 characters', () => {
        const title = extractTag(content, /<title>([^<]+)<\/title>/i);
        if (title) {
          expect(
            title.trim().length,
            `Title too long in ${htmlFile}: "${title.trim()}" (${title.trim().length} chars)`,
          ).toBeLessThanOrEqual(60);
        }
      });

      it('has a meta description', () => {
        const desc = extractMetaContent(content, 'name', 'description');
        expect(desc, `Missing meta description in ${htmlFile}`).toBeTruthy();
      });

      it('meta description is between 50 and 155 characters', () => {
        const desc = extractMetaContent(content, 'name', 'description');
        if (desc) {
          expect(
            desc.length,
            `Meta description too short in ${htmlFile}: "${desc}" (${desc.length} chars)`,
          ).toBeGreaterThanOrEqual(50);
          expect(
            desc.length,
            `Meta description too long in ${htmlFile}: "${desc}" (${desc.length} chars)`,
          ).toBeLessThanOrEqual(155);
        }
      });

      it('has a viewport meta tag', () => {
        const viewport = extractMetaContent(content, 'name', 'viewport');
        expect(viewport, `Missing viewport meta in ${htmlFile}`).toBeTruthy();
        expect(viewport).toContain('width=device-width');
      });

      if (!SKIP_OG.has(htmlFile)) {
        it('has Open Graph title', () => {
          const ogTitle = extractMetaContent(content, 'property', 'og:title');
          expect(ogTitle, `Missing og:title in ${htmlFile}`).toBeTruthy();
        });

        it('has Open Graph description', () => {
          const ogDesc = extractMetaContent(
            content,
            'property',
            'og:description',
          );
          expect(ogDesc, `Missing og:description in ${htmlFile}`).toBeTruthy();
        });

        it('has Open Graph image', () => {
          const ogImage = extractMetaContent(content, 'property', 'og:image');
          expect(ogImage, `Missing og:image in ${htmlFile}`).toBeTruthy();
        });
      }
    });
  }

  it('all pages have unique titles', () => {
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
      const title = extractTag(content, /<title>([^<]+)<\/title>/i);
      if (title) {
        const trimmed = title.trim();
        if (titles.has(trimmed)) {
          expect.fail(
            `Duplicate title "${trimmed}" found in ${htmlFile} and ${titles.get(trimmed)}`,
          );
        }
        titles.set(trimmed, htmlFile);
      }
    }
  });

  it('all pages have unique meta descriptions', () => {
    const descriptions = new Map();
    for (const htmlFile of htmlFiles) {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');
      const desc = extractMetaContent(content, 'name', 'description');
      if (desc) {
        const trimmed = desc.trim();
        if (descriptions.has(trimmed)) {
          expect.fail(
            `Duplicate meta description found in ${htmlFile} and ${descriptions.get(trimmed)}: "${trimmed.substring(0, 60)}..."`,
          );
        }
        descriptions.set(trimmed, htmlFile);
      }
    }
  });
});

describe('Blog post SEO', () => {
  const blogDir = path.join(ROOT, 'blog');
  const blogFiles = fs.existsSync(blogDir)
    ? fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith('.html') && f !== 'index.html')
        .map((f) => path.join('blog', f))
    : [];

  for (const blogFile of blogFiles) {
    describe(blogFile, () => {
      const content = fs.readFileSync(path.join(ROOT, blogFile), 'utf-8');

      it('has a canonical URL', () => {
        const canonical = content.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
        expect(canonical, `Missing canonical URL in ${blogFile}`).toBeTruthy();
        expect(canonical[1]).toContain('keneshiahaye.com');
      });

      it('has Open Graph article tags', () => {
        const ogType = extractMetaContent(content, 'property', 'og:type');
        if (ogType) {
          expect(ogType).toBe('article');
        }
      });

      it('navigation links using ../ paths resolve to valid pages', () => {
        const relLinks = content.match(/href="\.\.\/([\w-]+)"/g) || [];
        for (const link of relLinks) {
          const pageName = link.match(/href="\.\.\/([\w-]+)"/)?.[1];
          if (pageName) {
            const targetFile = path.join(ROOT, `${pageName}.html`);
            const exists = fs.existsSync(targetFile);
            expect(exists, `Broken nav link ../${pageName} in ${blogFile}`).toBe(true);
          }
        }
      });
    });
  }
});
