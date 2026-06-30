export default function HowToUse() {
  return (
    <section className="how-to-use" id="docs">
      <div className="how-to-header">
        <h2>Quick Start Guide</h2>
        <p>Visora features a powerful dual-workflow architecture. Choose how you want to code.</p>
      </div>
      
      <div className="how-to-grid">
        {/* Workflow A */}
        <div className="how-to-card tilt-card">
          <div className="how-to-step">
            <span className="step-number">Workflow A</span>
            <h3>The Autonomous Daemon</h3>
          </div>
          <p>
            Don't want to use an IDE chat? Visora comes with a built-in CLI agent that runs in the background and writes code for you automatically.
          </p>
          <div className="code-block">
            <pre>
              <code>
<span className="code-comment"># First time? The wizard will ask for your API key:</span>
pnpm visora

<span className="code-comment"># Or set it manually in .env:</span>
ANTHROPIC_API_KEY=sk-ant-...
<span className="code-comment"># Also supports: OPENAI, GEMINI, or OLLAMA</span>
              </code>
            </pre>
          </div>
          <p className="step-footer">
            Alt+Click components in your browser, type an instruction, and watch the terminal. The daemon will instantly patch your source files!
          </p>
        </div>

        {/* Workflow B */}
        <div className="how-to-card">
          <div className="how-to-step">
            <span className="step-number">Workflow B</span>
            <h3>The IDE MCP Server</h3>
          </div>
          <p>
            If you prefer using <strong>Cursor</strong> or <strong>Windsurf</strong>, you can plug Visora directly into your IDE's brain.
          </p>
          <div className="code-block">
            <pre>
              <code>
<span className="code-comment"># Add a new MCP Server in Cursor/Windsurf settings:</span>
Name:    visora
Type:    command
Command: node
Args:    /path/to/VISORA/packages/mcp-server/dist/index.js
Env:     VISORA_PROJECT_ROOT=/path/to/VISORA
              </code>
            </pre>
          </div>
          <p className="step-footer">
            Queue instructions in the browser, then tell your IDE chat: <strong>"Process my Visora queue"</strong>. The IDE will pull the AST context and write the code interactively.
          </p>
        </div>

        {/* Live Project Installation */}
        <div className="how-to-card">
          <div className="how-to-step">
            <span className="step-number">Setup</span>
            <h3>Install in your Live Project</h3>
          </div>
          <p>
            You can use Visora in your own live Vite/React projects by installing it from this local repository.
          </p>
          <div className="code-block">
            <pre>
              <code>
<span className="code-comment"># 1. Install the Vite Plugin into your project</span>
npm install -D /path/to/VISORA/packages/vite-plugin

<span className="code-comment"># 2. Add to vite.config.ts</span>
import visora from '@visora/vite-plugin';
export default defineConfig({`{`}
  plugins: [react(), visora()]
{`}`});
              </code>
            </pre>
          </div>
          <p className="step-footer">
            Start your dev server. The overlay will instantly appear in your live project!
          </p>
        </div>

        {/* CLI Reference */}
        <div className="how-to-card">
          <div className="how-to-step">
            <span className="step-number">CLI</span>
            <h3>Command Reference</h3>
          </div>
          <p>
            The Visora CLI is a professional-grade tool with built-in help, status monitoring, and queue management.
          </p>
          <div className="code-block">
            <pre>
              <code>
<span className="code-comment"># Start the autonomous daemon</span>
pnpm visora

<span className="code-comment"># Re-configure your AI provider</span>
pnpm visora --config

<span className="code-comment"># Show queue status across workspace</span>
pnpm visora --status

<span className="code-comment"># Clear completed/failed tasks</span>
pnpm visora --clear

<span className="code-comment"># Show full help page</span>
pnpm visora --help

<span className="code-comment"># Show version</span>
pnpm visora --version
              </code>
            </pre>
          </div>
          <p className="step-footer">
            Run <strong>pnpm visora --help</strong> at any time for the complete usage guide, supported env vars, and step-by-step instructions.
          </p>
        </div>
      </div>
    </section>
  );
}
