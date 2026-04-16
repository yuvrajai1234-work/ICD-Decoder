"use client";

import { signOut } from "@/app/actions/auth";

export function SignOutButton({ email }: { email?: string }) {
  return (
    <button
      onClick={() => signOut()}
      className="nav-link"
      style={{
        background: "none",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        borderRadius: "8px",
        padding: "6px 14px",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "rgba(255, 255, 255, 0.7)",
        transition: "all 0.2s ease",
      }}
      title={email ? `Signed in as ${email}` : "Sign out"}
    >
      🚪 Sign Out
    </button>
  );
}
