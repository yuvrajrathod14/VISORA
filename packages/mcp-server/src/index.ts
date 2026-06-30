#!/usr/bin/env node
/**
 * Visora MCP Server
 *
 * Exposes 6 tools for AI coding agents (Cursor, Antigravity, VS Code)
 * to interact with the Visora Multi-Action Queue.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  getVisoraQueue,
  getTaskContext,
  markTaskStatus,
  getSource,
  applyPatch,
  saveFile,
  reload,
} from './tools.js';

// ═══════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════
const TOOLS = [
  {
    name: 'get_visora_queue',
    description:
      'Reads the .visora/queue.json files across the monorepo workspace and returns a list ' +
      'of all pending UI editing tasks. Each task contains an ID, target component, and ' +
      'the user\'s natural language instruction. Call this first to discover work to be done.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'get_task_context',
    description:
      'Returns a structured, AI-optimized JSON context for a specific task ID in the queue. ' +
      'Includes component name, file, line, framework, Tailwind classes, props, ' +
      'parent/child hierarchy, computed styles, and the exact DOM outerHTML. Use this to ' +
      'understand what needs to be changed before generating a patch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task from get_visora_queue',
        },
      },
      required: ['taskId'],
      additionalProperties: false,
    },
  },
  {
    name: 'mark_task_status',
    description:
      'Updates the status of a task in the Visora queue. Mark a task as "processing" when you ' +
      'start working on it, and "done" when you successfully apply a patch, or "failed" if you cannot complete it.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to update',
        },
        status: {
          type: 'string',
          description: 'The new status: "processing", "done", or "failed"',
          enum: ['processing', 'done', 'failed']
        }
      },
      required: ['taskId', 'status'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_source',
    description:
      'Reads and returns the source code of a file within the workspace. ' +
      'Essential for reading the full source of the component before generating a patch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filePath: {
          type: 'string',
          description: 'Relative path to the source file (from project root).',
        },
      },
      required: ['filePath'],
      additionalProperties: false,
    },
  },
  {
    name: 'apply_patch',
    description:
      'Applies a code patch to a source file by replacing the exact original text with ' +
      'the modified text. Use this to enact the user\'s UI changes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filePath: {
          type: 'string',
          description: 'Relative path to the file to patch (from project root)',
        },
        original: {
          type: 'string',
          description: 'The exact original code to find and replace',
        },
        modified: {
          type: 'string',
          description: 'The new code to replace the original with',
        },
      },
      required: ['filePath', 'original', 'modified'],
      additionalProperties: false,
    },
  },
  {
    name: 'save_file',
    description:
      'Saves content to a file at the specified path within the project. ' +
      'Creates parent directories if needed.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filePath: {
          type: 'string',
          description: 'Relative path for the file (from project root)',
        },
        content: {
          type: 'string',
          description: 'The full content to write to the file',
        },
      },
      required: ['filePath', 'content'],
      additionalProperties: false,
    },
  },
  {
    name: 'reload',
    description:
      'Triggers the Vite dev server to refresh the browser. Use after applying patches ' +
      'to verify the changes visually.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      additionalProperties: false,
    },
  },
];

// ═══════════════════════════════════════════════════════════
// SERVER SETUP
// ═══════════════════════════════════════════════════════════
const server = new Server(
  { name: 'visora-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let result: { content: string; isError: boolean };

  switch (name) {
    case 'get_visora_queue':
      result = getVisoraQueue();
      break;
    case 'get_task_context':
      result = getTaskContext(args as { taskId: string });
      break;
    case 'mark_task_status':
      result = markTaskStatus(args as { taskId: string; status: string });
      break;
    case 'get_source':
      result = getSource(args as { filePath: string });
      break;
    case 'apply_patch':
      result = applyPatch(args as { filePath: string; original: string; modified: string });
      break;
    case 'save_file':
      result = saveFile(args as { filePath: string; content: string });
      break;
    case 'reload':
      result = reload();
      break;
    default:
      result = {
        content: JSON.stringify({ error: `Unknown tool: ${name}` }),
        isError: true,
      };
  }

  return {
    content: [{ type: 'text', text: result.content }],
    isError: result.isError,
  };
});

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
const transport = new StdioServerTransport();
await server.connect(transport);
