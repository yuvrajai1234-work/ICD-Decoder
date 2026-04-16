const ML_API = process.env.ML_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${ML_API}/api/audit`);
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ log: [], total: 0 }, { status: 200 });
  }
}
