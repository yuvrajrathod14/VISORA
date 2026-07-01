import { useState } from 'react';

const CodeBlock = ({ code, comment }: { code: string; comment?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modern-code-block">
      <div className="code-header">
        <span className="code-dot red"></span>
        <span className="code-dot yellow"></span>
        <span className="code-dot green"></span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? 'Copied! ✓' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>
          {comment && <span className="code-comment"># {comment}</span>}
          {comment && '\n'}
          {code}
        </code>
      </pre>
    </div>
  );
};

export default function HowToUse() {
  const [activeTab, setActiveTab] = useState<'install' | 'cli' | 'mcp'>('install');

  return (
    <section className="how-to-use" id="docs">
      <div className="how-to-header">
        <h2>Quick Start Guide</h2>
        <p>Get up and running with Visora in under 60 seconds.</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'install' ? 'active' : ''}`}
            onClick={() => setActiveTab('install')}
          >
            Installation
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cli' ? 'active' : ''}`}
            onClick={() => setActiveTab('cli')}
          >
            CLI Reference
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mcp' ? 'active' : ''}`}
            onClick={() => setActiveTab('mcp')}
          >
            IDE Setup (MCP)
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'install' && (
            <div className="tab-pane fade-in">
              <h3>Install Visora in your Next.js or Vite app</h3>
              <p>Run our automated setup script in the root of your existing project. It will detect your framework and configure everything.</p>
              
              <CodeBlock 
                comment="Initialize Visora automatically"
                code="npx visora-cli init" 
              />
              
              <p style={{ marginTop: '24px' }}>Once installed, start the autonomous daemon in a separate terminal:</p>
              
              <CodeBlock 
                comment="Run the AI Daemon (Will ask for your API key on first run)"
                code="npx visora-cli" 
              />
              
              <div className="pro-tip">
                <strong>💡 Pro Tip:</strong> Keep the daemon running in the background while you code. When you Alt+Click a UI component in the browser, the daemon instantly writes the patch!
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="tab-pane fade-in">
              <h3>Visora CLI Commands</h3>
              <p>The daemon comes with built-in tools for managing queues, API keys, and workspace status.</p>
              
              <div className="cli-grid">
                <div className="cli-item">
                  <CodeBlock code="npx visora-cli" />
                  <span>Start the background daemon</span>
                </div>
                <div className="cli-item">
                  <CodeBlock code="npx visora-cli --config" />
                  <span>Re-configure your AI provider</span>
                </div>
                <div className="cli-item">
                  <CodeBlock code="npx visora-cli --status" />
                  <span>View workspace queue status</span>
                </div>
                <div className="cli-item">
                  <CodeBlock code="npx visora-cli --clear" />
                  <span>Clear completed/failed tasks</span>
                </div>
                <div className="cli-item">
                  <CodeBlock code="npx visora-cli --undo" />
                  <span>Undo the last successful AI patch</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mcp' && (
            <div className="tab-pane fade-in">
              <h3>Cursor & Windsurf Integration</h3>
              <p>If you prefer using your IDE's built-in AI chat, you can connect Visora as an MCP (Model Context Protocol) Server.</p>
              
              <div className="mcp-config">
                <CodeBlock 
                  comment="Add this to your IDE's MCP settings:"
                  code={`Name:    visora\nType:    command\nCommand: npx\nArgs:    -y @visora/mcp-server`}
                />
              </div>

              <div className="pro-tip" style={{ marginTop: '24px' }}>
                <strong>🚀 Workflow:</strong> Queue instructions via Alt+Click in the browser, then tell your IDE chat: <em>"Process my Visora queue"</em>. The IDE will pull the perfect AST context directly from the browser!
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
