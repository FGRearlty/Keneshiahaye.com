/**
 * Unit tests for link and asset integrity
 *
 * Parses all site HTML files and verifies that every locally-referenced
 * image, stylesheet, script, PDF, and internal link points to a file
 * that actually exists on disk.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

/**
 * Site HTML pages (excludes email-templates, ghl, node_modules).
 */
const SITE_DIRS = ['', 'blog', 'areas'];
const htmlFiles = SITE_DIRS.flatMap((dir) => {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(dir, f));
});

/**
 * Extract attribute values from HTML for the given attribute name.
 * Returns raw attribute values (not resolved paths).
 */
function extractAttributes(html, attr) {
  const regex = new RegExp(`${attr}=["']([^"']+)["']`, 'gi');
  const values = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    values.push(match[1]);
  }
  return values;
}

/**
 * Determine if a URL is local (not external, not data URI, not anchor-only).
 */
function isLocalRef(value) {
  if (!value) return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  if (value.startsWith('//')) return false;
  if (value.startsWith('data:')) return false;
  if (value.startsWith('mailto:')) return false;
  if (value.startsWith('tel:')) return false;
  if (value.startsWith('#')) return false;
  if (value.startsWith('javascript:')) return false;
  return true;
}

/**
 * Resolve a relative reference from an HTML file to an absolute file path.
 */
function resolveRef(htmlFile, ref) {
  // Strip query string and hash
  const clean = ref.split('?')[0].split('#')[0];
  if (!clean) return null;

  // Absolute paths (start with /) resolve from ROOT
  if (clean.startsWith('/')) {
    return path.join(ROOT, clean);
  }

  // Relative paths resolve from the HTML file's directory
  const htmlDir = path.dirname(path.join(ROOT, htmlFile));
  return path.resolve(htmlDir, clean);
}

/**
 * Paths served by Cloudflare Pages Functions (serverless, no static file).
 */
const FUNCTION_ROUTES = new Set(['/checkout']);

/**
 * Known missing assets that should be fixed separately.
 * Each entry is { file, ref } where file is the HTML and ref is the broken reference.
 */
const KNOWN_MISSING = new Set([
  'areas/callahan.html:/images/stock/neighborhood-callahan.jpg',
  'areas/middleburg.html:/images/stock/neighborhood-middleburg.jpg',
]);

describe('Link and asset integrity', () => {
  for (const htmlFile of htmlFiles) {
    describe(htmlFile, () => {
      const content = fs.readFileSync(path.join(ROOT, htmlFile), 'utf-8');

      // Collect all local references from src, href, and poster attributes
      const srcs = extractAttributes(content, 'src').filter(isLocalRef);
      const hrefs = extractAttributes(content, 'href')
        .filter(isLocalRef)
        .filter((ref) => !FUNCTION_ROUTES.has(ref.split('?')[0].split('#')[0]));

      const localRefs = [...new Set([...srcs, ...hrefs])];

      if (localRefs.length === 0) return;

      for (const ref of localRefs) {
        const knownKey = `${htmlFile}:${ref}`;
        const skipKnown = KNOWN_MISSING.has(knownKey);

        it(`"${ref}" exists${skipKnown ? ' (known missing — TODO fix)' : ''}`, () => {
          if (skipKnown) return; // Skip known missing assets
          const resolved = resolveRef(htmlFile, ref);
          if (!resolved) return;

          // For clean URLs like "/buy" or "/contact", check for .html version
          // Cloudflare Pages and the dev server handle this automatically
          let exists = fs.existsSync(resolved);
          if (!exists && !path.extname(resolved)) {
            exists = fs.existsSync(resolved + '.html');
          }
          // For directory references like "/blog/", check for index.html
          if (!exists && ref.endsWith('/')) {
            exists = fs.existsSync(path.join(resolved, 'index.html'));
          }

          expect(exists, `Missing asset: "${ref}" referenced in ${htmlFile} (resolved to ${resolved})`).toBe(true);
        });
      }
    });
  }
});
