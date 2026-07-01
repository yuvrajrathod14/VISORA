import { useState, useEffect } from 'react';

export default function InitTerminal() {
  const [step, setStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  
  const fullCommand = 'npx visora-cli init';

  useEffect(() => {
    // 1. Typing animation
    if (step === 0) {
      if (typedCommand.length < fullCommand.length) {
        const timeout = setTimeout(() => {
          setTypedCommand(fullCommand.slice(0, typedCommand.length + 1));
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setStep(1), 400);
        return () => clearTimeout(timeout);
      }
    }
    
    // 2. Sequential output
    if (step > 0 && step < 6) {
      const delays = [0, 600, 800, 1200, 800, 800]; // Timing for each step
      const timeout = setTimeout(() => setStep(s => s + 1), delays[step] || 800);
      return () => clearTimeout(timeout);
    }

    // 3. Reset loop
    if (step >= 6) {
      const timeout = setTimeout(() => {
        setStep(0);
        setTypedCommand('');
      }, 5000); // Wait 5 seconds before restarting
      return () => clearTimeout(timeout);
    }
  }, [step, typedCommand]);

  return (
    <div className="terminal-container" style={{ margin: '24px 0' }}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="close"></span>
          <span className="minimize"></span>
          <span className="maximize"></span>
        </div>
        <div className="terminal-title">bash — yuvraj@visionatrix</div>
      </div>
      <div className="terminal-body" style={{ minHeight: '380px', fontSize: '13px' }}>
        
        {/* Command Line */}
        <div className="terminal-line">
          <span className="prompt">~/project $</span>
          <span className="command">{typedCommand}</span>
          {step === 0 && <span className="cursor"></span>}
        </div>
        
        {/* Output Sequence */}
        {step >= 2 && (
          <div className="terminal-line output text-gray" style={{ marginBottom: '16px' }}>
            ◇ injected env (2) from .env // tip: ⌘ custom filepath {'{'} path: '/custom/path/.env' {'}'}
          </div>
        )}
        
        {step >= 3 && (
          <div className="terminal-line output" style={{ color: '#d97757', fontWeight: 'bold', whiteSpace: 'pre', lineHeight: '1.2' }}>
{` _   _ _____ _____ ___________  ___ 
| | | |_   _/  ___|  _  | ___ \\/ _ \\
| | | | | | \\ \`--.| | | | |_/ / /_\\ \\
| | | | | |  \`--. \\ | | |    /|  _  |
\\ \\_/ /_| |_/\\__/ / \\_/ / |\\ \\| | | |
 \\___/ \\___/\\____/ \\___/\\_| \\_\\_| |_/`}
          </div>
        )}
        
        {step >= 4 && (
          <>
            <div className="terminal-line output text-gray" style={{ marginTop: '16px', marginBottom: '16px' }}>
              Automated Setup Script by Visionatrix
            </div>
            
            <div className="terminal-line output">
              <span className="text-green">✔</span> Visora engines installed successfully.
            </div>
            <div className="terminal-line output">
              <span className="text-green">✔</span> Framework patched successfully.
            </div>
          </>
        )}

        {step >= 5 && (
          <>
            <div className="terminal-line output text-green" style={{ marginTop: '16px', fontWeight: 'bold' }}>
              ✨ Visora Initialization Complete!
            </div>
            
            <div className="terminal-line output" style={{ marginTop: '16px' }}>
              Next steps:
            </div>
            <div className="terminal-line output text-gray">
              1. Start your dev server: <span style={{ color: '#fff' }}>npm run dev</span>
            </div>
            <div className="terminal-line output text-gray">
              2. In a second terminal:  <span style={{ color: '#fff' }}>npx visora</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
