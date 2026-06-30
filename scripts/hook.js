import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = process.argv[2];
if (!target) {
  console.error('\n❌ Please provide a target project path.');
  console.log('   Example: npm run hook ../my-next-app\n');
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), target);
if (!fs.existsSync(path.join(targetPath, 'package.json'))) {
  console.error(`\n❌ Target directory does not appear to be a Node project (no package.json found).`);
  console.error(`   Path: ${targetPath}\n`);
  process.exit(1);
}

console.log(`\n🚀 Hooking Visora into ${targetPath}...\n`);

const patcherPath = path.resolve(__dirname, '../packages/patcher/dist/index.js');

const child = spawn('node', [patcherPath, 'init'], {
  stdio: 'inherit',
  env: { ...process.env, VISORA_PROJECT_ROOT: targetPath }
});

child.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ Visora successfully hooked into your project!`);
    console.log(`   Keep Visora's daemon running here: npm run visora`);
    console.log(`   Then start your target project normally.\n`);
  }
  process.exit(code ?? 0);
});
