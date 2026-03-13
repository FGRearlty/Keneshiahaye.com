/**
 * Validate _redirects file for Cloudflare Pages.
 *
 * Checks for:
 * - Syntax errors (each line must have: from  to  statusCode)
 * - Redirect loops (A -> B -> A)
 * - Self-referencing redirects (A -> A)
 * - Invalid status codes
 * - Paths that don't start with /
 * - Destinations that point to missing HTML files
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const redirectsFile = path.join(ROOT, '_redirects');

let errors = 0;

if (!fs.existsSync(redirectsFile)) {
  console.log('No _redirects file found — skipping.');
  process.exit(0);
}

const content = fs.readFileSync(redirectsFile, 'utf-8');
const lines = content.split('\n');
const validStatuses = [200, 301, 302, 303, 307, 308];
const redirectMap = new Map();

lines.forEach((line, i) => {
  const lineNum = i + 1;
  const trimmed = line.trim();

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) return;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2 || parts.length > 3) {
    console.error(`Line ${lineNum}: Invalid format — expected "from to [status]", got: ${trimmed}`);
    errors++;
    return;
  }

  const [from, to, statusStr] = parts;
  const status = statusStr ? parseInt(statusStr, 10) : 301;

  // Check paths start with /
  if (!from.startsWith('/')) {
    console.error(`Line ${lineNum}: Source path must start with / — got: ${from}`);
    errors++;
  }
  if (!to.startsWith('/') && !to.startsWith('https://') && !to.startsWith('http://')) {
    console.error(`Line ${lineNum}: Destination must start with / or be a full URL — got: ${to}`);
    errors++;
  }

  // Check status code
  if (statusStr && !validStatuses.includes(status)) {
    console.error(`Line ${lineNum}: Invalid status code ${statusStr} — must be one of: ${validStatuses.join(', ')}`);
    errors++;
  }

  // Check self-redirect
  if (from === to) {
    console.error(`Line ${lineNum}: Self-redirect — "${from}" redirects to itself`);
    errors++;
  }

  // For rewrites (200), check that the destination file exists
  if (status === 200 && to.startsWith('/')) {
    const destFile = path.join(ROOT, to);
    if (!fs.existsSync(destFile)) {
      console.error(`Line ${lineNum}: Rewrite destination file not found — ${to}`);
      errors++;
    }
  }

  // For redirects, check that Cloudflare clean URLs won't conflict
  if (status !== 200 && to.startsWith('/') && !to.includes('.')) {
    const htmlFile = path.join(ROOT, to + '.html');
    if (!fs.existsSync(htmlFile) && !fs.existsSync(path.join(ROOT, to, 'index.html'))) {
      console.error(`Line ${lineNum}: Redirect destination has no matching HTML file — ${to}`);
      errors++;
    }
  }

  redirectMap.set(from, { to, status, lineNum });
});

// Check for redirect chains/loops
for (const [from, { to, lineNum }] of redirectMap) {
  const visited = new Set([from]);
  let current = to;
  let depth = 0;

  while (redirectMap.has(current) && depth < 10) {
    if (visited.has(current)) {
      console.error(`Line ${lineNum}: Redirect loop detected — "${from}" eventually redirects back to "${current}"`);
      errors++;
      break;
    }
    visited.add(current);
    current = redirectMap.get(current).to;
    depth++;
  }

  if (depth >= 10) {
    console.error(`Line ${lineNum}: Redirect chain too long (10+ hops) starting from "${from}"`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n_redirects validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('_redirects validation passed.');
}
