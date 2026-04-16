const ML_API = process.env.ML_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${ML_API}/api/review`);
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { queue: [], total: 0, approved_total: 0, error: "ML service unavailable" },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prediction_id, ...rest } = body;

    const res = await fetch(`${ML_API}/api/review/${prediction_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { error: "Failed to submit review" },
      { status: 503 }
    );
  }
}
