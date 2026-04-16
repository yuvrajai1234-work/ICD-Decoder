import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { GreetingBanner } from "./greeting-banner";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

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
            {user && <SignOutButton email={user.email} />}
          </div>
        </div>
      </nav>
      <GreetingBanner username={username} />
      {children}
    </>
  );
}
