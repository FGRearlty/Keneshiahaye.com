/**
 * Unit tests for PDF generation scripts
 *
 * Smoke tests that verify each script file exists, is valid JavaScript,
 * and that the generated PDF guides exist in the output directory.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const GUIDES_DIR = path.join(ROOT, 'guides');

const scriptFiles = [
  'create-buyers-steps-guide.js',
  'create-sellers-guide.js',
  'create-homebuyer-guide.js',
  'create-military-guide.js',
  'create-remaining-guides.js',
];

const imageScripts = [
  'optimize-images.js',
  'generate-webp.js',
];

describe('PDF generation scripts', () => {
  for (const script of scriptFiles) {
    it(`${script} exists and is readable`, () => {
      const filePath = path.join(SCRIPTS_DIR, script);
      expect(fs.existsSync(filePath), `${script} should exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    it(`${script} imports pdfkit`, () => {
      const filePath = path.join(SCRIPTS_DIR, script);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('pdfkit');
    });

    it(`${script} writes to the guides directory`, () => {
      const filePath = path.join(SCRIPTS_DIR, script);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/guides/);
    });
  }
});

describe('Image processing scripts', () => {
  for (const script of imageScripts) {
    it(`${script} exists and is readable`, () => {
      const filePath = path.join(SCRIPTS_DIR, script);
      expect(fs.existsSync(filePath), `${script} should exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });
  }
});

describe('Generated PDF guides', () => {
  it('guides directory exists', () => {
    expect(fs.existsSync(GUIDES_DIR), 'guides/ directory should exist').toBe(true);
  });

  it('at least one PDF guide has been generated', () => {
    if (!fs.existsSync(GUIDES_DIR)) return;
    const pdfs = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.pdf'));
    expect(pdfs.length, 'Should have at least one PDF in guides/').toBeGreaterThan(0);
  });

  it('all PDF files are non-empty', () => {
    if (!fs.existsSync(GUIDES_DIR)) return;
    const pdfs = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.pdf'));
    for (const pdf of pdfs) {
      const filePath = path.join(GUIDES_DIR, pdf);
      const stats = fs.statSync(filePath);
      expect(stats.size, `${pdf} should be non-empty`).toBeGreaterThan(0);
    }
  });

  it('PDF files start with valid PDF header', () => {
    if (!fs.existsSync(GUIDES_DIR)) return;
    const pdfs = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.pdf'));
    for (const pdf of pdfs) {
      const filePath = path.join(GUIDES_DIR, pdf);
      const buffer = Buffer.alloc(5);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 5, 0);
      fs.closeSync(fd);
      expect(buffer.toString(), `${pdf} should have valid PDF header`).toBe('%PDF-');
    }
  });
});
