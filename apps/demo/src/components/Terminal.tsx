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
    if (step > 0 && step < 6) {
      const timeout = setTimeout(() => setStep(s => s + 1), step === 1 ? 400 : 800);
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
        <div className="terminal-line">
          <span className="prompt">~/project $</span>
          <span className="command">{typedCommand}</span>
          {step === 0 && <span className="cursor"></span>}
        </div>
        
        {step >= 2 && (
          <div className="terminal-line output text-cyan">
            [Visora] 🔍 Detecting framework... Next.js (App Router)
          </div>
        )}
        
        {step >= 3 && (
          <div className="terminal-line output text-gray">
            [Visora] 📦 Installing visora-next-plugin and visora-cli via npm...
          </div>
        )}
        
        {step >= 4 && (
          <div className="terminal-line output text-gray">
            [Visora] ⚙️ Patching app/layout.tsx...
          </div>
        )}
        
        {step >= 5 && (
          <div className="terminal-line output text-green">
            [Visora] ✨ Successfully initialized Visora!
          </div>
        )}
        
        {step >= 6 && (
          <div className="terminal-line">
            <span className="prompt">~/project $</span>
            <span className="cursor blink"></span>
          </div>
        )}
      </div>
    </div>
  );
}
