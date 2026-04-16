"use client";

import { useState, useEffect, useCallback } from "react";

interface AuditEntry {
  id: string;
  prediction_id: string;
  action: string;
  timestamp: string;
  routing: string;
  codes: string[];
  user: string;
  details: string;
}

export default function AuditPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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
    return "reviewed";
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "prediction_created":
        return "🤖 Prediction Created";
      case "review_approve":
        return "✓ Approved";
      case "review_reject":
        return "✗ Rejected";
      case "review_modify":
        return "✏ Modified";
      default:
        return action;
    }
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
          Complete trail of all predictions, evidence, and reviewer changes — fully traceable and compliance-ready.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div className="tabs">
          {[
            { value: "all", label: "All Activity" },
            { value: "predictions", label: "Predictions" },
            { value: "reviews", label: "Reviews" },
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

      {/* Log Table */}
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
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Prediction ID</th>
                  <th>ICD Codes</th>
                  <th>User</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((entry) => (
                  <tr key={entry.id}>
                    <td className="text-mono text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`audit-action ${getActionStyle(entry.action)}`}>
                        {getActionLabel(entry.action)}
                      </span>
                    </td>
                    <td>
                      <span className="review-id">#{entry.prediction_id}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "300px" }}>
                        {entry.codes.slice(0, 5).map((code) => (
                          <span
                            key={code}
                            className="text-mono text-xs"
                            style={{
                              padding: "2px 8px",
                              background: "rgba(6, 182, 212, 0.08)",
                              borderRadius: "4px",
                              color: "var(--accent-cyan)",
                            }}
                          >
                            {code}
                          </span>
                        ))}
                        {entry.codes.length > 5 && (
                          <span className="text-xs text-muted">
                            +{entry.codes.length - 5} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-sm">{entry.user}</td>
                    <td className="text-sm text-muted" style={{ maxWidth: "200px" }}>
                      {entry.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
