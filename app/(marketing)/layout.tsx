import Link from "next/link";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="marketing-wrapper">
      <nav className="nav marketing-nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <div className="nav-brand-icon">⚕</div>
            <div className="nav-brand-text">
              ICD <span>Decoder</span>
            </div>
          </Link>
          <div className="nav-links" style={{ alignItems: "center" }}>
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How it Works</Link>
            <div style={{ width: "1px", height: "20px", background: "var(--border-secondary)", margin: "0 12px" }}></div>
            <Link href="/sign-in" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>Sign In</Link>
            <Link href="/sign-up" className="btn btn-primary btn-sm" style={{ textDecoration: "none", marginLeft: "8px" }}>Sign Up</Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="marketing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-brand-icon" style={{ width: "24px", height: "24px", fontSize: "12px" }}>⚕</div>
            ICD Decoder
          </div>
          <div className="footer-links">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">API Documentation</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
