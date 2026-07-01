export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header-logo">
        <div className="header-logo-icon">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Outer Hexagon / Lens */}
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" opacity="0.3" stroke="currentColor" />
            {/* The V / Vision Core */}
            <path d="M10 12L16 22L22 12" stroke="white" strokeWidth="3" />
            {/* Top Node */}
            <circle cx="16" cy="7" r="1.5" fill="white" stroke="none" />
          </svg>
        </div>
        <span className="header-logo-text">Visora</span>
      </a>
      
      <ul className="header-nav">
        <li><a href="#features">Features</a></li>
        <li><a href="#docs">Documentation</a></li>
      </ul>

      <button className="header-cta" id="header-cta-btn" onClick={() => window.location.href='#docs'}>
        Install Now
      </button>
    </header>
  );
}
