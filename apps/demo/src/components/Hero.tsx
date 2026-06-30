export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="highlight">New</span> Introducing Visora v1.0
      </div>
      
      <h1>
        Edit UI by <span className="gradient-text">Clicking</span>,<br />
        Not Describing
      </h1>
      
      <p className="hero-subtitle">
        The visual context engine for AI coding. Click any component in your running
        app, describe the change, and let the autonomous agent handle the rest — with
        absolute pixel-perfect precision.
      </p>
      
      <div className="hero-actions">
        <button className="btn-primary" id="hero-start-btn">
          Start Building
        </button>
        <button className="btn-secondary" id="hero-demo-btn">
          Watch Demo
        </button>
      </div>
    </section>
  );
}
