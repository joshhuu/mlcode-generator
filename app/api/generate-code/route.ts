import { NextRequest, NextResponse } from "next/server"

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

export async function POST(req: NextRequest) {
  const { datasetSummary } = await req.json()
  const prompt = `
You are an expert ML engineer. Based on the following dataset summary, generate full Python code for a machine learning pipeline.

Dataset Summary:
${JSON.stringify(datasetSummary, null, 2)}

The code should include:
- Data loading (use pandas to load the file 'sample.csv' from the working directory)
- EDA
- Preprocessing (null handling, encoding, scaling)
- Train/test split
- Model training (suggested: RandomForest)
- Evaluation (accuracy, confusion matrix)

Use pandas, scikit-learn. Return only Python code. No markdown or explanations.
`

  try {
    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const data = await res.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));
    // If Gemini returns an error, omit the response
    if (data.error) {
      // Only log the error, do not send to frontend
      console.warn("Gemini API error (omitted from frontend):", data.error);
      return NextResponse.json({ code: "" });
    }
    const code = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ code });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ code: "Gemini API error. Check server logs." }, { status: 500 });
  }
}
