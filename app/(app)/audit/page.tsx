"use client";

import { useState, useEffect, useCallback } from "react";

interface CodeDetail {
  code: string;
  description: string;
  confidence: number;
}

interface AuditEntry {
  id: string;
  prediction_id: string;
  action: string;
  timestamp: string;
  routing: string;
  codes: string[];
  code_details?: CodeDetail[];
  user: string;
  details: string;
}

export default function AuditPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      setAuditLog(data.log || []);
    } catch {
      console.error("Failed to fetch audit log");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 15000);
    return () => clearInterval(interval);
  }, [fetchAudit]);

  const filteredLog = auditLog.filter((entry) => {
    if (filter === "all") return true;
    if (filter === "predictions") return entry.action === "prediction_created";
    if (filter === "reviews") return entry.action.startsWith("review_");
    return true;
  });

  const getActionStyle = (action: string) => {
    if (action === "prediction_created") return "created";
    if (action.includes("approve")) return "approved";
    if (action.includes("reject")) return "rejected";
    return "reviewed";
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "prediction_created":
        return "🤖 Prediction Created";
      case "review_approve":
        return "✓ Approved (Manual Review)";
      case "review_reject":
        return "✗ Rejected (Manual Review)";
      case "review_modify":
        return "✏ Modified (Manual Review)";
      default:
        return action;
    }
  };

  const getRoutingLabel = (entry: AuditEntry) => {
    if (entry.action === "prediction_created") {
      if (entry.routing === "auto_approve") {
        return { label: "✓ Auto-Approved (High Confidence)", class: "auto-approve" };
      }
      if (entry.routing === "human_review") {
        return { label: "⊘ Sent to Manual Review (Low Confidence)", class: "human-review" };
      }
      return { label: "⚠ Partial Review Required", class: "partial-review" };
    }
    return { label: "📋 Reviewed", class: "reviewed" };
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
          <div className="loading-text">Loading audit log...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <h1>
          Audit-Ready <span className="gradient-text">Activity Log</span>
        </h1>
        <p>
          Complete trail of all predictions, evidence, and reviewer changes —
          fully traceable and compliance-ready. High-confidence predictions are
          auto-approved; low-confidence ones require manual review before
          appearing here.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div className="tabs">
          {[
            { value: "all", label: "All Activity" },
            { value: "predictions", label: "Predictions" },
            { value: "reviews", label: "Manual Reviews" },
          ].map((f) => (
            <button
              key={f.value}
              className={`tab ${filter === f.value ? "active" : ""}`}
              onClick={() => setFilter(f.value)}
              id={`filter-${f.value}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted">
          {filteredLog.length} entries
        </div>
      </div>

      {/* Log */}
      {filteredLog.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Audit Entries</h3>
          <p>
            Activity will be logged here as predictions are created and reviewed.
            Go to the Predict page to generate ICD codes.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredLog.map((entry) => {
            const routingInfo = getRoutingLabel(entry);
            const isExpanded = expandedId === entry.id;

            return (
              <div
                className="card"
                key={entry.id}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isExpanded ? "1px solid rgba(99, 102, 241, 0.3)" : undefined,
                }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                    <span className="review-id">#{entry.prediction_id}</span>
                    <span className={`audit-action ${getActionStyle(entry.action)}`}>
                      {getActionLabel(entry.action)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`routing-badge ${routingInfo.class}`} style={{ fontSize: "0.7rem" }}>
                      {routingInfo.label}
                    </span>
                    <span className="text-mono text-xs text-muted">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <span style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Summary row - ICD codes */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                  {entry.codes.slice(0, 6).map((code) => {
                    const detail = entry.code_details?.find((d) => d.code === code);
                    return (
                      <span
                        key={code}
                        className="text-mono text-xs"
                        style={{
                          padding: "4px 10px",
                          background: "rgba(6, 182, 212, 0.08)",
                          borderRadius: "6px",
                          color: "var(--accent-cyan)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        title={detail?.description || ""}
                      >
                        {code}
                        {detail && (
                          <span className={`confidence-value ${getConfidenceClass(detail.confidence)}`} style={{ fontSize: "0.65rem" }}>
                            {(detail.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </span>
                    );
                  })}
                  {entry.codes.length > 6 && (
                    <span className="text-xs text-muted" style={{ padding: "4px 8px" }}>
                      +{entry.codes.length - 6} more
                    </span>
                  )}
                </div>

                {/* User + details summary */}
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>👤 {entry.user}</span>
                  <span>{entry.details}</span>
                </div>

                {/* Expanded: Full disease + ICD code table */}
                {isExpanded && entry.code_details && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>
                      Disease → ICD-10 Code Mapping
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table className="audit-table" style={{ fontSize: "0.8rem" }}>
                        <thead>
                          <tr>
                            <th>ICD-10 Code</th>
                            <th>Disease / Condition</th>
                            <th>Confidence</th>
                            <th>Review Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.code_details.map((detail) => (
                            <tr key={detail.code}>
                              <td>
                                <span className="text-mono" style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>
                                  {detail.code}
                                </span>
                              </td>
                              <td style={{ color: "var(--text-primary)" }}>
                                {detail.description}
                              </td>
                              <td>
                                <span className={`confidence-value ${getConfidenceClass(detail.confidence)}`} style={{ fontSize: "0.75rem" }}>
                                  {(detail.confidence * 100).toFixed(1)}%
                                </span>
                              </td>
                              <td>
                                {detail.confidence >= 0.85 ? (
                                  <span style={{ color: "#4ade80", fontSize: "0.75rem" }}>✓ Auto-Approved</span>
                                ) : entry.action.startsWith("review_") ? (
                                  <span style={{ color: "#a78bfa", fontSize: "0.75rem" }}>
                                    {entry.action === "review_approve" ? "✓ Manually Approved" :
                                     entry.action === "review_reject" ? "✗ Manually Rejected" :
                                     "✏ Manually Modified"}
                                  </span>
                                ) : (
                                  <span style={{ color: "#fbbf24", fontSize: "0.75rem" }}>⏳ Pending Review</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Expanded: Fallback for old entries without code_details */}
                {isExpanded && !entry.code_details && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {entry.codes.map((code) => (
                        <span key={code} className="text-mono text-xs" style={{ padding: "4px 10px", background: "rgba(6, 182, 212, 0.08)", borderRadius: "6px", color: "var(--accent-cyan)" }}>
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
