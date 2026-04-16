"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/predict`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>
              We&apos;ve sent a password reset link to your email address.
              Click the link to set a new password.
            </p>
          </div>
          <div
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "8px",
              padding: "16px",
              color: "#4ade80",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          >
            ✅ Password reset email sent! Check your inbox and spam folder.
          </div>
          <div className="auth-footer" style={{ marginTop: "1.5rem" }}>
            Remember your password? <Link href="/sign-in">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "1rem",
              color: "#f87171",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">✉</span>
              <input
                type="email"
                id="email"
                name="email"
                className="auth-input"
                placeholder="doctor@hospital.org"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner-sm"></span> : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-footer">
          Remember your password? <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
