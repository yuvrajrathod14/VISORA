const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@visora/')) {
    // Special case for patcher
    content = content.replace(/@visora\/patcher/g, 'visora');
    // Replace all other @visora/foo with visora-foo
    content = content.replace(/@visora\/([a-zA-Z0-9-]+)/g, 'visora-$1');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
