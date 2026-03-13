/**
 * Unit tests for server.js
 *
 * Tests the actual server module's routing logic, MIME type mapping,
 * clean URL handling, and 404 behavior.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5111; // Use a different port to avoid conflicts
const ROOT = path.resolve(import.meta.dirname, '..', '..');
let server;

// Import actual server module
const { handleRequest, MIME } = await import('../../server.js');

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

beforeAll(() => {
  return new Promise((resolve) => {
    server = http.createServer(handleRequest);
    server.listen(PORT, resolve);
  });
});

afterAll(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

describe('Server routing (actual module)', () => {
  it('serves index.html for /', async () => {
    const res = await fetch('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.body).toContain('<!DOCTYPE html');
  });

  it('serves clean URLs (e.g., /contact -> contact.html)', async () => {
    const res = await fetch('/contact');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
  });

  it('serves .html files directly', async () => {
    const res = await fetch('/contact.html');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
  });

  it('returns 404 for non-existent pages', async () => {
    const res = await fetch('/this-page-does-not-exist');
    expect(res.status).toBe(404);
  });

  it('strips query parameters from path', async () => {
    const res = await fetch('/contact?ref=test');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
  });
});

describe('MIME types (from actual module)', () => {
  it('serves CSS with correct MIME type', async () => {
    const cssExists = fs.existsSync(path.join(ROOT, 'css', 'styles.css'));
    if (cssExists) {
      const res = await fetch('/css/styles.css');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/css');
    }
  });

  it('serves JSON with correct MIME type', async () => {
    const res = await fetch('/package.json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
  });

  it('maps all expected MIME types', () => {
    expect(MIME['.html']).toBe('text/html');
    expect(MIME['.css']).toBe('text/css');
    expect(MIME['.js']).toBe('application/javascript');
    expect(MIME['.json']).toBe('application/json');
    expect(MIME['.png']).toBe('image/png');
    expect(MIME['.jpg']).toBe('image/jpeg');
    expect(MIME['.jpeg']).toBe('image/jpeg');
    expect(MIME['.gif']).toBe('image/gif');
    expect(MIME['.svg']).toBe('image/svg+xml');
    expect(MIME['.ico']).toBe('image/x-icon');
    expect(MIME['.webp']).toBe('image/webp');
    expect(MIME['.woff']).toBe('font/woff');
    expect(MIME['.woff2']).toBe('font/woff2');
    expect(MIME['.pdf']).toBe('application/pdf');
  });
});

describe('404 handling', () => {
  it('returns 404 status for missing files', async () => {
    const res = await fetch('/nonexistent-file.html');
    expect(res.status).toBe(404);
  });

  it('serves custom 404.html page when available', async () => {
    const has404 = fs.existsSync(path.join(ROOT, '404.html'));
    if (has404) {
      const res = await fetch('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.headers['content-type']).toBe('text/html');
      expect(res.body).toContain('<!DOCTYPE html');
    }
  });
});

describe('Directory index serving', () => {
  it('serves blog/index.html for /blog/ path', async () => {
    const blogIndex = path.join(ROOT, 'blog', 'index.html');
    if (fs.existsSync(blogIndex)) {
      const res = await fetch('/blog/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/html');
    }
  });
});
