"use client";

import { useState, useRef } from "react";

const SAMPLE_TEXTS = [
  {
    label: "Discharge Summary — Heart Failure",
    text: `DISCHARGE SUMMARY
DIAGNOSIS: Acute systolic heart failure, hypertension, type 2 diabetes mellitus, atrial fibrillation.
HISTORY OF PRESENT ILLNESS: This 72-year-old male presented with progressive dyspnea and lower extremity edema over the past two weeks. He has a known history of coronary artery disease, hypertension, and atrial fibrillation. Echocardiogram showed ejection fraction of 30% with moderate mitral regurgitation. BNP was elevated at 1,850. The patient was treated with IV Lasix with good diuresis. Blood pressure was controlled with lisinopril and metoprolol. Chest x-ray showed bilateral pleural effusions and pulmonary edema. Patient was also noted to have chronic kidney disease stage 3. He was started on anticoagulation for atrial fibrillation. Hemoglobin A1c was 8.2 indicating poorly controlled diabetes.
MEDICATIONS ON DISCHARGE: Furosemide 40mg daily, Lisinopril 20mg daily, Metoprolol 50mg BID, Warfarin 5mg daily, Metformin 1000mg BID.
FOLLOW UP: Cardiology clinic in 2 weeks. Primary care in 1 week.`,
  },
  {
    label: "OP Note — Laparoscopic Cholecystectomy",
    text: `OPERATIVE REPORT
PREOPERATIVE DIAGNOSIS: Acute cholecystitis with cholelithiasis.
POSTOPERATIVE DIAGNOSIS: Acute cholecystitis with cholelithiasis.
PROCEDURE: Laparoscopic cholecystectomy.
ANESTHESIA: General endotracheal anesthesia.
INDICATION: 45-year-old female with right upper quadrant abdominal pain, nausea, and vomiting. Ultrasound revealed multiple gallstones with gallbladder wall thickening consistent with acute cholecystitis. Patient also has history of obesity, gastroesophageal reflux disease, and hypertension.
DESCRIPTION: The patient was placed in supine position. Abdomen was prepped and draped. Pneumoperitoneum established via Veress needle. Four trocars placed in standard positions. The gallbladder was identified with significant inflammation and adhesions to the omentum. Critical view of safety was obtained. Cystic duct and cystic artery were clipped and divided. Gallbladder removed from liver bed using electrocautery. Specimen placed in bag and removed. Hemostasis confirmed. No bile leak noted. Fascia closed. Patient tolerated procedure well.`,
  },
  {
    label: "Triage Log — Chest Pain",
    text: `EMERGENCY DEPARTMENT TRIAGE NOTE
CHIEF COMPLAINT: Chest pain and shortness of breath.
PATIENT: 58-year-old male presenting with sudden onset substernal chest pain radiating to the left arm accompanied by diaphoresis and nausea for the past 2 hours. History of hypertension, hyperlipidemia, type 2 diabetes, and family history of coronary artery disease. Patient is a current smoker. Pain is 8/10, crushing in nature. Vital signs: BP 165/95, HR 102, RR 22, SpO2 94% on room air, Temp 98.6. ECG shows ST elevation in leads II, III, aVF suggestive of acute inferior STEMI. Troponin I elevated at 2.4 ng/mL. Aspirin 325mg administered. Cardiology consulted for emergent cardiac catheterization. Patient also reports occasional episodes of syncope and has a history of deep venous thrombosis.`,
  },
];

interface EvidenceSpan {
  text: string;
  keyword: string;
  start: number;
  end: number;
}

interface Prediction {
  code: string;
  description: string;
  confidence: number;
  evidence_spans: EvidenceSpan[];
  source: string;
}

interface PredictionResult {
  predictions: Prediction[];
  routing: string;
  prediction_id: string;
  status: string;
  total_codes: number;
  high_confidence_count: number;
}

export default function HomePage() {
  const [clinicalText, setClinicalText] = useState("");
  const [docType, setDocType] = useState("discharge_summary");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [fhirModal, setFhirModal] = useState(false);
  const [fhirData, setFhirData] = useState<object | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePredict = async () => {
    if (!clinicalText.trim() || clinicalText.trim().length < 20) {
      setError("Please enter at least 20 characters of clinical text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clinicalText, document_type: docType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      setResult(data);
      showToast(
        `${data.predictions.length} ICD codes predicted — ${data.routing.replace("_", " ")}`,
        data.routing === "auto_approve" ? "success" : "info"
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to prediction service";
      setError(message);
      showToast("Prediction failed. Make sure the ML server is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setClinicalText(ev.target?.result as string);
      showToast(`Loaded: ${file.name}`, "success");
    };
    reader.readAsText(file);
  };

  const loadSample = (text: string) => {
    setClinicalText(text);
    setResult(null);
    setError("");
  };

  const getConfidenceClass = (conf: number) => {
    if (conf >= 0.85) return "high";
    if (conf >= 0.60) return "medium";
    return "low";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.85) return "High";
    if (conf >= 0.60) return "Medium";
    return "Low";
  };

  const getRoutingBadge = (routing: string) => {
    switch (routing) {
      case "auto_approve":
        return { class: "auto-approve", label: "✓ Auto-Approved" };
      case "partial_review":
        return { class: "partial-review", label: "⚠ Partial Review" };
      case "human_review":
        return { class: "human-review", label: "⊘ Human Review Required" };
      default:
        return { class: "", label: routing };
    }
  };

  const exportFHIR = async () => {
    if (!result?.prediction_id) return;
    try {
      const res = await fetch(`/api/export/${result.prediction_id}`);
      const data = await res.json();
      setFhirData(data);
      setFhirModal(true);
    } catch {
      showToast("Failed to export FHIR data", "error");
    }
  };

  const downloadFHIR = () => {
    if (!fhirData) return;
    const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `icd-prediction-${result?.prediction_id}-fhir.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("FHIR JSON downloaded", "success");
  };

  const highlightEvidence = (text: string, keyword: string) => {
    const regex = new RegExp(`(${keyword})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  };

  return (
    <main className="main">
      <div className="page-header">
        <h1>
          Intelligent <span className="gradient-text">ICD-10</span> Decoder
        </h1>
        <p>
          Paste or upload clinical text — get AI-powered ICD code predictions
          with confidence scores and evidence highlighting.
        </p>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon" style={{ background: "rgba(59,130,246,0.12)", color: "var(--accent-blue)" }}>📄</div>
              Clinical Document Input
            </div>
            <div className="doc-type-selector">
              {[
                { value: "discharge_summary", label: "Discharge" },
                { value: "op_note", label: "OP Note" },
                { value: "triage_log", label: "Triage" },
                { value: "general", label: "General" },
              ].map((dt) => (
                <button
                  key={dt.value}
                  className={`doc-type-btn ${docType === dt.value ? "active" : ""}`}
                  onClick={() => setDocType(dt.value)}
                  id={`doc-type-${dt.value}`}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="textarea-wrapper">
            <textarea
              className="clinical-textarea"
              placeholder="Paste your discharge summary, operative note, or triage log here...&#x0a;&#x0a;Example: DISCHARGE SUMMARY — 72-year-old male with acute systolic heart failure..."
              value={clinicalText}
              onChange={(e) => setClinicalText(e.target.value)}
              id="clinical-text-input"
            />
          </div>

          <div className="textarea-footer">
            <span className="char-count">
              {clinicalText.length.toLocaleString()} characters
            </span>
            <div className="upload-zone">
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.doc,.docx,.pdf"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                id="file-upload-input"
              />
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                id="upload-file-btn"
              >
                📎 Upload File
              </button>
              {clinicalText && (
                <button
                  className="upload-btn"
                  onClick={() => { setClinicalText(""); setResult(null); setError(""); }}
                  id="clear-text-btn"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div className="action-bar">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className="text-xs text-muted">Try a sample:</span>
              {SAMPLE_TEXTS.map((s, i) => (
                <button
                  key={i}
                  className="btn btn-sm btn-secondary"
                  onClick={() => loadSample(s.text)}
                  id={`sample-btn-${i}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={handlePredict}
              disabled={loading || !clinicalText.trim()}
              id="predict-btn"
            >
              {loading ? (
                <>
                  <span className="loading-pulse">
                    <span></span><span></span><span></span>
                  </span>
                  Analyzing...
                </>
              ) : (
                <>🧠 Predict ICD Codes</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="card" style={{ borderColor: "rgba(244,63,94,0.3)", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-rose)" }}>
            <span style={{ fontSize: "1.3rem" }}>⚠</span>
            <div>
              <strong>Error</strong>
              <p className="text-sm" style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Analyzing clinical text with ML model...</div>
          <div className="text-xs text-muted">Processing through TF-IDF vectorizer and multi-label classifier</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="results-section">
          <div className="results-header">
            <h2>
              <span style={{ fontSize: "1.3rem" }}>🎯</span>
              Predicted ICD-10 Codes
            </h2>
            <div className="results-meta">
              <span className={`routing-badge ${getRoutingBadge(result.routing).class}`}>
                {getRoutingBadge(result.routing).label}
              </span>
              <button className="btn btn-sm btn-secondary" onClick={exportFHIR} id="export-fhir-btn">
                📦 FHIR Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-value">{result.predictions.length}</div>
              <div className="stat-label">Codes Found</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.high_confidence_count}</div>
              <div className="stat-label">High Confidence</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ background: result.routing === "auto_approve" ? "var(--gradient-success)" : "var(--gradient-warning)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {result.routing === "auto_approve" ? "Auto" : "Review"}
              </div>
              <div className="stat-label">Routing</div>
            </div>
            <div className="stat-card">
              <div className="stat-value text-mono">{result.prediction_id}</div>
              <div className="stat-label">Prediction ID</div>
            </div>
          </div>

          {/* Prediction Cards */}
          <div className="predictions-grid">
            {result.predictions.map((pred, idx) => (
              <div className="prediction-card" key={pred.code}>
                <div className="prediction-rank">{idx + 1}</div>
                <div className="prediction-info">
                  <div className="prediction-code">{pred.code}</div>
                  <div className="prediction-desc">{pred.description}</div>
                  {pred.evidence_spans?.length > 0 && (
                    <div className="prediction-evidence">
                      {pred.evidence_spans.map((span, si) => (
                        <div key={si} dangerouslySetInnerHTML={{
                          __html: `📌 ${highlightEvidence(span.text, span.keyword)}`
                        }} />
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted mt-1">
                    Source: {pred.source === "ml_model" ? "🤖 ML Model" : pred.source === "keyword_match" ? "🔑 Keyword" : "👤 Human"}
                  </div>
                </div>
                <div className="prediction-confidence">
                  <div className={`confidence-value ${getConfidenceClass(pred.confidence)}`}>
                    {(pred.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="confidence-bar">
                    <div
                      className={`confidence-bar-fill ${getConfidenceClass(pred.confidence)}`}
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                  <div className="confidence-label">{getConfidenceLabel(pred.confidence)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FHIR Export Modal */}
      {fhirModal && fhirData && (
        <div className="modal-overlay" onClick={() => setFhirModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📦 FHIR Bundle Export</div>
              <button className="modal-close" onClick={() => setFhirModal(false)}>✕</button>
            </div>
            <p className="text-sm text-muted mb-2">
              Structured HL7 FHIR R4 Bundle with Condition resources and Provenance for EHR integration.
            </p>
            <pre className="fhir-json">{JSON.stringify(fhirData, null, 2)}</pre>
            <div className="action-bar" style={{ marginTop: "1rem" }}>
              <button className="btn btn-sm btn-secondary" onClick={() => { navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2)); showToast("Copied to clipboard!", "success"); }}>
                📋 Copy JSON
              </button>
              <button className="btn btn-sm btn-primary" onClick={downloadFHIR}>
                ⬇ Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}</span>
          {toast.message}
        </div>
      )}
    </main>
  );
}
