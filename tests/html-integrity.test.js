/**
 * HTML/Link Integrity Tests
 *
 * Validates that all HTML pages have:
 * - Working internal links (target files exist)
 * - Working local image references (files exist)
 * - Required navigation structure
 * - Valid JSON-LD structured data
 * - Consistent form endpoints
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const ROOT = path.resolve(import.meta.dirname, '..');

// Site HTML pages (exclude email templates and GHL widgets)
const SITE_PAGES = [];
const BLOG_PAGES = [];

function collectHtmlFiles(dir, list, prefix = '') {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      collectHtmlFiles(path.join(dir, entry.name), list, `${prefix}${entry.name}/`);
    } else if (entry.name.endsWith('.html')) {
      list.push({
        name: `${prefix}${entry.name}`,
        path: path.join(dir, entry.name),
      });
    }
  }
}

beforeAll(() => {
  // Top-level HTML files
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.html')) {
      SITE_PAGES.push({ name: f, path: path.join(ROOT, f) });
    }
  }
  // Area pages
  collectHtmlFiles(path.join(ROOT, 'areas'), SITE_PAGES, 'areas/');
  // Blog pages
  collectHtmlFiles(path.join(ROOT, 'blog'), BLOG_PAGES, 'blog/');
});

describe('Internal links resolve to existing files', () => {
  it('all href links to local HTML pages point to existing files', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const broken = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto:') ||
            href.startsWith('tel:') || href.startsWith('#') || href.startsWith('javascript:')) {
          return;
        }

        // Resolve relative path
        const pageDir = path.dirname(page.path);
        let targetPath;

        if (href.startsWith('/')) {
          targetPath = path.join(ROOT, href);
        } else {
          targetPath = path.join(pageDir, href);
        }

        // Clean up query strings and anchors
        targetPath = targetPath.split('?')[0].split('#')[0];

        // Try resolving: exact file, with .html, or as directory/index.html
        // Also check functions/ directory for Cloudflare Pages Functions
        const candidates = [
          targetPath,
          targetPath + '.html',
          path.join(targetPath, 'index.html'),
          path.join(ROOT, 'functions', path.basename(targetPath) + '.js'),
        ];

        const exists = candidates.some(c => fs.existsSync(c));
        if (!exists) {
          broken.push({ page: page.name, href, resolved: targetPath });
        }
      });
    }

    expect(broken).toEqual([]);
  });
});

describe('Local images exist', () => {
  // Known missing images — tracked as issues to fix separately
  const KNOWN_MISSING_IMAGES = [
    '/images/stock/neighborhood-callahan.jpg',
    '/images/stock/neighborhood-middleburg.jpg',
  ];

  it('all img src pointing to local files exist on disk', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const missing = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (!src || src.startsWith('http') || src.startsWith('data:')) return;

        // Strip cache-busting query strings (e.g., ?v=2026031101)
        const cleanSrc = src.split('?')[0];

        let imgPath;
        if (cleanSrc.startsWith('/')) {
          imgPath = path.join(ROOT, cleanSrc);
        } else {
          imgPath = path.join(path.dirname(page.path), cleanSrc);
        }

        if (!fs.existsSync(imgPath) && !KNOWN_MISSING_IMAGES.includes(cleanSrc)) {
          missing.push({ page: page.name, src: cleanSrc });
        }
      });
    }

    expect(missing).toEqual([]);
  });

  it('no images use Unsplash CDN hotlinks', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const violations = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('img[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('unsplash.com')) {
          violations.push({ page: page.name, src });
        }
      });
    }

    expect(violations).toEqual([]);
  });
});

describe('Navigation structure', () => {
  it('all site pages have a nav element', () => {
    const pagesWithoutNav = [];
    // Skip 404, landing pages (intentionally no nav for conversion focus)
    const LANDING_PAGES = ['404', 'free-guide'];
    const pages = SITE_PAGES.filter(p => !LANDING_PAGES.some(lp => p.name.includes(lp)));

    for (const page of pages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);
      if ($('nav').length === 0) {
        pagesWithoutNav.push(page.name);
      }
    }

    expect(pagesWithoutNav).toEqual([]);
  });

  it('all site pages have a footer', () => {
    const pagesWithoutFooter = [];
    const pages = SITE_PAGES.filter(p => !p.name.includes('404'));

    for (const page of pages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);
      if ($('footer').length === 0) {
        pagesWithoutFooter.push(page.name);
      }
    }

    expect(pagesWithoutFooter).toEqual([]);
  });
});

describe('JSON-LD structured data', () => {
  it('pages with JSON-LD have valid JSON', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const invalid = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);

      $('script[type="application/ld+json"]').each((_, el) => {
        const content = $(el).html();
        try {
          JSON.parse(content);
        } catch {
          invalid.push({ page: page.name, error: 'Invalid JSON in ld+json script' });
        }
      });
    }

    expect(invalid).toEqual([]);
  });
});

describe('Form endpoints', () => {
  const VALID_ENDPOINT = 'https://keneshia-haye-form-handler.jutsuxx.workers.dev';

  it('all hardcoded form endpoints use the correct Worker URL', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const wrongEndpoints = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      // Look for fetch() calls with hardcoded URLs
      const fetchMatches = html.matchAll(/fetch\(['"]([^'"]+)['"]/g);
      for (const match of fetchMatches) {
        const url = match[1];
        if (url.includes('workers.dev') && url !== VALID_ENDPOINT) {
          wrongEndpoints.push({ page: page.name, url });
        }
      }
    }

    expect(wrongEndpoints).toEqual([]);
  });
});

describe('_redirects file', () => {
  it('exists', () => {
    expect(fs.existsSync(path.join(ROOT, '_redirects'))).toBe(true);
  });

  it('redirect targets resolve to existing files', () => {
    const content = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf-8');
    const broken = [];

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const target = parts[1];
        if (target.startsWith('/')) {
          const candidates = [
            path.join(ROOT, target),
            path.join(ROOT, target + '.html'),
            path.join(ROOT, target, 'index.html'),
          ];
          if (!candidates.some(c => fs.existsSync(c))) {
            broken.push({ from: parts[0], to: target });
          }
        }
      }
    }

    expect(broken).toEqual([]);
  });
});

describe('Meta tags', () => {
  it('all pages have a title tag', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const missingTitle = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);
      const title = $('title').text().trim();
      if (!title) {
        missingTitle.push(page.name);
      }
    }

    expect(missingTitle).toEqual([]);
  });

  it('all pages have a meta description', () => {
    const allPages = [...SITE_PAGES, ...BLOG_PAGES];
    const missingDesc = [];

    for (const page of allPages) {
      const html = fs.readFileSync(page.path, 'utf-8');
      const $ = load(html);
      const desc = $('meta[name="description"]').attr('content');
      if (!desc || !desc.trim()) {
        missingDesc.push(page.name);
      }
    }

    expect(missingDesc).toEqual([]);
  });
});
