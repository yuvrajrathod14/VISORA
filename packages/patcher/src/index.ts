#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import { generatePatch } from './ai';
import { applyPatch } from './diff';
import { checkAndRunOnboarding } from './onboarding';

dotenv.config();

const projectRoot = process.env.VISORA_PROJECT_ROOT || process.cwd();

const forceConfig = process.argv.includes('--config') || process.argv.includes('--setup');

// Run interactive onboarding if no API keys are found, or if --config is passed
await checkAndRunOnboarding(projectRoot, forceConfig);

// Claude/Anthropic inspired aesthetic
console.clear();
console.log(chalk.bold.hex('#d97757')('Visora Autonomous Agent'));
console.log(chalk.gray('───────────────────────'));

const idleSpinner = ora({
  text: chalk.gray('Waiting for instructions...'),
  color: 'gray',
  spinner: 'dots'
}).start();

// Keep track of which queues are currently being processed
const processingQueues = new Set<string>();

// Robust manual scanner to bypass chokidar initial scan issues on Windows
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
  
  // Stop idle spinner
  idleSpinner.stop();
  console.log(); // Blank line for spacing

  for (const task of pendingTasks) {
    console.log(chalk.hex('#d97757')(`● Task:`), chalk.white(`"${task.selection.instruction}"`));
    console.log(chalk.gray(`  Target: ${task.selection.componentName || task.selection.tagName} in ${task.selection.sourceFile}`));
    
    task.status = 'processing';
    fs.writeFileSync(targetQueuePath, JSON.stringify(queue, null, 2));

    let actionSpinner = ora({
      text: chalk.gray('AI analyzing DOM and generating patch...'),
      color: 'yellow',
      spinner: 'dots'
    }).start();

    try {
      const appRoot = path.dirname(path.dirname(targetQueuePath));
      
      // 1. Generate Patch using AI
      const patch = await generatePatch(task, appRoot);
      
      // 2. Apply Patch
      if (patch && patch.modifiedContent) {
         actionSpinner.text = chalk.gray(`Applying patch to ${patch.filePath}...`);
         
         const success = applyPatch(appRoot, patch.filePath, patch.originalContent, patch.modifiedContent);
         if (success) {
           actionSpinner.succeed(chalk.green(`Code surgically updated (${patch.filePath})`));
           task.status = 'done';
         } else {
           actionSpinner.fail(chalk.red(`Failed to apply patch (context didn't match).`));
           task.status = 'failed';
         }
      } else {
         actionSpinner.fail(chalk.red(`AI failed to generate a valid patch.`));
         task.status = 'failed';
      }
    } catch (e: any) {
      actionSpinner.fail(chalk.red(`Error: ${e.message}`));
      task.status = 'failed';
    }
    
    // Save state
    fs.writeFileSync(targetQueuePath, JSON.stringify(queue, null, 2));
    console.log(); // Spacing after task finishes
  }
  
  processingQueues.delete(targetQueuePath);
  
  // Restart idle spinner
  idleSpinner.start();
}

// Watch any queue.json inside a .visora directory anywhere in the workspace
chokidar.watch('**/.visora/queue.json', { 
  cwd: projectRoot,
  persistent: true,
  ignoreInitial: true,
  ignored: ['**/node_modules/**', '**/dist/**']
}).on('add', (relativePath) => {
  processQueue(path.join(projectRoot, relativePath));
}).on('change', (relativePath) => {
  processQueue(path.join(projectRoot, relativePath));
});

// Run manual scan on startup
const initialQueues = findQueueFiles(projectRoot);
initialQueues.forEach(qPath => processQueue(qPath));
