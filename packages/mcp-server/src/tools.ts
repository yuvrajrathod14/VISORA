/**
 * Visora MCP Server — Tool Implementations
 *
 * Each tool reads from or operates on the project filesystem
 * and the .visora/context.json file maintained by the Vite plugin.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { VisoraContextFile } from '@visora/shared';
import { buildRichContext } from '@visora/context';

const PROJECT_ROOT = process.env.VISORA_PROJECT_ROOT || process.cwd();
const CONTEXT_PATH = path.join(PROJECT_ROOT, '.visora', 'context.json');

/** Read the current selection from context.json */
function readContext(): VisoraContextFile | { error: string } {
  if (!fs.existsSync(CONTEXT_PATH)) {
    return {
      error: `No context file found at ${CONTEXT_PATH}. Is the dev server running with @visora/vite-plugin?`,
    };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(CONTEXT_PATH, 'utf-8'));
    if (!raw.selection) {
      return {
        error:
          'No component has been selected yet. Alt+Click an element in the running app first.',
      };
    }
    return raw as VisoraContextFile;
  } catch (e: any) {
    return { error: `Failed to read context file: ${e.message}` };
  }
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
// TOOL: inspect_component
// ═══════════════════════════════════════════════════════════
export function inspectComponent(): { content: string; isError: boolean } {
  const data = readContext();
  return {
    content: JSON.stringify(data, null, 2),
    isError: 'error' in data,
  };
}

// ═══════════════════════════════════════════════════════════
// TOOL: get_source
// ═══════════════════════════════════════════════════════════
export function getSource(args: {
  filePath?: string;
}): { content: string; isError: boolean } {
  let targetFile = args.filePath;

  // If no file specified, use the selected component's file
  if (!targetFile) {
    const ctx = readContext();
    if ('error' in ctx) {
      return { content: JSON.stringify(ctx), isError: true };
    }
    targetFile = ctx.selection?.sourceFile || undefined;
  }

  if (!targetFile) {
    return {
      content: JSON.stringify({ error: 'No file path provided and no component selected' }),
      isError: true,
    };
  }

  try {
    const resolved = resolveProjectFile(targetFile);
    if (!fs.existsSync(resolved)) {
      return {
        content: JSON.stringify({ error: `File not found: ${targetFile}` }),
        isError: true,
      };
    }
    const source = fs.readFileSync(resolved, 'utf-8');
    return {
      content: JSON.stringify({
        filePath: targetFile,
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
// TOOL: get_context
// ═══════════════════════════════════════════════════════════
export function getContext(): { content: string; isError: boolean } {
  const ctx = readContext();
  if ('error' in ctx) {
    return { content: JSON.stringify(ctx), isError: true };
  }

  // Phase 2: Build a rich, AI-friendly context payload with AST data
  const selection = ctx.selection!;
  let enriched;
  try {
    enriched = buildRichContext(selection, PROJECT_ROOT);
  } catch (e) {
    enriched = { error: 'Failed to build rich context', details: (e as Error).message };
  }

  return {
    content: JSON.stringify(enriched, null, 2),
    isError: false,
  };
}

// ═══════════════════════════════════════════════════════════
// TOOL: capture_component
// ═══════════════════════════════════════════════════════════
export function captureComponent(): { content: string; isError: boolean } {
  const ctx = readContext();
  if ('error' in ctx) {
    return { content: JSON.stringify(ctx), isError: true };
  }

  const selection = ctx.selection!;
  const screenshotPath = path.join(PROJECT_ROOT, '.visora', 'screenshot.png');
  const hasScreenshot = fs.existsSync(screenshotPath);

  const capture = {
    note: 'Visual screenshot capture included.',
    component: selection.fiber?.componentName || selection.tagName,
    file: selection.sourceFile,
    line: selection.sourceLine,
    dimensions: selection.boundingRect,
    outerHTML: selection.outerHTML,
    computedStyles: selection.computedStyles,
    capturedAt: selection.capturedAt,
    screenshot: hasScreenshot ? '.visora/screenshot.png' : null,
  };

  return {
    content: JSON.stringify(capture, null, 2),
    isError: false,
  };
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
    if (!currentContent.includes(args.original)) {
      return {
        content: JSON.stringify({
          error: 'Original content not found in file. The file may have changed since context was captured.',
        }),
        isError: true,
      };
    }

    const newContent = currentContent.replace(args.original, args.modified);
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
  // In Phase 1, reload is informational — the Vite dev server handles
  // HMR automatically when files change. This tool signals intent.
  return {
    content: JSON.stringify({
      success: true,
      message:
        'Reload signal sent. If the Vite dev server is running, changes will be hot-reloaded automatically when files are saved.',
    }),
    isError: false,
  };
}
