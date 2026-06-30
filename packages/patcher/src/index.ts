#!/usr/bin/env node
/**
 * Visora CLI — The Autonomous Visual Coding Agent
 * 
 * A product of Visionatrix. Developed by Yuvraj Rathod.
 * 
 * Commands:
 *   visora             Start the daemon (watches for UI instructions)
 *   visora --config     Re-configure AI provider
 *   visora --status     Show queue status across the workspace
 *   visora --clear      Clear all completed/failed tasks from queues
 *   visora --help       Show help
 *   visora --version    Show version
 */
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import { generatePatch } from './ai';
import { applyPatch } from './diff';
import { checkAndRunOnboarding } from './onboarding';

// ═══════════════════════════════════════════════════════════
// CONSTANTS & BRANDING
// ═══════════════════════════════════════════════════════════
const VERSION = '1.0.0';
const BRAND = chalk.bold.hex('#d97757');
const DIM = chalk.gray;
const ACCENT = chalk.hex('#d97757');
const SUCCESS = chalk.green;
const FAIL = chalk.red;
const INFO = chalk.cyan;
const DIVIDER = DIM('─'.repeat(52));

dotenv.config();
const projectRoot = process.env.VISORA_PROJECT_ROOT || process.cwd();
const args = process.argv.slice(2);

// ═══════════════════════════════════════════════════════════
// UTILITY: Find queue files across monorepo
// ═══════════════════════════════════════════════════════════
function findQueueFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) {
      if (file !== '.visora') continue;
    }
    const filePath = path.join(dir, file);
    try {
      if (fs.statSync(filePath).isDirectory()) {
        if (file === '.visora') {
          const qPath = path.join(filePath, 'queue.json');
          if (fs.existsSync(qPath)) fileList.push(qPath);
        } else {
          findQueueFiles(filePath, fileList);
        }
      }
    } catch (e) {
      // Ignore stat errors on inaccessible paths
    }
  }
  return fileList;
}

function getActiveProvider(): string {
  if (process.env.ANTHROPIC_API_KEY) return 'Anthropic (Claude)';
  if (process.env.OPENAI_API_KEY) return 'OpenAI (GPT-4o)';
  if (process.env.GEMINI_API_KEY) return 'Google Gemini';
  if (process.env.OLLAMA_URL) return `Ollama (${process.env.OLLAMA_MODEL || 'llama3'})`;
  return 'None';
}

function printBanner() {
  console.clear();
  console.log();
  console.log(BRAND('  Visora'));
  console.log(DIM('  The Autonomous Visual Coding Agent'));
  console.log(DIM('  by Visionatrix'));
  console.log();
  console.log(DIVIDER);
  console.log();
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --help
// ═══════════════════════════════════════════════════════════
function showHelp() {
  printBanner();
  console.log(chalk.white.bold('  Usage'));
  console.log();
  console.log(`    ${ACCENT('visora')}                Start the daemon`);
  console.log(`    ${ACCENT('visora')} ${DIM('--status')}       Show queue status across workspace`);
  console.log(`    ${ACCENT('visora')} ${DIM('--clear')}        Clear completed/failed tasks`);
  console.log(`    ${ACCENT('visora')} ${DIM('--purge')}        Delete all Visora queues and history (free space)`);
  console.log(`    ${ACCENT('visora')} ${DIM('--undo')}         Undo the last successful AI patch`);
  console.log(`    ${ACCENT('visora')} ${DIM('--help')}         Show this help message`);
  console.log(`    ${ACCENT('visora')} ${DIM('--version')}      Show version`);
  console.log();
  console.log(DIVIDER);
  console.log();
  console.log(chalk.white.bold('  How It Works'));
  console.log();
  console.log(DIM('  1. Run ') + chalk.white('pnpm dev') + DIM(' to start your Vite app'));
  console.log(DIM('  2. Run ') + chalk.white('pnpm visora') + DIM(' in a second terminal'));
  console.log(DIM('  3. In the browser, ') + chalk.white('Alt+Click') + DIM(' any component'));
  console.log(DIM('  4. Type an instruction (e.g. "make this red")'));
  console.log(DIM('  5. Visora patches your source code automatically'));
  console.log();
  console.log(DIVIDER);
  console.log();
  console.log(chalk.white.bold('  Environment Variables'));
  console.log();
  console.log(`    ${DIM('ANTHROPIC_API_KEY')}     Anthropic Claude API key`);
  console.log(`    ${DIM('OPENAI_API_KEY')}        OpenAI API key`);
  console.log(`    ${DIM('GEMINI_API_KEY')}        Google Gemini API key`);
  console.log(`    ${DIM('OLLAMA_URL')}            Ollama server URL`);
  console.log(`    ${DIM('OLLAMA_MODEL')}          Ollama model name`);
  console.log(`    ${DIM('VISORA_PROJECT_ROOT')}   Custom project root path`);
  console.log();
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --version
// ═══════════════════════════════════════════════════════════
function showVersion() {
  console.log(`visora v${VERSION}`);
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --status
// ═══════════════════════════════════════════════════════════
function showStatus() {
  printBanner();
  console.log(chalk.white.bold('  Workspace Status'));
  console.log();

  const provider = getActiveProvider();
  console.log(`  ${DIM('Provider:')}   ${provider === 'None' ? FAIL('Not configured') : SUCCESS(provider)}`);
  console.log(`  ${DIM('Root:')}       ${INFO(projectRoot)}`);
  console.log();

  const queueFiles = findQueueFiles(projectRoot);

  if (queueFiles.length === 0) {
    console.log(DIM('  No queue files found. Start your Vite app and Alt+Click a component.'));
    console.log();
    process.exit(0);
  }

  let totalPending = 0;
  let totalProcessing = 0;
  let totalDone = 0;
  let totalFailed = 0;

  for (const qPath of queueFiles) {
    try {
      const queue = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
      const relPath = path.relative(projectRoot, qPath);

      const pending = queue.filter((t: any) => t.status === 'pending').length;
      const processing = queue.filter((t: any) => t.status === 'processing').length;
      const done = queue.filter((t: any) => t.status === 'done').length;
      const failed = queue.filter((t: any) => t.status === 'failed').length;

      totalPending += pending;
      totalProcessing += processing;
      totalDone += done;
      totalFailed += failed;

      console.log(`  ${DIM('Queue:')} ${INFO(relPath)}`);
      console.log(`    ${chalk.yellow(`${pending} pending`)}  ${INFO(`${processing} processing`)}  ${SUCCESS(`${done} done`)}  ${FAIL(`${failed} failed`)}`);
      console.log();
    } catch (e) {
      continue;
    }
  }

  console.log(DIVIDER);
  console.log();
  console.log(`  ${chalk.white.bold('Total:')}  ${chalk.yellow(`${totalPending} pending`)}  ${SUCCESS(`${totalDone} done`)}  ${FAIL(`${totalFailed} failed`)}`);
  console.log();
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --clear
// ═══════════════════════════════════════════════════════════
function clearQueues() {
  printBanner();
  const queueFiles = findQueueFiles(projectRoot);
  let totalCleared = 0;

  for (const qPath of queueFiles) {
    try {
      const queue = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
      const filtered = queue.filter((t: any) => t.status === 'pending' || t.status === 'processing');
      totalCleared += queue.length - filtered.length;
      fs.writeFileSync(qPath, JSON.stringify(filtered, null, 2));
    } catch (e) {
      continue;
    }
  }

  console.log(SUCCESS(`  ✔ Cleared ${totalCleared} completed/failed task(s) from ${queueFiles.length} queue(s).`));
  console.log();
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --purge
// ═══════════════════════════════════════════════════════════
function purgeAll() {
  printBanner();
  
  // Find all .visora directories
  let totalDeleted = 0;
  function deleteVisoraDirs(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === 'dist' || file.startsWith('.') && file !== '.visora') continue;
      
      const filePath = path.join(dir, file);
      try {
        if (fs.statSync(filePath).isDirectory()) {
          if (file === '.visora') {
            fs.rmSync(filePath, { recursive: true, force: true });
            totalDeleted++;
          } else {
            deleteVisoraDirs(filePath);
          }
        }
      } catch (e) {}
    }
  }

  deleteVisoraDirs(projectRoot);

  console.log(SUCCESS(`  ✔ Purged all Visora data (queues, screenshots, history) from ${totalDeleted} location(s).`));
  console.log();
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --undo
// ═══════════════════════════════════════════════════════════
function undoLastPatch() {
  printBanner();
  const historyPath = path.join(projectRoot, '.visora', 'history.json');
  
  if (!fs.existsSync(historyPath)) {
    console.log(FAIL('  No patch history found in this workspace.'));
    console.log();
    process.exit(1);
  }

  try {
    let history: any[] = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    if (history.length === 0) {
      console.log(FAIL('  No patches to undo.'));
      console.log();
      process.exit(1);
    }
    
    const lastChange = history.pop();
    const fullPath = path.join(projectRoot, lastChange.filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, lastChange.previousContent, 'utf-8');
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
      console.log(SUCCESS(`  ✔ Undid the last patch to ${INFO(lastChange.filePath)}`));
      console.log();
    } else {
      console.log(FAIL(`  Could not find file: ${lastChange.filePath}`));
      console.log();
      process.exit(1);
    }
  } catch (e) {
    console.log(FAIL('  Failed to read history or restore file.'));
    console.log();
    process.exit(1);
  }
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// ROUTE CLI COMMANDS
// ═══════════════════════════════════════════════════════════
if (args.includes('--help') || args.includes('-h')) showHelp();
if (args.includes('--version') || args.includes('-v')) showVersion();
if (args.includes('--status') || args.includes('-s')) showStatus();
if (args.includes('--clear')) clearQueues();
if (args.includes('--purge')) purgeAll();
if (args.includes('--undo') || args.includes('-u')) undoLastPatch();

const forceConfig = args.includes('--config') || args.includes('--setup');

// Run interactive onboarding if no API keys are found, or if --config is passed
await checkAndRunOnboarding(projectRoot, forceConfig);

// ═══════════════════════════════════════════════════════════
// MAIN DAEMON
// ═══════════════════════════════════════════════════════════
printBanner();

const provider = getActiveProvider();
console.log(`  ${DIM('Provider')}   ${SUCCESS(provider)}`);
console.log(`  ${DIM('Root')}       ${INFO(projectRoot)}`);
console.log();
console.log(DIVIDER);
console.log();

let isIdle = true;
console.log(DIM('  👀 Watching for instructions…\n'));

// Keep track of which queues are currently being processed
const processingQueues = new Set<string>();

async function processQueue(targetQueuePath: string) {
  if (processingQueues.has(targetQueuePath)) return;

  if (!fs.existsSync(targetQueuePath)) return;

  let queue: any[] = [];
  try {
    queue = JSON.parse(fs.readFileSync(targetQueuePath, 'utf-8'));
  } catch (e) {
    return;
  }

  const pendingTasks = queue.filter(t => t.status === 'pending');

  if (pendingTasks.length === 0) return;

  processingQueues.add(targetQueuePath);

  if (isIdle) {
    isIdle = false;
  }

  for (const task of pendingTasks) {
    const target = task.selection.componentName || task.selection.tagName || 'element';
    const file = task.selection.sourceFile || 'unknown';

    console.log(ACCENT(`  ● Task`), chalk.white(`"${task.selection.instruction}"`));
    console.log(DIM(`    ${target} → ${file}`));

    task.status = 'processing';
    fs.writeFileSync(targetQueuePath, JSON.stringify(queue, null, 2));

    const spinner = ora({
      text: DIM(`Asking ${provider} to generate patch…`),
      color: 'yellow',
      spinner: 'dots',
      indent: 4
    }).start();

    const startTime = Date.now();

    try {
      const appRoot = path.dirname(path.dirname(targetQueuePath));

      const patch = await generatePatch(task, appRoot);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (patch && patch.modifiedContent) {
        spinner.text = DIM(`Writing to ${patch.filePath}…`);

        const success = applyPatch(appRoot, patch.filePath, patch.originalContent, patch.modifiedContent);
        if (success) {
          spinner.succeed(SUCCESS(`Patched ${patch.filePath}`) + DIM(` (${elapsed}s)`));
          task.status = 'done';
        } else {
          spinner.fail(FAIL(`Patch conflict in ${patch.filePath}`) + DIM(` (${elapsed}s)`));
          task.status = 'failed';
        }
      } else {
        spinner.fail(FAIL(`No valid patch from AI`) + DIM(` (${elapsed}s)`));
        task.status = 'failed';
      }
    } catch (e: any) {
      spinner.fail(FAIL(e.message));
      task.status = 'failed';
    }

    fs.writeFileSync(targetQueuePath, JSON.stringify(queue, null, 2));
    console.log();
  }

  processingQueues.delete(targetQueuePath);
  if (processingQueues.size === 0) {
    isIdle = true;
    console.log(DIM('  👀 Watching for instructions…\n'));
  }
}

// Run manual scan on startup and watch exactly those files (solves Windows glob issues)
const initialQueues = findQueueFiles(projectRoot);
initialQueues.forEach(qPath => {
  processQueue(qPath);

  // Watch this specific file reliably
  chokidar.watch(qPath, {
    persistent: true,
    ignoreInitial: true
  }).on('change', () => {
    processQueue(qPath);
  });
});

// Also watch for newly created .visora/queue.json files in case Vite is started after Visora
chokidar.watch('**/.visora/queue.json', {
  cwd: projectRoot,
  persistent: true,
  ignoreInitial: true,
  ignored: ['**/node_modules/**', '**/dist/**']
}).on('add', (relativePath) => {
  const fullPath = path.join(projectRoot, relativePath);
  chokidar.watch(fullPath, { persistent: true }).on('change', () => processQueue(fullPath));
  processQueue(fullPath);
});
