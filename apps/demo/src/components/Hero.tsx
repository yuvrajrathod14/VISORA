import Terminal from './Terminal';

export default function Hero() {
  return (
    <section className="hero perspective-container">
      {/* 3D Background Elements */}
      <div className="hero-orb-1 float-3d"></div>
      <div className="hero-orb-2 float-3d float-3d-delay-1"></div>

      <div className="hero-badge entrance-3d">
        <span className="highlight">New</span> Introducing Visora v1.0
      </div>

      <h1 className='clickable-text entrance-3d entrance-delay-1' onClick={() => alert('Text clicked!')}>
        Edit UI by <span className="text-gradient">Clicking</span>,<br /> Not Describing
      </h1>

      <p className="hero-subtitle entrance-3d entrance-delay-2">
        The autonomous visual context engine for AI coding. Works natively with modern builders like Next.js and Vite. Features a powerful dual-engine architecture: run it autonomously via AI APIs (Anthropic/OpenAI) or integrate directly into next-gen IDEs like Cursor and Antigravity.
      </p>

      <div className="hero-actions entrance-3d entrance-delay-3">
        <button className="btn-primary" id="hero-start-btn" onClick={() => window.location.href='#docs'}>
          Start Building
        </button>
        <button className="btn-secondary" id="hero-demo-btn" onClick={() => window.location.href='https://github.com/yuvrajrathod14/VISORA'}>
          View on GitHub
        </button>
      </div>

      <div className="entrance-3d entrance-delay-3" style={{ width: '100%', marginTop: '40px' }}>
        <Terminal />
      </div>
    </section>
  );
}
