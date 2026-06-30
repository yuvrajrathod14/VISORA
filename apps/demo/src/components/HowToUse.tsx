export default function HowToUse() {
  return (
    <section className="how-to-use" id="docs">
      <div className="how-to-header">
        <h2>Quick Start Guide</h2>
        <p>Use Visora autonomously in the background, or plug it directly into your IDE via MCP.</p>
      </div>
      
      <div className="how-to-grid">
        {/* IDE MCP Server Guide */}
        <div className="how-to-card">
          <div className="how-to-step">
            <span className="step-number">01</span>
            <h3>Connect IDE (Cursor / Windsurf)</h3>
          </div>
          <p>
            You can give your AI IDE visual awareness by adding the Visora MCP server to your settings.
          </p>
          <div className="code-block">
            <pre>
              <code>
<span className="code-comment"># Add a new MCP Server in Cursor/Windsurf:</span>
Name:    visora
Type:    command
Command: node
Args:    /absolute/path/to/VISORA/packages/mcp-server/dist/index.js
Env:     VISORA_PROJECT_ROOT=/absolute/path/to/VISORA
              </code>
            </pre>
          </div>
          <p className="step-footer">
            Queue instructions in the browser, then tell your IDE chat: <strong>"Process my Visora queue"</strong>.
          </p>
        </div>

        {/* Live Project Installation Guide */}
        <div className="how-to-card">
          <div className="how-to-step">
            <span className="step-number">02</span>
            <h3>Install in your Live Project</h3>
          </div>
          <p>
            You can use Visora in your own live Vite/React projects by installing it from this local repository.
          </p>
          <div className="code-block">
            <pre>
              <code>
<span className="code-comment"># 1. Install the Vite Plugin</span>
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
      </div>
    </section>
  );
}
