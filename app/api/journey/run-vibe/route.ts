import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI generation is not configured." }, { status: 503 });
  }

  let input: { description?: unknown; minutes?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const description = typeof input.description === "string" ? input.description.trim() : "";
  const minutes = Number(input.minutes);
  if (!description || description.length > 500 || !Number.isFinite(minutes) || minutes < 20 || minutes > 90) {
    return NextResponse.json({ error: "Provide a run description and valid duration." }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response: Awaited<ReturnType<typeof ai.models.generateContent>> | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "Create an imaginative, illustrative running energy journey for a " + minutes +
        "-minute run. User description: " + description +
        ". Return a short title (max 55 characters), one-sentence description, and exactly 10 energy numbers from 0 to 100, sampled evenly throughout the run. Do not claim to analyze real audio.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short evocative title" },
            description: { type: Type.STRING, description: "One sentence about the energy progression" },
            energy: {
              type: Type.ARRAY,
              description: "Exactly ten energy intensity values between 0 and 100, from beginning to end",
              items: { type: Type.INTEGER, minimum: 0, maximum: 100 },
              minItems: 10,
              maxItems: 10
            }
          },
          required: ["title", "description", "energy"]
        },
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
        });
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const temporary = /503|unavailable|high demand|overloaded/i.test(message);
        if (!temporary || attempt === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    if (!response) throw new Error("No Gemini response");
    const raw = response.text?.trim();
    if (!raw) {
      console.error("Gemini response diagnostics:", JSON.stringify({
        kind: "empty",
        finishReason: response.candidates?.[0]?.finishReason ?? null,
        promptFeedback: response.promptFeedback?.blockReason ?? null,
        parts: response.candidates?.[0]?.content?.parts?.length ?? 0
      }));
      return NextResponse.json({ error: "Gemini returned no text. Please try again.", code: "EMPTY_RESPONSE" }, { status: 502 });
    }
    let value: unknown;
    try {
      value = JSON.parse(raw.replace(/^\`\`\`(?:json)?\\s*/i, "").replace(/\\s*\`\`\`$/, ""));
    } catch {
      console.error("Gemini response diagnostics:", JSON.stringify({ kind: "non_json", length: raw.length, finishReason: response.candidates?.[0]?.finishReason ?? null }));
      return NextResponse.json({ error: "Gemini generated text instead of valid JSON.", code: "NON_JSON" }, { status: 502 });
    }
    if (!value || typeof value !== "object") {
      return NextResponse.json({ error: "Gemini returned an unexpected JSON structure.", code: "BAD_STRUCTURE" }, { status: 502 });
    }
    const data = value as Record<string, unknown>;
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const summary = typeof data.description === "string" ? data.description.trim() : "";
    const energy = Array.isArray(data.energy) ? data.energy.map(Number) : [];
    if (!title || !summary || energy.length !== 10 || !energy.every(n => Number.isFinite(n) && n >= 0 && n <= 100)) {
      console.error("Gemini response diagnostics:", JSON.stringify({
        kind: "schema_mismatch", keys: Object.keys(data),
        energyLength: energy.length, titlePresent: !!title, descriptionPresent: !!summary
      }));
      return NextResponse.json({ error: "Gemini returned an incomplete energy curve.", code: "SCHEMA_MISMATCH" }, { status: 502 });
    }
    return NextResponse.json({
      title: title.slice(0, 55),
      description: summary.slice(0, 250),
      energy: energy.map(n => Math.round(n))
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    console.error("Gemini run vibe failed:", detail);
    const normalized = detail.toLowerCase();
    if (/429|quota|resource.exhausted|rate limit/.test(normalized)) {
      return NextResponse.json({ error: "Gemini's free-tier quota or rate limit was reached. Please wait and try again, or check your Google AI Studio usage." }, { status: 429 });
    }
    if (/403|permission.denied|api key not valid|api_key_invalid|401|unauthorized/.test(normalized)) {
      return NextResponse.json({ error: "Gemini rejected the API key or its permissions. Check the GEMINI_API_KEY setting in Vercel." }, { status: 502 });
    }
    if (/503|unavailable|high demand|overloaded/.test(normalized)) {
      return NextResponse.json({ error: "Gemini is temporarily overloaded. We retried automatically, but Google is still busy. Please try again in a few minutes." }, { status: 503 });
    }
    if (/404|not found|not supported|model.*not found/.test(normalized)) {
      return NextResponse.json({ error: "The Gemini model is unavailable for this API key or free tier. The model selection needs updating." }, { status: 502 });
    }
    if (/invalid output|json|parse|empty gemini response/.test(normalized)) {
      return NextResponse.json({ error: "Gemini returned a response the app couldn't interpret. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ error: "Gemini couldn't complete the request. Please try again later." }, { status: 502 });
  }
}
