/**
 * Generate WebP versions of all JPEG/PNG images.
 *
 * Creates a .webp file alongside each source image (same name, different ext).
 * Skips images that already have an up-to-date .webp version.
 *
 * Usage: node scripts/generate-webp.js
 *
 * The HTML files can then use <picture> with WebP sources for browsers
 * that support it, falling back to JPEG/PNG for older browsers.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dirs = [
  path.join(ROOT, 'images'),
  path.join(ROOT, 'images', 'stock'),
];

async function generateWebP() {
  let converted = 0;
  let skipped = 0;
  let totalSaved = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    for (const file of files) {
      const srcPath = path.join(dir, file);
      const webpPath = path.join(dir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

      // Skip if WebP already exists and is newer than source
      if (fs.existsSync(webpPath)) {
        const srcStat = fs.statSync(srcPath);
        const webpStat = fs.statSync(webpPath);
        if (webpStat.mtimeMs >= srcStat.mtimeMs) {
          skipped++;
          continue;
        }
      }

      try {
        const srcStat = fs.statSync(srcPath);
        await sharp(srcPath)
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);

        const webpStat = fs.statSync(webpPath);
        const saved = srcStat.size - webpStat.size;
        totalSaved += saved;
        converted++;

        const pctSaved = ((saved / srcStat.size) * 100).toFixed(1);
        console.log(
          `✓ ${path.relative(ROOT, srcPath)}: ` +
          `${(srcStat.size / 1024).toFixed(0)}KB → ${(webpStat.size / 1024).toFixed(0)}KB WebP (-${pctSaved}%)`
        );
      } catch (err) {
        console.error(`✗ ${path.relative(ROOT, srcPath)}: ${err.message}`);
      }
    }
  }

  console.log(`\nConverted: ${converted}, Skipped: ${skipped}`);
  if (totalSaved > 0) {
    console.log(`Total savings: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  }
}

generateWebP().catch(console.error);
