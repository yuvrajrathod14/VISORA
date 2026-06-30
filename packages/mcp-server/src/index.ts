#!/usr/bin/env node
/**
 * Visora MCP Server
 *
 * Exposes 7 tools for AI coding agents (Cursor, Antigravity, VS Code)
 * to interact with the Visora visual context system.
 *
 * Usage:
 *   VISORA_PROJECT_ROOT=/path/to/project node dist/index.js
 *
 * Or configure in your MCP client (Cursor, Antigravity):
 *   {
 *     "mcpServers": {
 *       "visora": {
 *         "command": "node",
 *         "args": ["/path/to/visora/packages/mcp-server/dist/index.js"],
 *         "env": { "VISORA_PROJECT_ROOT": "/path/to/your/project" }
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import {
  inspectComponent,
  getSource,
  getContext,
  captureComponent,
  applyPatch,
  saveFile,
  reload,
} from './tools.js';

// ═══════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════
const TOOLS = [
  {
    name: 'inspect_component',
    description:
      'Returns the full context of the component the developer last selected via Alt+Click ' +
      'in their running app. Includes source file, line number, outerHTML, computed styles, ' +
      'React Fiber data (component name, props), DOM hierarchy, and the user\'s instruction. ' +
      'Call this when the user refers to "the selected component" or asks to apply a visual edit.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'get_source',
    description:
      'Reads and returns the source code of a file. If no filePath is provided, ' +
      'returns the source of the currently selected component\'s file.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        filePath: {
          type: 'string',
          description: 'Relative path to the source file (from project root). Optional — defaults to selected component\'s file.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_context',
    description:
      'Returns a structured, AI-optimized JSON context for the selected component. ' +
      'Includes component name, file, line, framework, Tailwind classes, props, ' +
      'parent/child hierarchy, styles, and the user\'s instruction. Use this to ' +
      'understand what the user wants to change before generating a patch.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'capture_component',
    description:
      'Returns a visual/DOM snapshot of the selected component including its ' +
      'dimensions, outerHTML, and computed styles. (Screenshot capture coming in v2.)',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'apply_patch',
    description:
      'Applies a code patch to a source file by replacing the original text with ' +
      'the modified text. Use this after generating the edit for a visual-edit instruction.',
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
    case 'inspect_component':
      result = inspectComponent();
      break;
    case 'get_source':
      result = getSource(args as { filePath?: string });
      break;
    case 'get_context':
      result = getContext();
      break;
    case 'capture_component':
      result = captureComponent();
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
