const fs = require('fs');
const path = require('path');

// Read the compiled overlay from vite-plugin
const overlayPath = path.resolve(__dirname, '../vite-plugin/dist/overlay.js');
const overlayContent = fs.readFileSync(overlayPath, 'utf-8');

// Write it as a TypeScript constant
const outPath = path.resolve(__dirname, './src/overlay-script.ts');
const outContent = `export const OVERLAY_SCRIPT = ${JSON.stringify(overlayContent)};\n`;

fs.writeFileSync(outPath, outContent, 'utf-8');
console.log('✅ Generated overlay-script.ts');
