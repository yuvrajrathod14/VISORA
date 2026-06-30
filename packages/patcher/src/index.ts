#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { generatePatch } from './ai';
import { applyPatch } from './diff';

dotenv.config();

const projectRoot = process.env.VISORA_PROJECT_ROOT || process.cwd();

console.log(chalk.magenta('  ╔══════════════════════════════════════════╗'));
console.log(chalk.magenta('  ║') + '  🤖 ' + chalk.bold.magenta('Visora Patcher Daemon') + '                ' + chalk.magenta('║'));
console.log(chalk.magenta('  ║') + '  Watching for UI instructions...        ' + chalk.magenta('║'));
console.log(chalk.magenta('  ╚══════════════════════════════════════════╝'));

// Keep track of which queues are currently being processed
const processingQueues = new Set<string>();

// Robust manual scanner to bypass chokidar initial scan issues on Windows
function findQueueFiles(dir: string, fileList: string[] = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) {
      // Allow searching inside .visora, but skip other hidden folders like .git
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
      // Ignore stat errors
    }
  }
  return fileList;
}

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
  
  console.log(chalk.cyan(`\n[visora] Found ${pendingTasks.length} pending instruction(s)...`));

  for (const task of pendingTasks) {
    console.log(chalk.blue(`\n[visora] Processing Task ${task.id}`));
    console.log(chalk.gray(`Target: ${task.selection.componentName || task.selection.tagName} in ${task.selection.sourceFile}`));
    console.log(chalk.white(`Instruction: "${task.selection.instruction}"`));
    
    task.status = 'processing';
    fs.writeFileSync(targetQueuePath, JSON.stringify(queue, null, 2));

    try {
      const appRoot = path.dirname(path.dirname(targetQueuePath));
      
      // 1. Generate Patch using AI
      console.log(chalk.yellow('[visora] Asking AI to generate patch...'));
      const patch = await generatePatch(task, appRoot);
      
      // 2. Apply Patch
      if (patch && patch.modifiedContent) {
         console.log(chalk.yellow(`[visora] Applying patch to ${patch.filePath}...`));
         const success = applyPatch(appRoot, patch.filePath, patch.originalContent, patch.modifiedContent);
         if (success) {
           console.log(chalk.green(`[visora] ✨ Successfully patched ${patch.filePath}!`));
           task.status = 'done';
         } else {
           console.log(chalk.red(`[visora] ❌ Failed to apply patch (context didn't match).`));
           task.status = 'failed';
         }
      } else {
         console.log(chalk.red(`[visora] ❌ AI failed to generate a valid patch.`));
         task.status = 'failed';
      }
    } catch (e: any) {
      console.log(chalk.red(`[visora] ❌ Error: ${e.message}`));
      task.status = 'failed';
    }
    
    // Save state
    fs.writeFileSync(targetQueuePath, JSON.stringify(queue, null, 2));
  }
  
  processingQueues.delete(targetQueuePath);
  console.log(chalk.cyan(`\n[visora] Finished processing queue. Watching for more...`));
}

// Watch any queue.json inside a .visora directory anywhere in the workspace
chokidar.watch('**/.visora/queue.json', { 
  cwd: projectRoot,
  persistent: true,
  ignoreInitial: true, // We handle initial scan manually now
  ignored: ['**/node_modules/**', '**/dist/**']
}).on('add', (relativePath) => {
  processQueue(path.join(projectRoot, relativePath));
}).on('change', (relativePath) => {
  processQueue(path.join(projectRoot, relativePath));
});

// Run manual scan on startup
const initialQueues = findQueueFiles(projectRoot);
initialQueues.forEach(qPath => processQueue(qPath));
