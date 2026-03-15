const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\Jutsu\\Keneshiahayesite';
const subDirs = ['blog', 'areas'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix missing space between double quote and attribute name (e.g., ""class -> " "class)
  // We look for any word starting after a double quote without a space.
  // Common cases: href="..."class=, src="..."alt=, etc.
  content = content.replace(/([a-zA-Z0-9_-]+)="([^"]*)"([a-zA-Z0-9_-]+)=/g, '$1="$2" $3=');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed spacing in: ${filePath}`);
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (['css', 'js', 'images', 'icons', '.git', '.github', '.gemini', 'node_modules'].includes(item)) continue;
      walk(fullPath);
    } else if (item.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

walk(rootDir);
console.log('Finished fixing HTML spacing.');
