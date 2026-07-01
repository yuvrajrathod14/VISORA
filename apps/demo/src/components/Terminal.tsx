import { useState, useEffect } from 'react';

export default function Terminal() {
  const [step, setStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  
  const fullCommand = 'npx visora-cli';

  useEffect(() => {
    // 1. Typing animation
    if (step === 0) {
      if (typedCommand.length < fullCommand.length) {
        const timeout = setTimeout(() => {
          setTypedCommand(fullCommand.slice(0, typedCommand.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setStep(1), 400);
        return () => clearTimeout(timeout);
      }
    }
    
    // 2. Sequential output
    if (step > 0 && step < 6) {
      const delays = [0, 600, 800, 1000, 800, 800]; // Timing for each step
      const timeout = setTimeout(() => setStep(s => s + 1), delays[step] || 800);
      return () => clearTimeout(timeout);
    }
  }, [step, typedCommand]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="close"></span>
          <span className="minimize"></span>
          <span className="maximize"></span>
        </div>
        <div className="terminal-title">bash — yuvraj@visionatrix</div>
      </div>
      <div className="terminal-body" style={{ minHeight: '340px' }}>
        
        {/* Command Line */}
        <div className="terminal-line">
          <span className="prompt">~/project $</span>
          <span className="command">{typedCommand}</span>
          {step === 0 && <span className="cursor"></span>}
        </div>
        
        {/* Output Sequence */}
        {step >= 2 && (
          <div className="terminal-line output text-gray">
            ◇ injected env (2) from .env // tip: ⌘ multiple files {'{'} path: ['.env.local', '.env'] {'}'}
          </div>
        )}
        
        {step >= 3 && (
          <>
            <br/>
            <div className="terminal-line output text-cyan" style={{ fontWeight: 'bold' }}>
              Visora Configuration
            </div>
            <div className="terminal-line output text-gray">
              ──────────────────────────────────────────────────
            </div>
          </>
        )}
        
        {step >= 4 && (
          <div className="terminal-line output">
            Let's set up a new AI provider.
          </div>
        )}

        {step >= 5 && (
          <>
            <div className="terminal-line output" style={{ marginTop: '8px' }}>
              <span className="text-green" style={{ fontWeight: 'bold' }}>?</span> Which AI Provider would you like to use?
            </div>
            
            <div className="terminal-line output" style={{ marginTop: '4px' }}>
              <span className="text-cyan">❯ Anthropic (Recommended)</span>
            </div>
            <div className="terminal-line output" style={{ paddingLeft: '14px' }}>
              OpenAI
            </div>
            <div className="terminal-line output" style={{ paddingLeft: '14px' }}>
              Gemini
            </div>
            <div className="terminal-line output" style={{ paddingLeft: '14px' }}>
              Ollama (Local)
            </div>

            <br/>
            <div className="terminal-line output text-gray" style={{ fontStyle: 'italic' }}>
              Best for complex frontend coding tasks.
            </div>
            <div className="terminal-line output text-gray" style={{ fontSize: '12px', marginTop: '4px' }}>
              ↑↓ navigate • ⏎ select
            </div>
          </>
        )}
      </div>
    </div>
  );
}
