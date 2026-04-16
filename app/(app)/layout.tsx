import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/predict" className="nav-brand">
            <div className="nav-brand-icon">⚕</div>
            <div className="nav-brand-text">
              ICD <span>Decoder</span>
            </div>
          </Link>
          <div className="nav-links">
            <Link href="/predict" className="nav-link" id="nav-predict">
              🔍 Predict
            </Link>
            <Link href="/review" className="nav-link" id="nav-review">
              👁 Review
              <span className="badge" id="review-badge"></span>
            </Link>
            <Link href="/audit" className="nav-link" id="nav-audit">
              📋 Audit Log
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
