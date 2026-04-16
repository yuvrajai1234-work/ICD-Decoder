import { createClient } from "@/lib/supabase/server";

const ML_API = process.env.ML_API_URL || "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to ML service
    const res = await fetch(`${ML_API}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    // Save prediction to Supabase for the logged-in user
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("predictions").insert({
          user_id: user.id,
          prediction_id: data.prediction_id,
          clinical_text: body.text?.substring(0, 5000) || "",
          document_type: body.document_type || "general",
          predictions: data.predictions || [],
          routing: data.routing || "unknown",
          status: data.status || "completed",
          total_codes: data.total_codes || data.predictions?.length || 0,
          high_confidence_count: data.high_confidence_count || 0,
        });
      }
    } catch (dbErr) {
      // Don't fail the prediction if DB save fails — log and continue
      console.error("Failed to save prediction to Supabase:", dbErr);
    }

    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      {
        error:
          "Failed to connect to ML prediction service. Ensure the Python server is running on port 5000.",
      },
      { status: 503 }
    );
  }
}
