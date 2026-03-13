/**
 * Validate _headers file for Cloudflare Pages.
 *
 * Checks for:
 * - Required security headers on /*
 * - CSP directive completeness
 * - Valid header syntax
 * - Path blocks reference existing directories
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const headersFile = path.join(ROOT, '_headers');

let errors = 0;
let warnings = 0;

if (!fs.existsSync(headersFile)) {
  console.error('_headers file not found — this is required for security.');
  process.exit(1);
}

const content = fs.readFileSync(headersFile, 'utf-8');
const lines = content.split('\n');

// Required security headers for the global /* block
const requiredHeaders = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Strict-Transport-Security',
  'Content-Security-Policy',
];

const requiredCspDirectives = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
];

// Parse header blocks
const blocks = [];
let currentBlock = null;

lines.forEach((line, i) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;

  // Path line (no leading whitespace, starts with /)
  if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed.startsWith('/')) {
    currentBlock = { path: trimmed, headers: {}, lineNum: i + 1 };
    blocks.push(currentBlock);
    return;
  }

  // Header line (indented)
  if (currentBlock && (line.startsWith(' ') || line.startsWith('\t'))) {
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      console.error(`Line ${i + 1}: Invalid header syntax (missing colon) — "${trimmed}"`);
      errors++;
      return;
    }
    const name = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();
    currentBlock.headers[name] = value;
  }
});

// Find the global /* block
const globalBlock = blocks.find(b => b.path === '/*');
if (!globalBlock) {
  console.error('No global /* header block found — security headers will not apply to all pages.');
  errors++;
} else {
  // Check required security headers
  for (const header of requiredHeaders) {
    if (!globalBlock.headers[header]) {
      console.error(`Missing required security header in /* block: ${header}`);
      errors++;
    }
  }

  // Validate CSP
  const csp = globalBlock.headers['Content-Security-Policy'];
  if (csp) {
    for (const directive of requiredCspDirectives) {
      if (!csp.includes(directive)) {
        console.error(`CSP is missing required directive: ${directive}`);
        errors++;
      }
    }

    // Warn about unsafe directives
    if (csp.includes("'unsafe-eval'")) {
      console.warn('Warning: CSP contains unsafe-eval — this is a security risk.');
      warnings++;
    }

    // Check for data: in img-src (allows XSS via data URIs)
    const imgSrcMatch = csp.match(/img-src\s+([^;]+)/);
    if (imgSrcMatch && imgSrcMatch[1].includes('data:')) {
      console.warn('Warning: CSP img-src allows data: URIs — consider removing for security.');
      warnings++;
    }
  }

  // Check HSTS has recommended values
  const hsts = globalBlock.headers['Strict-Transport-Security'];
  if (hsts) {
    if (!hsts.includes('includeSubDomains')) {
      console.warn('Warning: HSTS should include includeSubDomains.');
      warnings++;
    }
    const maxAgeMatch = hsts.match(/max-age=(\d+)/);
    if (maxAgeMatch && parseInt(maxAgeMatch[1], 10) < 31536000) {
      console.warn('Warning: HSTS max-age should be at least 31536000 (1 year).');
      warnings++;
    }
  }
}

// Check that path-specific blocks reference existing paths
for (const block of blocks) {
  if (block.path === '/*') continue;
  const cleanPath = block.path.replace(/\*$/, '').replace(/\/$/, '');
  if (cleanPath) {
    const fullPath = path.join(ROOT, cleanPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning (line ${block.lineNum}): Path "${block.path}" — "${cleanPath}" does not exist.`);
      warnings++;
    }
  }
}

if (errors > 0) {
  console.error(`\n_headers validation failed with ${errors} error(s) and ${warnings} warning(s).`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`_headers validation passed with ${warnings} warning(s).`);
} else {
  console.log('_headers validation passed.');
}
