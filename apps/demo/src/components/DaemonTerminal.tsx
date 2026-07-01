import { useState, useEffect } from 'react';

export default function DaemonTerminal() {
  const [step, setStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [typedKey, setTypedKey] = useState('');
  
  const fullCommand = 'npx visora';
  const fakeKey = '****************************************';

  useEffect(() => {
    if (step === 0) {
      if (typedCommand.length < fullCommand.length) {
        const timeout = setTimeout(() => {
          setTypedCommand(fullCommand.slice(0, typedCommand.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setStep(1), 600);
        return () => clearTimeout(timeout);
      }
    }
    
    if (step === 1) {
      // Show list for 2 seconds before selecting Anthropic
      const timeout = setTimeout(() => setStep(2), 2000);
      return () => clearTimeout(timeout);
    }

    if (step === 2) {
      // Prompt for API key, wait 1s before typing
      const timeout = setTimeout(() => setStep(3), 1000);
      return () => clearTimeout(timeout);
    }

    if (step === 3) {
      // Type API key
      if (typedKey.length < fakeKey.length) {
        const timeout = setTimeout(() => {
          setTypedKey(fakeKey.slice(0, typedKey.length + 1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setStep(4), 500);
        return () => clearTimeout(timeout);
      }
    }

    if (step === 4) {
      // Show success, wait 4 seconds, then loop
      const timeout = setTimeout(() => {
        setStep(0);
        setTypedCommand('');
        setTypedKey('');
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [step, typedCommand, typedKey]);

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
            
            {step === 1 && (
              <>
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
              </>
            )}

            {step >= 2 && (
              <>
                <div style={{ color: '#4ade80' }}>✔ <span style={{ color: '#fff', fontWeight: 'bold' }}>Select AI Provider:</span> <span style={{ color: '#d97757' }}>Anthropic (Claude 3.5 Sonnet)</span></div>
                
                {step === 2 && (
                  <div style={{ color: '#fff', fontWeight: 'bold', marginTop: '4px' }}>
                    ? Enter your Anthropic API Key (sk-ant-...): <span className="cursor blink"></span>
                  </div>
                )}
                
                {step >= 3 && (
                  <div style={{ color: '#fff', fontWeight: 'bold', marginTop: '4px' }}>
                    ? Enter your Anthropic API Key (sk-ant-...): <span style={{ color: '#888', fontWeight: 'normal' }}>{typedKey}</span>{(step === 3 || step === 4) && <span className="cursor blink"></span>}
                  </div>
                )}

                {step === 4 && (
                  <div style={{ marginTop: '16px', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ color: '#4ade80' }}>✔ Configuration saved to .env</div>
                    <div style={{ color: '#888' }}>──────────────────────────────────────────────────</div>
                    <br />
                    
                    {/* Tiny representation of the dashboard booting up */}
                    <div style={{ color: '#d97757', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      <pre style={{ margin: 0 }}>
{` _   _ _____ _____ ___________  ___ 
| | | |_   _/  ___|  _  | ___ \\/ _ \\
| | | | | | \\ \`--.| | | | |_/ / /_\\ \\
| | | | | |  \`--. \\ | | |    /|  _  |
\\ \\_/ /_| |_/\\__/ / \\_/ / |\\ \\| | | |
 \\___/ \\___/\\____/ \\___/\\_| \\_\\_| |_/`}
                      </pre>
                    </div>
                    <div style={{ color: '#888', marginTop: '8px' }}>  👀 Watching for instructions…</div>
                  </div>
                )}
              </>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
