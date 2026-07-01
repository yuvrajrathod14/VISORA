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
import { runInit, runRemove } from './init.js';
import boxen from 'boxen';
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Visora Patch Review</title>
      <style>
        body { font-family: -apple-system, system-ui; background: #0f111a; color: #fff; padding: 2rem; margin: 0; }
        .patch-card { background: #1a1d27; border: 1px solid #333; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
        .diff-view { background: #000; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: monospace; white-space: pre-wrap; font-size: 13px; }
        .diff-add { color: #4ade80; }
        .diff-sub { color: #f87171; }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; margin-right: 0.5rem; }
        .btn-approve { background: #d97757; color: white; }
        .btn-reject { background: #333; color: white; }
      </style>
    </head>
    <body>
      <div style="display: flex; align-items: center; margin-bottom: 2rem;">
        <div style="background:#d97757; color:#fff; font-weight:bold; width:32px; height:32px; border-radius:4px; display:flex; align-items:center; justify-content:center; margin-right: 12px;">V</div>
        <h1 style="margin:0;">Visora Review</h1>
      </div>
      <div id="patches">Loading pending patches...</div>
      <script>
        async function fetchPatches() {
          const res = await fetch('/api/patches');
          const patches = await res.json();
          const container = document.getElementById('patches');
          if (patches.length === 0) {
            container.innerHTML = '<div style="color:#888;">No pending patches. Run a task via the Visora overlay!</div>';
            return;
          }
          container.innerHTML = patches.map(p => \`
            <div class="patch-card">
              <h3>\${p.instruction}</h3>
              <p style="color:#888; font-size: 14px;">Targeting \${p.patches.length} file(s)</p>
              \${p.patches.map(filePatch => \`
                <div style="margin-top: 1rem;">
                  <strong style="color: #60a5fa;">\${filePatch.filePath}</strong>
                  <div class="diff-view"><span class="diff-sub">-\${filePatch.originalContent}</span><br><br><span class="diff-add">+\${filePatch.modifiedContent}</span></div>
                </div>
              \`).join('')}
              <div style="margin-top: 1.5rem;">
                <button class="btn btn-approve" onclick="handleAction('\${p.id}', 'approve')">Approve & Apply</button>
                <button class="btn btn-reject" onclick="handleAction('\${p.id}', 'reject')">Discard</button>
              </div>
            </div>
          \`).join('');
        }
        async function handleAction(id, action) {
          await fetch(\`/api/patches/\${id}/\${action}\`, { method: 'POST' });
          fetchPatches();
        }
        fetchPatches();
        setInterval(fetchPatches, 3000);
      </script>
    </body>
    </html>
  `);
});

interface PendingPatch {
  id: string;
  appRoot: string;
  instruction: string;
  patches: any[];
}
const pendingPatches: PendingPatch[] = [];

app.get('/api/patches', (req, res) => res.json(pendingPatches));

app.post('/api/patches/:id/approve', (req, res) => {
  const idx = pendingPatches.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    const p = pendingPatches[idx];
    let allSuccess = true;
    for (const patch of p.patches) {
      const success = applyPatch(p.appRoot, patch.filePath, patch.originalContent, patch.modifiedContent);
      if (success) {
        console.log(SUCCESS(`  ✔ Patched ${patch.filePath} (Approved via Dashboard)`));
      } else {
        console.log(FAIL(`  ✖ Patch conflict in ${patch.filePath}`));
        allSuccess = false;
      }
    }
    
    // Add to history
    if (allSuccess) {
      // NOTE: History logic can be added here if needed
    }
    
    pendingPatches.splice(idx, 1);
  }
  res.sendStatus(200);
});

app.post('/api/patches/:id/reject', (req, res) => {
  const idx = pendingPatches.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    console.log(FAIL(`  ✖ Rejected patch for "${pendingPatches[idx].instruction}"`));
    pendingPatches.splice(idx, 1);
  }
  res.sendStatus(200);
});

app.listen(4444, () => {
  // Silent start
});

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

function padRight(str: string, total: number) {
  // Simple ANSI strip for padding calculation
  const len = str.replace(/\\x1B\\[\\d+;]*[a-zA-Z]/g, '').length;
  return str + ' '.repeat(Math.max(0, total - len));
}

function printBanner() {
  console.clear();
  console.log();
  console.log(BRAND(` _   _ _____ _____ ___________  ___ `));
  console.log(BRAND(`| | | |_   _/  ___|  _  | ___ \\/ _ \\`));
  console.log(BRAND(`| | | | | | \\ \`--.| | | | |_/ / /_\\ \\`));
  console.log(BRAND(`| | | | | |  \`--. \\ | | |    /|  _  |`));
  console.log(BRAND(`\\ \\_/ /_| |_/\\__/ / \\_/ / |\\ \\| | | |`));
  console.log(BRAND(` \\___/ \\___/\\____/ \\___/\\_| \\_\\_| |_/`));
  console.log();

  const providerDisplay = config?.provider ? `${config.provider}` : 'Not Configured';
  const rootDisplay = projectRoot.length > 30 ? '...' + projectRoot.slice(-27) : projectRoot;
  
  const leftCol = [
    chalk.hex('#d97757')(`   \\ \\ / /`),
    chalk.hex('#d97757')(`    \\ V / `),
    chalk.hex('#d97757')(`     \\_/  `),
    ``,
    DIM(`Provider `) + chalk.white(providerDisplay),
    DIM(`Target   `) + chalk.white(rootDisplay)
  ];

  const rightCol = [
    chalk.white.bold(`Available Tools`),
    chalk.gray(`visora       `) + chalk.dim(`start daemon`),
    chalk.gray(`visora init  `) + chalk.dim(`install to project`),
    chalk.gray(`visora remove`) + chalk.dim(`cleanly unhook`),
    ``,
    chalk.white.bold(`Active Modules`),
    chalk.green(`✔`) + chalk.gray(` AST Engine  `) + chalk.green(`✔`) + chalk.gray(` Visual UI `)
  ];

  const maxLines = Math.max(leftCol.length, rightCol.length);
  const rows = [];
  for (let i = 0; i < maxLines; i++) {
    const left = padRight(leftCol[i] || '', 38);
    const right = rightCol[i] || '';
    rows.push(`${left}${right}`);
  }

  const box = boxen(rows.join('\\n'), {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: '#d97757',
    title: chalk.white(` Visora Agent v0.1.7 `),
    titleAlignment: 'left'
  });

  console.log(box);
}

// ═══════════════════════════════════════════════════════════
// COMMAND: --help
// ═══════════════════════════════════════════════════════════
function showHelp() {
  printBanner();
  console.log(chalk.white.bold('  Usage'));
  console.log();
  console.log(`    ${ACCENT('visora')}                Start the daemon`);
  console.log(`    ${ACCENT('visora')} ${DIM('init')}         Auto-install Visora into the current project`);
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
if (args.includes('init') || args.includes('--init')) {
  await runInit(projectRoot);
}
if (args.includes('remove') || args.includes('--remove')) {
  await runRemove(projectRoot);
}
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
    // Normalize: Vite stores { selection: { selections, instruction } }, Next.js stores { selections, instruction } flat
    const sel = task.selection || task;
    const isMulti = !!(sel.selections);
    const firstSel = isMulti ? sel.selections[0] : sel;
    const instruction = sel.instruction || task.instruction || 'unknown';
    const target = firstSel?.componentName || firstSel?.tagName || 'element';
    const file = firstSel?.sourceFile || 'unknown';
    const multiSuffix = (isMulti && sel.selections.length > 1) ? ` (+${sel.selections.length - 1} more)` : '';

    console.log(ACCENT(`  ● Task`), chalk.white(`"${instruction}"`));
    console.log(DIM(`    ${target} → ${file}${multiSuffix}`));

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

      const patches = await generatePatch(task, appRoot);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (patches && Array.isArray(patches) && patches.length > 0) {
        const patchId = crypto.randomUUID();
        pendingPatches.push({
          id: patchId,
          appRoot,
          instruction,
          patches
        });
        
        spinner.succeed(SUCCESS(`Generated ${patches.length} patch(es)`) + DIM(` (${elapsed}s)`));
        console.log(INFO(`  ➡ Patch ready for review at http://localhost:4444`));
        task.status = 'done'; // The task is done generating, it's now in the review queue
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

// Keep track of which files we are explicitly watching
const watchedFiles = new Set<string>();

function watchQueueFile(qPath: string) {
  if (watchedFiles.has(qPath)) return;
  watchedFiles.add(qPath);
  
  // Process it immediately in case there are pending tasks
  processQueue(qPath);

  // Watch this specific file reliably with aggressive polling for instant response
  chokidar.watch(qPath, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 100,
    binaryInterval: 300
  }).on('change', () => {
    processQueue(qPath);
  });
}

// 1. Initial scan on startup
const initialQueues = findQueueFiles(projectRoot);
initialQueues.forEach(watchQueueFile);

// 2. Fallback Poller: Windows glob watching often misses newly created deep directories. 
// We manually scan every 2 seconds to ensure we never miss a newly created queue.json
setInterval(() => {
  const currentQueues = findQueueFiles(projectRoot);
  currentQueues.forEach(watchQueueFile);
}, 2000);

// 3. Keep the glob watcher as an optimistic fast-path for standard environments
chokidar.watch('**/.visora/queue.json', {
  cwd: projectRoot,
  persistent: true,
  ignoreInitial: true,
  ignored: ['**/node_modules/**', '**/dist/**']
}).on('add', (relativePath) => {
  const fullPath = path.join(projectRoot, relativePath);
  watchQueueFile(fullPath);
});
