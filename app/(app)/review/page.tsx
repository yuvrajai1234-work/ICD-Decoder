"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [modifyingId, setModifyingId] = useState<string | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [customCode, setCustomCode] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const showToast = (message: string, type: string = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch the logged-in user's name to use as reviewer
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name =
          user.user_metadata?.username ||
          user.user_metadata?.display_name ||
          user.email?.split("@")[0] ||
          "Dr. Reviewer";
        setReviewerName(name);
      }
    };
    fetchUser();
  }, []);

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

  // APPROVE: Keep only the highest-confidence code
  const handleApprove = async (item: ReviewItem) => {
    const sorted = [...item.predictions].sort((a, b) => b.confidence - a.confidence);
    const topCode = sorted[0];
    const removedCodes = sorted.slice(1).map((p) => p.code);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction_id: item.id,
          action: "approve",
          reviewer: reviewerName,
          changes: [`Approved highest-confidence code: ${topCode.code} (${(topCode.confidence * 100).toFixed(1)}%)`],
          removed_codes: removedCodes,
        }),
      });

      if (res.ok) {
        showToast(
          `Approved: ${topCode.code} — ${topCode.description} (${(topCode.confidence * 100).toFixed(1)}%)`,
          "success"
        );
        fetchData();
      } else {
        showToast("Failed to submit approval", "error");
      }
    } catch {
      showToast("Failed to connect to server", "error");
    }
  };

  // REJECT: Reject the entire prediction
  const handleReject = async (item: ReviewItem) => {
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction_id: item.id,
          action: "reject",
          reviewer: reviewerName,
          changes: [`Rejected entire prediction with ${item.predictions.length} codes`],
          removed_codes: item.predictions.map((p) => p.code),
        }),
      });

      if (res.ok) {
        showToast(
          `Rejected prediction #${item.id} — all ${item.predictions.length} codes removed`,
          "success"
        );
        fetchData();
      } else {
        showToast("Failed to submit rejection", "error");
      }
    } catch {
      showToast("Failed to connect to server", "error");
    }
  };

  // MODIFY: Open the code selection UI
  const openModify = (item: ReviewItem) => {
    setModifyingId(item.id);
    setSelectedCodes(new Set());
    setCustomCode("");
    setCustomDesc("");
  };

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleModifySubmit = async (item: ReviewItem) => {
    const keptCodes = item.predictions.filter((p) => selectedCodes.has(p.code));
    const removedCodes = item.predictions
      .filter((p) => !selectedCodes.has(p.code))
      .map((p) => p.code);

    // Add custom code if provided
    const addedCodes: { code: string; description: string }[] = [];
    if (customCode.trim()) {
      addedCodes.push({
        code: customCode.trim().toUpperCase(),
        description: customDesc.trim() || "Manually added",
      });
    }

    if (keptCodes.length === 0 && addedCodes.length === 0) {
      showToast("Select at least one code or add a custom one", "error");
      return;
    }

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction_id: item.id,
          action: "modify",
          reviewer: reviewerName,
          changes: [
            `Kept ${keptCodes.length} codes, removed ${removedCodes.length}`,
            ...(addedCodes.length > 0
              ? [`Added custom code: ${addedCodes[0].code}`]
              : []),
          ],
          removed_codes: removedCodes,
          added_codes: addedCodes,
        }),
      });

      if (res.ok) {
        const kept = keptCodes.map((p) => p.code).join(", ");
        const added = addedCodes.map((c) => c.code).join(", ");
        showToast(
          `Modified: kept [${kept}]${added ? ` + added [${added}]` : ""} — saved to audit log`,
          "success"
        );
        setModifyingId(null);
        fetchData();
      } else {
        showToast("Failed to submit modification", "error");
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
          Manual <span className="gradient-text">Review</span>
        </h1>
        <p>
          Low-confidence predictions are routed here for expert validation.
          High-confidence predictions (≥85%) are auto-approved and skip this queue.
        </p>
      </div>

      {/* Confidence threshold info */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          padding: "16px 20px",
          background: "rgba(99, 102, 241, 0.06)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Actions:</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#4ade80", fontWeight: 600 }}>Approve</span>
            <span className="text-muted">→ Keeps only the highest-confidence code</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>Modify</span>
            <span className="text-muted">→ Pick specific codes or add your own</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#f87171", fontWeight: 600 }}>Reject</span>
            <span className="text-muted">→ Discards the entire prediction</span>
          </span>
        </div>
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
            <div className="stat-label">Manually Reviewed</div>
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

      {/* Reviewer Identity */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Reviewing as:</span>
          <span style={{ fontWeight: 600, color: "var(--accent-purple)" }}>{reviewerName}</span>
          <span className="text-xs text-muted">(from your account)</span>
        </div>
      </div>

      {/* Review Queue */}
      {queue.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>Review Queue Empty</h3>
          <p>
            All predictions have been reviewed or auto-approved. New low-confidence
            predictions requiring manual review will appear here automatically.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--accent-amber)" }}>⏳</span>
            {queue.length} Prediction{queue.length !== 1 ? "s" : ""} Pending Manual Review
          </h2>

          {queue.map((item) => {
            const isModifying = modifyingId === item.id;
            const sortedPreds = [...item.predictions].sort((a, b) => b.confidence - a.confidence);
            const topPred = sortedPreds[0];

            return (
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
                    {item.routing === "human_review" ? "⊘ Full Manual Review Required" : "⚠ Partial Review Needed"}
                  </span>
                </div>

                <div className="review-text-preview">{item.text_preview}</div>

                {/* Show predicted codes */}
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>
                    PREDICTED CODES ({item.predictions.length}):
                  </div>

                  {!isModifying ? (
                    /* Normal view */
                    <div className="review-codes">
                      {sortedPreds.map((pred, idx) => (
                        <div
                          key={pred.code}
                          style={{
                            padding: "8px 12px",
                            background:
                              idx === 0
                                ? "rgba(34, 197, 94, 0.08)"
                                : pred.confidence >= 0.6
                                  ? "rgba(251, 191, 36, 0.06)"
                                  : "rgba(248, 113, 113, 0.06)",
                            border: `1px solid ${
                              idx === 0
                                ? "rgba(34, 197, 94, 0.2)"
                                : pred.confidence >= 0.6
                                  ? "rgba(251, 191, 36, 0.15)"
                                  : "rgba(248, 113, 113, 0.15)"
                            }`,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className={`confidence-value ${getConfidenceClass(pred.confidence)}`}
                            style={{ fontSize: "0.7rem", minWidth: "38px" }}
                          >
                            {(pred.confidence * 100).toFixed(0)}%
                          </span>
                          <span
                            className="text-mono"
                            style={{ fontWeight: 600, color: "var(--accent-cyan)", fontSize: "0.85rem" }}
                          >
                            {pred.code}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {pred.description}
                          </span>
                          {idx === 0 && (
                            <span
                              className="text-xs"
                              style={{
                                marginLeft: "auto",
                                color: "#4ade80",
                                fontWeight: 600,
                                background: "rgba(34, 197, 94, 0.1)",
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              ★ Highest Confidence
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Modify mode — checkboxes to pick codes */
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#a78bfa",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        Select the codes you want to keep:
                      </div>
                      {sortedPreds.map((pred) => (
                        <label
                          key={pred.code}
                          style={{
                            padding: "10px 14px",
                            background: selectedCodes.has(pred.code)
                              ? "rgba(99, 102, 241, 0.1)"
                              : "rgba(255, 255, 255, 0.02)",
                            border: `1px solid ${
                              selectedCodes.has(pred.code)
                                ? "rgba(99, 102, 241, 0.3)"
                                : "rgba(255, 255, 255, 0.06)"
                            }`,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCodes.has(pred.code)}
                            onChange={() => toggleCode(pred.code)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#6366f1",
                              cursor: "pointer",
                            }}
                          />
                          <span
                            className={`confidence-value ${getConfidenceClass(pred.confidence)}`}
                            style={{ fontSize: "0.7rem", minWidth: "38px" }}
                          >
                            {(pred.confidence * 100).toFixed(0)}%
                          </span>
                          <span
                            className="text-mono"
                            style={{ fontWeight: 600, color: "var(--accent-cyan)", fontSize: "0.85rem" }}
                          >
                            {pred.code}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {pred.description}
                          </span>
                        </label>
                      ))}

                      {/* Add custom code */}
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "12px 14px",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px dashed rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            marginBottom: "8px",
                          }}
                        >
                          ➕ Add a custom ICD-10 code:
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                            placeholder="e.g. I10"
                            className="clinical-textarea"
                            style={{
                              minHeight: "auto",
                              padding: "8px 12px",
                              width: "120px",
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.85rem",
                              textTransform: "uppercase",
                            }}
                          />
                          <input
                            type="text"
                            value={customDesc}
                            onChange={(e) => setCustomDesc(e.target.value)}
                            placeholder="Disease description"
                            className="clinical-textarea"
                            style={{
                              minHeight: "auto",
                              padding: "8px 12px",
                              flex: 1,
                              minWidth: "200px",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.85rem",
                            }}
                          />
                        </div>
                      </div>

                      {/* Modify action buttons */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setModifyingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleModifySubmit(item)}
                          disabled={selectedCodes.size === 0 && !customCode.trim()}
                        >
                          ✓ Confirm Selection ({selectedCodes.size + (customCode.trim() ? 1 : 0)} codes)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons (only when not in modify mode) */}
                {!isModifying && (
                  <div className="review-actions">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleReject(item)}
                      id={`reject-${item.id}`}
                    >
                      ✗ Reject All
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openModify(item)}
                      id={`modify-${item.id}`}
                      style={{ borderColor: "rgba(167, 139, 250, 0.3)", color: "#a78bfa" }}
                    >
                      ✏ Modify — Pick Codes
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(item)}
                      id={`approve-${item.id}`}
                      title={`Will approve: ${topPred.code} (${(topPred.confidence * 100).toFixed(1)}%)`}
                    >
                      ✓ Approve Top Code ({topPred.code})
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
