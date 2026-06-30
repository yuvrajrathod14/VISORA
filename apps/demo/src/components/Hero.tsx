export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        🔮 Introducing Visora v1
      </div>
      <h1>
        Edit UI by{' '}
        <span className="gradient-text">Clicking</span>,{' '}
        Not Describing
      </h1>
      <p className="hero-subtitle">
        The visual context engine for AI coding. Click any component in your
        running app, describe the change, and let AI do the rest — with full
        visual and code context.
      </p>
      <div className="hero-actions">
        <button className="btn-primary" id="hero-start-btn">
          🚀 Start Building
        </button>
        <button className="btn-secondary" id="hero-demo-btn">
          ▶ Watch Demo
        </button>
      </div>
    </section>
  );
}
