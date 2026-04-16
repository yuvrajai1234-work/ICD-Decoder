const ML_API = process.env.ML_API_URL || "http://localhost:5000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${ML_API}/api/export/fhir/${id}`);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { error: "Failed to generate FHIR export" },
      { status: 503 }
    );
  }
}
