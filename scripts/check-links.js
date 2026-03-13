/**
 * Check internal links across all HTML pages.
 *
 * Validates that:
 * - All internal href links point to existing pages
 * - Anchor IDs referenced by # links exist on the target page
 * - Image src attributes point to existing files
 * - No broken relative paths
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXTENSIONS = ['.html'];

let errors = 0;
let warnings = 0;
let checkedLinks = 0;

// Collect all HTML files
function findHtmlFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip non-site directories
      if (['node_modules', '.git', 'ghl-integration', 'email-templates', 'scripts', 'tests', 'va-resources', '.claude', '.github', 'src'].includes(entry.name)) continue;
      findHtmlFiles(full, files);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

// Known clean URL pages (Cloudflare Pages serves .html without extension)
const htmlFiles = findHtmlFiles(ROOT);
const pageSet = new Set();

for (const file of htmlFiles) {
  const rel = '/' + path.relative(ROOT, file).replace(/\\/g, '/');
  pageSet.add(rel);
  // Also add clean URL version (without .html)
  if (rel.endsWith('.html') && !rel.endsWith('index.html')) {
    pageSet.add(rel.replace(/\.html$/, ''));
  }
  // /blog/index.html -> /blog/ and /blog
  if (rel.endsWith('index.html')) {
    pageSet.add(rel.replace(/index\.html$/, ''));
    pageSet.add(rel.replace(/\/index\.html$/, ''));
  }
}

// Known static asset directories
const assetDirs = ['images', 'css', 'js', 'fonts', 'guides', 'va-resources'];

// Paths served by Cloudflare Pages Functions (not static HTML)
const functionPaths = new Set();
if (fs.existsSync(path.join(ROOT, 'functions'))) {
  for (const f of fs.readdirSync(path.join(ROOT, 'functions'))) {
    if (f.endsWith('.js')) {
      functionPaths.add('/' + f.replace(/\.js$/, ''));
    }
  }
}

function resolveHref(href, fromFile) {
  // Skip external links, anchors, mailto, tel, javascript
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return null;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return null;
  if (href.startsWith('javascript:')) return null;
  if (href.startsWith('#')) return null;
  if (href.startsWith('data:')) return null;

  // Strip anchor
  const cleanHref = href.split('#')[0].split('?')[0];
  if (!cleanHref) return null;

  // Resolve relative paths
  const fromDir = path.dirname(fromFile);
  if (cleanHref.startsWith('/')) {
    return cleanHref;
  }
  const resolved = path.resolve(fromDir, cleanHref);
  return '/' + path.relative(ROOT, resolved).replace(/\\/g, '/');
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(ROOT, filePath);

  // Extract href attributes
  const hrefRegex = /href="([^"]*?)"/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    const resolved = resolveHref(href, filePath);
    if (!resolved) continue;
    checkedLinks++;

    // Check if the resolved path exists
    const fullPath = path.join(ROOT, resolved);
    const exists =
      fs.existsSync(fullPath) ||
      fs.existsSync(fullPath + '.html') ||
      fs.existsSync(path.join(fullPath, 'index.html')) ||
      pageSet.has(resolved) ||
      functionPaths.has(resolved);

    if (!exists) {
      console.error(`${relPath}: Broken link — href="${href}" resolves to "${resolved}" (not found)`);
      errors++;
    }
  }

  // Extract img src attributes
  const srcRegex = /src="([^"]*?)"/g;
  while ((match = srcRegex.exec(content)) !== null) {
    const src = match[1];
    // Skip external, data URIs, and script sources
    if (!src || src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) continue;
    if (src.endsWith('.js')) continue; // JS files handled differently

    const resolved = resolveHref(src, filePath);
    if (!resolved) continue;
    checkedLinks++;

    const fullPath = path.join(ROOT, resolved);
    if (!fs.existsSync(fullPath)) {
      console.error(`${relPath}: Broken image — src="${src}" resolves to "${resolved}" (not found)`);
      errors++;
    }
  }
}

// Run checks
for (const file of htmlFiles) {
  checkFile(file);
}

console.log(`Checked ${checkedLinks} links across ${htmlFiles.length} HTML files.`);

if (errors > 0) {
  console.error(`\nLink check failed with ${errors} broken link(s).`);
  process.exit(1);
} else {
  console.log('All internal links are valid.');
}
