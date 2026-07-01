import { useState, useEffect } from 'react';

export default function DaemonTerminal() {
  const [step, setStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  
  const fullCommand = 'npx visora';

  useEffect(() => {
    if (step === 0) {
      if (typedCommand.length < fullCommand.length) {
        const timeout = setTimeout(() => {
          setTypedCommand(fullCommand.slice(0, typedCommand.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setStep(1), 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [step, typedCommand]);

  return (
    <div className="terminal-container" style={{ marginTop: '1rem', marginBottom: '1rem', width: '100%', maxWidth: '800px', margin: '1rem auto' }}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <div className="terminal-btn close"></div>
          <div className="terminal-btn minimize"></div>
          <div className="terminal-btn maximize"></div>
        </div>
        <div className="terminal-title">bash - visora</div>
      </div>
      
      <div className="terminal-body" style={{ minHeight: '380px' }}>
        <div className="command-line">
          <span className="prompt">~/project $</span>
          <span className="command">{typedCommand}</span>
          {step === 0 && <span className="cursor blink"></span>}
        </div>

        {step >= 1 && (
          <div className="terminal-output" style={{ marginTop: '16px', lineHeight: '1.5' }}>
            <div style={{ color: '#888' }}>◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]</div>
            <br />
            <div style={{ color: '#d97757', fontWeight: 'bold' }}>Visora Autonomous Agent Setup</div>
            <div style={{ color: '#888' }}>──────────────────────────────────────────────────</div>
            <div style={{ color: '#fff' }}>It looks like this is your first time running Visora!</div>
            <div style={{ color: '#888' }}>To let the daemon write code for you, you need to configure an AI provider.</div>
            <br />
            <div style={{ color: '#fff', fontWeight: 'bold' }}>? Select AI Provider: <span style={{ color: '#888', fontWeight: 'normal' }}>(Type number or arrow keys)</span></div>
            <div style={{ color: '#d97757', marginLeft: '12px' }}>❯ 1) Anthropic (Claude 3.5 Sonnet)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  2) OpenAI (GPT-4o)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  3) Google Gemini (1.5 Pro)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  4) Ollama (Local Models)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  5) OpenRouter (Multi-model Aggregator)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  6) DeepSeek (V3 / R1 Coder)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  7) NVIDIA NIM (Nemotron Models)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  8) Groq (Ultra-fast Llama 3)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  9) LM Studio (Local Desktop Server)</div>
            <div style={{ color: '#888', marginLeft: '12px' }}>  10) Custom OpenAI-Compatible Endpoint</div>
            
            <div className="command-line" style={{ marginTop: '12px' }}>
              <span className="cursor blink"></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
