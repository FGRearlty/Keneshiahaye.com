/**
 * PDF Generation Script Tests
 *
 * Validates that PDF generation scripts:
 * - Can be loaded without errors
 * - Reference images that exist on disk
 * - Have consistent structure
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');

const PDF_SCRIPTS = [
  'create-buyers-steps-guide.js',
  'create-homebuyer-guide.js',
  'create-military-guide.js',
  'create-sellers-guide.js',
  'create-remaining-guides.js',
];

describe('PDF scripts exist', () => {
  for (const script of PDF_SCRIPTS) {
    it(`${script} exists`, () => {
      expect(fs.existsSync(path.join(SCRIPTS_DIR, script))).toBe(true);
    });
  }
});

describe('PDF scripts reference existing images', () => {
  for (const script of PDF_SCRIPTS) {
    it(`${script} — all referenced images exist`, () => {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) return;

      const content = fs.readFileSync(scriptPath, 'utf-8');
      const missing = [];

      // Match path.join patterns referencing image files
      const pathJoinMatches = content.matchAll(/path\.join\([^)]*['"]([^'"]*\.(png|jpg|jpeg|webp|svg))['"]\s*\)/g);
      for (const m of pathJoinMatches) {
        // These are typically relative to __dirname or ROOT
        const imgName = m[1];
        const candidates = [
          path.join(SCRIPTS_DIR, imgName),
          path.join(ROOT, imgName),
          path.join(ROOT, 'images', imgName),
          path.join(ROOT, 'images/stock', imgName),
        ];
        if (!candidates.some(c => fs.existsSync(c))) {
          missing.push(imgName);
        }
      }

      // Match string literal image paths
      const literalMatches = content.matchAll(/['"](?:\.\/|\.\.\/|\/)?(?:images\/[^'"]*\.(png|jpg|jpeg|webp|svg))['"]/g);
      for (const m of literalMatches) {
        const imgPath = m[0].replace(/['"]/g, '');
        const resolved = imgPath.startsWith('/')
          ? path.join(ROOT, imgPath)
          : path.join(SCRIPTS_DIR, imgPath);
        const altResolved = path.join(ROOT, imgPath);

        if (!fs.existsSync(resolved) && !fs.existsSync(altResolved)) {
          missing.push(imgPath);
        }
      }

      expect(missing).toEqual([]);
    });
  }
});

describe('PDF scripts have valid JavaScript syntax', () => {
  for (const script of PDF_SCRIPTS) {
    it(`${script} has no syntax errors`, () => {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) return;

      const content = fs.readFileSync(scriptPath, 'utf-8');

      // Basic syntax check — try to parse as a function body
      // This catches obvious syntax errors like unclosed brackets, missing commas, etc.
      expect(() => {
        // Use Function constructor to check syntax without executing
        // We need to handle require() and module-level code
        new Function('require', '__dirname', '__filename', 'module', 'exports', content);
      }).not.toThrow();
    });
  }
});

describe('Output directories', () => {
  it('guides directory exists for PDF output', () => {
    expect(fs.existsSync(path.join(ROOT, 'guides'))).toBe(true);
  });
});

describe('PDF scripts reference correct contact info', () => {
  const CORRECT_PHONE = '(254) 449-5299';
  const CORRECT_EMAIL = 'keneshia@fgragent.com';

  for (const script of PDF_SCRIPTS) {
    it(`${script} uses correct agent phone number in branded lines`, () => {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) return;

      const content = fs.readFileSync(scriptPath, 'utf-8');
      const wrong = [];

      // Only check lines that reference Keneshia or Florida Gateway Realty
      // (third-party numbers like VA offices, base operators, etc. are fine)
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('Keneshia') || line.includes('Florida Gateway')) {
          const phoneMatches = line.matchAll(/\(\d{3}\)\s*\d{3}-\d{4}/g);
          for (const m of phoneMatches) {
            if (m[0] !== CORRECT_PHONE) {
              wrong.push({ line: line.trim().substring(0, 80), phone: m[0] });
            }
          }
        }
      }

      expect(wrong).toEqual([]);
    });

    it(`${script} uses correct email`, () => {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) return;

      const content = fs.readFileSync(scriptPath, 'utf-8');

      // If the script references an @fgragent.com email, it should be correct
      const emailMatches = content.matchAll(/[\w.-]+@fgragent\.com/g);
      for (const m of emailMatches) {
        expect(m[0]).toBe(CORRECT_EMAIL);
      }
    });
  }
});
