/**
 * Brutal Import Path Fixer
 * Fixes 4-level relative paths to 3-level in notification API routes.
 */
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'apps', 'web', 'pages', 'api', 'notifications');

if (!fs.existsSync(TARGET_DIR)) {
  console.error(`❌ Directory not found: ${TARGET_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.js'));
let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(TARGET_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix lib imports (db, config, url, telegram)
  content = content.replace(/from ["']\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, "from '../../../lib/");
  content = content.replace(/require\(["']\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, "require('../../../lib/");
  
  // Fix context imports (AuthContext, ToastContext)
  content = content.replace(/from ["']\.\.\/\.\.\/\.\.\/\.\.\/context\//g, "from '../../../context/");
  content = content.replace(/require\(["']\.\.\/\.\.\/\.\.\/\.\.\/context\//g, "require('../../../context/");

  // Fix hooks imports
  content = content.replace(/from ["']\.\.\/\.\.\/\.\.\/\.\.\/hooks\//g, "from '../../../hooks/");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in: ${file}`);
    fixedCount++;
  }
});

if (fixedCount === 0) {
  console.log('ℹ️ No incorrect paths found.');
} else {
  console.log(`\n🎉 Successfully fixed ${fixedCount} file(s). Run \`npm run build\` to verify.`);
}