import { useState, useEffect } from 'react';

export default function Terminal() {
  const [step, setStep] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  
  const fullCommand = 'npx visora-cli init';

  useEffect(() => {
    // 1. Typing animation
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
    
    // 2. Sequential output
    if (step > 0 && step < 7) {
      const delays = [0, 400, 800, 400, 400, 800, 800];
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
      <div className="terminal-body">
        
        {/* Command Line */}
        <div className="terminal-line">
          <span className="prompt">~/project $</span>
          <span className="command">{typedCommand}</span>
          {step === 0 && <span className="cursor"></span>}
        </div>
        
        {/* Output Sequence */}
        {step >= 2 && (
          <div className="terminal-line output text-gray">
            ◇ injected env (2) from .env // tip: ⌘ custom filepath {'{'} path: '/custom/path/.env' {'}'}
          </div>
        )}
        
        {step >= 3 && (
          <>
            <br/>
            <div className="terminal-line output text-green">
              ✔ Visora engines installed successfully.
            </div>
          </>
        )}
        
        {step >= 4 && (
          <div className="terminal-line output text-green">
            ✔ Framework patched successfully.
          </div>
        )}
        
        {step >= 5 && (
          <>
            <br/>
            <div className="terminal-line output text-cyan">
              ✨ Visora Initialization Complete!
            </div>
          </>
        )}

        {step >= 6 && (
          <>
            <br/>
            <div className="terminal-line output text-gray">
              Next steps:
            </div>
            <div className="terminal-line output text-gray" style={{ paddingLeft: '8px' }}>
              1. Start your dev server: npm run dev
            </div>
            <div className="terminal-line output text-gray" style={{ paddingLeft: '8px' }}>
              2. In a second terminal:  npx visora-cli
            </div>
          </>
        )}
        
        {/* Final Prompt */}
        {step >= 7 && (
          <div className="terminal-line" style={{ marginTop: '16px' }}>
            <span className="prompt">~/project $</span>
            <span className="cursor blink"></span>
          </div>
        )}
      </div>
    </div>
  );
}
