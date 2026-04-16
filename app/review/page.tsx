"use client";

import { useState, useEffect, useCallback } from "react";

interface Prediction {
  code: string;
  description: string;
  confidence: number;
  source: string;
}

interface ReviewItem {
  id: string;
  timestamp: string;
  document_type: string;
  text_preview: string;
  predictions: Prediction[];
  routing: string;
  status: string;
  reviewer: string | null;
}

interface Stats {
  total_predictions: number;
  auto_approved: number;
  human_reviewed: number;
  pending_review: number;
  automation_rate: number;
  audit_entries: number;
}

export default function ReviewPage() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [reviewerName, setReviewerName] = useState("Dr. Reviewer");

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [reviewRes, statsRes] = await Promise.all([
        fetch("/api/review"),
        fetch("/api/stats"),
      ]);
      const reviewData = await reviewRes.json();
      const statsData = await statsRes.json();
      setQueue(reviewData.queue || []);
      setStats(statsData);
    } catch {
      console.error("Failed to fetch review data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleReview = async (predictionId: string, action: string) => {
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction_id: predictionId,
          action: action,
          reviewer: reviewerName,
          changes: [],
        }),
      });

      if (res.ok) {
        showToast(
          `Prediction ${predictionId} ${action}d successfully`,
          "success"
        );
        fetchData();
      } else {
        showToast("Failed to submit review", "error");
      }
    } catch {
      showToast("Failed to connect to server", "error");
    }
  };

  const getConfidenceClass = (conf: number) => {
    if (conf >= 0.85) return "high";
    if (conf >= 0.6) return "medium";
    return "low";
  };

  if (loading) {
    return (
      <main className="main">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading review queue...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <h1>
          Human-in-the-Loop <span className="gradient-text">Review</span>
        </h1>
        <p>
          Review low-confidence predictions. High-confidence cases are auto-approved;
          low-confidence cases are routed here for expert validation.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{stats.total_predictions}</div>
            <div className="stat-label">Total Predictions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ background: "var(--gradient-success)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {stats.auto_approved}
            </div>
            <div className="stat-label">Auto-Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ background: "var(--gradient-purple)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {stats.human_reviewed}
            </div>
            <div className="stat-label">Human Reviewed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ background: "var(--gradient-warning)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {stats.pending_review}
            </div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.automation_rate}%</div>
            <div className="stat-label">Automation Rate</div>
          </div>
        </div>
      )}

      {/* Reviewer Name */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Reviewing as:</span>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="clinical-textarea"
            style={{ minHeight: "auto", padding: "6px 12px", width: "250px", fontFamily: "var(--font-sans)", fontSize: "0.875rem" }}
            id="reviewer-name-input"
          />
        </div>
      </div>

      {/* Review Queue */}
      {queue.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>Review Queue Empty</h3>
          <p>
            All predictions have been reviewed or auto-approved. New predictions
            requiring review will appear here automatically.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--accent-amber)" }}>⏳</span>
            {queue.length} Prediction{queue.length !== 1 ? "s" : ""} Pending Review
          </h2>

          {queue.map((item) => (
            <div className="review-card" key={item.id}>
              <div className="review-card-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span className="review-id">#{item.id}</span>
                    <span className="text-xs text-muted">
                      {item.document_type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`routing-badge ${item.routing === "human_review" ? "human-review" : "partial-review"}`}>
                  {item.routing === "human_review" ? "Needs Full Review" : "Partial Review"}
                </span>
              </div>

              <div className="review-text-preview">{item.text_preview}</div>

              <div className="review-codes">
                {item.predictions.map((pred) => (
                  <span className="review-code-chip" key={pred.code}>
                    <span className={`confidence-value ${getConfidenceClass(pred.confidence)}`} style={{ fontSize: "0.7rem" }}>
                      {(pred.confidence * 100).toFixed(0)}%
                    </span>
                    {pred.code}
                    <span className="text-xs text-muted">{pred.description.slice(0, 40)}...</span>
                  </span>
                ))}
              </div>

              <div className="review-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleReview(item.id, "reject")}
                  id={`reject-${item.id}`}
                >
                  ✗ Reject
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleReview(item.id, "modify")}
                  id={`modify-${item.id}`}
                >
                  ✏ Modify
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleReview(item.id, "approve")}
                  id={`approve-${item.id}`}
                >
                  ✓ Approve
                </button>
              </div>
            </div>
          ))}
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
