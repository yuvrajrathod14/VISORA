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
const contextDir = path.join(projectRoot, '.visora');
const queuePath = path.join(contextDir, 'queue.json');

console.log(chalk.magenta('  ╔══════════════════════════════════════════╗'));
console.log(chalk.magenta('  ║') + '  🤖 ' + chalk.bold.magenta('Visora Patcher Daemon') + '                ' + chalk.magenta('║'));
console.log(chalk.magenta('  ║') + '  Watching for UI instructions...        ' + chalk.magenta('║'));
console.log(chalk.magenta('  ╚══════════════════════════════════════════╝'));

let isProcessing = false;

async function processQueue() {
  if (isProcessing) return;
  
  if (!fs.existsSync(queuePath)) return;
  
  let queue: any[] = [];
  try {
    queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
  } catch (e) {
    return;
  }

  const pendingTasks = queue.filter(t => t.status === 'pending');
  
  if (pendingTasks.length === 0) return;
  
  isProcessing = true;
  
  console.log(chalk.cyan(`\n[visora] Found ${pendingTasks.length} pending instruction(s)...`));

  for (const task of pendingTasks) {
    console.log(chalk.blue(`\n[visora] Processing Task ${task.id}`));
    console.log(chalk.gray(`Target: ${task.selection.componentName || task.selection.tagName} in ${task.selection.sourceFile}`));
    console.log(chalk.white(`Instruction: "${task.selection.instruction}"`));
    
    task.status = 'processing';
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));

    try {
      // 1. Generate Patch using AI
      console.log(chalk.yellow('[visora] Asking AI to generate patch...'));
      const patch = await generatePatch(task);
      
      // 2. Apply Patch
      if (patch && patch.modifiedContent) {
         console.log(chalk.yellow(`[visora] Applying patch to ${patch.filePath}...`));
         const success = applyPatch(projectRoot, patch.filePath, patch.originalContent, patch.modifiedContent);
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
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  }
  
  isProcessing = false;
  console.log(chalk.cyan(`\n[visora] Finished processing queue. Watching for more...`));
}

// Watch queue.json for changes
chokidar.watch(queuePath, { persistent: true }).on('change', () => {
  processQueue();
});

// Run once on startup
processQueue();
