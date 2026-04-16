import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-wrapper" style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}>
      <div className="aurora-bg">
        <div className="aurora-orb orb-1" style={{ opacity: 0.3 }}></div>
        <div className="aurora-orb orb-2" style={{ opacity: 0.3 }}></div>
        <div className="aurora-orb orb-3" style={{ opacity: 0.2 }}></div>
      </div>
      <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 10 }}>
        <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
          <div className="nav-brand-icon" style={{ width: "32px", height: "32px", fontSize: "14px" }}>⚕</div>
          <div className="nav-brand-text">
            ICD <span>Decoder</span>
          </div>
        </Link>
      </div>
      {children}
    </div>
  );
}
