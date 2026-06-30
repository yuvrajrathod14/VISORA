export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header-logo">
        <div className="header-logo-icon">V</div>
        <span className="header-logo-text">Visora</span>
      </a>
      <nav>
        <ul className="header-nav">
          <li><a href="#features">Features</a></li>
          <li><a href="#docs">Docs</a></li>
          <li><a href="#github">GitHub</a></li>
        </ul>
      </nav>
      <button className="header-cta" id="header-get-started">
        Get Started
      </button>
    </header>
  );
}
