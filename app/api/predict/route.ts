const ML_API = process.env.ML_API_URL || "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${ML_API}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { error: "Failed to connect to ML prediction service. Ensure the Python server is running on port 5000." },
      { status: 503 }
    );
  }
}
