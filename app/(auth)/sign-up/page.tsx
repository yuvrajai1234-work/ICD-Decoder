"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const username = (formData.get("username") as string).trim();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (!username || username.length < 2) {
      setError("Username must be at least 2 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // If Supabase has email confirmation disabled, redirect immediately
    setTimeout(() => {
      router.push("/predict");
      router.refresh();
    }, 2000);
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>
              We&apos;ve sent a confirmation link to your email address.
              Click the link to activate your account.
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
            ✅ Account created successfully! If email confirmation is disabled, you&apos;ll be redirected shortly.
          </div>
          <div className="auth-footer" style={{ marginTop: "1.5rem" }}>
            Already confirmed? <Link href="/sign-in">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join the future of clinical text decoding</p>
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
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">👤</span>
              <input
                type="text"
                id="username"
                name="username"
                className="auth-input"
                placeholder="Dr. Smith"
                required
                minLength={2}
              />
            </div>
          </div>

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

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="auth-input"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "👓" : "🕶"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">🔐</span>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                name="confirm-password"
                className="auth-input"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? <span className="loading-spinner-sm"></span> : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
