import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Generates a human-readable, color-coded diff view for the terminal.
 * Shows exactly what lines were removed (red) and added (green).
 */
function printDiff(originalContent: string, modifiedContent: string) {
  const DIM = chalk.gray;
  const ADDED = chalk.green;
  const REMOVED = chalk.red;
  
  const origLines = originalContent.split('\n');
  const modLines = modifiedContent.split('\n');
  
  console.log();
  console.log(DIM('    ┌─ Changes ─────────────────────────────────────────'));
  
  // Show removed lines
  for (const line of origLines) {
    const trimmed = line.trimEnd();
    if (trimmed.length > 0) {
      console.log(REMOVED(`    │ - ${trimmed}`));
    }
  }
  
  // Separator
  console.log(DIM('    │'));
  
  // Show added lines
  for (const line of modLines) {
    const trimmed = line.trimEnd();
    if (trimmed.length > 0) {
      console.log(ADDED(`    │ + ${trimmed}`));
    }
  }
  
  console.log(DIM('    └───────────────────────────────────────────────────'));
  console.log();
}

function saveHistory(appRoot: string, filePath: string, previousContent: string) {
  try {
    const visoraDir = path.join(appRoot, '.visora');
    if (!fs.existsSync(visoraDir)) fs.mkdirSync(visoraDir, { recursive: true });
    
    const historyPath = path.join(visoraDir, 'history.json');
    let history: any[] = [];
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    }
    
    // Push the state before the change
    history.push({
      filePath,
      timestamp: Date.now(),
      previousContent
    });
    
    // Keep only the last 20 changes to avoid bloat
    if (history.length > 20) history = history.slice(-20);
    
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (e) {
    console.error(chalk.yellow(`  Warning: Failed to save rollback history: ${(e as Error).message}`));
  }
}

export function applyPatch(
  appRoot: string,
  filePath: string,
  originalContent: string,
  modifiedContent: string
): boolean {
  const fullPath = path.join(appRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`File not found: ${fullPath}`));
    return false;
  }

  let source = fs.readFileSync(fullPath, 'utf-8');

  // Exact match replacement
  if (source.includes(originalContent)) {
    const newSource = source.replace(originalContent, modifiedContent);
    saveHistory(appRoot, filePath, source);
    fs.writeFileSync(fullPath, newSource, 'utf-8');
    printDiff(originalContent, modifiedContent);
    return true;
  }
  
  // Try to normalize line endings and whitespace
  const normalize = (str: string) => str.replace(/\r\n/g, '\n').trim();
  if (normalize(source).includes(normalize(originalContent))) {
    const normalizedSource = source.replace(/\r\n/g, '\n');
    const newSource = normalizedSource.replace(normalize(originalContent), modifiedContent);
    saveHistory(appRoot, filePath, source);
    fs.writeFileSync(fullPath, newSource, 'utf-8');
    printDiff(originalContent, modifiedContent);
    return true;
  }

  return false;
}
