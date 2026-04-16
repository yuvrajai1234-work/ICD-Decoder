"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main style={{ position: "relative", overflow: "hidden" }}>
      <div className="aurora-bg">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
        <div className="aurora-orb orb-3"></div>
      </div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge" style={{ opacity: mounted ? 1 : 0 }}>
          🚀 ICD-10 Prediction is now 10x faster
        </div>
        <h1 className="hero-title" style={{ opacity: mounted ? 1 : 0 }}>
          Decode Clinical Text with <span>Superhuman AI</span>
        </h1>
        <p className="hero-subtitle" style={{ opacity: mounted ? 1 : 0 }}>
          Transform unstructured discharge summaries, operative notes, and triage logs into highly accurate ICD-10 codes in seconds. Designed for clinicians, powered by cutting-edge neural networks.
        </p>
        <div className="hero-actions" style={{ opacity: mounted ? 1 : 0 }}>
          <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
            Start Decoding for Free
          </Link>
          <Link href="#how-it-works" className="btn btn-secondary btn-lg" style={{ textDecoration: "none" }}>
            See How It Works
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="marketing-section">
        <div className="section-header">
          <h2 className="section-title">Built for Medical Precision</h2>
          <p className="section-subtitle">
            Our platform doesn't just guess; it analyzes context, maps evidence, and integrates seamlessly into your clinical workflow.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">Context-Aware AI</h3>
            <p className="feature-description">
              Our models understand complex medical terminology, negation, and implicit diagnoses from unstructured narratives, outperforming traditional keyword matching.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Transparent Evidence</h3>
            <p className="feature-description">
              Every predicted ICD-10 code comes with highlighted text spans directly from your notes, ensuring auditors and coders can trace back every decision.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">Millisecond Processing</h3>
            <p className="feature-description">
              Process hundreds of pages of medical records in the blink of an eye. Say goodbye to backlogs and dramatically reduce manual coding overhead.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔀</div>
            <h3 className="feature-title">Smart Routing</h3>
            <p className="feature-description">
              Confidence scoring automatically routes high-probability codes for auto-approval, while flagging ambiguous cases for human-in-the-loop review.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3 className="feature-title">FHIR Native</h3>
            <p className="feature-description">
              Export predictions directly as standard HL7 FHIR R4 Bundles complete with Condition resources and Provenance, ready for EHR integration.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">Enterprise Security</h3>
            <p className="feature-description">
              Your data never leaves your control. Built with HIPAA-compliant architecture, zero-retention policies for text inputs, and end-to-end encryption.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="marketing-section" style={{ background: "rgba(10, 14, 26, 0.4)" }}>
        <div className="section-header">
          <h2 className="section-title">The Decoding Pipeline</h2>
          <p className="section-subtitle">
            A seamless three-step flow from raw text to structured billing codes.
          </p>
        </div>
        <div className="pipeline">
          <div className="pipeline-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="feature-title">Input Clinical Narrative</h3>
              <p className="feature-description">
                Paste your raw discharge summary, OP note, or triage log into the secure portal, or upload documents directly. Select the document type to prime the model.
              </p>
            </div>
          </div>
          <div className="pipeline-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="feature-title">AI Processing & Entity Linking</h3>
              <p className="feature-description">
                The TF-IDF vectorizer and multi-label classifier map complex clinical language to the standardized ICD-10 taxonomy, calculating confidence scores for every prediction.
              </p>
            </div>
          </div>
          <div className="pipeline-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="feature-title">Review & Export</h3>
              <p className="feature-description">
                Review the predictions visually with exact text-anchors. Approve the codes and instantly download a FHIR-compliant payload to send to your billing systems.
              </p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
            Create Your Account Today
          </Link>
        </div>
      </section>
    </main>
  );
}
