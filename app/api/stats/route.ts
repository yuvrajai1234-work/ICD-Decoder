const ML_API = process.env.ML_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${ML_API}/api/stats`);
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      {
        total_predictions: 0,
        auto_approved: 0,
        human_reviewed: 0,
        pending_review: 0,
        automation_rate: 0,
        audit_entries: 0,
      },
      { status: 200 }
    );
  }
}
