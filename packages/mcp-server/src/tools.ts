/**
 * Visora MCP Server — Tool Implementations
 *
 * Each tool reads from or operates on the project filesystem
 * and the .visora/queue.json files maintained by the Vite plugin.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { VisoraContextFile } from 'visora-shared';
import { buildRichContext } from 'visora-context';

const PROJECT_ROOT = process.env.VISORA_PROJECT_ROOT || process.cwd();

/** Robust manual scanner to find queue.json files across monorepo */
function findQueueFiles(dir: string, fileList: string[] = []): string[] {
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

/** Helper to find a specific task across all queues */
function findTaskInQueues(taskId: string): { task: any; queuePath: string; queue: any[] } | null {
  const queueFiles = findQueueFiles(PROJECT_ROOT);
  for (const qPath of queueFiles) {
    try {
      const queue = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
      const task = queue.find((t: any) => t.id === taskId);
      if (task) {
        return { task, queuePath: qPath, queue };
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

/** Safely resolve a file path within the project root */
function resolveProjectFile(filePath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  // Security: ensure we stay within project root
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`Path "${filePath}" resolves outside project root`);
  }
  return resolved;
}

// ═══════════════════════════════════════════════════════════
// TOOL: get_visora_queue
// ═══════════════════════════════════════════════════════════
export function getVisoraQueue(): { content: string; isError: boolean } {
  const queueFiles = findQueueFiles(PROJECT_ROOT);
  const allTasks: any[] = [];
  
  for (const qPath of queueFiles) {
    try {
      const queue = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
      // Add a lightweight version of pending tasks (exclude huge ASTs/HTML to keep it clean)
      const pending = queue.filter((t: any) => t.status === 'pending').map((t: any) => ({
        id: t.id,
        status: t.status,
        createdAt: t.createdAt,
        target: `${t.selection.componentName || t.selection.tagName} in ${t.selection.sourceFile}`,
        instruction: t.selection.instruction
      }));
      allTasks.push(...pending);
    } catch (e) {
      continue;
    }
  }

  return {
    content: JSON.stringify({ pendingTasks: allTasks }, null, 2),
    isError: false,
  };
}

// ═══════════════════════════════════════════════════════════
// TOOL: get_task_context
// ═══════════════════════════════════════════════════════════
export function getTaskContext(args: { taskId: string }): { content: string; isError: boolean } {
  if (!args.taskId) {
    return { content: JSON.stringify({ error: 'taskId is required' }), isError: true };
  }

  const result = findTaskInQueues(args.taskId);
  if (!result) {
    return { content: JSON.stringify({ error: `Task ${args.taskId} not found` }), isError: true };
  }

  // Build the rich context
  let enriched;
  try {
    const appRoot = path.dirname(path.dirname(result.queuePath));
    enriched = buildRichContext(result.task.selection, appRoot);
  } catch (e) {
    enriched = { error: 'Failed to build rich context', details: (e as Error).message, basicContext: result.task.selection };
  }

  return {
    content: JSON.stringify({
      task: {
        id: result.task.id,
        status: result.task.status,
        createdAt: result.task.createdAt
      },
      context: enriched
    }, null, 2),
    isError: false,
  };
}

// ═══════════════════════════════════════════════════════════
// TOOL: mark_task_status
// ═══════════════════════════════════════════════════════════
export function markTaskStatus(args: { taskId: string, status: string }): { content: string; isError: boolean } {
  if (!args.taskId || !args.status) {
    return { content: JSON.stringify({ error: 'taskId and status are required' }), isError: true };
  }

  const validStatuses = ['pending', 'processing', 'done', 'failed'];
  if (!validStatuses.includes(args.status)) {
    return { content: JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }), isError: true };
  }

  const result = findTaskInQueues(args.taskId);
  if (!result) {
    return { content: JSON.stringify({ error: `Task ${args.taskId} not found` }), isError: true };
  }

  result.task.status = args.status;
  
  try {
    fs.writeFileSync(result.queuePath, JSON.stringify(result.queue, null, 2));
    return {
      content: JSON.stringify({ success: true, message: `Task ${args.taskId} marked as ${args.status}` }),
      isError: false,
    };
  } catch (e: any) {
    return { content: JSON.stringify({ error: `Failed to save queue: ${e.message}` }), isError: true };
  }
}

// ═══════════════════════════════════════════════════════════
// TOOL: get_source
// ═══════════════════════════════════════════════════════════
export function getSource(args: {
  filePath: string;
}): { content: string; isError: boolean } {
  if (!args.filePath) {
    return {
      content: JSON.stringify({ error: 'filePath is required' }),
      isError: true,
    };
  }

  try {
    const resolved = resolveProjectFile(args.filePath);
    if (!fs.existsSync(resolved)) {
      return {
        content: JSON.stringify({ error: `File not found: ${args.filePath}` }),
        isError: true,
      };
    }
    const source = fs.readFileSync(resolved, 'utf-8');
    return {
      content: JSON.stringify({
        filePath: args.filePath,
        resolvedPath: resolved,
        lineCount: source.split('\n').length,
        source,
      }, null, 2),
      isError: false,
    };
  } catch (e: any) {
    return {
      content: JSON.stringify({ error: e.message }),
      isError: true,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// TOOL: apply_patch
// ═══════════════════════════════════════════════════════════
export function applyPatch(args: {
  filePath: string;
  original: string;
  modified: string;
}): { content: string; isError: boolean } {
  if (!args.filePath || !args.original || !args.modified) {
    return {
      content: JSON.stringify({ error: 'filePath, original, and modified are required' }),
      isError: true,
    };
  }

  try {
    const resolved = resolveProjectFile(args.filePath);
    if (!fs.existsSync(resolved)) {
      return {
        content: JSON.stringify({ error: `File not found: ${args.filePath}` }),
        isError: true,
      };
    }

    const currentContent = fs.readFileSync(resolved, 'utf-8');
    
    let newContent = currentContent;
    if (currentContent.includes(args.original)) {
      newContent = currentContent.replace(args.original, args.modified);
    } else {
      // Fallback: try normalizing line endings
      const normalize = (str: string) => str.replace(/\r\n/g, '\n').trim();
      const normSource = currentContent.replace(/\r\n/g, '\n');
      if (normSource.includes(normalize(args.original))) {
        newContent = normSource.replace(normalize(args.original), args.modified);
      } else {
        return {
          content: JSON.stringify({
            error: 'Original content not found in file. Ensure exact string match.',
          }),
          isError: true,
        };
      }
    }

    fs.writeFileSync(resolved, newContent, 'utf-8');

    return {
      content: JSON.stringify({
        success: true,
        filePath: args.filePath,
        message: 'Patch applied successfully',
      }),
      isError: false,
    };
  } catch (e: any) {
    return {
      content: JSON.stringify({ error: e.message }),
      isError: true,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// TOOL: save_file
// ═══════════════════════════════════════════════════════════
export function saveFile(args: {
  filePath: string;
  content: string;
}): { content: string; isError: boolean } {
  if (!args.filePath || args.content === undefined) {
    return {
      content: JSON.stringify({ error: 'filePath and content are required' }),
      isError: true,
    };
  }

  try {
    const resolved = resolveProjectFile(args.filePath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, args.content, 'utf-8');

    return {
      content: JSON.stringify({
        success: true,
        filePath: args.filePath,
        bytes: Buffer.byteLength(args.content, 'utf-8'),
        message: 'File saved successfully',
      }),
      isError: false,
    };
  } catch (e: any) {
    return {
      content: JSON.stringify({ error: e.message }),
      isError: true,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// TOOL: reload
// ═══════════════════════════════════════════════════════════
export function reload(): { content: string; isError: boolean } {
  return {
    content: JSON.stringify({
      success: true,
      message:
        'Reload signal sent. If the Vite dev server is running, changes will be hot-reloaded automatically when files are saved.',
    }),
    isError: false,
  };
}
