const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dirs = [
  path.join(ROOT, 'images'),
  path.join(ROOT, 'images', 'stock'),
];

async function optimize() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      const sizeBefore = stat.size;
      totalBefore += sizeBefore;

      const ext = path.extname(file).toLowerCase();
      const tempPath = filePath + '.tmp';

      try {
        if (ext === '.png') {
          // Compress PNG
          await sharp(filePath)
            .png({ quality: 80, compressionLevel: 9, palette: true })
            .toFile(tempPath);
        } else {
          // Compress JPEG
          await sharp(filePath)
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(tempPath);
        }

        const newStat = fs.statSync(tempPath);
        const sizeAfter = newStat.size;

        // Only replace if smaller
        if (sizeAfter < sizeBefore) {
          fs.renameSync(tempPath, filePath);
          totalAfter += sizeAfter;
          const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
          console.log(`✓ ${path.relative(ROOT, filePath)}: ${(sizeBefore/1024).toFixed(0)}KB → ${(sizeAfter/1024).toFixed(0)}KB (-${saved}%)`);
        } else {
          fs.unlinkSync(tempPath);
          totalAfter += sizeBefore;
          console.log(`- ${path.relative(ROOT, filePath)}: already optimized`);
        }
      } catch (err) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        totalAfter += sizeBefore;
        console.error(`✗ ${path.relative(ROOT, filePath)}: ${err.message}`);
      }
    }
  }

  console.log(`\nTotal: ${(totalBefore/1024/1024).toFixed(2)}MB → ${(totalAfter/1024/1024).toFixed(2)}MB (-${((1 - totalAfter/totalBefore) * 100).toFixed(1)}%)`);
}

optimize().catch(console.error);
