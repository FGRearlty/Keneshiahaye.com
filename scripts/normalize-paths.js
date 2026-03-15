const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\Jutsu\\Keneshiahayesite';
const subDirs = ['blog', 'areas'];

// Get all top-level files and directories
const items = fs.readdirSync(rootDir);

function normalizeFile(filePath, depth) {
    let content = fs.readFileSync(filePath, 'utf8');
    const prefix = depth === 0 ? '' : '../'.repeat(depth);
    
    // First, clean up any existing backslashes from the previous bad run
    // Specifically targeting the pattern before we do the correct replacement
    content = content.replace(/\\\./g, '.');

    items.forEach(item => {
        // Escape for regex specifically, but keep original for replacement
        const escapedItem = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Look for "/item" where it's an absolute path
        const regex = new RegExp(`(href|src|content)="\\/${escapedItem}`, 'g');
        content = content.replace(regex, `$1="${prefix}${item}`);
    });

    // Special case for root "/" -> "index.html" or "./"
    content = content.replace(/(href)="\/index\.html"/g, `$1="${prefix}index.html"`);
    // Handle the case where someone might have used just "/"
    // We avoid matching "//" for external links
    content = content.replace(/(href)="\/(\s|") /g, `$1="${prefix}./$2`);

    fs.writeFileSync(filePath, content);
    console.log(`Normalized: ${filePath}`);
}

// Root files
fs.readdirSync(rootDir).forEach(file => {
    if (file.endsWith('.html')) {
        normalizeFile(path.join(rootDir, file), 0);
    }
});

// Subdir files
subDirs.forEach(sub => {
    const subPath = path.join(rootDir, sub);
    if (fs.existsSync(subPath)) {
        fs.readdirSync(subPath).forEach(file => {
            if (file.endsWith('.html')) {
                normalizeFile(path.join(subPath, file), 1);
            }
        });
    }
});
