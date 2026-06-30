export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header-logo">
        <div className="header-logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="header-logo-text">Visora</span>
      </a>
      
      <ul className="header-nav">
        <li><a href="#features">Features</a></li>
        <li><a href="#docs">Documentation</a></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>

      <button className="header-cta" id="header-cta-btn">
        Install Now
      </button>
    </header>
  );
}
