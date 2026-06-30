const fs = require('fs');
let c = fs.readFileSync('packages/vite-plugin/src/overlay.ts', 'utf8');
c = c.replace(/\\\$\{/g, '${');
fs.writeFileSync('packages/vite-plugin/src/overlay.ts', c);
console.log('Fixed overlay.ts template strings.');
