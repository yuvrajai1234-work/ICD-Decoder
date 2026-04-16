"use client";

import { useState, useEffect, useCallback } from "react";

interface PredictionEntry {
  id: string;
  prediction_id: string;
  clinical_text: string;
  document_type: string;
  predictions: {
    code: string;
    description: string;
    confidence: number;
    source: string;
  }[];
  routing: string;
  status: string;
  total_codes: number;
  high_confidence_count: number;
  created_at: string;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<PredictionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        showToast("Entry deleted", "success");
      } else {
        showToast("Failed to delete entry", "error");
      }
    } catch {
      showToast("Failed to delete entry", "error");
    }
  };

  const getConfidenceClass = (conf: number) => {
    if (conf >= 0.85) return "high";
    if (conf >= 0.6) return "medium";
    return "low";
  };

  const getRoutingBadge = (routing: string) => {
    switch (routing) {
      case "auto_approve":
        return { class: "auto-approve", label: "✓ Auto-Approved" };
      case "partial_review":
        return { class: "partial-review", label: "⚠ Partial Review" };
      case "human_review":
        return { class: "human-review", label: "⊘ Human Review" };
      default:
        return { class: "", label: routing };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <main className="main">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading prediction history...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <h1>
          Prediction <span className="gradient-text">History</span>
        </h1>
        <p>
          Browse your past ICD-10 predictions. All entries are saved to your
          account and synced across devices.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">Total Predictions</div>
        </div>
        <div className="stat-card">
          <div
            className="stat-value"
            style={{
              background: "var(--gradient-success)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {entries.filter((e) => e.routing === "auto_approve").length}
          </div>
          <div className="stat-label">Auto-Approved</div>
        </div>
        <div className="stat-card">
          <div
            className="stat-value"
            style={{
              background: "var(--gradient-warning)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {entries.filter((e) => e.routing !== "auto_approve").length}
          </div>
          <div className="stat-label">Needed Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {entries.reduce((sum, e) => sum + (e.total_codes || 0), 0)}
          </div>
          <div className="stat-label">Total Codes</div>
        </div>
      </div>

      {/* History List */}
      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>No Predictions Yet</h3>
          <p>
            Your prediction history will appear here once you start decoding
            clinical text. Go to the Predict page to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {entries.map((entry) => (
            <div
              className="card"
              key={entry.id}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                border:
                  expandedId === entry.id
                    ? "1px solid rgba(99, 102, 241, 0.3)"
                    : undefined,
              }}
              onClick={() =>
                setExpandedId(expandedId === entry.id ? null : entry.id)
              }
            >
              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    className="text-mono text-xs"
                    style={{
                      padding: "4px 10px",
                      background: "rgba(99, 102, 241, 0.1)",
                      borderRadius: "6px",
                      color: "var(--accent-purple)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    #{entry.prediction_id}
                  </span>
                  <span className="text-xs text-muted">
                    {entry.document_type.replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span className="text-xs text-muted">
                    {entry.total_codes} codes
                  </span>
                  <span
                    className={`routing-badge ${getRoutingBadge(entry.routing).class}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {getRoutingBadge(entry.routing).label}
                  </span>
                  <span
                    style={{
                      transform:
                        expandedId === entry.id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    ▼
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div
                className="text-sm text-muted"
                style={{
                  marginTop: "8px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {entry.clinical_text?.substring(0, 150)}...
              </div>

              {/* Expanded content */}
              {expandedId === entry.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: "16px" }}
                >
                  {/* Clinical text */}
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      marginBottom: "16px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      fontSize: "0.8rem",
                      lineHeight: 1.6,
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {entry.clinical_text}
                  </div>

                  {/* Predictions */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {entry.predictions?.map((pred) => (
                      <div
                        key={pred.code}
                        style={{
                          padding: "8px 14px",
                          background: "rgba(6, 182, 212, 0.06)",
                          border: "1px solid rgba(6, 182, 212, 0.12)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          className="text-mono"
                          style={{
                            fontWeight: 600,
                            color: "var(--accent-cyan)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {pred.code}
                        </span>
                        <span
                          className="text-xs text-muted"
                          style={{ maxWidth: "180px" }}
                        >
                          {pred.description}
                        </span>
                        <span
                          className={`confidence-value ${getConfidenceClass(pred.confidence)}`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {(pred.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(entry.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>
            {toast.type === "success"
              ? "✓"
              : toast.type === "error"
                ? "✗"
                : "ℹ"}
          </span>
          {toast.message}
        </div>
      )}
    </main>
  );
}
