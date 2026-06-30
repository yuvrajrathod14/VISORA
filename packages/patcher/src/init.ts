import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';

const SUCCESS = chalk.green;
const FAIL = chalk.red;
const INFO = chalk.cyan;
const DIM = chalk.gray;

function detectPackageManager(targetDir: string) {
  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function installDependencies(targetDir: string, pm: string) {
  const cmd = pm === 'npm' ? 'npm install -D' : `${pm} add -D`;
  // We link to the specific visora packages using absolute paths for local testing,
  // but for production this would just be @visora/vite-plugin @visora/patcher.
  // Since we are simulating a live user, let's use the local workspace paths if available, 
  // or fall back to npm names if published.
  // For this local build, we assume Visora is being installed from the source repo:
  const visoraRoot = path.resolve(__dirname, '../../..');
  const vitePluginPath = path.join(visoraRoot, 'packages/vite-plugin');
  const patcherPath = path.join(visoraRoot, 'packages/patcher');
  
  try {
    execSync(`${cmd} "${vitePluginPath}" "${patcherPath}"`, { cwd: targetDir, stdio: 'pipe' });
  } catch (e: any) {
    throw new Error(e.stderr ? e.stderr.toString() : e.message);
  }
}

function patchViteConfig(targetDir: string): boolean {
  const possibleNames = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'];
  let configPath = '';
  let content = '';

  for (const name of possibleNames) {
    const p = path.join(targetDir, name);
    if (fs.existsSync(p)) {
      configPath = p;
      content = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!configPath) return false;
  if (content.includes('visora()')) return true; // already patched

  // 1. Inject Import
  const importStatement = `import visora from '@visora/vite-plugin';\n`;
  // Find last import
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
  } else {
    content = importStatement + content;
  }

  // 2. Inject Plugin
  // Look for plugins: [
  const pluginsRegex = /plugins:\s*\[([\s\S]*?)\]/;
  const match = content.match(pluginsRegex);
  
  if (match) {
    const currentPlugins = match[1];
    const newPlugins = currentPlugins.trim().length > 0 ? `${currentPlugins.trim()}, visora()` : `visora()`;
    content = content.replace(pluginsRegex, `plugins: [\n    ${newPlugins}\n  ]`);
  } else {
    // If no plugins array exists, this regex might be too simple, but usually it exists in Vite React projects.
    return false;
  }

  fs.writeFileSync(configPath, content, 'utf-8');
  return true;
}

export async function runInit(projectRoot: string) {
  console.log();
  const pm = detectPackageManager(projectRoot);
  
  const spinnerDeps = ora(`Installing Visora engines using ${pm}...`).start();
  try {
    installDependencies(projectRoot, pm);
    spinnerDeps.succeed(SUCCESS(`Visora engines installed successfully.`));
  } catch (e: any) {
    spinnerDeps.fail(FAIL(`Failed to install dependencies.`));
    console.error(chalk.red(e.message));
    process.exit(1);
  }

  const spinnerConfig = ora(`Patching vite.config...`).start();
  try {
    const patched = patchViteConfig(projectRoot);
    if (patched) {
      spinnerConfig.succeed(SUCCESS(`vite.config patched successfully.`));
    } else {
      spinnerConfig.warn(chalk.yellow(`Could not auto-patch vite.config. Please add the visora plugin manually.`));
    }
  } catch (e) {
    spinnerConfig.fail(FAIL(`Failed to patch vite.config.`));
  }

  console.log();
  console.log(SUCCESS('✨ Visora Initialization Complete!'));
  console.log();
  console.log(INFO('  Next steps:'));
  console.log(DIM(`  1. Start your dev server: `) + chalk.white(`${pm === 'npm' ? 'npm run' : pm} dev`));
  console.log(DIM(`  2. In a second terminal:  `) + chalk.white(`${pm === 'npm' ? 'npx' : pm} visora`));
  console.log();
  process.exit(0);
}
