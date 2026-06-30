export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features-header">
        <h2>Built for Agentic Coding</h2>
        <p>Visora gives your AI coding assistant the visual awareness it needs to make flawless frontend changes.</p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card tilt-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h3>Visual Selection</h3>
          <p>
            Hover and click any component in your running React app. Visora highlights it instantly with source file and line info.
          </p>
        </div>
        
        <div className="feature-card tilt-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3>Deep AST Context</h3>
          <p>
            Automatically extracts React Fiber properties, component state, parent/child hierarchy, and Tailwind classes.
          </p>
        </div>
        
        <div className="feature-card tilt-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m13 2-2 2.5-4-1 3 5-5 3.5 6 1.5 1 5 4-4.5 5 1-1.5-6.5 4-3-6-1.5z"/>
            </svg>
          </div>
          <h3>Multi-Action Queue</h3>
          <p>
            Queue up dozens of UI modifications rapidly. The background daemon processes them autonomously via AI.
          </p>
        </div>
      </div>
    </section>
  );
}
