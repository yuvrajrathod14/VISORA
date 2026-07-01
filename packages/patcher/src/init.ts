import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import { select } from '@inquirer/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUCCESS = chalk.green;
const FAIL = chalk.red;
const INFO = chalk.cyan;
const DIM = chalk.gray;

function detectPackageManager(targetDir: string) {
  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function isVisoraInstalled(targetDir: string) {
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    return !!allDeps['visora-cli'];
  }
  return false;
}

function detectFramework(targetDir: string) {
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.dependencies?.next || pkg.devDependencies?.next) return 'next';
  }
  return 'vite'; // Fallback default
}

function installDependencies(targetDir: string, pm: string, framework: string) {
  const cmd = pm === 'npm' ? 'npm install -D' : `${pm} add -D`;
  const pluginPkg = framework === 'next' ? 'visora-next-plugin' : 'visora-vite-plugin';
  const patcherPkg = 'visora-cli';
  
  try {
    execSync(`${cmd} ${pluginPkg} ${patcherPkg}`, { cwd: targetDir, stdio: 'pipe' });
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

  if (!configPath) throw new Error('Could not find vite.config.ts, vite.config.js, or vite.config.mjs in the project root.');
  if (content.includes('visora()')) return true; // already patched

  // 1. Inject Import
  const importStatement = `import visora from 'visora-vite-plugin';\n`;
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
    throw new Error('Could not find a plugins array in your vite.config file.');
  }

  fs.writeFileSync(configPath, content, 'utf-8');
  return true;
}

function patchNextLayout(targetDir: string): boolean {
  const possibleNames = [
    'app/layout.tsx', 'app/layout.jsx',
    'src/app/layout.tsx', 'src/app/layout.jsx',
    'pages/_app.tsx', 'pages/_app.jsx',
    'src/pages/_app.tsx', 'src/pages/_app.jsx'
  ];
  
  let layoutPath = '';
  let content = '';

  for (const name of possibleNames) {
    const p = path.join(targetDir, name);
    if (fs.existsSync(p)) {
      layoutPath = p;
      content = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!layoutPath) throw new Error('Could not find app/layout.tsx or pages/_app.tsx in the project.');
  
  // Clean up legacy imports
  content = content.replace(/import\s+\{\s*VisoraTracker\s*\}\s+from\s+['"]@visora\/next-plugin['"];?\s*\n?/g, '');
  content = content.replace(/import\s+\{\s*VisoraTracker\s*\}\s+from\s+['"]visora-next-plugin['"];?\s*\n?/g, '');
  
  // Inject Import safely
  const importStatement = `import { VisoraTracker } from 'visora-next-plugin';\n`;
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
  } else {
    content = importStatement + content;
  }

  // Inject Component inside <body> or main wrapper if it isn't there already
  if (!content.includes('<VisoraTracker')) {
    const bodyTagRegex = /<body[^>]*>/i;
    if (bodyTagRegex.test(content)) {
      content = content.replace(bodyTagRegex, `$& \n        <VisoraTracker />`);
    } else {
      // If no body tag (like pages/_app), just inject it near the return statement's main wrapper
      const returnRegex = /return\s*\(\s*<[^>]+>/;
      if (returnRegex.test(content)) {
        content = content.replace(returnRegex, `$& \n      <VisoraTracker />`);
      } else {
        throw new Error('Could not find a place to inject <VisoraTracker /> in your layout.');
      }
    }
  }

  fs.writeFileSync(layoutPath, content, 'utf-8');
  return true;
}

function createNextApiRoute(targetDir: string) {
  // Check for App Router vs Pages Router
  const isAppRouter = fs.existsSync(path.join(targetDir, 'app')) || fs.existsSync(path.join(targetDir, 'src', 'app'));
  const isSrc = fs.existsSync(path.join(targetDir, 'src'));

  let apiDir = '';
  let fileName = '';
  let content = '';

  if (isAppRouter) {
    const base = isSrc ? 'src/app' : 'app';
    apiDir = path.join(targetDir, base, 'api', 'visora');
    fileName = 'route.ts'; // We'll just default to .ts, if they don't have TS Next.js compiles it anyway
    content = `export { POST } from 'visora-next-plugin/api';\n`;
  } else {
    const base = isSrc ? 'src/pages' : 'pages';
    apiDir = path.join(targetDir, base, 'api');
    fileName = 'visora.ts';
    content = `export { POST as default } from 'visora-next-plugin/api';\n`;
  }

  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  const filePath = path.join(apiDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}


export async function runInit(projectRoot: string) {
  console.log();
  console.log(chalk.hex('#d97757').bold(` _   _ _____ _____ ___________  ___ `));
  console.log(chalk.hex('#d97757').bold(`| | | |_   _/  ___|  _  | ___ \\/ _ \\`));
  console.log(chalk.hex('#d97757').bold(`| | | | | | \\ \`--.| | | | |_/ / /_\\ \\`));
  console.log(chalk.hex('#d97757').bold(`| | | | | |  \`--. \\ | | |    /|  _  |`));
  console.log(chalk.hex('#d97757').bold(`\\ \\_/ /_| |_/\\__/ / \\_/ / |\\ \\| | | |`));
  console.log(chalk.hex('#d97757').bold(` \\___/ \\___/\\____/ \\___/\\_| \\_\\_| |_/`));
  console.log();
  console.log(chalk.gray('  Automated Setup Script by Visionatrix'));
  console.log();
  
  if (isVisoraInstalled(projectRoot)) {
    console.log(INFO(`  Visora is already installed in this project!`));
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Cancel', value: 'cancel' },
        { name: 'Repair / Reinstall', value: 'repair' }
      ]
    });
    
    if (action === 'cancel') {
      console.log();
      console.log(DIM('  Setup cancelled.'));
      process.exit(0);
    }
    console.log();
  }

  const pm = detectPackageManager(projectRoot);
  const framework = detectFramework(projectRoot);
  
  const spinnerDeps = ora(`Installing Visora engines using ${pm}...`).start();
  try {
    installDependencies(projectRoot, pm, framework);
    spinnerDeps.succeed(SUCCESS(`Visora engines installed successfully.`));
  } catch (e: any) {
    spinnerDeps.fail(FAIL(`Failed to install dependencies.`));
    console.error(chalk.red(e.message));
    process.exit(1);
  }

  const spinnerConfig = ora(`Patching ${framework === 'next' ? 'layout & api route' : 'vite.config'}...`).start();
  try {
    if (framework === 'next') {
      patchNextLayout(projectRoot);
      createNextApiRoute(projectRoot);
    } else {
      patchViteConfig(projectRoot);
    }
    spinnerConfig.succeed(SUCCESS(`Framework patched successfully.`));
  } catch (e: any) {
    spinnerConfig.warn(chalk.yellow(`Could not auto-patch: ${e.message}`));
    console.log(DIM(`  Please add the Visora plugin manually.`));
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

function uninstallDependencies(targetDir: string, pm: string) {
  const cmd = pm === 'npm' ? 'npm uninstall' : `${pm} remove`;
  try {
    execSync(`${cmd} visora-cli visora-vite-plugin visora-next-plugin`, { cwd: targetDir, stdio: 'pipe' });
  } catch (e: any) {
    // Ignore errors here since packages might not exist
  }
}

function unpatchViteConfig(targetDir: string) {
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

  if (!configPath) return;

  // Remove import
  content = content.replace(/import\s+visora\s+from\s+['"]visora-vite-plugin['"];?\s*\n?/g, '');
  // Remove plugin from array (visora(), or , visora() or ,visora())
  content = content.replace(/,\s*visora\(\)/g, '').replace(/visora\(\)\s*,?/g, '');

  fs.writeFileSync(configPath, content, 'utf-8');
}

function unpatchNextLayout(targetDir: string) {
  const possibleNames = [
    'app/layout.tsx', 'app/layout.jsx',
    'src/app/layout.tsx', 'src/app/layout.jsx',
    'pages/_app.tsx', 'pages/_app.jsx',
    'src/pages/_app.tsx', 'src/pages/_app.jsx'
  ];
  
  let layoutPath = '';
  let content = '';

  for (const name of possibleNames) {
    const p = path.join(targetDir, name);
    if (fs.existsSync(p)) {
      layoutPath = p;
      content = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!layoutPath) return;

  // Remove import
  content = content.replace(/import\s+\{\s*VisoraTracker\s*\}\s+from\s+['"]@visora\/next-plugin['"];?\s*\n?/g, '');
  content = content.replace(/import\s+\{\s*VisoraTracker\s*\}\s+from\s+['"]visora-next-plugin['"];?\s*\n?/g, '');
  // Remove Component
  content = content.replace(/<VisoraTracker\s*\/>\s*\n?/g, '');

  fs.writeFileSync(layoutPath, content, 'utf-8');
}

function removeNextApiRoute(targetDir: string) {
  const possiblePaths = [
    'app/api/visora/route.ts', 'src/app/api/visora/route.ts',
    'pages/api/visora.ts', 'src/pages/api/visora.ts'
  ];

  for (const p of possiblePaths) {
    const fullPath = path.join(targetDir, p);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      // Try to remove the 'visora' directory if it's empty
      const dir = path.dirname(fullPath);
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    }
  }
}

function removeVisoraFolder(targetDir: string) {
  const vDir = path.join(targetDir, '.visora');
  if (fs.existsSync(vDir)) {
    fs.rmSync(vDir, { recursive: true, force: true });
  }
}

export async function runRemove(projectRoot: string) {
  console.log();
  console.log(chalk.hex('#d97757').bold(` _   _ _____ _____ ___________  ___ `));
  console.log(chalk.hex('#d97757').bold(`| | | |_   _/  ___|  _  | ___ \\/ _ \\`));
  console.log(chalk.hex('#d97757').bold(`| | | | | | \\ \`--.| | | | |_/ / /_\\ \\`));
  console.log(chalk.hex('#d97757').bold(`| | | | | |  \`--. \\ | | |    /|  _  |`));
  console.log(chalk.hex('#d97757').bold(`\\ \\_/ /_| |_/\\__/ / \\_/ / |\\ \\| | | |`));
  console.log(chalk.hex('#d97757').bold(` \\___/ \\___/\\____/ \\___/\\_| \\_\\_| |_/`));
  console.log();
  console.log(chalk.gray('  Uninstaller Script by Visionatrix'));
  console.log();

  const pm = detectPackageManager(projectRoot);
  const framework = detectFramework(projectRoot);
  
  const spinnerConfig = ora('Unpatching ' + (framework === 'next' ? 'layout & api route' : 'vite.config') + '...').start();
  try {
    if (framework === 'next') {
      unpatchNextLayout(projectRoot);
      removeNextApiRoute(projectRoot);
    } else {
      unpatchViteConfig(projectRoot);
    }
    removeVisoraFolder(projectRoot);
    spinnerConfig.succeed(SUCCESS('Framework unpatched and configs removed.'));
  } catch (e: any) {
    spinnerConfig.warn(chalk.yellow('Could not fully unpatch: ' + e.message));
  }

  const spinnerDeps = ora('Removing Visora packages using ' + pm + '...').start();
  try {
    uninstallDependencies(projectRoot, pm);
    spinnerDeps.succeed(SUCCESS('Visora packages removed successfully.'));
  } catch (e: any) {
    spinnerDeps.fail(FAIL('Failed to uninstall dependencies.'));
  }

  console.log();
  console.log(SUCCESS('✨ Visora has been completely removed from this project.'));
  console.log();
  process.exit(0);
}
