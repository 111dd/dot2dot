// add-api-base-import.js
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'frontend', 'src');const IMPORT_LINE = `import API_BASE_URL from '../config';`;

function getRelativeImport(filePath) {
  const depth = filePath.replace(BASE_DIR, '').split(path.sep).length - 2;
  const relative = './' + '../'.repeat(depth) + 'config';
  return `import API_BASE_URL from '${relative}';`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('API_BASE_URL')) return;
  if (content.includes("import API_BASE_URL")) return;

  const importLine = getRelativeImport(filePath);
  content = importLine + '\n' + content;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated: ${filePath}`);
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

walk(BASE_DIR);