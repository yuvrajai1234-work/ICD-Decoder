"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/predict";
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join the future of clinical text decoding</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">✉</span>
              <input 
                type="email" 
                id="email" 
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
                className="auth-input" 
                placeholder="••••••••" 
                required 
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
                className="auth-input" 
                placeholder="••••••••" 
                required 
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
