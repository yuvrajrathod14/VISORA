export default function HowToUse() {
  return (
    <section className="how-to-use" id="docs">
      <div className="how-to-header">
        <h2>Quick Start Guide</h2>
        <p>Visora features a powerful dual-workflow architecture. Choose how you want to code.</p>
      </div>
      
      <div className="how-to-grid">
        {/* Workflow A */}
        <div className="how-to-card">
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
<span className="code-comment"># 1. Create a .env file with your API key:</span>
OPENAI_API_KEY=sk-proj-...
<span className="code-comment"># (Also supports ANTHROPIC, GEMINI, or OLLAMA)</span>

<span className="code-comment"># 2. Run the background daemon:</span>
pnpm visora

<span className="code-comment"># Tip: Change AI provider later by running:</span>
<span className="code-comment"># pnpm visora --config</span>
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
Args:    /absolute/path/to/VISORA/packages/mcp-server/dist/index.js
Env:     VISORA_PROJECT_ROOT=/absolute/path/to/VISORA
              </code>
            </pre>
          </div>
          <p className="step-footer">
            Queue instructions in the browser, then tell your IDE chat: <strong>"Process my Visora queue"</strong>. The IDE will pull the AST context and write the code interactively.
          </p>
        </div>

        {/* Live Project Installation Guide */}
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
<span className="code-comment"># 1. Install the Vite Plugin into your live project</span>
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
            Start your dev server (`npm run dev`). The overlay will instantly appear in your live project!
          </p>
        </div>
      </div>
    </section>
  );
}
