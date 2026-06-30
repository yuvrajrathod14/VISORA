/**
 * @visora/vite-plugin
 *
 * The core Vite plugin that powers Visora:
 * 1. Tags every JSX opening element with data-visora-src="relative/path:line"
 * 2. Injects the premium browser overlay script in dev mode
 * 3. Exposes dev server middleware for context bridging
 *
 * Usage:
 *   import visora from '@visora/vite-plugin';
 *   export default defineConfig({ plugins: [react(), visora()] });
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin, ViteDevServer } from 'vite';
import type { VisoraPluginOptions, VisoraContextFile } from '@visora/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONTEXT_DIR = '.visora';
const CONTEXT_FILE = 'context.json';

/**
 * Tag JSX opening elements with data-visora-src attributes containing
 * the relative file path and line number. This runs BEFORE React's JSX
 * compiler so we operate on raw JSX text.
 */
function tagJSXWithSource(code: string, relPath: string): string {
  // Pre-compute line start indices for fast line number lookup
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '\n') lineStarts.push(i + 1);
  }

  function lineAt(idx: number): number {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  }

  // Match JSX opening tags: <ComponentName or <div (not closing </...)
  const tagRegex = /<([A-Za-z][\w.]*)([\s>\/])/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(code)) !== null) {
    const [full, _tagName, after] = match;
    const idx = match.index;

    // Guard: skip if preceded by word char (avoids matching generics like Array<Foo>)
    const prevChar = code[idx - 1];
    if (prevChar && /[\w]/.test(prevChar)) continue;

    // Guard: skip if already tagged
    const nextChunk = code.slice(idx, idx + 200);
    if (nextChunk.includes('data-visora-src')) continue;

    const line = lineAt(idx);
    const insertion = ` data-visora-src="${relPath}:${line}"`;
    result += code.slice(lastIndex, idx + full.length - after.length);
    result += insertion;
    result += after;
    lastIndex = idx + full.length;
  }

  result += code.slice(lastIndex);
  return result;
}

export default function visoraPlugin(options: VisoraPluginOptions = {}): Plugin {
  const contextDirName = options.contextDir || DEFAULT_CONTEXT_DIR;
  let projectRoot: string;
  let contextPath: string;

  function ensureContextDir(): void {
    const dir = path.join(projectRoot, contextDirName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  function initContextFile(): void {
    if (!fs.existsSync(contextPath)) {
      const initial: VisoraContextFile = {
        selection: null,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(contextPath, JSON.stringify(initial, null, 2));
    }
  }

  return {
    name: 'visora',
    apply: 'serve', // dev-only — never runs in production
    enforce: 'pre', // must run BEFORE @vitejs/plugin-react compiles JSX

    configResolved(config) {
      projectRoot = options.root || config.root;
      contextPath = path.join(projectRoot, contextDirName, CONTEXT_FILE);
    },

    transform(code: string, id: string) {
      // Only process JSX/TSX files
      if (!/\.(jsx|tsx)$/.test(id)) return null;
      // Skip node_modules
      if (id.includes('node_modules')) return null;

      const relPath = path.relative(projectRoot, id).replace(/\\/g, '/');
      const tagged = tagJSXWithSource(code, relPath);

      return { code: tagged, map: null };
    },

    transformIndexHtml() {
      if (options.disableOverlay) return [];

      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: `/@visora/overlay.js?v=${Date.now()}` },
          injectTo: 'body' as const,
        },
      ];
    },

    configureServer(server: ViteDevServer) {
      const queuePath = path.join(projectRoot, contextDirName, 'queue.json');

      ensureContextDir();
      initContextFile();
      
      // Initialize queue file if missing
      if (!fs.existsSync(queuePath)) {
        fs.writeFileSync(queuePath, JSON.stringify([]));
      }

      // Serve the overlay client script
      server.middlewares.use('/@visora/overlay.js', (_req, res) => {
        const overlayPath = path.join(__dirname, 'overlay.js');
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        try {
          res.end(fs.readFileSync(overlayPath, 'utf-8'));
        } catch (e) {
          console.error('\x1b[2m  [visora]\x1b[0m \x1b[31mFailed to serve overlay.js. Did you build the plugin?\x1b[0m');
          res.statusCode = 404;
          res.end();
        }
      });

      // Context bridge: browser POSTs selection, MCP/AI reads it
      server.middlewares.use('/@visora/context', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => (body += chunk));
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);

              const id = Date.now().toString();
              
              // Extract screenshot base64 if present, and save as unique file
              if (payload.screenshotBase64) {
                const base64Data = payload.screenshotBase64.replace(/^data:image\/png;base64,/, "");
                const screenFileName = `screenshot_${id}.png`;
                fs.writeFileSync(path.join(projectRoot, contextDirName, screenFileName), base64Data, 'base64');
                delete payload.screenshotBase64;
                payload.screenshotFile = `.visora/${screenFileName}`;
              }

              // Also maintain backwards compatibility for the active selection
              const contextData: VisoraContextFile = {
                selection: payload,
                updatedAt: new Date().toISOString(),
              };
              fs.writeFileSync(contextPath, JSON.stringify(contextData, null, 2));

              if (payload.instruction) {
                // Append to Multi-Action Queue
                let queue: any[] = [];
                try {
                  if (fs.existsSync(queuePath)) {
                    queue = JSON.parse(fs.readFileSync(queuePath, 'utf-8'));
                  }
                } catch (e) {
                  // ignore parse error, reset queue
                }
                
                queue.push({
                  id,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                  selection: payload
                });
                
                fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
                
                console.log(
                  `\x1b[38;2;217;119;87m  ● Queued\x1b[0m  "${payload.instruction?.slice(0, 50) || 'instruction'}" \x1b[2m(${id})\x1b[0m`
                );
              } else {
                console.log(
                  `\x1b[2m  [visora]\x1b[0m selection → \x1b[36m${payload.sourceFile || 'unknown'}\x1b[0m`
                );
              }
            } catch (e) {
              console.error('\x1b[2m  [visora]\x1b[0m \x1b[31mfailed to parse context\x1b[0m');
            }
            res.statusCode = 204;
            res.end();
          });
        } else if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            res.end(fs.readFileSync(contextPath, 'utf-8'));
          } catch {
            res.end(JSON.stringify({ selection: null, updatedAt: null }));
          }
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      // Reload endpoint — triggers full page reload via HMR
      server.middlewares.use('/@visora/reload', (_req, res) => {
        server.ws.send({ type: 'full-reload' });
        res.statusCode = 204;
        res.end();
      });

      // Startup banner
      console.log('');
      console.log(
        '\x1b[1m\x1b[38;2;217;119;87m  Visora\x1b[0m'
      );
      console.log(
        '\x1b[2m  Browser overlay active · Alt+Click to inspect\x1b[0m'
      );
      console.log('');
      console.log(
        `\x1b[2m  ─────────────────────────────────────────────────\x1b[0m`
      );
      console.log('');
      console.log(
        `\x1b[2m  Context\x1b[0m   ${contextPath}`
      );
      console.log(
        `\x1b[2m  Queue\x1b[0m     ${queuePath}`
      );
      console.log('');
    },
  };
}
