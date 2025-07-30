import { NextRequest, NextResponse } from "next/server"

const DEEPSEEK_URL = "https://openrouter.ai/api/v1/chat/completions"

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
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000/", // or your deployed domain
        "X-Title": "ML Code Generator"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528", // DeepSeek R1 model name on OpenRouter
        messages: [
          { role: "system", content: "You are an expert ML engineer." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4096
      }),
    });
    const data = await res.json();
    console.log("DeepSeek API response:", JSON.stringify(data, null, 2));
    if (data.error) {
      console.warn("DeepSeek API error (omitted from frontend):", data.error);
      return NextResponse.json({ code: "" });
    }
    // DeepSeek returns code in data.choices[0].message.content
    const code = data?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ code });
  } catch (err) {
    console.error("DeepSeek API error:", err);
    return NextResponse.json({ code: "DeepSeek API error. Check server logs." }, { status: 500 });
  }
}
