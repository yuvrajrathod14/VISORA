import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

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
    source = source.replace(originalContent, modifiedContent);
    fs.writeFileSync(fullPath, source, 'utf-8');
    return true;
  }
  
  // Try to normalize line endings and whitespace
  const normalize = (str: string) => str.replace(/\r\n/g, '\n').trim();
  if (normalize(source).includes(normalize(originalContent))) {
    // A bit risky, but we can do a fallback exact string replacement if we just normalize line endings
    const normalizedSource = source.replace(/\r\n/g, '\n');
    const newSource = normalizedSource.replace(normalize(originalContent), modifiedContent);
    fs.writeFileSync(fullPath, newSource, 'utf-8');
    return true;
  }

  return false;
}
