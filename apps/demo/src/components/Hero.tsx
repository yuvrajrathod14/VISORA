export default function Hero() {
  return (
    <section className="hero perspective-container">
      {/* 3D Background Elements */}
      <div className="hero-orb-1 float-3d"></div>
      <div className="hero-orb-2 float-3d float-3d-delay-1"></div>
      <div className="geo-cube geo-cube-1 float-3d float-3d-delay-2"></div>
      <div className="geo-cube geo-cube-2 float-3d"></div>

      <div className="hero-badge entrance-3d">
        <span className="highlight">New</span> Introducing Visora v1.0
      </div>

      <h1 className='clickable-text entrance-3d entrance-delay-1' onClick={() => alert('Text clicked!')}>
        Edit UI by <span className="text-gradient">Clicking</span>,<br /> Not Describing
      </h1>

      <p className="hero-subtitle entrance-3d entrance-delay-2">
        The visual context engine for AI coding. Click any component in your running
        app, describe the change, and let the autonomous agent handle the rest — with
        absolute pixel-perfect precision.
      </p>

      <div className="hero-actions entrance-3d entrance-delay-3">
        <button className="btn-primary" id="hero-start-btn" onClick={() => console.log('Button clicked!')}>
          Start Building
        </button>
        <button className="btn-secondary" id="hero-demo-btn">
          Watch Demo
        </button>
      </div>
    </section>
  );
}
