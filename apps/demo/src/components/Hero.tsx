export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="highlight">New</span> Introducing Visora v1.0
      </div>
      
      <h1>YUVRAJ RATHOD</h1>
      
      <p className="hero-subtitle">
        The visual context engine for AI coding. Click any component in your running
        app, describe the change, and let the autonomous agent handle the rest — with
        absolute pixel-perfect precision.
      </p>
      
      <div className="hero-actions">
        <button className="btn-primary" id="hero-start-btn" onClick={() => console.log('Button clicked!')}>
          <span className="animate-bounce">Start Building</span>
        </button>
        <button className="btn-secondary" id="hero-demo-btn">
          Watch Demo
        </button>
      </div>
    </section>
  );
}
